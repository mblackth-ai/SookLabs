import assert from "node:assert/strict";
import test from "node:test";
import { adapterFor, buildEnvelope, decideRoute, parseMentions, seatPresenceFor } from "./swarm-routing.js";

const targets = (decision) => decision.targets.map((t) => `${t.seatId}:${t.reason}`).sort();
const msg = (seatId, body, extra = {}) => ({ id: "m1", seatId, kind: "chat", body, refs: [], ...extra });

test("parseMentions finds @seat and @all, not emails", () => {
  assert.deepEqual(parseMentions("@all please, and @Claude too. mail mark@sooklabs.com"), ["all", "claude"]);
  assert.deepEqual(parseMentions("(@grok) review"), ["grok"]);
});

test("Test 1: a plain Mark message fans out to every agent seat once", () => {
  const decision = decideRoute(msg("mark", "Review the current HQ state and report one blocker."));
  assert.deepEqual(targets(decision), [
    "chatgpt:mark-default",
    "claude:mark-default",
    "codex:mark-default",
    "cursor:mark-default",
    "gemini:mark-default",
    "grok:mark-default",
  ]);
  assert.equal(decision.hop, 1);
});

test("Test 2: @claude from Mark dispatches only Claude", () => {
  assert.deepEqual(targets(decideRoute(msg("mark", "@claude Review the room persistence implementation."))), ["claude:mention"]);
  assert.deepEqual(targets(decideRoute(msg("mark", "@all Review PR #14"))).length, 6);
  assert.deepEqual(targets(decideRoute(msg("mark", "@nobody hello"))), []);
});

test("Test 3: an agent reply with no mention or baton dispatches nobody", () => {
  const decision = decideRoute(msg("claude", "Persistence is good. I recommend another index.", { hop: 1 }));
  assert.deepEqual(decision.targets, []);
});

test("Test 4: an agent baton to Cursor dispatches exactly Cursor", () => {
  const decision = decideRoute(
    msg("claude", "Branch ready", { kind: "baton", baton: { to: "cursor", status: "todo", task: "Integrate" }, hop: 1 })
  );
  assert.deepEqual(targets(decision), ["cursor:baton"]);
  assert.equal(decision.hop, 2);
});

test("agents cannot @all unless orchestrator; never themselves; hop limit stops chains", () => {
  assert.deepEqual(decideRoute(msg("claude", "@all thoughts?")).targets, []);
  assert.match(decideRoute(msg("claude", "@all thoughts?")).note, /orchestrator/);
  assert.equal(decideRoute(msg("grok", "@all report status")).targets.length, 5);
  assert.deepEqual(targets(decideRoute(msg("claude", "@claude @codex check this"))), ["codex:mention"]);
  assert.deepEqual(decideRoute(msg("claude", "@codex again", { hop: 3 })).targets, []);
  assert.deepEqual(targets(decideRoute(msg("claude", "@codex again", { hop: 3 }), { env: { HQ_ROOM_MAX_HOPS: "5" } })), [
    "codex:mention",
  ]);
  assert.deepEqual(decideRoute(msg("crew", "@all hi")).targets, []);
  assert.deepEqual(decideRoute(msg("mark", "Shipped.", { kind: "status" })).targets, []);
});

test("Test 5 (rules): adapters need their credential; none means offline", () => {
  assert.deepEqual(adapterFor("chatgpt", {}), { kind: "none", ready: false, missing: "HQ_SEAT_ADAPTER_CHATGPT" });
  assert.equal(adapterFor("chatgpt", { HQ_SEAT_ADAPTER_CHATGPT: "openai" }).missing, "OPENAI_API_KEY");
  assert.equal(adapterFor("chatgpt", { HQ_SEAT_ADAPTER_CHATGPT: "openai", OPENAI_API_KEY: "k" }).ready, true);
  assert.equal(adapterFor("cursor", { HQ_SEAT_ADAPTER_CURSOR: "pull" }).ready, false);
  assert.equal(adapterFor("cursor", { HQ_SEAT_ADAPTER_CURSOR: "pull", HQ_ROOM_CONNECTION_CURSOR: "c" }).ready, true);
  assert.equal(adapterFor("grok", { HQ_SEAT_ADAPTER_GROK: "webhook", HQ_SEAT_WEBHOOK_URL_GROK: "https://x" }).ready, true);
  const now = Date.now();
  const env = { HQ_SEAT_ADAPTER_CURSOR: "pull", HQ_ROOM_CONNECTION_CURSOR: "c" };
  assert.equal(seatPresenceFor({ id: "cursor" }, { env, lastSeenAt: new Date(now - 60_000).toISOString(), now }).online, true);
  assert.equal(seatPresenceFor({ id: "cursor" }, { env, lastSeenAt: new Date(now - 600_000).toISOString(), now }).online, false);
  assert.equal(JSON.stringify(seatPresenceFor({ id: "cursor" }, { env, now })).includes('"c"'), false);
});

test("envelope is bounded and carries identity, thread and reply instructions", () => {
  const recent = Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, seatId: "codex", seat: "Codex", kind: "chat", body: "x".repeat(2000), createdAt: `t${i}` }));
  const source = { id: "src", seatId: "mark", body: "Review MCP readiness.", refs: [{ type: "pr", ref: "#14" }], channel: "room" };
  const env = buildEnvelope({
    dispatch: { id: "d1", threadId: "src", seatId: "claude", reason: "mark-default", hop: 1 },
    source,
    recent: [...recent, source],
    baton: { to: "claude", status: "todo", task: "Index", next: "" },
    prs: Array.from({ length: 9 }, (_, i) => ({ number: i, repo: "a/b", title: "t", ciState: "pass", url: "u" })),
  });
  assert.equal(env.seat.id, "claude");
  assert.equal(env.from.id, "mark");
  assert.equal(env.threadId, "src");
  assert.equal(env.channel, "room");
  assert.equal(env.reply.body.channel, "room");
  assert.equal(env.reply.body.dispatchId, "d1");
  assert.ok(env.recent.length <= 12);
  assert.ok(env.recent.every((m) => m.body.length <= 600));
  assert.ok(JSON.stringify(env.recent).length < 9000);
  assert.equal(env.prs.length, 5);
  assert.ok(!env.recent.some((m) => m.body === source.body));
});
