import { HashGraphSchema, DerivedStringSchema, DerivedArraySchema } from "../../types/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

export interface ILLMProvider {
  generate(systemPrompt: string, userPrompt: string): Promise<string>;
}

export interface EnrichmentDiagnostics {
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED" | "SKIPPED";
  enrichment_time_ms: number;
  report: string;
}

export class SemanticEnricher {
  private llm: ILLMProvider;
  public readonly promptVersion = "1.0.0";
  public readonly model = "gemini-2.5-pro";

  constructor(llmProvider: ILLMProvider) {
    this.llm = llmProvider;
  }

  public async enrich(graph: HashGraphSchema): Promise<{ graph: HashGraphSchema, diagnostics: EnrichmentDiagnostics }> {
    const start = performance.now();
    let status: EnrichmentDiagnostics["status"] = "RUNNING";

    try {
      const systemPrompt = this.loadPrompt("system.md").replace("{{PAYLOAD}}", JSON.stringify(graph.structural));
      const intentPrompt = this.loadPrompt("intent.md");
      const securityPrompt = this.loadPrompt("security.md");
      const devPrompt = this.loadPrompt("developer.md");

      const [intentRes, securityRes, devRes] = await Promise.all([
        this.llm.generate(systemPrompt, intentPrompt),
        this.llm.generate(systemPrompt, securityPrompt),
        this.llm.generate(systemPrompt, devPrompt)
      ]);

      const intentParsed = this.validateAndParse(intentRes, z.object({ intent: DerivedStringSchema, user_goal: DerivedStringSchema }));
      const securityParsed = this.validateAndParse(securityRes, z.object({ guardrails: DerivedArraySchema }));
      const devParsed = this.validateAndParse(devRes, z.object({ integration_notes: DerivedArraySchema }));

      this.validateCitations(graph.structural, intentParsed.intent.derived_from);
      this.validateCitations(graph.structural, intentParsed.user_goal.derived_from);
      for (const g of securityParsed.guardrails) this.validateCitations(graph.structural, g.derived_from);
      for (const d of devParsed.integration_notes) this.validateCitations(graph.structural, d.derived_from);

      graph.semantic.intent = intentParsed.intent;
      graph.semantic.user_goal = intentParsed.user_goal;
      graph.security.guardrails = securityParsed.guardrails;
      graph.developer.integration_notes = devParsed.integration_notes;

      status = "COMPLETE";
    } catch (e) {
      status = "FAILED";
      console.error(e);
    }

    const timeMs = Math.round(performance.now() - start);
    
    graph.semantic.semantic_status = status;
    if (status === "COMPLETE") {
        graph.semantic.prompt_version = this.promptVersion;
        graph.semantic.model = this.model;
        graph.semantic.generated_at = new Date().toISOString();
        graph.semantic.enrichment_time_ms = timeMs;
    }

    const report = this.generateReport(graph);

    return {
      graph,
      diagnostics: {
        status,
        enrichment_time_ms: timeMs,
        report
      }
    };
  }

  private loadPrompt(filename: string): string {
    return fs.readFileSync(path.join(process.cwd(), "src/prompts", filename), "utf-8");
  }

  private validateAndParse<T>(jsonStr: string, schema: z.ZodSchema<T>): T {
    const cleaned = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    return schema.parse(JSON.parse(cleaned));
  }

  private validateCitations(structural: any, derivations: string[]) {
    const validCitations = new Set<string>();
    
    structural.roles.forEach((r: any) => { validCitations.add(r.name); validCitations.add(r.evidence); });
    structural.dependencies.forEach((d: any) => { validCitations.add(d.target); validCitations.add(d.evidence); });
    structural.events.forEach((e: any) => { validCitations.add(e.name); validCitations.add(`${e.name} event`); });
    
    for (const item of derivations) {
      let found = false;
      for (const valid of validCitations) {
        if (valid.includes(item) || item.includes(valid) || item.replace("()", "") === valid) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`Citation Validation Failed: '${item}' was hallucinated and not found in deterministic structural graph.`);
      }
    }
  }

  private generateReport(graph: HashGraphSchema): string {
    const intentBlock = graph.semantic.intent ? 
      `Intent\n\nGenerated from\n${graph.semantic.intent.derived_from.map(d => `• ${d}`).join("\n")}` : '';
      
    const securityBlock = graph.security.guardrails && graph.security.guardrails.length > 0 ? 
      `Security\n\nGenerated from\n${graph.security.guardrails.map(g => g.derived_from.map(d => `• ${d}`).join("\n")).join("\n")}` : '';

    const devBlock = graph.developer.integration_notes && graph.developer.integration_notes.length > 0 ? 
      `Developer Notes\n\nGenerated from\n${graph.developer.integration_notes.map(g => g.derived_from.map(d => `• ${d}`).join("\n")).join("\n")}` : '';

    return [
      `Explainability Report`,
      ``,
      intentBlock,
      ``,
      securityBlock,
      ``,
      devBlock,
      ``,
      `Structural Integrity`,
      `${graph.semantic.structural_integrity_score}`,
      ``,
      `Semantic Status`,
      `${graph.semantic.semantic_status}`
    ].filter(Boolean).join("\n");
  }
}
