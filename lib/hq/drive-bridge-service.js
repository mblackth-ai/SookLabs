import "server-only";
import { driveBridgeConfig, entriesForFile, ingestEntries } from "./drive-bridge.js";
import { createDriveClient } from "./drive-client.js";
import { claimKvPg, deleteKvPg, getKvPg, loadClientNames, setKvPg } from "./swarm-pg.js";
import { postRoomRecord } from "./swarm";
import { routeAndProcess } from "./swarm-router";

// Server wiring for the Drive bridge: the room's own post and router, and
// atomic dedupe claims in hq_kv. The loop tick calls runDriveBridgeTick on
// every wake (no new scheduler); it is a no-op until Mark sets the Google
// credential (HQ_DRIVE_SERVICE_ACCOUNT_JSON) and HQ_DRIVE_RELAY_FOLDER.

const CURSOR_KEY = "drive-bridge:cursor";
const FIRST_RUN_LOOKBACK_MS = 24 * 60 * 60 * 1000;


/**
 * drive: { changedFiles() → [{ fileId, title, modifiedTime, revisionId?, viewUrl, text }] }
 * Postgres only: dedupe must hold across serverless instances.
 */
export async function runDriveBridge({ drive }) {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  if (!url?.trim()) return { ok: false, error: "The Drive bridge needs the Postgres room store (HQ_DATABASE_URL)." };
  const files = await drive.changedFiles();
  const entries = files.flatMap((file) => entriesForFile(file));
  const clientNames = await loadClientNames();
  const result = await ingestEntries(entries, {
    clientNames,
    claim: (key) => claimKvPg(key, new Date().toISOString()),
    release: (key) => deleteKvPg(key),
    post: (record) => postRoomRecord(record),
    route: (message) => routeAndProcess(message),
  });
  return { ok: true, files: files.length, entries: entries.length, ...result };
}

/**
 * One bridge pass from the loop tick. Reads files changed since the stored
 * cursor (first run: the last 24 h, so history doesn't flood the room).
 * The cursor only advances when every entry posted or was deduped/refused,
 * so a failed post is retried next tick; dedupe keeps that safe.
 */
export async function runDriveBridgeTick({ env = process.env, now = Date.now } = {}) {
  const config = driveBridgeConfig(env);
  if (config.skip) return { ok: true, skipped: config.skip };
  if (!String(env.HQ_DATABASE_URL || env.DATABASE_URL || "").trim()) return { ok: false, error: "The Drive bridge needs the Postgres room store (HQ_DATABASE_URL)." };
  const since = (await getKvPg(CURSOR_KEY)) || new Date(now() - FIRST_RUN_LOOKBACK_MS).toISOString();
  const client = createDriveClient({ credentials: config.credentials, folderId: config.folderId });
  let newest = since;
  const result = await runDriveBridge({
    drive: {
      changedFiles: async () => {
        const files = await client.changedFiles(since);
        for (const file of files) if (file.modifiedTime > newest) newest = file.modifiedTime;
        return files;
      },
    },
  });
  if (result.ok && !result.failed?.length && newest !== since) await setKvPg(CURSOR_KEY, newest);
  return { ...result, since };
}
