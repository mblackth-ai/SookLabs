import pg from "pg";
import { createHash, randomBytes } from "crypto";
import { ownerRedeemErrorFromState, ownerRedeemUnknownToken } from "./owner-join-errors.js";

// Owner rooms. Mark invites a business owner with a one-time link; using it
// issues that owner a key (kept in an httpOnly cookie) that opens /hq/client
// for that one business only. Only hashes are stored. Mark can revoke any time.
// Tables are created only by migrateOwnerPortal (Mark's switch-on), never on first use.

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

export async function closeOwnerPool() {
  if (pool) await pool.end();
  pool = undefined;
}

const q = (text, params) => getPool().query(text, params);
const sha = (value) => createHash("sha256").update(String(value)).digest("hex");

export const OWNER_COOKIE = "hq_owner";
export const OWNER_INVITE_TTL_MS = 7 * 24 * 60 * 60_000;
export const OWNER_COOKIE_MAX_AGE_SEC = 90 * 24 * 60 * 60;
const INVITE_PREFIX = "hqi_";
const KEY_PREFIX = "hqo_";

export const OWNER_SCHEMA = `
CREATE TABLE IF NOT EXISTS hq_owner_invites (
  id text PRIMARY KEY,
  business_slug text NOT NULL,
  label text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  access_id text
);
CREATE INDEX IF NOT EXISTS hq_owner_invites_business ON hq_owner_invites (business_slug);
CREATE TABLE IF NOT EXISTS hq_owner_access (
  id text PRIMARY KEY,
  business_slug text NOT NULL,
  label text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL,
  last_seen_at timestamptz,
  revoked_at timestamptz,
  revoked_by text
);
CREATE INDEX IF NOT EXISTS hq_owner_access_business ON hq_owner_access (business_slug);
`;

export async function migrateOwnerPortal() {
  await q(OWNER_SCHEMA);
}

export async function ownerPortalInstalled() {
  try {
    const { rows } = await q(
      "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_name IN ('hq_owner_invites', 'hq_owner_access')"
    );
    return rows[0]?.n === 2;
  } catch (error) {
    if (error.code === "no-database") return false;
    throw error;
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

function cleanLabel(label) {
  const text = String(label || "").replace(/\s+/g, " ").trim().slice(0, 80);
  return text || "Owner";
}

/** Mark only (the route checks). A new invite for the same business + label replaces an unused one. */
export async function createOwnerInvite({ business, label, by, now = new Date(), ttlMs = OWNER_INVITE_TTL_MS }) {
  if (!SLUG_RE.test(String(business || ""))) return { error: { status: 400, error: "Unknown business." } };
  const name = cleanLabel(label);
  await q(
    "UPDATE hq_owner_invites SET revoked_at = $3 WHERE business_slug = $1 AND label = $2 AND used_at IS NULL AND revoked_at IS NULL",
    [business, name, now]
  );
  const token = `${INVITE_PREFIX}${randomBytes(32).toString("base64url")}`;
  const id = `oin_${randomBytes(6).toString("hex")}`;
  const expiresAt = new Date(now.getTime() + ttlMs);
  await q(
    "INSERT INTO hq_owner_invites (id, business_slug, label, token_hash, created_by, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, business, name, sha(token), by, now, expiresAt]
  );
  return { id, business, label: name, token, expiresAt: expiresAt.toISOString() };
}

function inviteState(found, now) {
  if (!found) return "unknown";
  if (found.revoked_at) return "cancelled";
  if (found.used_at) return "used";
  if (found.expires_at <= now) return "expired";
  return "ready";
}

/** Read-only: never consumes the link (so link previews in chat apps can't burn it). */
export async function peekOwnerInvite(token, now = new Date()) {
  if (!String(token || "").startsWith(INVITE_PREFIX)) return { state: "unknown" };
  const { rows } = await q("SELECT * FROM hq_owner_invites WHERE token_hash = $1", [sha(token)]);
  const found = rows[0];
  return { state: inviteState(found, now), business: found?.business_slug || "", label: found?.label || "" };
}

/** Use a link exactly once (POST from the join page). Returns the owner key to set as a cookie. */
export async function redeemOwnerInvite({ token, now = new Date() }) {
  if (!String(token || "").startsWith(INVITE_PREFIX)) {
    return { error: ownerRedeemUnknownToken() };
  }
  const claimed = await q(
    `UPDATE hq_owner_invites SET used_at = $2
     WHERE token_hash = $1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at > $2
     RETURNING *`,
    [sha(token), now]
  );
  const invite = claimed.rows[0];
  if (!invite) {
    const { state } = await peekOwnerInvite(token, now);
    return { error: ownerRedeemErrorFromState(state) };
  }
  const key = `${KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
  const accessId = `own_${randomBytes(6).toString("hex")}`;
  await q(
    "INSERT INTO hq_owner_access (id, business_slug, label, key_hash, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [accessId, invite.business_slug, invite.label, sha(key), invite.created_by, now]
  );
  await q("UPDATE hq_owner_invites SET access_id = $2 WHERE id = $1", [invite.id, accessId]);
  return { key, business: invite.business_slug, label: invite.label, accessId };
}

/** The business an owner key opens, or null (unknown, revoked, or tables not installed). */
export async function ownerForKey(key, now = new Date()) {
  if (!String(key || "").startsWith(KEY_PREFIX)) return null;
  let rows;
  try {
    ({ rows } = await q(
      "UPDATE hq_owner_access SET last_seen_at = $2 WHERE key_hash = $1 AND revoked_at IS NULL RETURNING id, business_slug, label",
      [sha(key), now]
    ));
  } catch (error) {
    if (error.code === "no-database" || error.code === "42P01") return null;
    throw error;
  }
  const found = rows[0];
  return found ? { accessId: found.id, business: found.business_slug, label: found.label } : null;
}

const iso = (v) => (v?.toISOString ? v.toISOString() : v || null);

/** For Mark: open invites and owner access per business. Never returns tokens, keys or hashes. */
export async function listOwners({ now = new Date() } = {}) {
  const [invites, access] = await Promise.all([
    q("SELECT * FROM hq_owner_invites WHERE used_at IS NULL AND revoked_at IS NULL AND expires_at > $1 ORDER BY created_at DESC", [now]),
    q("SELECT * FROM hq_owner_access WHERE revoked_at IS NULL ORDER BY created_at DESC"),
  ]);
  return {
    invites: invites.rows.map((r) => ({ id: r.id, business: r.business_slug, label: r.label, expiresAt: iso(r.expires_at) })),
    access: access.rows.map((r) => ({
      id: r.id,
      business: r.business_slug,
      label: r.label,
      createdAt: iso(r.created_at),
      lastSeenAt: iso(r.last_seen_at),
    })),
  };
}

/** Revoke an owner's access ("own_…") or cancel an unused invite ("oin_…"). */
export async function revokeOwner({ id, by, now = new Date() }) {
  const value = String(id || "");
  if (value.startsWith("own_")) {
    const { rowCount } = await q(
      "UPDATE hq_owner_access SET revoked_at = $2, revoked_by = $3 WHERE id = $1 AND revoked_at IS NULL",
      [value, now, by]
    );
    return { ok: rowCount === 1 };
  }
  if (value.startsWith("oin_")) {
    const { rowCount } = await q("UPDATE hq_owner_invites SET revoked_at = $2 WHERE id = $1 AND revoked_at IS NULL AND used_at IS NULL", [value, now]);
    return { ok: rowCount === 1 };
  }
  return { ok: false };
}
