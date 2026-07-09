#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { HashGraphClient } from "../sdk/client";
import { lookupGraph, registerGraph } from "../chain/registry";

const client = new HashGraphClient();
const server = new McpServer({
  name: "hashgraph-mcp",
  version: "1.0.0"
});

server.tool(
    "get_protocol_graph",
    "Returns the full deterministic + semantic graph for a contract",
    { address: z.string() },
    async ({ address }) => {
        try {
            const graph = await client.getProtocolGraph(address);
            return { content: [{ type: "text", text: JSON.stringify(graph, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "get_contract_summary",
    "Returns a lightweight overview of a contract",
    { address: z.string() },
    async ({ address }) => {
        try {
            const summary = await client.getContractSummary(address);
            return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "explain_transaction",
    "Explains what a transaction does using calldata",
    { address: z.string(), calldata: z.string() },
    async ({ address, calldata }) => {
        try {
            const exp = await client.explainTransaction(address, calldata);
            return { content: [{ type: "text", text: JSON.stringify(exp, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "search_protocol",
    "Search the protocol for specific functions, events, or roles",
    { address: z.string(), query: z.string() },
    async ({ address, query }) => {
        try {
            const res = await client.searchProtocol(address, query);
            return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "simulate_transaction",
    "Simulate a transaction against the blockchain to see its outcome",
    { to: z.string(), data: z.string(), from: z.string().optional(), value: z.string().optional() },
    async ({ to, data, from, value }) => {
        try {
            const res = await client.simulateTransaction(to, data, from, value);
            return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "read_contract",
    "Read a state variable or view function from a contract",
    { address: z.string(), data: z.string() },
    async ({ address, data }) => {
        try {
            const res = await client.readContract(address, data);
            return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "get_source_code",
    "Fetch the fully resolved, unflattened Solidity source code for a contract",
    { address: z.string() },
    async ({ address }) => {
        try {
            const source = await client.getSourceCode(address);
            return { content: [{ type: "text", text: JSON.stringify({ source: source || "No source code available" }, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "lookup_graph_attestation",
    "Lookup the on-chain HashKey Mainnet attestation for a compiled protocol graph",
    { address: z.string() },
    async ({ address }) => {
        try {
            const attestation = await lookupGraph(address);
            return { content: [{ type: "text", text: JSON.stringify(attestation || { error: "No attestation found on HashKey Chain" }, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

server.tool(
    "register_protocol_graph",
    "Register a deterministic protocol graph hash to the HashKey Chain mainnet",
    { address: z.string(), graphHash: z.string(), metadataURI: z.string() },
    async ({ address, graphHash, metadataURI }) => {
        if (process.env.HASHGRAPH_ENABLE_WRITES !== "true") {
            return { 
                content: [{ 
                    type: "text", 
                    text: JSON.stringify({ 
                        error: "Write operations are disabled by default on this MCP server. To enable registry attestations, set HASHGRAPH_ENABLE_WRITES=true in your environment variables." 
                    }, null, 2) 
                }], 
                isError: true 
            };
        }
        try {
            const txHash = await registerGraph(address, graphHash, metadataURI);
            return { content: [{ type: "text", text: JSON.stringify({ txHash, status: "success" }, null, 2) }] };
        } catch (e: any) {
            return { content: [{ type: "text", text: JSON.stringify({ error: e.message }) }], isError: true };
        }
    }
);

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HashGraph MCP Server running on stdio");
}

run().catch(console.error);
