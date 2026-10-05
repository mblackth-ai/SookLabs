import assert from "node:assert/strict";
import test from "node:test";
import { MCP_TOOLS, handleRpc, isRpcPayload } from "./room-mcp-rpc.js";

const calls = [];
const ctx = (seat = "codex", callTool) => ({
  seat,
  authError: seat ? null : { status: 401, error: "Send this seat's connection." },
  callTool:
    callTool ||
    (async (input) => {
      calls.push(input);
      return { ok: true, messages: [{ id: "m1" }] };
    }),
});

test("rpc: only JSON-RPC 2.0 bodies take the MCP path; legacy {name,args} does not", () => {
  assert.equal(isRpcPayload({ jsonrpc: "2.0", id: 1, method: "ping" }), true);
  assert.equal(isRpcPayload([{ jsonrpc: "2.0", method: "notifications/initialized" }]), true);
  assert.equal(isRpcPayload({ name: "room_read", args: {} }), false);
  assert.equal(isRpcPayload([]), false);
});

test("rpc: initialize negotiates the version and names the seat; unknown versions get the latest", async () => {
  const out = await handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26" } }, ctx());
  assert.equal(out.result.protocolVersion, "2025-03-26");
  assert.deepEqual(out.result.capabilities, { tools: { listChanged: false } });
  assert.equal(out.result.serverInfo.name, "sooklabs-hq-room");
  assert.match(out.result.instructions, /seat "codex"/);
  const later = await handleRpc({ jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "2099-01-01" } }, ctx());
  assert.equal(later.result.protocolVersion, "2025-06-18");
});

test("rpc: notifications get no response; batches drop them", async () => {
  assert.equal(await handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }, ctx()), null);
  const out = await handleRpc([{ jsonrpc: "2.0", method: "notifications/initialized" }, { jsonrpc: "2.0", id: 9, method: "ping" }], ctx());
  assert.deepEqual(out, [{ jsonrpc: "2.0", id: 9, result: {} }]);
});

test("rpc: every request needs a seat key, including initialize and tools/list", async () => {
  for (const method of ["initialize", "tools/list", "ping"]) {
    const out = await handleRpc({ jsonrpc: "2.0", id: 1, method }, ctx(""));
    assert.equal(out.error.code, -32001);
  }
});

test("rpc: tools/list exposes the room tools and no write-to-world tools", async () => {
  const out = await handleRpc({ jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx());
  const names = out.result.tools.map((tool) => tool.name);
  assert.deepEqual(names, ["room_read", "room_board", "room_inbox", "room_claim", "room_enroll_pending", "room_enroll_decide", "hq_status", "hq_next_actions", "room_post"]);
  for (const banned of ["promote", "broadcast", "merge", "deploy", "publish"]) assert.ok(!names.some((name) => name.includes(banned)));
  for (const tool of MCP_TOOLS) assert.equal(tool.inputSchema.type, "object");
  for (const tool of MCP_TOOLS.filter((item) => item.name.startsWith("hq_"))) assert.equal(tool.annotations.readOnlyHint, true, tool.name);
});

test("rpc: tools/call maps to the room tool; room_post defaults to chat", async () => {
  calls.length = 0;
  const read = await handleRpc({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "room_read", arguments: { after: "x" } } }, ctx());
  assert.equal(read.result.isError, false);
  assert.deepEqual(read.result.structuredContent, { messages: [{ id: "m1" }] });
  assert.equal(JSON.parse(read.result.content[0].text).messages[0].id, "m1");
  await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "room_post", arguments: { body: "hi" } } }, ctx());
  assert.deepEqual(calls, [
    { name: "room_read", args: { after: "x" } },
    { name: "room_post", args: { kind: "chat", body: "hi" } },
  ]);
});

test("rpc: a tool refusal is an isError result, an unknown tool or method is a protocol error", async () => {
  const refused = await handleRpc(
    { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "room_post", arguments: { kind: "decision", body: "ship" } } },
    ctx("codex", async () => ({ ok: false, status: 403, error: "Only Mark can post a decision." }))
  );
  assert.equal(refused.result.isError, true);
  assert.equal(refused.result.content[0].text, "Only Mark can post a decision.");
  const unknown = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "room_promote" } }, ctx());
  assert.equal(unknown.error.code, -32602);
  const missing = await handleRpc({ jsonrpc: "2.0", id: 3, method: "sampling/createMessage" }, ctx());
  assert.equal(missing.error.code, -32601);
});
