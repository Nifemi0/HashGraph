import { HashGraphClient } from "../src/sdk/client";

const client = new HashGraphClient();

// These are example addresses to seed the cache for the Hackathon demo
// so that you do not depend on live Blockscout APIs on stage.
const TARGET_ADDRESSES = {
    "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "Uniswap Router": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "Lending Pool": "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf", // Aave V2
};

async function seed() {
    console.log("Seeding HashGraph Cache for Hackathon Demo...");
    
    for (const [name, address] of Object.entries(TARGET_ADDRESSES)) {
        try {
            console.log(`\nCompiling ${name} (${address})...`);
            await client.getProtocolGraph(address, true); // forceRefresh=true
            console.log(`✅ Cached ${name}`);
        } catch (e: any) {
            console.error(`❌ Failed to cache ${name}: ${e.message}`);
        }
    }
    
    console.log("\nSeeding complete. The cache is now warm.");
}

seed().catch(console.error);
