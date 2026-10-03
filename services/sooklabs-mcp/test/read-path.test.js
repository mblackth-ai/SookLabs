import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { getControlPlaneSnapshot } from "../../../lib/hq/control-plane.js";
import { loadConfig } from "../src/config.js";
import { readControlPlaneBlockers } from "../src/control-plane.js";
import { buildStatus, deployStatus, projectStatus } from "../src/github.js";

process.chdir(fileURLToPath(new URL("../../../", import.meta.url)));

test("blockers tool source matches getControlPlaneSnapshot().blockers exactly", async () => {
  const snapshot = await getControlPlaneSnapshot();
  const blockers = await readControlPlaneBlockers();
  assert.deepEqual(blockers, snapshot.blockers);
  assert.ok(Array.isArray(blockers));
  for (const entry of blockers) {
    assert.equal(typeof entry.id, "string");
    assert.equal(typeof entry.title, "string");
    assert.ok(entry.status === "open" || entry.status === "resolved");
    assert.equal("number" in entry, false, "blockers must not be GitHub issue rows");
    assert.equal("html_url" in entry, false, "blockers must not be GitHub issue rows");
  }
  assert.notEqual(typeof snapshot.overallProgress, "undefined");
});

test("project_status is GitHub-only and never carries control-plane progress fields", async () => {
  const github = {
    async getRepository() {
      return {
        full_name: "mblackth-ai/SookLabs",
        default_branch: "master",
        pushed_at: "2026-01-01T00:00:00Z",
        homepage: "https://sooklabs.com",
        private: true,
      };
    },
    async listOpenIssues() {
      return [{ id: 1, title: "issue", state: "open" }];
    },
  };
  const payload = await projectStatus(github, "codex");
  assert.deepEqual(Object.keys(payload).sort(), [
    "default_branch",
    "homepage",
    "last_push_at",
    "open_issue_count",
    "repo",
    "seat",
    "visibility",
  ]);
  assert.equal(payload.overallProgress, undefined);
  assert.equal(payload.blockers, undefined);
  assert.equal(payload.fronts, undefined);
});

test("github read tools stay read-only summaries without control-plane keys", async () => {
  const github = {
    async getRepository() {
      return {
        full_name: "mblackth-ai/SookLabs",
        default_branch: "master",
        pushed_at: "2026-01-01T00:00:00Z",
        homepage: null,
        private: false,
        visibility: "public",
      };
    },
    async getDefaultBranchHeadSha() {
      return "deadbeef";
    },
    async listCheckRunsForRef() {
      return [{ name: "ci", status: "completed", conclusion: "success", html_url: "https://example.test/run" }];
    },
    async listCommitStatusesForRef() {
      return [];
    },
    async listDeployments() {
      return [{ id: 9, environment: "production", sha: "deadbeef", created_at: "2026-01-01T00:00:00Z", url: null }];
    },
    async listDeploymentStatuses() {
      return [{ state: "success", environment_url: "https://example.test", log_url: null }];
    },
  };
  const build = await buildStatus(github, "claude");
  assert.equal(build.sha, "deadbeef");
  assert.equal(build.overallProgress, undefined);
  const deploy = await deployStatus(github, "claude");
  assert.equal(deploy.deployments.length, 1);
  assert.equal(deploy.overallProgress, undefined);
  assert.deepEqual(Object.keys(deploy).sort(), ["deployments", "homepage", "seat"]);
  assert.deepEqual(Object.keys(build).sort(), ["checks", "seat", "sha"]);
});

