# HashGraph

**Deterministic by design. Explainable by AI.**

HashGraph compiles deterministic blockchain artifacts into an AI-readable Protocol Graph that IDEs, wallets, AI agents, and developer tools can consume through MCP.

## Why HashGraph?

**Current Workflow**
`Explorer` → `ABI` → `Read Solidity` → `Guess Architecture` → `Integrate`

**HashGraph Workflow**
`Explorer` → `Compile` → `Protocol Graph` → `Ask AI` → `Ship`

## The Problem
LLMs understand code, but they don't understand protocols. A protocol is an emergent property of multiple smart contracts, roles, permissions, and events. AI agents (like Cursor or Claude) struggle to build a holistic mental model from raw ABIs. HashGraph solves this by deterministically compiling contracts into a structured Protocol Graph, and then using a Semantic Layer to explain it.

---

## Architecture

`Input Contract` ↓ `Blockscout Fetcher` ↓ `Normalizer` ↓ `Deterministic Compiler` ↓ `HashGraph Schema` ↓ `Semantic Enrichment` ↓ `Cache` ↓ `MCP Server` ↓ `Cursor / Gemini / Claude`

## Compiler Pipeline

1. **RoleExtractor**: Extracts AccessControl, Ownable, and custom auth roles.
2. **EventExtractor**: Extracts state-emission events.
3. **FunctionExtractor**: Extracts public mutators and privileged functions.
4. **DependencyExtractor**: Resolves external interfaces and downstream contracts.

## Semantic Pipeline (AI Enrichment)

Adhering to **ADR-015 (AI Never Creates Facts)**, the AI engine consumes the deterministic structural facts and extracts:
- Technical Intent
- User Goals
- Security Guardrails
- Developer Integration Notes
*All AI outputs undergo strict Citation Validation against the deterministic graph.*

## MCP Server Usage

The HashGraph MCP server provides AI IDEs (like Cursor) and AI assistants (like Claude Desktop) direct access to compiled protocol graphs.

### Integrating with Cursor

1. Open Cursor Settings.
2. Navigate to **Features > MCP**.
3. Click **+ Add new MCP server**.
4. Set Name: `HashGraph`
5. Set Type: `command`
6. Set Command: `npx tsx /absolute/path/to/HashGraph/src/server/index.ts`

### Integrating with Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hashgraph": {
      "command": "npx",
      "args": [
        "tsx",
        "/absolute/path/to/HashGraph/src/server/index.ts"
      ]
    }
  }
}
```

### Available MCP Tools

- `get_protocol_graph(address)`: Full semantic + deterministic schema.
- `get_contract_summary(address)`: Lightweight summarization.
- `explain_transaction(address, calldata)`: ABI-aware calldata explanation.
- `search_protocol(address, query)`: Semantic and structural search.

---

## Examples

**CLI Usage**
```bash
# Fetch and export graph
hashgraph compile 0x123... --export ./out

# Explain a transaction
hashgraph explain 0x123... 0xa9059cbb...

# Generate visual architecture
hashgraph graph 0x123...

# Run compiler performance benchmarks
hashgraph benchmark
```

## Dashboard & Visualization
Launch the HashGraph web dashboard to visually compile contracts in real-time.
```bash
npm run dashboard
```

---

## FAQ (For Judges)

**"Why not just ask Claude?"**
> Claude can read individual contracts. HashGraph compiles entire protocols into a deterministic graph with provenance, explainability, and a reusable schema exposed through MCP.

**"Why is this deterministic?"**
> Every structural fact comes from verified blockchain artifacts—ABI, verified source, events, roles, and dependencies. The AI layer only annotates those facts and cannot create new ones.

**"Why MCP?"**
> Because AI tools already speak MCP. Once HashGraph exposes a protocol through MCP, Cursor, Claude Desktop, and other compatible tools can query it without custom integrations.

**"Why HashKey?"**
> Better developer tooling reduces integration friction. HashGraph makes HashKey protocols easier for both developers and AI coding agents to understand, which can accelerate ecosystem adoption.

---

## Demo Script (90 Seconds)

- **0–10s [Problem]**: *"LLMs understand code, but they don't understand protocols."*
- **10–25s [Action]**: Paste a complex contract address into the HashGraph Dashboard.
- **25–40s [Compilation]**: The deterministic compiler runs. Structural statistics populate (Roles, Events, Dependencies).
- **40–55s [Visualization]**: The Protocol Graph appears (Mermaid). AI Semantic Enrichment streams in (Intent, Security Guardrails).
- **55–70s [Integration]**: Switch to Cursor IDE connected via MCP. Ask: *"What does this contract do?"*
- **70–90s [Closing]**: Cursor uses the `get_protocol_graph` tool and outputs a perfect explanation with zero hallucinations. *"HashGraph: Deterministic by design. Explainable by AI."*

---

## License
MIT License
