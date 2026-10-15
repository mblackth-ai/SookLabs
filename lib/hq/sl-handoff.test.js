import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { identifySeat } from "./room-connection.js";
import { authorizeSlPost, gateSlPost } from "./sl-handoff.js";
import { buildEnvelope, decideRoute } from "./swarm-routing.js";
import { gateRoomKind, normalizeBaton, promotionFiles } from "./swarm-contract.js";
import { replyWakesLoop } from "./dispatch-guard.js";

const task = "Record the handoff";
const next = "Open the PR";
const dispatched = { slId: "SL-001", to: "codex", reviewer: "claude", status: "dispatched", task, next };
const prRef = [{ type: "pr", ref: "example/repo#1" }];
const docRef = [{ type: "doc", ref: "docs/fixture.md" }];

function baton(raw, kind = "baton") {
  const parsed = normalizeBaton(raw, kind);
  assert.equal(parsed.ok, true, parsed.error);
  return parsed.baton;
}

test("acceptance 1: an SL baton round-trips slId and reviewer", () => {
  const parsed = normalizeBaton(dispatched, "baton");
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.baton, {
    to: "codex",
    status: "dispatched",
    task,
    next,
    approval: null,
    slId: "SL-001",
    reviewer: "claude",
  });
  assert.equal(normalizeBaton({ ...dispatched, to: "Codex", reviewer: "Claude" }, "baton").baton.reviewer, "claude");
});

test("acceptance 2: the reviewer cannot be the assignee", () => {
  for (const reviewer of ["codex", "Codex", "CODEX"]) {
    const parsed = normalizeBaton({ ...dispatched, reviewer }, "baton");
    assert.equal(parsed.ok, false, reviewer);
    assert.equal(parsed.status, 400);
    assert.match(parsed.error, /reviewer cannot be the assignee/);
  }
  assert.equal(normalizeBaton({ ...dispatched, to: "mark", reviewer: "mark" }, "baton").ok, false);
});

test("SL ids and seats fail closed", () => {
  const bad = (raw) => normalizeBaton({ ...dispatched, ...raw }, "baton");
  for (const slId of ["sl-001", "SL-", "SL-001a", "TASK-1", "SL- 1"]) {
    assert.equal(bad({ slId }).ok, false, slId);
  }
  assert.equal(bad({ reviewer: "" }).ok, false);
  assert.equal(bad({ reviewer: "nobody" }).ok, false);
  assert.equal(bad({ to: "" }).ok, false);
  assert.equal(bad({ status: "todo" }).ok, false);
  assert.equal(bad({ status: "Dispatched" }).ok, false);
  const plain = normalizeBaton({ to: "cursor", status: "todo", task: "Integrate", next: "Open the PR" }, "baton");
  assert.deepEqual(plain.baton, { to: "cursor", status: "todo", task: "Integrate", next: "Open the PR", approval: null });
  assert.equal(Object.hasOwn(plain.baton, "slId"), false);
  assert.deepEqual(normalizeBaton(dispatched, "chat"), { ok: true, baton: null });
});

test("acceptance 3: reviewer, assignee, and Mark have different posts", () => {
  const reviewed = baton({ ...dispatched, status: "reviewed" });
  const approved = baton({ ...dispatched, status: "approved" });
  assert.equal(gateRoomKind("codex", "decision").status, 403);
  assert.equal(gateRoomKind("claude", "decision").status, 403);
  assert.equal(gateSlPost({ seatId: "codex", kind: "decision", baton: reviewed, refs: prRef }).status, 403);
  assert.match(gateSlPost({ seatId: "codex", kind: "baton", baton: reviewed, refs: prRef }).error, /own review/);
  assert.equal(gateSlPost({ seatId: "cursor", kind: "baton", baton: reviewed, refs: prRef }).status, 403);
  assert.equal(gateSlPost({ seatId: "mark", kind: "baton", baton: reviewed, refs: prRef }).status, 403);
  assert.equal(gateSlPost({ seatId: "claude", kind: "baton", baton: reviewed, refs: [] }).status, 400);
  assert.equal(gateSlPost({ seatId: "claude", kind: "baton", baton: reviewed, refs: [{ type: "commit", ref: "abc" }] }).status, 400);
  assert.equal(gateSlPost({ seatId: "claude", kind: "baton", baton: reviewed, refs: prRef }).ok, true);
  assert.equal(gateSlPost({ seatId: "claude", kind: "baton", baton: reviewed, refs: docRef }).ok, true);
  for (const seatId of ["codex", "claude", "cursor", "grok"]) {
    assert.equal(gateSlPost({ seatId, kind: "baton", baton: approved, refs: prRef }).status, 403, seatId);
  }
  assert.equal(gateSlPost({ seatId: "mark", kind: "baton", baton: approved, refs: [] }).ok, true);
  assert.equal(gateSlPost({ seatId: "codex", kind: "baton", baton: baton(dispatched), refs: [] }).ok, true);
  const evidence = authorizeSlPost({
    seatId: "claude",
    kind: "evidence",
    raw: { baton: { ...dispatched, status: "reviewed" } },
    baton: null,
    refs: prRef,
    resolveSeat: (id) => ({ id }),
  });
  assert.equal(evidence.ok, false);
  assert.match(evidence.error, /belong on a baton/);
});