test("partial OAuth configuration stays fail-closed with mcp_not_configured", async (t) => {
  const { createApp } = await import("../src/server.js");
  const cases = [
    {
      name: "empty issuer",
      env: {
        SOOKLABS_MCP_OAUTH_ISSUER_URL: "",
        SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
        SOOKLABS_MCP_SEAT_ALLOWLIST: JSON.stringify({ "worker-a@clients": "codex" }),
      },
    },
    {
      name: "empty seat allowlist",
      env: {
        SOOKLABS_MCP_OAUTH_ISSUER_URL: "https://tenant.example.test/",
        SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
        SOOKLABS_MCP_SEAT_ALLOWLIST: "",
      },
    },
  ];
  for (const { name, env } of cases) {
    await t.test(name, async () => {
      const server = createServer(await createApp(loadConfig(env)));
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
      }));
      const response = await fetch(`http://127.0.0.1:${server.address().port}/mcp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
        signal: AbortSignal.timeout(10_000),
      });
      assert.equal(response.status, 401);
      assert.equal((await response.json()).error, "mcp_not_configured");
    });
  }
});

test("v1 read path serves all four tools over Streamable HTTP without live GitHub", async (t) => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = { ...await exportJWK(publicKey), kid: "read-path", alg: "RS256", use: "sig" };
  let issuer;
  const authority = createServer((req, res) => {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(req.url === "/jwks"
      ? { keys: [jwk] }
      : { issuer, jwks_uri: `${issuer}/jwks` }));
  });
  issuer = await new Promise((resolve) => {
    authority.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${authority.address().port}`));
  });
  t.after(() => new Promise((resolve, reject) => {
    authority.close((error) => error ? reject(error) : resolve());
    authority.closeAllConnections();
  }));

  const repoBase = "https://api.github.com/repos/mblackth-ai/SookLabs";
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.startsWith(repoBase)) {
      const path = url.slice(repoBase.length).split("?")[0];
      const json = (body, status = 200) => new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      });
      if (path === "") {
        return json({
          full_name: "mblackth-ai/SookLabs",
          default_branch: "master",
          pushed_at: "2026-01-01T00:00:00Z",
          homepage: null,
          private: true,
        });
      }
      if (path === "/issues") return json([]);
      if (path === "/git/ref/heads/master") return json({ object: { sha: "cafebabe" } });
      if (path === "/commits/cafebabe/check-runs") return json({ check_runs: [] });
      if (path === "/commits/cafebabe/status") return json({ statuses: [] });
      if (path === "/deployments") return json([]);
      return json({ message: "unexpected github path" }, 404);
    }
    return originalFetch(input, init);
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const { createApp } = await import("../src/server.js");
  const config = loadConfig({
    SOOKLABS_MCP_OAUTH_ISSUER_URL: issuer,
    SOOKLABS_MCP_RESOURCE_IDENTIFIER: "https://mcp.example.test/mcp",
    SOOKLABS_MCP_SEAT_ALLOWLIST: JSON.stringify({ "worker-a@clients": "codex" }),
  });
  const app = createServer(await createApp(config));
  const baseUrl = await new Promise((resolve) => {
    app.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${app.address().port}`));
  });
  t.after(() => new Promise((resolve, reject) => {
    app.close((error) => error ? reject(error) : resolve());
    app.closeAllConnections();
  }));

  const token = await new SignJWT({
    sub: "worker-a@clients",
    iss: issuer,
    aud: config.resourceIdentifier,
    scope: "sooklabs:read",
    exp: Math.floor(Date.now() / 1000) + 300,
  }).setProtectedHeader({ alg: "RS256", kid: "read-path" }).sign(privateKey);

  async function mcp(body, session) {
    const headers = {
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
    if (session) headers["mcp-session-id"] = session;
    return fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  }

  const init = await mcp({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "read-path-contract", version: "1" },
    },
  });
  assert.equal(init.status, 200);
  const session = init.headers.get("mcp-session-id");
  assert.ok(session);
  await init.json();
  assert.equal((await mcp({ jsonrpc: "2.0", method: "notifications/initialized" }, session)).status, 202);

  const expectedBlockers = await readControlPlaneBlockers();
  const toolNames = ["project_status", "blockers", "build_status", "deploy_status"];
  for (const [index, name] of toolNames.entries()) {
    const response = await mcp({
      jsonrpc: "2.0",
      id: 10 + index,
      method: "tools/call",
      params: { name, arguments: {} },
    }, session);
    assert.equal(response.status, 200, name);
    const data = await response.json();
    const structured = data.result.structuredContent;
    assert.equal(structured.seat, "codex");
    if (name === "blockers") {
      assert.deepEqual(Object.keys(structured).sort(), ["blockers", "seat"]);
      assert.deepEqual(structured.blockers, expectedBlockers);
      assert.equal(structured.overallProgress, undefined);
    }
    if (name === "project_status") {
      assert.equal(structured.repo, "mblackth-ai/SookLabs");
      assert.equal(structured.overallProgress, undefined);
    }
    if (name === "build_status") {
      assert.equal(structured.sha, "cafebabe");
    }
    if (name === "deploy_status") {
      assert.deepEqual(structured.deployments, []);
    }
  }
});
