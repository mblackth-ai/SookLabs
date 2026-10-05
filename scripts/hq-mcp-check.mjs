#!/usr/bin/env node
/**
 * Check one seat's MCP connection to the HQ room. No dependencies.
 *
 *   HQ_ROOM_CONNECTION=<this seat's key> node scripts/hq-mcp-check.mjs [url]
 *
 * url defaults to https://hq.sooklabs.com/hq/api/room/mcp. The key is read
 * from the environment and never printed. Read-only: initialize, tools/list,
 * room_inbox (which also marks the seat as seen) and room_board.
 */
import { ROOM_MCP_URL } from "../lib/hq/room-mcp-endpoint.js";

const url = process.argv[2] || process.env.HQ_MCP_URL || ROOM_MCP_URL;
const key = (process.env.HQ_ROOM_CONNECTION || "").trim();
if (!key) {
  console.error("Set HQ_ROOM_CONNECTION to this seat's key (it is not printed).");
  process.exit(2);
}

let id = 0;
async function rpc(method, params) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", authorization: `Bearer ${key}` },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) throw new Error(`${method}: HTTP ${res.status} ${body.error?.message || ""}`.trim());
  return body.result;
}

try {
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "hq-mcp-check", version: "1" } });
  const seat = (init.instructions?.match(/seat "([a-z]+)"/) || [])[1] || "?";
  console.log(`connected: ${init.serverInfo?.name} ${init.serverInfo?.version}, protocol ${init.protocolVersion}, seat ${seat}`);
  const tools = await rpc("tools/list");
  console.log(`tools: ${tools.tools.map((tool) => tool.name).join(", ")}`);
  const inbox = await rpc("tools/call", { name: "room_inbox", arguments: {} });
  if (inbox.isError) throw new Error(`room_inbox: ${inbox.content?.[0]?.text}`);
  console.log(`inbox: ${inbox.structuredContent.dispatches.length} dispatch(es) waiting`);
  const board = await rpc("tools/call", { name: "room_board", arguments: {} });
  console.log(`board: ${board.structuredContent?.board?.length ?? 0} baton row(s)`);
  console.log("OK");
} catch (error) {
  console.error(`FAILED: ${error.message}`);
  process.exit(1);
}
