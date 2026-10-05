// Quo webhook signature verification (2026-03-30 style). Copy to app.sookly.com.
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * @param {{ rawBody: string, signatureHeader: string, secret: string }} input
 * @returns {boolean}
 */
export function verifyQuoWebhookSignature({ rawBody, signatureHeader, secret }) {
  const sig = String(signatureHeader || "").trim();
  const key = String(secret || "").trim();
  if (!sig || !key || !rawBody) return false;

  const expected = createHmac("sha256", key).update(rawBody, "utf8").digest("hex");
  const presented = sig.includes("=") ? sig.split("=").pop()?.trim() : sig;
  if (!presented || presented.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(presented, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}
