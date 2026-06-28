// Phase 1 HQ auth: single shared password -> HMAC-signed session token.
// No database, no third-party auth. Edge-safe (Web Crypto only).

export const HQ_COOKIE = "hq_session";
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

// Constant-time comparison to avoid leaking secret length/content via timing.
export function timingSafeEqual(a, b) {
  const aBytes = encoder.encode(String(a));
  const bBytes = encoder.encode(String(b));
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
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
  if (!timingSafeEqual(sig, expected)) return false;
  const expiryNum = Number(expiry);
  if (!Number.isFinite(expiryNum) || Date.now() > expiryNum) return false;
  return true;
}
