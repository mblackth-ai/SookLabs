import assert from "node:assert/strict";
import test from "node:test";
import { HQ_ROOM_MCP_PROTOCOL_VERSIONS, ROOM_MCP_URL } from "./room-mcp-endpoint.js";

test("room MCP public URL is the canonical hq subdomain path", () => {
  assert.match(ROOM_MCP_URL, /^https:\/\/hq\.sooklabs\.com\/hq\/api\/room\/mcp$/);
  assert.ok(HQ_ROOM_MCP_PROTOCOL_VERSIONS.includes("2025-06-18"));
});
