import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { SOOKLABS_GITHUB_REPO, SOOKLABS_MCP_REQUIRED_SCOPE } from "../src/constants.js";
import { loadConfig } from "../src/config.js";

test("healthz reports repo lock without exposing tokens", async (t) => {
  const { createApp } = await import("../src/server.js");
  const server = createServer(await createApp(loadConfig({})));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/healthz`, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.githubRepo, SOOKLABS_GITHUB_REPO);
  assert.equal(body.authConfigured, false);
  assert.equal(body.githubTokenPresent, false);
  assert.equal(body.githubToken, undefined);
  assert.equal(body.token, undefined);
});

test("OAuth protected-resource metadata advertises sooklabs:read only", async (t) => {
  let issuer;
  const authority = createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    const body = req.url === "/jwks"
      ? { keys: [] }
      : { issuer, jwks_uri: `${issuer}/jwks` };
    res.end(JSON.stringify(body));
  });
  authority.listen(0, "127.0.0.1");
  await once(authority, "listening");
  issuer = `http://127.0.0.1:${authority.address().port}`;
  t.after(() => new Promise((resolve, reject) => {
    authority.close((error) => error ? reject(error) : resolve());
    authority.closeAllConnections();
  }));

  const { createApp } = await import("../src/server.js");
  const config = loadConfig({
    SOOKLABS_MCP_OAUTH_ISSUER_URL: issuer,
    SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
    SOOKLABS_MCP_SEAT_ALLOWLIST: JSON.stringify({ "worker-a@clients": "codex" }),
  });
  const server = createServer(await createApp(config));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/.well-known/oauth-protected-resource/mcp`,
    { signal: AbortSignal.timeout(10_000) },
  );
  assert.equal(response.status, 200);
  const metadata = await response.json();
  assert.deepEqual(metadata.scopes_supported, [SOOKLABS_MCP_REQUIRED_SCOPE]);
  assert.equal(metadata.resource, "https://mcp.example.test/mcp");
});
