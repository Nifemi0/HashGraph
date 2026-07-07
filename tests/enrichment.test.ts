import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SemanticEnricher, ILLMProvider } from '../src/engine/enrichment/enricher';
import { SemanticCache } from '../src/engine/enrichment/semantic.cache';
import { HashGraphSchema } from '../src/types/schema';
import fs from 'fs';
import path from 'path';

const getMockGraph = (): HashGraphSchema => ({
  metadata: {
    protocol_name: "Test",
    contract_address: "0x123",
    is_proxy: false,
    compiler_version: "0.8.20",
    schema_version: "1.0.0",
    enrichment_version: "1.0.0",
    cache_status: "MISS"
  },
  statistics: {
    contracts: 1,
    functions: 0,
    events: 1,
    dependencies: 0,
    roles: 1,
    proxy: false,
    compile_time_ms: 10
  },
  structural: {
    roles: [{ name: "Owner", source: "ABI", confidence: 1.0, evidence: "owner()" }],
    dependencies: [],
    events: [{ name: "Deposit", source: "ABI" }]
  },
  semantic: {
    intent: null,
    user_goal: null,
    semantic_status: "PENDING",
    structural_integrity_score: 90,
    verified: true
  },
  security: {
    guardrails: [],
    privileged_functions: [],
    structural_integrity_score: 90,
    verified: true
  },
  developer: {
    integration_notes: [],
    structural_integrity_score: 90,
    verified: true
  }
});

class MockLLM implements ILLMProvider {
  async generate(sys: string, user: string): Promise<string> {
    if (user.includes("intent")) {
      return JSON.stringify({
        intent: { value: "mock intent", derived_from: ["Owner"] },
        user_goal: { value: "mock goal", derived_from: ["Deposit event"] }
      });
    }
    if (user.includes("guardrails")) {
      return JSON.stringify({
        guardrails: [{ value: "mock guard", derived_from: ["Owner"] }]
      });
    }
    if (user.includes("integration_notes")) {
      return JSON.stringify({
        integration_notes: [{ value: "mock note", derived_from: ["Deposit event"] }]
      });
    }
    return "{}";
  }
}

class HallucinatingLLM implements ILLMProvider {
  async generate(sys: string, user: string): Promise<string> {
    return JSON.stringify({
        intent: { value: "bad intent", derived_from: ["magicFunction()"] },
        user_goal: { value: "bad goal", derived_from: ["magicFunction()"] }
    });
  }
}

describe('SemanticEnrichment', () => {
  it('enriches graph, verifies citations, and generates report', async () => {
    const enricher = new SemanticEnricher(new MockLLM());
    const graph = getMockGraph();
    
    const { graph: result, diagnostics } = await enricher.enrich(graph);
    
    expect(result.semantic.semantic_status).toBe("COMPLETE");
    expect(result.semantic.intent?.value).toBe("mock intent");
    expect(result.security.guardrails.length).toBe(1);
    expect(diagnostics.report).toContain("Explainability Report");
    expect(diagnostics.report).toContain("Owner");
    expect(diagnostics.report).toContain("Deposit event");
    expect(result.semantic.model).toBe("gemini-2.5-pro");
  });

  it('rejects hallucinated citations with FAILED status', async () => {
    const enricher = new SemanticEnricher(new HallucinatingLLM());
    const graph = getMockGraph();
    
    const { graph: result, diagnostics } = await enricher.enrich(graph);
    
    expect(result.semantic.semantic_status).toBe("FAILED");
    expect(diagnostics.status).toBe("FAILED");
    expect(result.semantic.intent).toBeNull(); // remains null
  });
});

describe('SemanticCache', () => {
    const TEST_DB_DIR = 'data_test';
    const TEST_DB_NAME = 'test_semantic.db';
    let cache: SemanticCache;
  
    beforeEach(() => {
      if (fs.existsSync(path.join(TEST_DB_DIR, TEST_DB_NAME))) {
        fs.unlinkSync(path.join(TEST_DB_DIR, TEST_DB_NAME));
      }
      cache = new SemanticCache(TEST_DB_DIR, TEST_DB_NAME);
    });
  
    afterEach(() => {
      if (fs.existsSync(path.join(TEST_DB_DIR, TEST_DB_NAME))) {
        fs.unlinkSync(path.join(TEST_DB_DIR, TEST_DB_NAME));
      }
    });

    it('caches and retrieves by prompt version', () => {
        const data = { semantic: { intent: "test" }, security: {}, developer: {} };
        cache.set("0x1", "1.0.0", data);
        
        const hit = cache.get("0x1", "1.0.0");
        expect(hit).not.toBeNull();
        expect(hit?.semantic.intent).toBe("test");

        const miss = cache.get("0x1", "1.1.0"); // Prompt version changed
        expect(miss).toBeNull();
    });
});
