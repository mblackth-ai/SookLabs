import pg from "pg";

// HQ room on Postgres. Every write touches only its own rows, so concurrent
// seats cannot overwrite each other's posts (the old full-table rewrite could).

const { Pool } = pg;

let pool;
let schemaReady;

function getPool() {
  if (!pool) {
    const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) throw new Error("HQ_DATABASE_URL not configured");
    pool = new Pool({
      connectionString: url,
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS hq_room_seats (
    id TEXT PRIMARY KEY,
    callsign TEXT NOT NULL,
    glyph TEXT NOT NULL,
    hue TEXT NOT NULL,
    tier TEXT NOT NULL,
    token_hash TEXT,
    last_seen_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS hq_room_messages (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    seat_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    body TEXT NOT NULL,
    refs JSONB NOT NULL DEFAULT '[]',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    baton JSONB,
    promoted_sha TEXT,
    created_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS hq_room_messages_channel_created ON hq_room_messages (channel, created_at)`,
  `CREATE TABLE IF NOT EXISTS hq_room_broadcast (
    id TEXT PRIMARY KEY,
    source_message_id TEXT NOT NULL,
    masked_body TEXT NOT NULL,
    approved_by TEXT NOT NULL,
    publish_after TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    held BOOLEAN NOT NULL DEFAULT FALSE,
    hold_reason TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS hq_mcp_calls (
    id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    tool TEXT NOT NULL,
    seat_id TEXT,
    created_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS hq_ingest_events (
    provider TEXT NOT NULL,
    delivery_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    repo TEXT,
    payload_sha256 TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ,
    error TEXT,
    PRIMARY KEY (provider, delivery_id)
  )`,
  `CREATE TABLE IF NOT EXISTS hq_github_prs (
    repo TEXT NOT NULL,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    state TEXT NOT NULL,
    draft BOOLEAN NOT NULL DEFAULT FALSE,
    merged BOOLEAN NOT NULL DEFAULT FALSE,
    author TEXT,
    head_ref TEXT,
    head_sha TEXT,
    base_ref TEXT,
    ci_state TEXT NOT NULL DEFAULT 'unknown',
    updated_at TIMESTAMPTZ NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (repo, number)
  )`,
  `CREATE TABLE IF NOT EXISTS hq_kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
];

export function ensureSwarmSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await getPool().connect();
      try {
        for (const statement of SCHEMA) await client.query(statement);
      } finally {
        client.release();
      }
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }
  return schemaReady;
}

async function query(text, params) {
  await ensureSwarmSchema();
  return getPool().query(text, params);
}

const iso = (value) => (value ? new Date(value).toISOString() : "");

function mapMessage(row) {
  return {
    id: row.id,
    channel: row.channel,
    seatId: row.seat_id,
    kind: row.kind,
    body: row.body,
    refs: row.refs || [],
    verified: row.verified === true,
    baton: row.baton || null,
    promotedSha: row.promoted_sha || null,
    createdAt: iso(row.created_at),
  };
}

function mapBroadcast(row) {
  return {
    id: row.id,
    sourceMessageId: row.source_message_id,
    maskedBody: row.masked_body,
    approvedBy: row.approved_by,
    publishAfter: iso(row.publish_after),
    createdAt: iso(row.created_at),
    held: row.held === true,
    holdReason: row.hold_reason || "",
  };
}

function mapSeat(row) {
  return {
    id: row.id,
    callsign: row.callsign,
    glyph: row.glyph,
    hue: row.hue,
    tier: row.tier,
    tokenHash: row.token_hash || "",
    lastSeenAt: iso(row.last_seen_at),
  };
}

function mapPr(row) {
  return {
    repo: row.repo,
    number: row.number,
    title: row.title,
    url: row.url,
    state: row.state,
    draft: row.draft === true,
    merged: row.merged === true,
    author: row.author || "",
    headRef: row.head_ref || "",
    headSha: row.head_sha || "",
    baseRef: row.base_ref || "",
    ciState: row.ci_state || "unknown",
    updatedAt: iso(row.updated_at),
    ingestedAt: iso(row.ingested_at),
  };
}

export async function listMessagesPg({ channel, after, limit }) {
  const params = [];
  const where = [];
  if (channel) {
    params.push(channel);
    where.push(`channel = $${params.length}`);
  }
  if (after) {
    params.push(after);
    where.push(`created_at > $${params.length}`);
  }
  params.push(limit || 500);
  const sql = `SELECT * FROM (
      SELECT * FROM hq_room_messages ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC, id DESC LIMIT $${params.length}
    ) recent ORDER BY created_at ASC, id ASC`;
  const result = await query(sql, params);
  return result.rows.map(mapMessage);
}

export async function listSeatsPg() {
  const result = await query("SELECT * FROM hq_room_seats ORDER BY id");
  return result.rows.map(mapSeat);
}

export async function findMessagePg(id) {
  const result = await query("SELECT * FROM hq_room_messages WHERE id = $1", [id]);
  return result.rows[0] ? mapMessage(result.rows[0]) : null;
}

/**
 * Insert one message and touch its seat in one transaction. A transaction-level
 * advisory lock serialises posts so the duplicate check sees the true latest row.
 */
export async function insertMessagePg({ message, seat, isDuplicate, keep }) {
  await ensureSwarmSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('hq_room_messages'))");
    const latest = await client.query("SELECT * FROM hq_room_messages ORDER BY created_at DESC, id DESC LIMIT 1");
    const previous = latest.rows[0] ? mapMessage(latest.rows[0]) : null;
    if (isDuplicate(previous, message)) {
      await client.query("COMMIT");
      return { message: previous, deduped: true };
    }
    await client.query(
      `INSERT INTO hq_room_messages
        (id, channel, seat_id, kind, body, refs, verified, baton, promoted_sha, created_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8::jsonb,$9,$10)`,
      [
        message.id,
        message.channel,
        message.seatId,
        message.kind,
        message.body,
        JSON.stringify(message.refs || []),
        message.verified === true,
        message.baton ? JSON.stringify(message.baton) : null,
        message.promotedSha || null,
        message.createdAt,
      ]
    );
    await client.query(
      `INSERT INTO hq_room_seats (id, callsign, glyph, hue, tier, token_hash, last_seen_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET token_hash = EXCLUDED.token_hash, last_seen_at = EXCLUDED.last_seen_at`,
      [seat.id, seat.callsign, seat.glyph, seat.hue, seat.tier, seat.tokenHash || null, seat.lastSeenAt]
    );
    await client.query(
      `DELETE FROM hq_room_messages WHERE id IN (
         SELECT id FROM hq_room_messages ORDER BY created_at DESC, id DESC OFFSET $1)`,
      [keep]
    );
    await client.query("COMMIT");
    return { message, deduped: false };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** Sets promoted_sha only once; returns the stored sha either way. */
export async function setPromotedShaPg(id, sha) {
  const result = await query(
    `UPDATE hq_room_messages SET promoted_sha = COALESCE(promoted_sha, $2) WHERE id = $1 RETURNING promoted_sha`,
    [id, sha]
  );
  return result.rows[0]?.promoted_sha || null;
}

export async function insertBroadcastPg(row) {
  await query(
    `INSERT INTO hq_room_broadcast
      (id, source_message_id, masked_body, approved_by, publish_after, created_at, held, hold_reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [row.id, row.sourceMessageId, row.maskedBody, row.approvedBy, row.publishAfter, row.createdAt, row.held === true, row.holdReason || null]
  );
}

export async function listBroadcastsPg() {
  const result = await query("SELECT * FROM hq_room_broadcast ORDER BY created_at ASC LIMIT 500");
  return result.rows.map(mapBroadcast);
}

export async function holdBroadcastPg(id, reason) {
  await query("UPDATE hq_room_broadcast SET held = TRUE, hold_reason = $2 WHERE id = $1", [id, reason]);
}

export async function insertMcpCallPg(call) {
  await query(`INSERT INTO hq_mcp_calls (id, event, tool, seat_id, created_at) VALUES ($1,$2,$3,$4,$5)`, [
    call.id,
    call.event,
    call.tool,
    call.seatId || null,
    call.createdAt,
  ]);
}

/** Returns false when this delivery was already recorded (a GitHub redelivery). */
export async function recordIngestPg(event) {
  const result = await query(
    `INSERT INTO hq_ingest_events (provider, delivery_id, event_type, repo, payload_sha256, received_at)
     VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (provider, delivery_id) DO NOTHING RETURNING delivery_id`,
    [event.provider, event.deliveryId, event.eventType, event.repo || null, event.payloadSha256, event.receivedAt]
  );
  return result.rowCount === 1;
}

export async function finishIngestPg({ provider, deliveryId, error }) {
  await query(
    `UPDATE hq_ingest_events SET processed_at = $3, error = $4 WHERE provider = $1 AND delivery_id = $2`,
    [provider, deliveryId, new Date().toISOString(), error || null]
  );
}

export async function upsertPrPg(pr) {
  await query(
    `INSERT INTO hq_github_prs
      (repo, number, title, url, state, draft, merged, author, head_ref, head_sha, base_ref, ci_state, updated_at, ingested_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (repo, number) DO UPDATE SET
       title = EXCLUDED.title, url = EXCLUDED.url, state = EXCLUDED.state, draft = EXCLUDED.draft,
       merged = EXCLUDED.merged, author = EXCLUDED.author, head_ref = EXCLUDED.head_ref,
       ci_state = CASE WHEN EXCLUDED.ci_state = 'unknown' AND hq_github_prs.head_sha = EXCLUDED.head_sha
                       THEN hq_github_prs.ci_state ELSE EXCLUDED.ci_state END,
       head_sha = EXCLUDED.head_sha, base_ref = EXCLUDED.base_ref,
       updated_at = EXCLUDED.updated_at, ingested_at = EXCLUDED.ingested_at
     WHERE hq_github_prs.updated_at <= EXCLUDED.updated_at`,
    [
      pr.repo,
      pr.number,
      pr.title,
      pr.url,
      pr.state,
      pr.draft === true,
      pr.merged === true,
      pr.author || null,
      pr.headRef || null,
      pr.headSha || null,
      pr.baseRef || null,
      pr.ciState || "unknown",
      pr.updatedAt,
      pr.ingestedAt,
    ]
  );
}

export async function setPrCiPg({ repo, headSha, ciState }) {
  await query(`UPDATE hq_github_prs SET ci_state = $3, ingested_at = $4 WHERE repo = $1 AND head_sha = $2`, [
    repo,
    headSha,
    ciState,
    new Date().toISOString(),
  ]);
}

export async function listPrsPg() {
  const result = await query(
    `SELECT * FROM hq_github_prs ORDER BY (state = 'open') DESC, updated_at DESC LIMIT 50`
  );
  return result.rows.map(mapPr);
}

export async function getKvPg(key) {
  const result = await query("SELECT value FROM hq_kv WHERE key = $1", [key]);
  return result.rows[0]?.value ?? null;
}

export async function setKvPg(key, value) {
  await query(
    `INSERT INTO hq_kv (key, value, updated_at) VALUES ($1,$2,$3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
    [key, value, new Date().toISOString()]
  );
}

export async function loadClientNames() {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  if (!url?.trim()) return [];
  try {
    const tables = await getPool().query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients'`
    );
    if (tables.rows.length === 0) return [];
    const names = await getPool().query(`SELECT name FROM clients WHERE name IS NOT NULL`);
    return names.rows.map((row) => String(row.name || "").trim()).filter((name) => name.length >= 3);
  } catch {
    return [];
  }
}

export async function closeSwarmPool() {
  if (pool) await pool.end();
  pool = undefined;
  schemaReady = undefined;
}
