import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { BRIDGE_KEY_PREFIX, bridgeKey, entriesForFile, hasSecret, inboundRecord, ingestEntries, outboundEntry, redactContacts, shouldMirror, splitFeed } from "./drive-bridge.js";

const sha = (text) => createHash("sha256").update(text).digest("hex");

function fakeIo({ failPost = false } = {}) {
  const claimed = new Set();
  const posts = [];
  const routed = [];
  return {
    claimed,
    posts,
    routed,
    claim: async (key) => (claimed.has(key) ? false : (claimed.add(key), true)),
    release: async (key) => claimed.delete(key),
    post: async (record) => {
      if (failPost) return { error: { status: 503, error: "db down" } };
      const message = { id: `m${posts.length + 1}`, ...record };
      posts.push(message);
      return { message, deduped: false };
    },
    route: async (message) => routed.push(message.id),
  };
}

const ruling = { fileId: "f1", title: "13 — HQ MCP gateway", modifiedTime: "2026-10-05T18:28:45Z", viewUrl: "https://docs.google.com/document/d/f1/edit", text: "Ruling text. @claude please implement." };

test("key: sha256(file_id:revision_id:entry_index), as ruled in baton 10", () => {
  assert.equal(bridgeKey("f1", "modified:t", 2), sha("f1:modified:t:2"));
});

test("a doc is one entry per revision; the revision stand-in is modified:<time>", () => {
  const [entry] = entriesForFile(ruling);
  assert.equal(entry.revisionId, "modified:2026-10-05T18:28:45Z");
  assert.equal(entry.entryIndex, 0);
  assert.deepEqual(entriesForFile({ ...ruling, modifiedTime: "" }), []);
});

test("the feed splits per ## heading; an unchanged entry keeps its key when the doc changes", () => {
  const v1 = "Preamble\n## 18:00 · cursor\nfirst\n## 18:05 · gemini\nsecond";
  assert.deepEqual(splitFeed(v1).map((entry) => entry.text), ["## 18:00 · cursor\nfirst", "## 18:05 · gemini\nsecond"]);
  const file = { fileId: "feed", title: "00_ROOM_EVENT_FEED", modifiedTime: "a", text: v1 };
  const before = entriesForFile(file).map((e) => bridgeKey(e.fileId, e.revisionId, e.entryIndex));
  const after = entriesForFile({ ...file, modifiedTime: "b", text: `${v1}\n## 18:10 · grok\nthird` }).map((e) => bridgeKey(e.fileId, e.revisionId, e.entryIndex));
  assert.deepEqual(after.slice(0, 2), before);
  assert.equal(after.length, 3);
});

test("inbound posts as gemini through the room path, routes @mentions, and never touches presence", async () => {
  const io = fakeIo();
  const out = await ingestEntries(entriesForFile(ruling), io);
  assert.equal(out.posted.length, 1);
  const [post] = io.posts;
  assert.equal(post.seatId, "gemini");
  assert.equal(post.channel, "room");
  assert.equal(post.touchSeat, false);
  assert.match(post.body, /^Drive: 13 — HQ MCP gateway\n\[relayed source claim · proposal\/evidence only · not adopted HQ status\]\n\nRuling text/);
  assert.deepEqual(post.refs, [{ type: "doc", ref: "13 — HQ MCP gateway", url: ruling.viewUrl }]);
  assert.deepEqual(io.routed, ["m1"]);
});

test("a repeated or overlapping poll never posts the same entry twice", async () => {
  const io = fakeIo();
  const entries = entriesForFile(ruling);
  const [a, b] = await Promise.all([ingestEntries(entries, io), ingestEntries(entries, io)]);
  assert.equal(a.posted.length + b.posted.length, 1);
  assert.equal(a.skipped + b.skipped, 1);
  const again = await ingestEntries(entries, io);
  assert.deepEqual([again.posted.length, again.skipped], [0, 1]);
});

test("secrets are refused and not retried; a failed post releases its claim for the next poll", async () => {
  const io = fakeIo();
  const leak = { ...ruling, fileId: "f2", text: "use HQ_ROOM_CONNECTION_GEMINI=abc123" };
  const first = await ingestEntries(entriesForFile(leak), io);
  assert.deepEqual(first.refused, [{ fileId: "f2", entryIndex: 0, reason: "secret" }]);
  assert.equal(io.posts.length, 0);
  assert.equal((await ingestEntries(entriesForFile(leak), io)).skipped, 1);

  const down = fakeIo({ failPost: true });
  const failed = await ingestEntries(entriesForFile(ruling), down);
  assert.equal(failed.failed.length, 1);
  assert.equal(down.claimed.size, 0);
  assert.equal(inboundRecord({ text: "Bearer abcdefghijklmnop" }).refused, "secret");
});

test("adversarial: broad credential classes are quarantined, not posted", () => {
  const leaks = [
    "token: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
    "see eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N",
    "-----BEGIN PRIVATE KEY-----\nMIIEv...",
    "-----BEGIN RSA PRIVATE KEY-----",
    "maps key AIzaSyA1234567890abcdefghijklmnopqrstu",
    "oauth ya29.a0AfH6SMBx1234567890abcdefghij",
    "client_secret = \"GOCSPX-abcdef123456\"",
    "password: hunter2hunter2",
    "refresh_token=1//0gabcdefghijklmnop",
    "https://storage.googleapis.com/b/o?X-Goog-Signature=abcdef0123456789",
    "https://x.blob.core.windows.net/c?sv=2020&sig=abcdefghijklmnop%3D",
    "https://hooks.example.com/run?token=abcdefgh12345678",
    "postgres://hq:s3cretpass@db.internal:5432/hq",
    "ghs_abcdefghijklmnopqrstuvwxyz0123",
    "glpat-abcdefghijklmnop1234",
  ];
  for (const text of leaks) {
    assert.equal(hasSecret(text), true, text);
    assert.equal(inboundRecord({ title: "t", text }).refused, "secret", text);
  }
  for (const clean of ["Ruling: keep the Postgres room. Token budget is fine.", "Use HQ_ROOM_CONNECTION_<SEAT> from the env, never paste it.", "https://docs.google.com/document/d/abc/edit"]) {
    assert.equal(hasSecret(clean), false, clean);
  }
});