test("permission: the seat key is the auth boundary, and it cannot post as another seat", () => {
  const env = {
    HQ_ROOM_CONNECTION_CLAUDE: "fixture-claude-connection",
    HQ_ROOM_CONNECTION_CODEX: "fixture-codex-connection",
  };
  assert.equal(identifySeat({ token: "", env }).status, 401);
  assert.equal(identifySeat({ token: "", sharedLogin: true, env }).status, 401);
  const claude = identifySeat({ token: "fixture-claude-connection", claimedSeat: "claude", env });
  assert.equal(claude.ok, true);
  assert.equal(claude.seat, "claude");
  const spoof = identifySeat({ token: "fixture-claude-connection", claimedSeat: "codex", claimedAuthor: "codex", env });
  assert.equal(spoof.ok, false);
  assert.equal(spoof.status, 403);
  assert.match(spoof.error, /another seat/);
  const codex = identifySeat({ token: "fixture-codex-connection", env });
  assert.equal(codex.seat, "codex");
  const reviewed = baton({ ...dispatched, status: "reviewed" });
  assert.equal(gateSlPost({ seatId: codex.seat, kind: "baton", baton: reviewed, refs: prRef }).ok, false);
  assert.equal(gateSlPost({ seatId: claude.seat, kind: "baton", baton: reviewed, refs: prRef }).ok, true);
});

test("a grok SL baton dispatches only the assignee, and the envelope keeps the handoff", () => {
  const parsed = baton(dispatched);
  const decision = decideRoute({ id: "m1", seatId: "grok", kind: "baton", body: "SL-001 handoff", baton: parsed, hop: 0 });
  assert.deepEqual(decision.targets.map((row) => row.seatId), ["codex"]);
  const mark = decideRoute({ id: "m2", seatId: "mark", kind: "baton", body: "SL-001 handoff", baton: parsed });
  assert.deepEqual(mark.targets.map((row) => row.seatId), ["codex"]);
  const envelope = buildEnvelope({
    dispatch: { id: "d1", threadId: "m1", seatId: "codex", reason: "baton", hop: 1 },
    source: { id: "m1", seatId: "grok", body: "SL-001 handoff", refs: [], channel: "room" },
    baton: parsed,
  });
  assert.equal(envelope.activeBaton.slId, "SL-001");
  assert.equal(envelope.activeBaton.reviewer, "claude");
  assert.equal(envelope.seat.id, "codex");
});

test("promotion YAML keeps slId and reviewer", () => {
  const message = {
    id: "01JSL",
    seatId: "grok",
    kind: "baton",
    body: "SL-001 handoff",
    createdAt: "2026-10-15T00:00:00.000Z",
    refs: prRef,
    baton: baton(dispatched),
  };
  const files = promotionFiles(message);
  assert.match(files.yaml, /^slId: "SL-001"$/m);
  assert.match(files.yaml, /^reviewer: "claude"$/m);
  const plain = promotionFiles({ ...message, baton: baton({ to: "cursor", status: "todo", task: "Integrate", next: "wait" }) });
  assert.match(plain.yaml, /^slId: ""$/m);
  assert.match(plain.yaml, /^reviewer: ""$/m);
});

