import assert from "node:assert/strict";
import test from "node:test";

// Runs only against a throwaway database: HQ_TEST_DATABASE_URL=postgres://... node --test lib/hq/swarm-pg.test.js
const url = process.env.HQ_TEST_DATABASE_URL;

test(
  "concurrent posts all land, duplicates collapse, promote sha sets once",
  { skip: !url && "set HQ_TEST_DATABASE_URL" },
  async () => {
    process.env.HQ_DATABASE_URL = url;
    const pg = await import("./swarm-pg.js");
    const { isDuplicateRoomMessage, ROOM_SEATS } =
      await import("./swarm-contract.js");
    await pg.ensureSwarmSchema();
    const { default: Pg } = await import("pg");
    const admin = new Pg.Client({ connectionString: url });
    await admin.connect();
    try {
      await admin.query(
        "TRUNCATE hq_room_messages, hq_room_seats, hq_ingest_events, hq_github_prs, hq_kv",
      );

      const seat = (id) => ({
        ...ROOM_SEATS.find((s) => s.id === id),
        tokenHash: "h",
        lastSeenAt: new Date().toISOString(),
      });
      const message = (i, seatId = "claude", body = `post ${i}`) => ({
        id: `m${String(i).padStart(3, "0")}`,
        channel: "room",
        seatId,
        kind: "chat",
        body,
        refs: [],
        verified: false,
        baton: null,
        promotedSha: null,
        createdAt: new Date(Date.now() + i).toISOString(),
      });
      const insert = (m) =>
        pg.insertMessagePg({
          message: m,
          seat: seat(m.seatId),
          isDuplicate: isDuplicateRoomMessage,
          keep: 500,
        });

      const seats = ["claude", "cursor", "codex", "grok", "gemini"];
      await Promise.all(
        Array.from({ length: 25 }, (_, i) =>
          insert(message(i, seats[i % seats.length])),
        ),
      );
      assert.equal(
        (await pg.listMessagesPg({ channel: "room", limit: 500 })).length,
        25,
      );
      assert.equal((await pg.listSeatsPg()).length, 5);

      const first = await insert({
        ...message(200, "codex", "smoke passed"),
        createdAt: new Date(Date.now() + 1000).toISOString(),
      });
      const again = await insert({
        ...message(201, "codex", "smoke passed"),
        createdAt: new Date(Date.now() + 1500).toISOString(),
      });
      assert.equal(first.deduped, false);
      assert.equal(again.deduped, true);
      assert.equal(again.message.id, "m200");
      assert.equal(
        (await pg.listMessagesPg({ channel: "room", limit: 500 })).length,
        26,
      );

      const after = (
        await pg.listMessagesPg({ channel: "room", limit: 500 })
      )[19].createdAt;
      assert.equal(
        (await pg.listMessagesPg({ channel: "room", after, limit: 500 }))
          .length,
        6,
      );

      assert.equal(await pg.setPromotedShaPg("m000", "aaa"), "aaa");
      assert.equal(await pg.setPromotedShaPg("m000", "bbb"), "aaa");

      const ingest = {
        provider: "github",
        deliveryId: "d1",
        eventType: "pull_request",
        repo: "a/b",
        payloadSha256: "x",
        receivedAt: new Date().toISOString(),
      };
      assert.equal(await pg.recordIngestPg(ingest), true);
      assert.equal(await pg.recordIngestPg(ingest), false);

      const pr = {
        repo: "a/b",
        number: 1,
        title: "t",
        url: "u",
        state: "open",
        headSha: "s1",
        ciState: "pass",
        updatedAt: "2026-10-03T10:00:00Z",
        ingestedAt: "2026-10-03T10:00:00Z",
      };
      await pg.upsertPrPg(pr);
      await pg.upsertPrPg({
        ...pr,
        ciState: "unknown",
        updatedAt: "2026-10-03T11:00:00Z",
        title: "t2",
      });
      await pg.upsertPrPg({
        ...pr,
        title: "older",
        updatedAt: "2026-10-03T09:00:00Z",
      });
      const [row] = await pg.listPrsPg();
      assert.equal(row.title, "t2");
      assert.equal(row.ciState, "pass");
    } finally {
      await admin.end();
      await pg.closeSwarmPool();
    }
  },
);

