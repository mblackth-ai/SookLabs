import assert from "node:assert/strict";
import test from "node:test";
import { ROOM_MCP_URL } from "./room-mcp-endpoint.js";

test("room MCP URL is the production Streamable HTTP endpoint", () => {
  assert.equal(ROOM_MCP_URL, "https://hq.sooklabs.com/hq/api/room/mcp");
});
