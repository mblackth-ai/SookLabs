import "server-only";
import { entriesForFile, ingestEntries } from "./drive-bridge.js";
import { claimKvPg, deleteKvPg } from "./swarm-pg.js";
import { postRoomRecord } from "./swarm";
import { routeAndProcess } from "./swarm-router";

// Server wiring for the Drive bridge: the room's own post and router, and
// atomic dedupe claims in hq_kv. The Drive client is passed in. There is no
// Google credential in HQ yet (Mark's gate), so nothing calls this on a
// schedule; when one exists, the loop tick calls it (no new scheduler).

/**
 * drive: { changedFiles() → [{ fileId, title, modifiedTime, revisionId?, viewUrl, text }] }
 * Postgres only: dedupe must hold across serverless instances.
 */
export async function runDriveBridge({ drive }) {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  if (!url?.trim()) return { ok: false, error: "The Drive bridge needs the Postgres room store (HQ_DATABASE_URL)." };
  const files = await drive.changedFiles();
  const entries = files.flatMap((file) => entriesForFile(file));
  const result = await ingestEntries(entries, {
    claim: (key) => claimKvPg(key, new Date().toISOString()),
    release: (key) => deleteKvPg(key),
    post: (record) => postRoomRecord(record),
    route: (message) => routeAndProcess(message),
  });
  return { ok: true, files: files.length, entries: entries.length, ...result };
}
