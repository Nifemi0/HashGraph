# Implementation Log

## Step 1: Scaffold Schema & Cache (Completed)

- **What changed**: Initialized the Node project, set up strict TypeScript configuration, created the project folder structure, defined the Protocol Graph Zod schema, and implemented a SQLite-backed cache engine with cache metrics, ttl handling, corrupted record clearing, schema version migration guards, and cleanup functionality. Unit tests were written for the cache engine.
- **Files added**:
  - `src/types/schema.ts`
  - `src/engine/cache.ts`
  - `src/config/cache.ts`
  - `src/config/thresholds.ts`
  - `tests/cache.test.ts`
  - `docs/IMPLEMENTATION_LOG.md`
- **Files modified**:
  - `package.json`
  - `tsconfig.json`
- **ADRs affected**:
  - ADR-009 (SQLite for MVP): implemented strictly.
  - New architectures applied for proxy support, evidence score instead of confidence, and cache TTL constraints.
- **Technical debt introduced**: 
  - SQLite write blocking on high concurrent loads.
  - Cache DB unbounded growth (partially mitigated with a callable cleanup method).
- **Future improvements**:
  - Automatic background job to periodically call `cleanupExpiredEntries()` to keep database size in check.

## Step 2: Fetcher & Normalizer (Completed)

- **What changed**: Implemented the ingestion layer for HashGraph. Built custom error classes for detailed explorer failure tracking. Defined an `IExplorerRepository` interface to decouple the compiler from Blockscout. Created the `BlockscoutRepository` containing rate limiting (via `bottleneck`), retry logic with exponential backoff, timeout handling, and Zod validation on incoming explorer payloads. Implemented the `DataNormalizer` which resolves proxy logic automatically based on ADR-002, outputting a sanitized, standard data structure ready for compilation.
- **Files added**:
  - `src/engine/errors.ts`
  - `src/engine/explorer/repository.interface.ts`
  - `src/engine/explorer/blockscout.repository.ts`
  - `src/engine/explorer/normalizer.ts`
- **Files modified**: None.
- **ADRs affected**:
  - ADR-003 (Normalizer isolates compiler): Extensively implemented with `IExplorerRepository`.
  - ADR-002 (ABI is primary truth): Updated internally to support automatic proxy resolution (implementation ABI takes precedence).
- **Technical debt introduced**: 
  - `bottleneck` memory overhead if queue grows exceptionally large (unlikely in normal IDE usage).
- **Future improvements**:
  - Support for multiple explorers dynamically based on the chain ID.

## Step 3: Deterministic Compiler (Completed)

- **What changed**: Implemented the core deterministic compiler stages (`RoleExtractor`, `EventExtractor`, `FunctionExtractor`, `DependencyExtractor`). Created a robust pipeline orchestrating these stages safely and measuring their execution times. Built a deterministic `EvidenceScorer` that evaluates the quality of compiler inputs before generating a score. The `GraphAssembler` handles all state initialization immutably. Traversal depths were built into the CompilerInput interface to combat infinite dependency recursion.
- **Files added**:
  - `src/engine/compiler/interfaces.ts`
  - `src/engine/compiler/extractors/role.extractor.ts`
  - `src/engine/compiler/extractors/event.extractor.ts`
  - `src/engine/compiler/extractors/function.extractor.ts`
  - `src/engine/compiler/extractors/dependency.extractor.ts`
  - `src/engine/compiler/integrity.scorer.ts`
  - `src/engine/compiler/graph.assembler.ts`
  - `src/engine/compiler/pipeline.ts`
  - `tests/compiler/extractors.test.ts`
  - `tests/compiler/pipeline.test.ts`
- **Files modified**: None
- **ADRs affected**:
  - ADR-013 (Compiler Stages Are Pure): Strictly adhered to. Extractors only take `CompilerInput` and return `ExtractorResult` without side-effects or mutations.
- **Technical debt introduced**: 
  - Regex avoidance requires relying on broad string-matching heuristics (e.g. `name.startsWith("set")`) which might incorrectly flag public state mutators as "privileged".
- **Future improvements**:
  - Integrate a true AST parser (e.g., solc-typed-ast) instead of heuristics when the source code is available.

## Interlude: Explainability First (Completed)

