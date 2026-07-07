import { HashGraphCache } from "../engine/cache";
import { SemanticCache } from "../engine/enrichment/semantic.cache";
import { BlockscoutRepository } from "../engine/explorer/blockscout.repository";
import { DataNormalizer } from "../engine/explorer/normalizer";
import { CompilerPipeline } from "../engine/compiler/pipeline";
import { SemanticEnricher, ILLMProvider } from "../engine/enrichment/enricher";
import { HashGraphSchema } from "../types/schema";
import { decodeFunctionData } from "viem";

class NoopLLM implements ILLMProvider {
  async generate(): Promise<string> {
    return "{}";
  }
}

export class HashGraphClient {
  private cache: HashGraphCache;
  private semanticCache: SemanticCache;
  private repo: BlockscoutRepository;
  private normalizer: DataNormalizer;
  private compiler: CompilerPipeline;
  private enricher: SemanticEnricher;

  constructor(llmProvider?: ILLMProvider) {
    this.cache = new HashGraphCache();
    this.semanticCache = new SemanticCache();
    this.repo = new BlockscoutRepository();
    this.normalizer = new DataNormalizer(this.repo);
    this.compiler = new CompilerPipeline();
    this.enricher = new SemanticEnricher(llmProvider || new NoopLLM());
  }

  public async getProtocolGraph(address: string, forceRefresh = false): Promise<HashGraphSchema> {
    let graph = this.cache.get(address);

    if (!graph || forceRefresh) {
        const normalized = await this.normalizer.normalize(address);
        const input: any = {
            address: normalized.address,
            abi: normalized.abi ? JSON.parse(normalized.abi) : [],
            source: normalized.sourceCode,
            isProxy: normalized.isProxy,
            implementation: normalized.implementationAddress,
            metadata: {
                protocolName: "Unknown",
                compilerVersion: "Unknown"
            },
            depth: 0,
            maxDepth: 1,
            visited: new Set()
        };
        const { graph: compiledGraph } = await this.compiler.compile(input);
        graph = compiledGraph;
        this.cache.set(address, graph);
    }

    const promptVersion = this.enricher.promptVersion;
    const cachedSemantic = this.semanticCache.get(address, promptVersion);

    if (cachedSemantic) {
        graph.semantic = cachedSemantic.semantic;
        graph.security = cachedSemantic.security;
        graph.developer = cachedSemantic.developer;
        graph.semantic.semantic_status = "COMPLETE";
    } else {
        const { graph: enrichedGraph, diagnostics } = await this.enricher.enrich(graph);
        graph = enrichedGraph;
        if (diagnostics.status === "COMPLETE") {
            this.semanticCache.set(address, promptVersion, {
                semantic: graph.semantic,
                security: graph.security,
                developer: graph.developer
            });
        }
    }

    return graph;
  }

  public async getContractSummary(address: string): Promise<any> {
     const graph = await this.getProtocolGraph(address);
     return {
         protocol_name: graph.metadata.protocol_name,
         intent: graph.semantic.intent?.value || "Unknown",
         structural_integrity: graph.semantic.structural_integrity_score,
         roles: graph.structural.roles.map(r => r.name),
         dependencies: graph.structural.dependencies.map(d => d.target),
         privileged_functions: graph.security.privileged_functions.map(f => f.name)
     };
  }

  public async explainTransaction(address: string, calldata: string): Promise<any> {
      const graph = await this.getProtocolGraph(address);
      if (!graph.metadata.contract_address) throw new Error("Invalid graph");

      const abiRaw = await this.repo.fetchContractAbi(address);
      if (!abiRaw) throw new Error("No ABI found for decoding");
      
      const abi = JSON.parse(abiRaw);

      try {
         const decoded = decodeFunctionData({ abi, data: calldata as any });
         const funcInfo = graph.security.privileged_functions.find(f => f.name === decoded.functionName) 
            || { classification: "public mutator", reason: "Standard public call" };

         return {
            function: decoded.functionName,
            args: decoded.args,
            classification: funcInfo.classification,
            reason: funcInfo.reason
         };
      } catch (e: any) {
         return { error: "Failed to decode transaction", details: e.message };
      }
  }

  public async searchProtocol(address: string, query: string): Promise<any[]> {
      const graph = await this.getProtocolGraph(address);
      const results: any[] = [];
      const q = query.toLowerCase();

      for (const func of graph.security.privileged_functions) {
          if (func.name.toLowerCase().includes(q)) results.push({ type: "privileged_function", ...func });
      }
      for (const role of graph.structural.roles) {
          if (role.name.toLowerCase().includes(q)) results.push({ type: "role", ...role });
      }
      for (const event of graph.structural.events) {
          if (event.name.toLowerCase().includes(q)) results.push({ type: "event", ...event });
      }

      return results;
  }
}
