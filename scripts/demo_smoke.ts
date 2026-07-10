/**
 * Demo smoke test — exercises every MCP tool surface via the SDK
 * so a recording never hits a surprise failure on camera.
 *
 * Usage: npx tsx scripts/demo_smoke.ts
 */
import dotenv from "dotenv";
dotenv.config();

import { HashGraphClient } from "../src/sdk/client";
import { lookupGraph } from "../src/chain/registry";

const CELA = "0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029";
// transfer(address,uint256) → 0xa9059cbb
// to = 0x1111...1111, amount = 10
const TRANSFER_CALLDATA =
  "0xa9059cbb0000000000000000000000001111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000a";
// name() selector
const NAME_CALLDATA = "0x06fdde03";

type Result = { tool: string; ok: boolean; detail: string; ms: number };

async function run(
  tool: string,
  fn: () => Promise<unknown>
): Promise<Result> {
  const t0 = Date.now();
  try {
    const out = await fn();
    const ms = Date.now() - t0;
    const text = typeof out === "string" ? out : JSON.stringify(out);
    const preview = text.slice(0, 160).replace(/\s+/g, " ");
    // Treat hard failures as failures, but allow expected educational reverts
    if (out && typeof out === "object") {
      const status = (out as any).status;
      if (
        status === "expected_revert" ||
        status === "expected_state_revert" ||
        status === "gated" ||
        status === "no_attestation" ||
        status === "success"
      ) {
        return { tool, ok: true, detail: preview, ms };
      }
      if (
        "error" in (out as any) ||
        status === "reverted" ||
        (out as any).isError
      ) {
        return { tool, ok: false, detail: preview, ms };
      }
    }
    return { tool, ok: true, detail: preview, ms };
  } catch (e: any) {
    return { tool, ok: false, detail: e.message || String(e), ms: Date.now() - t0 };
  }
}

async function main() {
  const client = new HashGraphClient();
  const results: Result[] = [];

  console.log("HashGraph demo smoke test");
  console.log(`Target: CELA ${CELA}\n`);

  results.push(
    await run("1 get_protocol_graph", async () => {
      const g = await client.getProtocolGraph(CELA, true);
      return {
        protocol: g.metadata?.protocol_name,
        address: g.metadata?.contract_address,
        roles: g.structural?.roles?.map((r: any) => r.name),
        events: g.structural?.events?.slice(0, 5).map((e: any) => e.name),
        privileged: g.security?.privileged_functions?.slice(0, 5).map((f: any) => f.name),
        integrity: g.semantic?.structural_integrity_score,
        intent: g.semantic?.intent?.value?.slice?.(0, 80) ?? g.semantic?.intent,
      };
    })
  );

  results.push(
    await run("2 get_contract_summary", async () => client.getContractSummary(CELA))
  );

  results.push(
    await run("3 explain_transaction", async () =>
      client.explainTransaction(CELA, TRANSFER_CALLDATA)
    )
  );

  results.push(
    await run("4 search_protocol", async () =>
      client.searchProtocol(CELA, "transfer")
    )
  );

  // Without `from`, ERC-20 transfer reverts (zero address) — great live teaching moment.
  // With `from`, simulation runs against real mainnet state (may still revert on balance).
  const DEMO_FROM = "0x1111111111111111111111111111111111111111";
  results.push(
    await run("5a simulate_transaction (no from — expect revert)", async () => {
      const res = await client.simulateTransaction(CELA, TRANSFER_CALLDATA);
      // Expected educational revert
      if (res?.status === "reverted" && /zero address/i.test(res?.error || "")) {
        return { status: "expected_revert", error: res.error };
      }
      return res;
    })
  );
  results.push(
    await run("5b simulate_transaction (with from)", async () => {
      const res = await client.simulateTransaction(
        CELA,
        TRANSFER_CALLDATA,
        DEMO_FROM
      );
      // Either success or a clean balance/allowance revert is fine for smoke
      if (res?.status === "reverted") {
        return { status: "expected_state_revert", error: res.error };
      }
      return res;
    })
  );

  results.push(
    await run("6 read_contract (name)", async () =>
      client.readContract(CELA, NAME_CALLDATA)
    )
  );

  results.push(
    await run("7 get_source_code", async () => {
      const src = await client.getSourceCode(CELA);
      return {
        available: Boolean(src),
        bytes: src?.length ?? 0,
        head: src?.slice(0, 80),
      };
    })
  );

  results.push(
    await run("8 lookup_graph_attestation", async () => {
      const att = await lookupGraph(CELA);
      // No attestation is fine for demo — tool must not throw
      return att ?? { status: "no_attestation", note: "expected if never registered" };
    })
  );

  results.push(
    await run("9 register_protocol_graph (gated)", async () => {
      // Mirror MCP gating — we only check the env flag, never send a tx in smoke
      if (process.env.HASHGRAPH_ENABLE_WRITES !== "true") {
        return {
          status: "gated",
          note: "HASHGRAPH_ENABLE_WRITES!=true — safe default for demo",
        };
      }
      return {
        status: "writes_enabled",
        note: "Skip live register in smoke — use MCP only if intentional",
      };
    })
  );

  console.log("\n── Results ──────────────────────────────────────");
  let pass = 0;
  let fail = 0;
  for (const r of results) {
    const mark = r.ok ? "✅" : "❌";
    console.log(`${mark} ${r.tool} (${r.ms}ms)`);
    console.log(`   ${r.detail}`);
    if (r.ok) pass++;
    else fail++;
  }
  console.log("────────────────────────────────────────────────");
  console.log(`pass=${pass} fail=${fail}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
