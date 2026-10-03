#!/usr/bin/env node
/**
 * HQ MCP M0 acceptance smoke (docs/adr/2026-10-hq-mcp-server.md → "M0 acceptance").
 *
 *   HQ_MCP_URL=http://localhost:3008/hq/api/mcp HQ_MCP_READ_TOKEN=... \
 *   HQ_SESSION_COOKIE='hq_session=...' node scripts/hq-mcp-smoke.mjs
 *
 * Checks: exactly the six M0 tools; every tool answers; retainer_delivery equals
 * the UI's /hq/api/control-plane retainerDelivery; no/wrong token → 401; tools
 * are read-only; bad input → tool error, not a crash. Exits 1 on any failure.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = process.env.HQ_MCP_URL || "http://localhost:3008/hq/api/mcp";
const token = process.env.HQ_MCP_READ_TOKEN;
const cookie = process.env.HQ_SESSION_COOKIE;
const EXPECTED = ["hq_status", "next_actions", "pending_approvals", "project_status", "rdusa_value_expansion", "retainer_delivery"];

let failed = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

async function connect(bearer) {
  const client = new Client({ name: "hq-mcp-smoke", version: "0.1.0" });
  const headers = bearer ? { Authorization: `Bearer ${bearer}` } : {};
  await client.connect(new StreamableHTTPClientTransport(new URL(url), { requestInit: { headers } }));
  return client;
}

const parse = (result) => JSON.parse(result.content?.[0]?.text ?? "null");

for (const [label, bearer] of [["no token", null], ["wrong token", "x".repeat(64)]]) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  });
  check(`${label} → 401`, res.status === 401, `got ${res.status}`);
}

const client = await connect(token);
const { tools } = await client.listTools();
const names = tools.map((tool) => tool.name).sort();
check("lists exactly the six M0 tools", JSON.stringify(names) === JSON.stringify(EXPECTED), names.join(", "));
check("every tool is annotated read-only", tools.every((tool) => tool.annotations?.readOnlyHint === true));

for (const [name, args] of [
  ["hq_status", {}],
  ["project_status", { frontId: "hq" }],
  ["pending_approvals", {}],
  ["rdusa_value_expansion", {}],
  ["retainer_delivery", {}],
  ["retainer_delivery", { clientId: "rdusa" }],
  ["next_actions", { status: "ready" }],
]) {
  const result = await client.callTool({ name, arguments: args });
  const body = parse(result);
  check(`${name}(${JSON.stringify(args)})`, !result.isError && body !== null, result.isError ? result.content?.[0]?.text : `${JSON.stringify(body).length} bytes`);
}

const bad = await client.callTool({ name: "project_status", arguments: { frontId: "no-such-front" } });
check("unknown frontId → tool error, not a crash", bad.isError === true, bad.content?.[0]?.text?.slice(0, 80));

if (cookie) {
  const ui = await (await fetch(new URL("/hq/api/control-plane", url), { headers: { Cookie: cookie } })).json();
  const viaMcp = parse(await client.callTool({ name: "retainer_delivery", arguments: {} }));
  check("retainer_delivery equals UI control-plane retainerDelivery", JSON.stringify(viaMcp) === JSON.stringify(ui.data?.retainerDelivery));
  const hq = parse(await client.callTool({ name: "hq_status", arguments: {} }));
  check("hq_status.eightFrontsOverall equals UI", hq.eightFrontsOverall === ui.data?.eightFrontsOverall, `${hq.eightFrontsOverall} vs ${ui.data?.eightFrontsOverall}`);
} else {
  console.log("SKIP UI parity — set HQ_SESSION_COOKIE to compare with /hq/api/control-plane");
}

await client.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nall checks passed");
process.exit(failed ? 1 : 0);
