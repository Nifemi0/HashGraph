#!/usr/bin/env node

/**
 * HashGraph MCP Server – Post-install Quick Start Banner
 * Prints a quick-start guide after `npm install -g hashgraph-mcp`.
 */

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";

console.log("");
console.log(`${GREEN}${BOLD}  ⬡ HashGraph MCP Server installed successfully!${RESET}`);
console.log("");
console.log(`  ${BOLD}Quick Start:${RESET}`);
console.log(`  ${CYAN}npx hashgraph-mcp${RESET}            ${DIM}Run the MCP server via stdio${RESET}`);
console.log(`  ${CYAN}npx hashgraph-mcp --help${RESET}     ${DIM}Show all available options${RESET}`);
console.log("");
console.log(`  ${BOLD}Claude Desktop Setup:${RESET}`);
console.log(`  Add this to your ${DIM}claude_desktop_config.json${RESET}:`);
console.log(`  ${DIM}{${RESET}`);
console.log(`  ${DIM}  "mcpServers": {${RESET}`);
console.log(`  ${DIM}    "hashgraph": {${RESET}`);
console.log(`  ${DIM}      "command": "npx",${RESET}`);
console.log(`  ${DIM}      "args": ["-y", "hashgraph-mcp"]${RESET}`);
console.log(`  ${DIM}    }${RESET}`);
console.log(`  ${DIM}  }${RESET}`);
console.log(`  ${DIM}}${RESET}`);
console.log("");
console.log(`  ${BOLD}Docs:${RESET}     ${CYAN}https://hashgraph-eight.vercel.app/docs.html${RESET}`);
console.log(`  ${BOLD}GitHub:${RESET}   ${CYAN}https://github.com/Nifemi0/HashGraph${RESET}`);
console.log("");
