import pg from "pg";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";
import { ROOM_SEATS, roomSeat } from "./swarm-contract.js";

// Seat key self-enrollment. A seat's own client asks for a key and gets it at
// once, inactive, plus a pairing code. An approver (Mark by default; any seat
// listed in HQ_SEAT_ENROLL_APPROVERS) activates it by entering that code. Only
// hashes are stored. The env-var keys from scripts/hq-room-seats.mjs keep working.
// Tables are created only by scripts/hq-seat-enroll-migrate.mjs (never on first use).

const { Pool } = pg;
let pool;

function getPool() {
  if (!pool) {
    const url = process.env.HQ_DATABASE_URL || process.env.DATABASE_URL;
    if (!url) throw Object.assign(new Error("HQ_DATABASE_URL not configured"), { code: "no-database" });
    pool = new Pool({ connectionString: url, ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined });
  }
  return pool;
}

export async function closeEnrollPool() {
  if (pool) await pool.end();
  pool = undefined;
}

const q = (text, params) => getPool().query(text, params);

export const ENROLL_SCHEMA = `
CREATE TABLE IF NOT EXISTS hq_seat_enrollments (
  id text PRIMARY KEY,
  seat_id text NOT NULL,
  client text NOT NULL DEFAULT '',
  key_hash text NOT NULL UNIQUE,
  code_hash text NOT NULL,
  status text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  requested_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  decided_by text NOT NULL DEFAULT '',
  decided_at timestamptz,
  revoked_by text NOT NULL DEFAULT '',
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS hq_seat_enrollments_seat ON hq_seat_enrollments (seat_id, status);
CREATE TABLE IF NOT EXISTS hq_seat_enroll_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
`;

export const ISSUED_KEY_PREFIX = "hqk_";
export const ENROLL_LIMITS = { ttlMs: 15 * 60_000, pendingPerSeat: 3, pendingTotal: 20, maxAttempts: 5 };
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const ENROLLABLE_SEATS = ROOM_SEATS.filter((seat) => seat.tier === "agent").map((seat) => seat.id);

