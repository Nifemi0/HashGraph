/**
 * Attest the CELA protocol graph on HashKey Mainnet HashGraphRegistry.
 * Usage: HASHGRAPH_ENABLE_WRITES=true npx tsx scripts/attest_demo.ts
 */
import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { HashGraphClient } from "../src/sdk/client";
import { lookupGraph, registerGraph } from "../src/chain/registry";

const CELA = "0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029";
const METADATA_URI =
  "https://hashgraph-eight.vercel.app/explorer.html#0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029";

function computeGraphHash(graph: any, address: string): string {
  const hashInput = JSON.stringify({
    address: address.toLowerCase(),
    roles: graph.structural.roles,
    events: graph.structural.events,
    dependencies: graph.structural.dependencies,
    functions: graph.security.privileged_functions,
  });
  return "0x" + crypto.createHash("sha256").update(hashInput).digest("hex");
}

async function main() {
  const client = new HashGraphClient();
  console.log("Compiling CELA protocol graph…");
  const graph = await client.getProtocolGraph(CELA, true);
  const graphHash = computeGraphHash(graph, CELA);
  console.log("graphHash:", graphHash);

  const existing = await lookupGraph(CELA);
  console.log("existing attestation:", existing);

  const ZERO =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  if (
    existing?.verified &&
    existing.graphHash &&
    existing.graphHash !== ZERO
  ) {
    console.log("Already attested — skipping write.");
    return;
  }

  console.log("Registering attestation on HashKey Mainnet…");
  const txHash = await registerGraph(CELA, graphHash, METADATA_URI);
  if (!txHash) {
    console.error("registerGraph returned null — check DEPLOYER_PRIVATE_KEY / auth / gas");
    process.exit(1);
  }
  console.log("tx:", txHash);
  console.log("explorer:", `https://explorer.hsk.xyz/tx/${txHash}`);

  // brief wait then re-read
  await new Promise((r) => setTimeout(r, 4000));
  const after = await lookupGraph(CELA);
  console.log("post-attest lookup:", after);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
