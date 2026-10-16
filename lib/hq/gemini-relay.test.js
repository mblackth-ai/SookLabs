import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { relayDedupeKey, relayDocument, relaySecretHit } from "./gemini-relay.js";

const FILE_ID = "1MDheDkrlfjICLbTWI4p1ACoQh-_AYC0ZvRTtWDn600o";
const REVISION = "modified:2026-10-05T18:20:33.363Z";

test("dedupe key is sha256 of file, revision, and entry index", () => {
  const expected = createHash("sha256").update(`${FILE_ID}:${REVISION}:0`).digest("hex");
  assert.equal(relayDedupeKey(FILE_ID, REVISION, 0), expected);
  assert.notEqual(relayDedupeKey(FILE_ID, REVISION, 1), expected);
});

test("the landed baton 10 file uses the same dedupe key", () => {
  const raw = readFileSync(new URL("../../docs/relay/gemini/10-ruling-postgres-bridge-mcp-seos.md", import.meta.url), "utf8");
  const ledger = JSON.parse(readFileSync(new URL("../../docs/relay/gemini/ledger.json", import.meta.url), "utf8"));
  const key = relayDedupeKey(FILE_ID, REVISION, 0);
  assert.match(raw, new RegExp(`dedupeKey: ${key}`));
  assert.equal(ledger.entries[0].dedupeKey, key);
  assert.equal(ledger.entries[0].repoPath, "docs/relay/gemini/10-ruling-postgres-bridge-mcp-seos.md");
  assert.equal(relaySecretHit(raw), false);
  for (const entry of ledger.entries) {
    const landed = readFileSync(new URL(`../../${entry.repoPath}`, import.meta.url), "utf8");
    assert.equal(entry.dedupeKey, relayDedupeKey(entry.fileId, entry.revisionId, entry.entryIndex));
    assert.match(landed, new RegExp(`dedupeKey: ${entry.dedupeKey}`));
    assert.equal(relaySecretHit(landed), false);
  }
});

test("relay markdown keeps the ruling and refuses a pasted seat key", () => {
  const clean = relayDocument({
    title: "10 — Gemini Spark Ruling",
    body: "Seat gemini posts through postRoomRecord. The name HQ_ROOM_CONNECTION is not a value.",
    fileId: FILE_ID,
    revisionId: REVISION,
    viewUrl: "https://docs.google.com/document/d/1MDheDkrlfjICLbTWI4p1ACoQh-_AYC0ZvRTtWDn600o/edit",
    modifiedTime: "2026-10-05T18:20:33.363Z",
  });
  assert.equal(clean.ok, true);
  assert.match(clean.markdown, /source: gemini-spark/);
  assert.match(clean.markdown, /Not production acceptance/);
  assert.equal(relaySecretHit("Bearer token must authenticate strictly to the designated seat"), false);

  const leaked = relayDocument({
    title: "10 — Gemini Spark Ruling",
    body: "HQ_ROOM_CONNECTION=seat-key-value",
    fileId: FILE_ID,
    revisionId: REVISION,
  });
  assert.equal(leaked.ok, false);
});
