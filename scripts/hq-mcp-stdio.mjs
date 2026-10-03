#!/usr/bin/env node
/**
 * Local stdio bridge to the remote HQ MCP endpoint, for Cursor / Claude CLI.
 * Forwards tools/list and tools/call to HQ over Streamable HTTP, so no
 * database credentials live on laptops.
 *
 *   HQ_MCP_URL=https://hq.sooklabs.com/api/mcp HQ_MCP_READ_TOKEN=... node scripts/hq-mcp-stdio.mjs
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const url = process.env.HQ_MCP_URL || "https://hq.sooklabs.com/api/mcp";
const token = process.env.HQ_MCP_READ_TOKEN;
if (!token) {
  console.error("hq-mcp-stdio: set HQ_MCP_READ_TOKEN (and HQ_MCP_URL for a non-production HQ).");
  process.exit(1);
}

const remote = new Client({ name: "hq-mcp-stdio", version: "0.1.0" });
await remote.connect(
  new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers: { Authorization: `Bearer ${token}` } } })
);

const local = new Server(
  { name: "sooklabs-hq (via stdio bridge)", version: "0.1.0" },
  { capabilities: { tools: {} }, instructions: remote.getInstructions() }
);
local.setRequestHandler(ListToolsRequestSchema, () => remote.listTools());
local.setRequestHandler(CallToolRequestSchema, (request) => remote.callTool(request.params));

await local.connect(new StdioServerTransport());
console.error(`hq-mcp-stdio: bridging stdio → ${url}`);