const sha = (value) => createHash("sha256").update(String(value), "utf8").digest("hex");
const same = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const normCode = (code) => String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Approvers from the env var plus any `extra` seats (Mark's in-room delegation). Mark is always one. */
export function enrollApprovers(env = process.env, extra = []) {
  const list = [...String(env.HQ_SEAT_ENROLL_APPROVERS || "mark").split(","), ...extra]
    .map((item) => roomSeat(String(item).trim())?.id)
    .filter(Boolean);
  return [...new Set(["mark", ...list])].filter((seat) => seat === "mark" || ENROLLABLE_SEATS.includes(seat));
}

/** Seats Mark delegated in the room (stored, not env). Never throws. */
export async function delegatedApprovers() {
  try {
    const { rows } = await q("SELECT value FROM hq_seat_enroll_settings WHERE key = 'approvers'");
    return Array.isArray(rows[0]?.value) ? rows[0].value.filter((seat) => ENROLLABLE_SEATS.includes(seat)) : [];
  } catch {
    return [];
  }
}

export async function setDelegatedApprovers(seats, by) {
  const list = [...new Set((seats || []).map((seat) => roomSeat(String(seat).trim())?.id).filter((seat) => ENROLLABLE_SEATS.includes(seat)))];
  await q(
    `INSERT INTO hq_seat_enroll_settings (key, value, updated_by, updated_at) VALUES ('approvers', $1::jsonb, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [JSON.stringify(list), by]
  );
  return list;
}

export async function currentApprovers(env = process.env) {
  return enrollApprovers(env, await delegatedApprovers());
}

export async function migrateEnroll() {
  await q(ENROLL_SCHEMA);
}

export async function enrollInstalled() {
  const { rows } = await q("SELECT to_regclass('hq_seat_enrollments') IS NOT NULL AND to_regclass('hq_seat_enroll_settings') IS NOT NULL AS ok");
  return rows[0]?.ok === true;
}

function code8() {
  let out = "";
  for (let i = 0; i < 8; i += 1) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

const row = (r) =>
  r && {
    id: r.id,
    seat: r.seat_id,
    client: r.client,
    status: r.status,
    attempts: r.attempts,
    requestedAt: r.requested_at?.toISOString?.() || r.requested_at,
    expiresAt: r.expires_at?.toISOString?.() || r.expires_at,
    decidedBy: r.decided_by,
    decidedAt: r.decided_at?.toISOString?.() || r.decided_at || "",
  };

/** Unauthenticated: returns the key once (inactive) and the pairing code. Only hashes are stored. */
export async function requestEnrollment({ seat, client, now = new Date() }) {
  const seatId = roomSeat(seat)?.id;
  if (!seatId || !ENROLLABLE_SEATS.includes(seatId)) return { error: { status: 400, error: "Keys can be requested for agent seats only." } };
  const label = String(client || "").replace(/[^A-Za-z0-9 ._-]/g, "").trim().slice(0, 40);
  await q("UPDATE hq_seat_enrollments SET status = 'expired' WHERE status = 'pending' AND expires_at <= $1", [now]);
  const { rows: counts } = await q(
    "SELECT count(*) FILTER (WHERE seat_id = $1)::int AS seat, count(*)::int AS total FROM hq_seat_enrollments WHERE status = 'pending'",
    [seatId]
  );
  if (counts[0].seat >= ENROLL_LIMITS.pendingPerSeat || counts[0].total >= ENROLL_LIMITS.pendingTotal) {
    return { error: { status: 429, error: "Too many pending key requests. Try again after they expire (15 minutes)." } };
  }
  const key = `${ISSUED_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
  const pairingCode = code8();
  const id = `enr_${randomBytes(6).toString("hex")}`;
  const expiresAt = new Date(now.getTime() + ENROLL_LIMITS.ttlMs);
  await q(
    `INSERT INTO hq_seat_enrollments (id, seat_id, client, key_hash, code_hash, status, requested_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)`,
    [id, seatId, label, sha(key), sha(normCode(pairingCode)), now, expiresAt]
  );
  return { id, seat: seatId, key, pairingCode, expiresAt: expiresAt.toISOString() };
}

/** The requester checks its own request with the key it was given. */
export async function enrollmentForKey(id, key, now = new Date()) {
  const { rows } = await q("SELECT * FROM hq_seat_enrollments WHERE id = $1", [id]);
  const found = rows[0];
  if (!found || !same(found.key_hash, sha(key))) return null;
  if (found.status === "pending" && found.expires_at <= now) return { ...row(found), status: "expired" };
  return row(found);
}

export async function listEnrollments({ now = new Date(), limit = 20 } = {}) {
  const { rows } = await q(
    `SELECT * FROM hq_seat_enrollments
     WHERE (status = 'pending' AND expires_at > $1) OR status = 'active'
     ORDER BY requested_at DESC LIMIT $2`,
    [now, limit]
  );
  return rows.map(row);
}

/** Approve or deny with the pairing code. Approving revokes this seat's earlier issued keys. */
export async function decideEnrollment({ id, code, approve, approver, env = process.env, now = new Date() }) {
  if (!(await currentApprovers(env)).includes(approver)) return { error: { status: 403, error: "This seat cannot approve key requests." } };
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT * FROM hq_seat_enrollments WHERE id = $1 FOR UPDATE", [id]);
    const found = rows[0];
    if (!found) throw Object.assign(new Error("nf"), { http: { status: 404, error: "No such key request." } });
    if (found.status !== "pending" || found.expires_at <= now) {
      throw Object.assign(new Error("st"), { http: { status: 409, error: `That request is ${found.status === "pending" ? "expired" : found.status}.` } });
    }
    if (found.seat_id === approver) throw Object.assign(new Error("self"), { http: { status: 403, error: "A seat cannot approve its own key." } });
    if (!same(found.code_hash, sha(normCode(code)))) {
      const attempts = found.attempts + 1;
      const locked = attempts >= ENROLL_LIMITS.maxAttempts;
      await client.query("UPDATE hq_seat_enrollments SET attempts = $2, status = $3, decided_by = $4, decided_at = $5 WHERE id = $1", [
        id,
        attempts,
        locked ? "denied" : "pending",
        locked ? "too-many-wrong-codes" : "",
        locked ? now : null,
      ]);
      await client.query("COMMIT");
      return { error: { status: 403, error: locked ? "Wrong pairing code too many times; the request is denied." : "Wrong pairing code." } };
    }
    if (approve) {
      await client.query(
        "UPDATE hq_seat_enrollments SET status = 'revoked', revoked_by = $2, revoked_at = $3 WHERE seat_id = $1 AND status = 'active'",
        [found.seat_id, `replaced by ${id}`, now]
      );
    }
    const { rows: done } = await client.query(
      "UPDATE hq_seat_enrollments SET status = $2, decided_by = $3, decided_at = $4 WHERE id = $1 RETURNING *",
      [id, approve ? "active" : "denied", approver, now]
    );
    await client.query("COMMIT");
    return { enrollment: row(done[0]) };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.http) return { error: error.http };
    throw error;
  } finally {
    client.release();
  }
}

export async function revokeSeatKeys({ seat, by, now = new Date() }) {
  const { rowCount } = await q(
    "UPDATE hq_seat_enrollments SET status = 'revoked', revoked_by = $2, revoked_at = $3 WHERE seat_id = $1 AND status IN ('active', 'pending')",
    [seat, by, now]
  );
  return { revoked: rowCount };
}

/** Seat for an active issued key, or "" (also "" when the table is not installed). */
export async function seatForIssuedKey(token) {
  const key = String(token || "").trim();
  if (!key.startsWith(ISSUED_KEY_PREFIX)) return { seat: "" };
  try {
    const { rows } = await q("SELECT seat_id, status, expires_at FROM hq_seat_enrollments WHERE key_hash = $1", [sha(key)]);
    const found = rows[0];
    if (!found) return { seat: "" };
    if (found.status === "active") return { seat: found.seat_id };
    return { seat: "", status: found.status === "pending" && found.expires_at <= new Date() ? "expired" : found.status };
  } catch (error) {
    if (error?.code === "42P01" || error?.code === "no-database") return { seat: "" };
    throw error;
  }
}

/** Agent seats Mark connected from the room as `pull` (no secret involved). Never throws. */
export async function pullSeats() {
  try {
    const { rows } = await q("SELECT value FROM hq_seat_enroll_settings WHERE key = 'pull_seats'");
    return Array.isArray(rows[0]?.value) ? rows[0].value.filter((seat) => ENROLLABLE_SEATS.includes(seat)) : [];
  } catch {
    return [];
  }
}

export async function setPullSeat(seat, connected, by) {
  const target = roomSeat(seat)?.id;
  if (!ENROLLABLE_SEATS.includes(target)) return { error: { status: 400, error: "Unknown agent seat." } };
  const current = await pullSeats();
  const next = connected ? [...new Set([...current, target])] : current.filter((item) => item !== target);
  await q(
    `INSERT INTO hq_seat_enroll_settings (key, value, updated_by, updated_at) VALUES ('pull_seats', $1::jsonb, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [JSON.stringify(next), by]
  );
  return { pull: next };
}

/** Seats with an active issued key, for adapter readiness. Never throws. */
export async function activeIssuedSeats() {
  try {
    const { rows } = await q("SELECT DISTINCT seat_id FROM hq_seat_enrollments WHERE status = 'active'");
    return rows.map((r) => r.seat_id);
  } catch {
    return [];
  }
}
