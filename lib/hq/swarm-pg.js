import pg from "pg";

const { Pool } = pg;

let pool;

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

export async function ensureSwarmSchema() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS hq_room_seats (
        id TEXT PRIMARY KEY,
        callsign TEXT NOT NULL,
        glyph TEXT NOT NULL,
        hue TEXT NOT NULL,
        tier TEXT NOT NULL,
        token_hash TEXT,
        last_seen_at TIMESTAMPTZ
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS hq_room_messages (
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
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS hq_room_broadcast (
        id TEXT PRIMARY KEY,
        source_message_id TEXT NOT NULL,
        masked_body TEXT NOT NULL,
        approved_by TEXT NOT NULL,
        publish_after TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        held BOOLEAN NOT NULL DEFAULT FALSE,
        hold_reason TEXT
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS hq_mcp_calls (
        id TEXT PRIMARY KEY,
        event TEXT NOT NULL,
        tool TEXT NOT NULL,
        seat_id TEXT,
        created_at TIMESTAMPTZ NOT NULL
      )
    `);
  } finally {
    client.release();
  }
}

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
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapBroadcast(row) {
  return {
    id: row.id,
    sourceMessageId: row.source_message_id,
    maskedBody: row.masked_body,
    approvedBy: row.approved_by,
    publishAfter: new Date(row.publish_after).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
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
    lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at).toISOString() : "",
  };
}

export async function readRoomPg() {
  await ensureSwarmSchema();
  const client = await getPool().connect();
  try {
    const seats = await client.query("SELECT * FROM hq_room_seats ORDER BY id");
    const messages = await client.query("SELECT * FROM hq_room_messages ORDER BY created_at ASC");
    const broadcasts = await client.query("SELECT * FROM hq_room_broadcast ORDER BY created_at ASC");
    const mcpCalls = await client.query("SELECT * FROM hq_mcp_calls ORDER BY created_at ASC");
    return {
      seats: seats.rows.map(mapSeat),
      messages: messages.rows.map(mapMessage),
      broadcasts: broadcasts.rows.map(mapBroadcast),
      mcpCalls: mcpCalls.rows.map((row) => ({
        id: row.id,
        event: row.event,
        tool: row.tool,
        seatId: row.seat_id || "",
        createdAt: new Date(row.created_at).toISOString(),
      })),
    };
  } finally {
    client.release();
  }
}

export async function writeRoomPg(store) {
  await ensureSwarmSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM hq_room_seats");
    await client.query("DELETE FROM hq_room_messages");
    await client.query("DELETE FROM hq_room_broadcast");
    await client.query("DELETE FROM hq_mcp_calls");
    for (const seat of store.seats) {
      await client.query(
        `INSERT INTO hq_room_seats (id, callsign, glyph, hue, tier, token_hash, last_seen_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [seat.id, seat.callsign, seat.glyph, seat.hue, seat.tier, seat.tokenHash || null, seat.lastSeenAt || null]
      );
    }
    for (const message of store.messages) {
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
    }
    for (const row of store.broadcasts) {
      await client.query(
        `INSERT INTO hq_room_broadcast
          (id, source_message_id, masked_body, approved_by, publish_after, created_at, held, hold_reason)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          row.id,
          row.sourceMessageId,
          row.maskedBody,
          row.approvedBy,
          row.publishAfter,
          row.createdAt,
          row.held === true,
          row.holdReason || null,
        ]
      );
    }
    for (const call of store.mcpCalls) {
      await client.query(
        `INSERT INTO hq_mcp_calls (id, event, tool, seat_id, created_at) VALUES ($1,$2,$3,$4,$5)`,
        [call.id, call.event, call.tool, call.seatId || null, call.createdAt]
      );
    }
    await client.query("COMMIT");
    return store;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loadClientNames() {
  const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
  if (!url?.trim()) return [];
  const client = await getPool().connect();
  try {
    const tables = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients'`
    );
    if (tables.rows.length === 0) return [];
    const names = await client.query(`SELECT name FROM clients WHERE name IS NOT NULL`);
    return names.rows.map((row) => String(row.name || "").trim()).filter((name) => name.length >= 3);
  } catch {
    return [];
  } finally {
    client.release();
  }
}
