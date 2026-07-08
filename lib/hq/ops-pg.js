import pg from "pg";
import { DEFAULT_OPS } from "./ops-default";
import { mergeOpsPatch } from "./ops-shared";

const { Pool } = pg;
const OPS_ROW_ID = "default";

let pool;

function getPool() {
  if (!pool) {
    const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) throw new Error("HQ_DATABASE_URL not configured");
    pool = new Pool({ connectionString: url, ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined });
  }
  return pool;
}

export async function ensureOpsSchema() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS hq_ops (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  } finally {
    client.release();
  }
}

export async function readOpsDataFromPg() {
  await ensureOpsSchema();
  const client = await getPool().connect();
  try {
    const res = await client.query("SELECT data FROM hq_ops WHERE id = $1", [OPS_ROW_ID]);
    if (res.rows.length === 0) {
      const seed = { ...DEFAULT_OPS, updatedAt: new Date().toISOString(), agentJobs: [] };
      await client.query(
        "INSERT INTO hq_ops (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())",
        [OPS_ROW_ID, JSON.stringify(seed)]
      );
      return seed;
    }
    const data = res.rows[0].data;
    if (!data.agentJobs) data.agentJobs = [];
    return data;
  } finally {
    client.release();
  }
}

export async function writeOpsDataToPg(data) {
  await ensureOpsSchema();
  const next = { ...data, updatedAt: new Date().toISOString() };
  if (!next.agentJobs) next.agentJobs = [];
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
