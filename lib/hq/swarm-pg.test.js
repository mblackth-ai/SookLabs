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
