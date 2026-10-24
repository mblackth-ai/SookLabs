/**
 * Read timeouts for HQ pages (pure; no server-only import, so it is testable).
 *
 * Every SEOS / Sookly read and every hq_ops Postgres connection or read gives up after about
 * HQ_READ_TIMEOUT_MS, so a slow upstream turns into an "Unavailable" state instead of a hung page.
 */

export const HQ_READ_TIMEOUT_MS = 3000;

/** SEOS base URL, the same order every SEOS client already used. */
export function seosBaseUrl(env = process.env) {
  return env.SEOS_INTERNAL_URL || env.NEXT_PUBLIC_SEOS_URL || "https://seos.sooklabs.com";
}

/** Wrap a fetch so each call aborts after `ms`. A caller's own signal still works alongside it. */
export function fetchWithTimeout(fetchImpl = globalThis.fetch, ms = HQ_READ_TIMEOUT_MS) {
  return (url, init = {}) => {
    const timeout = AbortSignal.timeout(ms);
    const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    return fetchImpl(url, { ...init, signal });
  };
}

export class ReadTimeoutError extends Error {
  constructor(label, ms) {
    super(`${label} timed out after ${ms}ms`);
    this.name = "ReadTimeoutError";
  }
}

/** Resolve with `promise`, or reject with ReadTimeoutError after `ms`. The timer never outlives the race. */
export function withDeadline(promise, ms = HQ_READ_TIMEOUT_MS, label = "read") {
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new ReadTimeoutError(label, ms)), ms);
  });
  return Promise.race([Promise.resolve(promise), deadline]).finally(() => clearTimeout(timer));
}

/** node-postgres Pool options for the hq_ops store: give up connecting after the read timeout. */
export function opsPoolConfig(url, ms = HQ_READ_TIMEOUT_MS) {
  return {
    connectionString: url,
    ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: ms,
  };
}
