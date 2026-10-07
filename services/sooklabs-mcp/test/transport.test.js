import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { loadConfig } from "../src/config.js";

// Shared file-backed HQ state is read from the repository root, as in service startup.
process.chdir(fileURLToPath(new URL("../../../", import.meta.url)));
const { createApp } = await import("../src/server.js");

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return `http://127.0.0.1:${server.address().port}`;
}
function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  });
}

test("Streamable HTTP authenticates seats and isolates two concurrent clients", async (t) => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = { ...await exportJWK(publicKey), kid: "transport-test", alg: "RS256", use: "sig" };
  let issuer;
  const authority = createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(req.url === "/jwks"
      ? { keys: [jwk] }
      : { issuer, jwks_uri: `${issuer}/jwks` }));
  });
  issuer = await listen(authority);
  t.after(() => close(authority));
  const config = loadConfig({
    SOOKLABS_MCP_OAUTH_ISSUER_URL: issuer,
    SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
    SOOKLABS_MCP_SEAT_ALLOWLIST: JSON.stringify({ "codex-service@clients": "codex", "claude-service@clients": "claude" }),
  });
  const app = createServer(await createApp(config));
  const url = await listen(app);
  t.after(() => close(app));
  const sign = (sub, claims = {}) => new SignJWT({
    sub, iss: issuer, aud: config.resourceIdentifier, scope: "sooklabs:read",
    exp: Math.floor(Date.now() / 1000) + 300, ...claims,
  }).setProtectedHeader({ alg: "RS256", kid: "transport-test" }).sign(privateKey);
  const codex = await sign("codex-service@clients");
  const claude = await sign("claude-service@clients");
  async function request(token, session, method = "POST", body) {
    const headers = { accept: "application/json, text/event-stream", "content-type": "application/json" };
    if (token) headers.authorization = `Bearer ${token}`;
    if (session) headers["mcp-session-id"] = session;
    return fetch(`${url}/mcp`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10_000),
    });
  }
  const initialize = { jsonrpc: "2.0", id: 1, method: "initialize", params: {
    protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "acceptance-test", version: "1" },
  } };
  await t.test("unauthenticated caller is refused with discovery challenge", async () => {
    const response = await request(null, null, "POST", initialize);
    assert.equal(response.status, 401);
    assert.match(response.headers.get("www-authenticate"), /resource_metadata/);
  });
  await t.test("missing scope and unlisted subject are denied", async () => {
    assert.equal((await request(await sign("codex-service@clients", { scope: "" }), null, "POST", initialize)).status, 403);
    assert.equal((await request(await sign("unlisted-service@clients"), null, "POST", initialize)).status, 403);
  });
  await t.test("wrong audience and malformed credentials are rejected", async () => {
    assert.equal((await request(await sign("codex-service@clients", { aud: "https://other.example.test/mcp" }), null, "POST", initialize)).status, 401);
    assert.equal((await request("not-a-token", null, "POST", initialize)).status, 401);
  });
  const [codexInit, claudeInit] = await Promise.all([
    request(codex, null, "POST", initialize), request(claude, null, "POST", initialize),
  ]);
  assert.equal(codexInit.status, 200);
  assert.equal(claudeInit.status, 200);
  const codexSession = codexInit.headers.get("mcp-session-id");
  const claudeSession = claudeInit.headers.get("mcp-session-id");
  assert.ok(codexSession);
  assert.ok(claudeSession);
  assert.notEqual(codexSession, claudeSession);
  await codexInit.json();
  await claudeInit.json();
  for (const [token, session] of [[codex, codexSession], [claude, claudeSession]]) {
    assert.equal((await request(token, session, "POST", { jsonrpc: "2.0", method: "notifications/initialized" })).status, 202);
  }
  await t.test("another authenticated seat cannot read post or delete the session", async () => {
    for (const method of ["POST", "GET", "DELETE"]) {
      const response = await request(claude, codexSession, method, method === "POST"
        ? { jsonrpc: "2.0", id: 2, method: "tools/list" } : undefined);
      assert.equal(response.status, 403);
    }
  });
  await t.test("both seats retain independent read-only tool sessions and shared blockers", async () => {
    const lists = await Promise.all([[codex, codexSession], [claude, claudeSession]].map(async ([token, session]) => {
      const response = await request(token, session, "POST", { jsonrpc: "2.0", id: 3, method: "tools/list" });
      assert.equal(response.status, 200);
      const data = await response.json();
      assert.deepEqual(data.result.tools.map((tool) => tool.name).sort(), ["blockers", "build_status", "deploy_status", "project_status"]);
      assert.ok(data.result.tools.every((tool) => tool.annotations.readOnlyHint === true));
      const result = await request(token, session, "POST", { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "blockers", arguments: {} } });
      return (await result.json()).result.structuredContent;
    }));
    assert.equal(lists[0].seat, "codex");
    assert.equal(lists[1].seat, "claude");
    assert.deepEqual(lists[0].blockers, lists[1].blockers);
  });
  for (const [token, session] of [[codex, codexSession], [claude, claudeSession]]) {
    assert.equal((await request(token, session, "DELETE")).status, 200);
  }
});

test("unconfigured service stays fail-closed on every MCP method", async (t) => {
  const server = createServer(await createApp(loadConfig({})));
  const url = await listen(server);
  t.after(() => close(server));
  for (const method of ["POST", "GET", "DELETE"]) {
    const response = await fetch(`${url}/mcp`, { method, signal: AbortSignal.timeout(10_000) });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error, "mcp_not_configured");
  }
});
