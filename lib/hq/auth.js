// Phase 1 HQ auth: single shared password -> HMAC-signed session token.
// No database, no third-party auth. Edge-safe (Web Crypto only).

export const HQ_COOKIE = "hq_session";
export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days
const DEFAULT_TTL_MS = SESSION_MAX_AGE_SEC * 1000;
const MIN_SECRET_LENGTH = 32;
const PLACEHOLDER_PATTERN = /^change-me/i;

const encoder = new TextEncoder();

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toHex(sig);
}

async function sha256Hex(value) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(String(value)));
  return toHex(hash);
}

// Constant-time comparison to avoid leaking secret length/content via timing.
export function timingSafeEqual(a, b) {
  const aBytes = encoder.encode(String(a));
  const bBytes = encoder.encode(String(b));
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

/** Reject missing, placeholder, or too-short session secrets. */
export function resolveSessionSecret(raw = process.env.HQ_SESSION_SECRET) {
  const secret = raw?.trim();
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  if (PLACEHOLDER_PATTERN.test(secret)) return null;
  return secret;
}

/** Reject missing or placeholder access passwords. */
export function resolveAccessPassword(raw = process.env.HQ_ACCESS_PASSWORD) {
  const password = raw?.trim();
  if (!password || PLACEHOLDER_PATTERN.test(password)) return null;
  return password;
}

export function isSecureCookieEnv() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export function sessionCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: isSecureCookieEnv(),
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

/** Compare passwords without leaking length via early-exit timing. */
export async function verifyPassword(submitted, password) {
  if (!password) return false;
  const [submittedHash, passwordHash] = await Promise.all([
    sha256Hex(submitted),
    sha256Hex(password),
  ]);
  return timingSafeEqual(submittedHash, passwordHash);
}

export async function createSessionToken(secret, ttlMs = DEFAULT_TTL_MS) {
  const expiry = String(Date.now() + ttlMs);
  const sig = await hmacHex(secret, expiry);
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmacHex(secret, expiry);
  if (sig.length !== expected.length) {
    // Burn constant time even when the attacker sends a malformed signature length.
    timingSafeEqual(expected, expected);
    return false;
  }
  if (!timingSafeEqual(sig, expected)) return false;
  const expiryNum = Number(expiry);
  if (!Number.isFinite(expiryNum) || Date.now() > expiryNum) return false;
  return true;
}
