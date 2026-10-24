import pg from "pg";
import { DEFAULT_OPS } from "./ops-default.js";
import { mergeOpsPatch, normalizeOpsData } from "./ops-shared.js";
import { HQ_READ_TIMEOUT_MS, opsPoolConfig } from "./read-timeouts.js";

const { Pool } = pg;
const OPS_ROW_ID = "default";

let pool;

function getPool() {
  if (!pool) {
    const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) throw new Error("HQ_DATABASE_URL not configured");
    // Connecting gives up after ~3s (HQ_READ_TIMEOUT_MS) instead of hanging the page.
    pool = new Pool(opsPoolConfig(url));
  }
  return pool;
}

export async function ensureOpsSchema() {
  const client = await getPool().connect();
  try {
    await client.query({
      text: `
      CREATE TABLE IF NOT EXISTS hq_ops (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
      query_timeout: HQ_READ_TIMEOUT_MS,
    });
  } finally {
    client.release();
  }
}

export async function readOpsDataFromPg() {
  await ensureOpsSchema();
  const client = await getPool().connect();
  try {
    const res = await client.query({
      text: "SELECT data FROM hq_ops WHERE id = $1",
      values: [OPS_ROW_ID],
      query_timeout: HQ_READ_TIMEOUT_MS,
    });
    if (res.rows.length === 0) {
      const seed = normalizeOpsData({ ...DEFAULT_OPS, updatedAt: new Date().toISOString() });
      await client.query(
        "INSERT INTO hq_ops (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())",
        [OPS_ROW_ID, JSON.stringify(seed)]
      );
      return seed;
    }
    return normalizeOpsData(res.rows[0].data);
  } finally {
    client.release();
  }
}

export async function writeOpsDataToPg(data) {
  await ensureOpsSchema();
  const next = normalizeOpsData({ ...data, updatedAt: new Date().toISOString() });
  const client = await getPool().connect();
  try {
    await client.query(
      `INSERT INTO hq_ops (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [OPS_ROW_ID, JSON.stringify(next)]
    );
    return next;
  } finally {
    client.release();
  }
}

export async function patchOpsDataInPg(partial) {
  const current = await readOpsDataFromPg();
  return writeOpsDataToPg(mergeOpsPatch(current, partial));
}
