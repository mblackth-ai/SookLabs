import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JOIN_GUIDE } from "./join-guide.js";
import { ROOM_MCP_URL } from "./room-mcp-endpoint.js";

test("cursor project mcp.json registers the HQ room and does not embed a key", () => {
  const raw = readFileSync(new URL("../../.cursor/mcp.json", import.meta.url), "utf8");
  const config = JSON.parse(raw);
  assert.deepEqual(Object.keys(config.mcpServers), ["sooklabs-hq"]);
  const server = config.mcpServers["sooklabs-hq"];
  assert.equal(server.url, ROOM_MCP_URL);
  assert.deepEqual(server.headers, { Authorization: "Bearer ${env:HQ_ROOM_CONNECTION}" });
  assert.equal("command" in server, false);
  assert.doesNotMatch(raw, /Bearer [A-Za-z0-9]/);
  assert.match(JOIN_GUIDE, /\.cursor\/mcp\.json/);
  assert.match(JOIN_GUIDE, /\$\{env:HQ_ROOM_CONNECTION\}/);
});
