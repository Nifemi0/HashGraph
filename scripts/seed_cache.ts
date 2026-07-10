import dotenv from "dotenv";
dotenv.config();

import { HashGraphClient } from "../src/sdk/client";

const client = new HashGraphClient();

// HashKey Mainnet verified contracts for the demo.
// Warm these so live MCP / dashboard queries do not depend on a cold Blockscout round-trip on stage.
const TARGET_ADDRESSES: Record<string, string> = {
  // Featured on the landing page as "CELA" — OptimismMintableERC20 (USDT bridge token)
  CELA: "0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029",
  // Wrapped HSK — good transfer + deposit/withdraw story
  WHSK: "0xB210D2120d57b758EE163cFfb43e73728c471Cf1",
  // Cellula Token — native ecosystem ERC-20
  "Cellula Token": "0xC7DcECe84EC314F08014dA2036632afb7fb1e05C",
  // Dogs Coin — simple ERC-20 for a fast second compile
  DOGS: "0xF9fB2302DA48d5715b10921CEC3b82c99ACb39AC",
  // KycGate — richer roles / access-control story for the security beat
  KycGate: "0xA36E8c13Ca1eF6493d9F57D74E1470fB3427Ee46",
};

async function seed() {
  console.log("Seeding HashGraph Cache for HashKey Demo...");
  console.log(`Contracts: ${Object.keys(TARGET_ADDRESSES).join(", ")}\n`);

  let ok = 0;
  let failed = 0;

  for (const [name, address] of Object.entries(TARGET_ADDRESSES)) {
    try {
      console.log(`Compiling ${name} (${address})...`);
      const graph = await client.getProtocolGraph(address, true); // forceRefresh=true
      const roles = graph.structural?.roles?.length ?? 0;
      const events = graph.structural?.events?.length ?? 0;
      const priv = graph.security?.privileged_functions?.length ?? 0;
      console.log(
        `✅ Cached ${name} — roles=${roles} events=${events} privileged=${priv} integrity=${graph.semantic?.structural_integrity_score ?? "?"}`
      );
      ok++;
    } catch (e: any) {
      console.error(`❌ Failed to cache ${name}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nSeeding complete. ok=${ok} failed=${failed}. Cache is warm.`);
  if (failed > 0) process.exitCode = 1;
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