test(
  "dispatches: one per (message, seat), atomic claim, reply links once, timeouts sweep",
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
      const now = new Date().toISOString();
      const seat = (id) => ({ ...ROOM_SEATS.find((s) => s.id === id), tokenHash: "h", lastSeenAt: now });
      const source = { id: "src1", channel: "room", seatId: "mark", kind: "chat", body: "Review.", refs: [], verified: false, baton: null, createdAt: now };
      await pg.insertMessagePg({ message: source, seat: seat("mark"), isDuplicate: isDuplicateRoomMessage, keep: 500 });
      const row = (id, seatId, status = "queued") => ({
        id,
        sourceMessageId: "src1",
        threadId: "src1",
        seatId,
        originSeatId: "mark",
        reason: "mark-default",
        adapter: status === "offline" ? "none" : "pull",
        status,
        hop: 1,
        createdAt: now,
      });

      const first = await pg.insertDispatchesPg([row("d-claude", "claude"), row("d-chatgpt", "chatgpt", "offline")]);
      assert.equal(first.length, 2);
      // Test 6: the same routing event again creates nothing new.
      const again = await pg.insertDispatchesPg([row("d-claude-2", "claude"), row("d-chatgpt-2", "chatgpt", "offline")]);
      assert.equal(again.length, 0);
      assert.equal((await pg.listDispatchesPg({ sourceIds: ["src1"] })).length, 2);

      // Only one of two concurrent claims wins.
      const claims = await Promise.all([
        pg.transitionDispatchPg("d-claude", { from: ["queued"], to: "thinking", bumpAttempt: true }),
        pg.transitionDispatchPg("d-claude", { from: ["queued"], to: "thinking", bumpAttempt: true }),
      ]);
      assert.equal(claims.filter(Boolean).length, 1);

      const reply = (id, seatId) => ({ id, channel: "room", seatId, kind: "chat", body: `answer ${id}`, refs: [], verified: false, baton: null, createdAt: new Date().toISOString() });
      // Wrong seat cannot answer Claude's dispatch.
      const wrong = await pg.insertMessagePg({ message: reply("r0", "cursor"), seat: seat("cursor"), isDuplicate: isDuplicateRoomMessage, keep: 500, dispatchId: "d-claude" });
      assert.equal(wrong.error.status, 403);
      const answered = await pg.insertMessagePg({ message: reply("r1", "claude"), seat: seat("claude"), isDuplicate: isDuplicateRoomMessage, keep: 500, dispatchId: "d-claude" });
      assert.equal(answered.message.replyTo, "src1");
      assert.equal(answered.message.threadId, "src1");
      assert.equal(answered.message.dispatchId, "d-claude");
      assert.equal(answered.message.hop, 1);
      // A retried reply returns the first one and adds nothing.
      const retried = await pg.insertMessagePg({ message: reply("r2", "claude"), seat: seat("claude"), isDuplicate: isDuplicateRoomMessage, keep: 500, dispatchId: "d-claude" });
      assert.equal(retried.deduped, true);
      assert.equal(retried.message.id, "r1");
      const done = await pg.findDispatchPg("d-claude");
      assert.equal(done.status, "responded");
      assert.equal(done.replyMessageId, "r1");
      // A final state cannot be reopened.
      assert.equal(await pg.transitionDispatchPg("d-claude", { from: ["queued", "thinking"], to: "failed" }), null);

      // Sweep: old open work times out; offline stays offline.
      await pg.insertDispatchesPg([{ ...row("d-old", "grok"), createdAt: new Date(Date.now() - 3_600_000).toISOString() }]);
      await pg.sweepDispatchesPg({ timeoutMs: 1_800_000 });
      assert.equal((await pg.findDispatchPg("d-old")).status, "timed_out");
      assert.equal((await pg.findDispatchPg("d-chatgpt")).status, "offline");
    } finally {
      await admin.end();
      await pg.closeSwarmPool();
    }
  },
);