test("SL-001 adds no table and no MCP tool", () => {
  const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
  const handoff = read("./sl-handoff.js");
  const mcp = read("./room-mcp.js");
  const rpc = read("./room-mcp-rpc.js");
  const http = read("./room-http.js");
  const store = read("./swarm.js");
  assert.match(http, /authorizeSlPost\(/);
  assert.match(mcp, /authorizeSlPost\(/);
  assert.match(store, /gateSlPost\(/);
  assert.match(mcp, /BLOCKED_TOOLS = \["promote", "broadcast", "room_promote", "room_broadcast"\]/);
  assert.match(rpc, /name: "room_post"/);
  assert.doesNotMatch(handoff, /CREATE TABLE/i);
  assert.doesNotMatch(mcp, /hq_sl_tasks/);
  assert.doesNotMatch(rpc, /name: "sl_/);
});

const url = process.env.HQ_TEST_DATABASE_URL;

test(
  "acceptance 4 and 5: one codex dispatch, a retry adds none, and only the first reply wakes",
  { skip: !url && "set HQ_TEST_DATABASE_URL" },
  async () => {
    process.env.HQ_DATABASE_URL = url;
    const pg = await import("./swarm-pg.js");
    const { isDuplicateRoomMessage, ROOM_SEATS } = await import("./swarm-contract.js");
    await pg.ensureSwarmSchema();
    const { default: Pg } = await import("pg");
    const admin = new Pg.Client({ connectionString: url });
    await admin.connect();
    try {
      await admin.query("TRUNCATE hq_room_messages, hq_room_seats, hq_room_dispatches");
      const now = "2026-10-15T12:00:00.000Z";
      const seat = (id) => ({ ...ROOM_SEATS.find((item) => item.id === id), tokenHash: "fixture", lastSeenAt: now });
      const parsed = baton(dispatched);
      const source = {
        id: "sl-src",
        channel: "room",
        seatId: "grok",
        kind: "baton",
        body: "SL-001 handoff",
        refs: [],
        verified: false,
        baton: parsed,
        createdAt: now,
      };
      const inserted = await pg.insertMessagePg({ message: source, seat: seat("grok"), isDuplicate: isDuplicateRoomMessage, keep: 500 });
      assert.equal(inserted.deduped, false);
      assert.equal(inserted.message.baton.slId, "SL-001");
      assert.equal(inserted.message.baton.reviewer, "claude");
      const decision = decideRoute(inserted.message);
      assert.deepEqual(decision.targets.map((row) => row.seatId), ["codex"]);
      const dispatch = {
        id: "sl-d1",
        sourceMessageId: source.id,
        threadId: source.id,
        seatId: "codex",
        originSeatId: "grok",
        reason: "baton",
        adapter: "pull",
        status: "queued",
        hop: decision.hop,
        createdAt: now,
      };
      assert.equal((await pg.insertDispatchesPg([dispatch])).length, 1);
      assert.equal((await pg.insertDispatchesPg([{ ...dispatch, id: "sl-d2" }])).length, 0);
      assert.equal((await pg.listDispatchesPg({ sourceIds: [source.id], seatId: "codex" })).length, 1);

      const retry = await pg.insertMessagePg({
        message: { ...source, id: "sl-src-retry", createdAt: "2026-10-15T12:00:01.000Z" },
        seat: seat("grok"),
        isDuplicate: isDuplicateRoomMessage,
        keep: 500,
      });
      assert.equal(retry.deduped, true);
      assert.equal(retry.message.id, "sl-src");
      assert.equal(replyWakesLoop(retry, null), false);
      assert.equal((await pg.listDispatchesPg({ sourceIds: [source.id] })).length, 1);

      const claimed = await pg.transitionDispatchPg("sl-d1", { from: ["queued"], to: "thinking", leaseMs: 120000 });
      assert.equal(claimed.status, "thinking");
      const reply = (id, seatId) => ({
        id,
        channel: "room",
        seatId,
        kind: "chat",
        body: `reply ${id}`,
        refs: [],
        verified: false,
        baton: null,
        createdAt: "2026-10-15T12:00:02.000Z",
      });
      const rejected = await pg.insertMessagePg({
        message: reply("sl-wrong", "claude"),
        seat: seat("claude"),
        isDuplicate: isDuplicateRoomMessage,
        keep: 500,
        dispatchId: "sl-d1",
      });
      assert.equal(rejected.error.status, 403);
      assert.equal(replyWakesLoop(rejected, "sl-d1"), false);
      const stored = await pg.insertMessagePg({
        message: reply("sl-reply", "codex"),
        seat: seat("codex"),
        isDuplicate: isDuplicateRoomMessage,
        keep: 500,
        dispatchId: "sl-d1",
      });
      assert.equal(stored.deduped, false);
      assert.equal(replyWakesLoop(stored, "sl-d1"), true);
      const replay = await pg.insertMessagePg({
        message: reply("sl-replay", "codex"),
        seat: seat("codex"),
        isDuplicate: isDuplicateRoomMessage,
        keep: 500,
        dispatchId: "sl-d1",
      });
      assert.equal(replay.deduped, true);
      assert.equal(replay.message.id, "sl-reply");
      assert.equal(replyWakesLoop(replay, "sl-d1"), false);
      assert.equal((await pg.findDispatchPg("sl-d1")).replyMessageId, "sl-reply");
    } finally {
      await admin.end();
      await pg.closeSwarmPool();
    }
  }
);