test("customer data: a client name quarantines the entry; contact details are redacted", async () => {
  const io = { ...fakeIo(), clientNames: ["Acme Displays"] };
  const out = await ingestEntries(entriesForFile({ ...ruling, fileId: "f3", text: "Brief for acme displays, Q4." }), io);
  assert.deepEqual(out.refused, [{ fileId: "f3", entryIndex: 0, reason: "customer-data" }]);
  assert.equal(io.posts.length, 0);

  const { record } = inboundRecord({ title: "Contacts", text: "Ping jane.doe@example.com or +66 81 234 5678 about baton 14." });
  assert.ok(!record.body.includes("jane.doe@example.com"));
  assert.ok(!record.body.includes("234 5678"));
  assert.match(record.body, /\[email\] or \[phone\] about baton 14/);
  for (const keep of ["baton 14, rev 2026-10-05, 3500 chars", "at 18:28:45Z", "brief 01M46PGWW18G663R12T98R4JTA", "commit c2c7495", "rows 3500 1200"]) assert.equal(redactContacts(keep), keep);
  assert.equal(redactContacts("call (02) 123-4567"), "call [phone]");
});

test("outbound: only what is meant for Gemini, masked with the spectator rules", () => {
  assert.equal(shouldMirror({ seatId: "codex", kind: "chat", body: "@gemini ruling needed" }), true);
  assert.equal(shouldMirror({ seatId: "codex", kind: "baton", body: "to cursor" }), true);
  assert.equal(shouldMirror({ seatId: "codex", kind: "chat", body: "email me@gemini.com" }), false);
  assert.equal(shouldMirror({ seatId: "gemini", kind: "baton", body: "@gemini" }), false);
  const line = outboundEntry(
    { seatId: "codex", kind: "chat", createdAt: "2026-10-05T18:40:00Z", body: "@gemini see https://hq.sooklabs.com/x for Acme Co, key sk-abcdefghijkl, $1,500" },
    ["Acme Co"]
  );
  assert.match(line, /^## 2026-10-05T18:40:00Z · codex · chat/);
  for (const leaked of ["https://", "Acme", "sk-abc", "1,500"]) assert.ok(!line.includes(leaked), leaked);
});

// Real Postgres: the dedupe claim is atomic and a relayed post leaves presence alone.
const url = process.env.HQ_TEST_DATABASE_URL;
test("pg: claimKvPg is first-wins under concurrency; touchSeat:false skips the seat upsert", { skip: !url && "set HQ_TEST_DATABASE_URL" }, async () => {
  process.env.HQ_DATABASE_URL = url;
  const pg = await import("./swarm-pg.js");
  await pg.ensureSwarmSchema();
  const key = `${BRIDGE_KEY_PREFIX}test-${Date.now()}`;
  const wins = await Promise.all(Array.from({ length: 10 }, () => pg.claimKvPg(key, "t")));
  assert.equal(wins.filter(Boolean).length, 1);
  await pg.deleteKvPg(key);
  assert.equal(await pg.claimKvPg(key, "t"), true);
  await pg.deleteKvPg(key);

  const { default: Pg } = await import("pg");
  const admin = new Pg.Client({ connectionString: url });
  await admin.connect();
  try {
    await admin.query("DELETE FROM hq_room_seats WHERE id = 'gemini'");
    const message = { id: `bridge-${Date.now()}`, channel: "room", seatId: "gemini", kind: "chat", body: "relayed", refs: [], verified: false, baton: null, promotedSha: null, createdAt: new Date().toISOString() };
    const saved = await pg.insertMessagePg({ message, seat: null, isDuplicate: () => false, keep: 500 });
    assert.equal(saved.deduped, false);
    const seats = await admin.query("SELECT 1 FROM hq_room_seats WHERE id = 'gemini'");
    assert.equal(seats.rowCount, 0);
    await admin.query("DELETE FROM hq_room_messages WHERE id = $1", [message.id]);
  } finally {
    await admin.end();
    await pg.closeSwarmPool();
  }
});

test("config: skipped until both env vars are set; malformed credentials named, never echoed", async () => {
  const { driveBridgeConfig } = await import("./drive-bridge.js");
  assert.match(driveBridgeConfig({}).skip, /not configured/);
  assert.match(driveBridgeConfig({ HQ_DRIVE_RELAY_FOLDER: "F" }).skip, /not configured/);
  const bad = driveBridgeConfig({ HQ_DRIVE_RELAY_FOLDER: "F", HQ_DRIVE_SERVICE_ACCOUNT_JSON: "{oops SECRET" });
  assert.match(bad.skip, /not valid JSON/);
  assert.ok(!bad.skip.includes("SECRET"));
  assert.match(driveBridgeConfig({ HQ_DRIVE_RELAY_FOLDER: "F", HQ_DRIVE_SERVICE_ACCOUNT_JSON: "{}" }).skip, /client_email/);
  const ok = driveBridgeConfig({ HQ_DRIVE_RELAY_FOLDER: " F ", HQ_DRIVE_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: "a@b", private_key: "k" }) });
  assert.deepEqual(ok, { credentials: { client_email: "a@b", private_key: "k" }, folderId: "F" });
});
