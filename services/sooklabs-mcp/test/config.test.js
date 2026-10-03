import assert from "node:assert/strict";
import { test } from "node:test";
import { loadConfig, parseSeatRegistry } from "../src/config.js";
import { authorizedSeat } from "../src/seat-auth.js";

test("one registry maps managed issuer subjects to canonical room seats", () => {
  const config = loadConfig({
    SOOKLABS_MCP_OAUTH_ISSUER_URL: "https://tenant.example.test/",
    SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
    SOOKLABS_MCP_SEAT_ALLOWLIST: JSON.stringify({ "worker-a@clients": "codex", "worker-b@clients": "claude" }),
  });
  assert.equal(config.isAuthConfigured, true);
  assert.equal(authorizedSeat(config, "worker-a@clients"), "codex");
  assert.equal(authorizedSeat(config, "worker-b@clients"), "claude");
  assert.equal(authorizedSeat(config, "unlisted@clients"), null);
  assert.equal(authorizedSeat(config, "codex"), null);
});
test("legacy explicit seat list stays compatible", () => {
  const registry = parseSeatRegistry("codex, claude");
  assert.equal(authorizedSeat(registry, "codex"), "codex");
});
test("invalid registry fails closed", () => {
  for (const raw of ['{broken', '{"worker":"invented-seat"}', '{"worker":null}', 'unlisted-seat', "{}"]) {
    assert.deepEqual(parseSeatRegistry(raw).seatAllowlist, []);
  }
});
test("empty and invalid auth configuration stays disabled", () => {
  const base = {
    SOOKLABS_MCP_OAUTH_ISSUER_URL: "https://tenant.example.test/",
    SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
    SOOKLABS_MCP_SEAT_ALLOWLIST: "codex",
  };
  for (const patch of [
    { SOOKLABS_MCP_OAUTH_ISSUER_URL: "" },
    { SOOKLABS_MCP_SEAT_ALLOWLIST: "" },
    { SOOKLABS_MCP_RESOURCE_IDENTIFIER: "not-a-url" },
    { SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/wrong-path" },
    { SOOKLABS_MCP_OAUTH_ISSUER_URL: "http://public.example.test" },
  ]) assert.equal(loadConfig({ ...base, ...patch }).isAuthConfigured, false);
});