- **What changed**: 
  - Overhauled the HashGraph schema to adopt "Explainability First" (ADR-014).
  - Transformed simple string arrays into robust objects (`RoleItem`, `DependencyItem`, `FunctionItem`, `EventItem`) that carry provenance (source, confidence, evidence, classification, reason).
  - Added a `statistics` block to the top-level schema to summarize graph volume (contracts, functions, events, dependencies, compile time).
  - Refactored `evidence_score` nomenclature into `structural_integrity_score`.
  - Upgraded the `CompilerPipeline` to emit a stylized, demo-friendly `Compiler Trace` string detailing exactly what was found and how long it took.
  - Refactored extractors and `GraphAssembler` to correctly map these deep objects.
- **Files added/modified**:
  - Modified: `src/types/schema.ts`
  - Modified: `src/engine/compiler/interfaces.ts`
  - Modified: `src/engine/compiler/extractors/*.ts`
  - Modified: `src/engine/compiler/integrity.scorer.ts`
  - Modified: `src/engine/compiler/graph.assembler.ts`
  - Modified: `src/engine/compiler/pipeline.ts`
  - Modified: `tests/compiler/*.ts`
- **ADRs affected**:
  - ADR-014 (Explainability First) [NEW]: Every deterministic fact emitted by the compiler must contain enough metadata for an engineer to independently verify how it was derived. No black-box extraction.
- **Technical debt introduced**: 
  - Schema size increased, consuming more cache DB storage.
- **Future improvements**:
  - Persist compiler traces to disk for auditing and benchmarking.

## Step 4: Semantic Enrichment (Completed)

- **What changed**: 
  - Implemented `SemanticEnricher` to ingest the deterministic schema and utilize an external `ILLMProvider` to generate high-level semantic, security, and developer insights.
  - Implemented the `SemanticCache` decoupled from the core compiler cache, keyed on `prompt_version`, ensuring that LLM prompt updates correctly invalidate AI annotations without destroying deterministic compilation artifacts.
  - Extracted prompt templates into pure markdown files under `src/prompts/` (system, intent, security, developer).
  - Adopted strict Zod parsing on LLM JSON responses.
  - Implemented "Citation Validation": The engine automatically checks `derived_from` arrays inside the LLM response. If a cited fact doesn't exist within the deterministic structural output, the enrichment is explicitly rejected as a hallucination, defaulting the semantic state to `FAILED`.
  - Added the "Explainability Report" generation.
- **Files added/modified**:
  - Added: `src/engine/enrichment/enricher.ts`
  - Added: `src/engine/enrichment/semantic.cache.ts`
  - Added: `src/prompts/system.md`, `src/prompts/intent.md`, `src/prompts/security.md`, `src/prompts/developer.md`
  - Added: `tests/enrichment.test.ts`
  - Modified: `src/types/schema.ts`
  - Modified: `src/engine/compiler/graph.assembler.ts`
- **ADRs affected**:
  - ADR-015 (AI Never Creates Facts) [NEW]: The LLM is restricted exclusively to summarizing, grouping, and explaining existing deterministic structural facts. Any structural metadata emitted by the LLM is discarded, and hallucinated citations fail the pipeline.
- **Technical debt introduced**: 
  - Sub-string fuzzy matching in `validateCitations` (`valid.includes(item)`) might let slightly inaccurate citations through. In production, this should map directly to precise structural UUIDs.
- **Future improvements**:
  - Add parallelization limits so multiple concurrent enrichment passes do not hit LLM API rate limits.

## Step 5: Productization & Developer Experience (In Progress)

- **What changed**:
  - Implemented Phase 5.2 (SDK) encapsulating the entire pipeline (`HashGraphClient`).
  - Implemented Phase 5.1 (MCP Server) providing `get_protocol_graph`, `get_contract_summary`, `explain_transaction`, and `search_protocol` tools for AI IDEs.
  - Implemented Phase 5.3 (CLI) with subcommands: `compile`, `summary`, `explain`, `graph`.
  - Implemented Phase 5.5 and 5.6 (Mermaid & JSON Export) integrated into the CLI via `hashgraph compile --export <dir>`.
- **Files added/modified**:
  - Added: `src/sdk/client.ts`
  - Added: `src/server/mcp.ts`
  - Added: `src/cli/index.ts`
  - Added: `src/engine/export/mermaid.ts`
  - Modified: `package.json`
- **ADRs affected**:
  - ADR-016 (HashGraph Is Infrastructure) [NEW]: HashGraph does not execute transactions. HashGraph does not modify contracts. HashGraph does not perform audits. HashGraph does not make trust decisions. HashGraph provides deterministic protocol intelligence for AI systems and developers.
