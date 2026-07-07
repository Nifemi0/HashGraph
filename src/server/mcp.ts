#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { HashGraphClient } from "../sdk/client";

const client = new HashGraphClient();

const server = new Server(
  { name: "hashgraph-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_protocol_graph",
        description: "Returns the full deterministic + semantic graph for a contract",
        inputSchema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] }
      },
      {
        name: "get_contract_summary",
        description: "Returns a lightweight overview of a contract",
        inputSchema: { type: "object", properties: { address: { type: "string" } }, required: ["address"] }
      },
      {
        name: "explain_transaction",
        description: "Explains what a transaction does using calldata",
        inputSchema: { type: "object", properties: { address: { type: "string" }, calldata: { type: "string" } }, required: ["address", "calldata"] }
      },
      {
        name: "search_protocol",
        description: "Search the protocol for specific functions, events, or roles",
        inputSchema: { type: "object", properties: { address: { type: "string" }, query: { type: "string" } }, required: ["address", "query"] }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "get_protocol_graph") {
            const graph = await client.getProtocolGraph(request.params.arguments?.address as string);
            return { toolResult: graph };
        }
        if (request.params.name === "get_contract_summary") {
            const summary = await client.getContractSummary(request.params.arguments?.address as string);
            return { toolResult: summary };
        }
        if (request.params.name === "explain_transaction") {
            const exp = await client.explainTransaction(request.params.arguments?.address as string, request.params.arguments?.calldata as string);
            return { toolResult: exp };
        }
        if (request.params.name === "search_protocol") {
            const res = await client.searchProtocol(request.params.arguments?.address as string, request.params.arguments?.query as string);
            return { toolResult: res };
        }
        throw new Error("Tool not found");
    } catch (e: any) {
        return { toolResult: { error: e.message } };
    }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("HashGraph MCP Server running on stdio");
}

run().catch(console.error);
