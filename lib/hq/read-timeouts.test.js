import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import net from "node:net";
import {
  HQ_READ_TIMEOUT_MS,
  ReadTimeoutError,
  fetchWithTimeout,
  opsPoolConfig,
  seosBaseUrl,
  withDeadline,
} from "./read-timeouts.js";
import { readAnalyticsSummaryWith } from "./analytics-summary.js";
import { readContentSummaryWith } from "./content-summary.js";

/** A fetch that never answers until its signal aborts, like a hung upstream. */
function hangingFetch(calls = []) {
  return (url, init = {}) => {
    calls.push({ url, init });
    return new Promise((_, reject) => {
      init.signal?.addEventListener("abort", () => reject(init.signal.reason), { once: true });
    });
  };
}

// AbortSignal.timeout() timers are unref'd, so keep the test's event loop alive while a fake request hangs.
const keepAlive = setInterval(() => {}, 1000);
test.after(() => clearInterval(keepAlive));

const elapsed = async (fn) => {
  const t0 = performance.now();
  const value = await fn();
  return { value, ms: performance.now() - t0 };
};

test("HQ reads give up after about 3 seconds", () => {
  assert.ok(HQ_READ_TIMEOUT_MS >= 2000 && HQ_READ_TIMEOUT_MS <= 4000, `timeout is ${HQ_READ_TIMEOUT_MS}ms`);
});

test("fetchWithTimeout aborts a hung request and keeps the caller's own signal", async () => {
  const calls = [];
  const timed = fetchWithTimeout(hangingFetch(calls), 50);
  const { ms } = await elapsed(() => assert.rejects(timed("https://seos.example/x"), { name: "TimeoutError" }));
  assert.ok(ms < 1000, `aborted after ${ms}ms`);
  assert.ok(calls[0].init.signal instanceof AbortSignal);

  const caller = new AbortController();
  const p = fetchWithTimeout(hangingFetch(), 10_000)("https://seos.example/y", { signal: caller.signal });
  caller.abort(new Error("caller cancelled"));
  await assert.rejects(p, /caller cancelled/);
});

test("a hung SEOS analytics or content read resolves to an error result instead of hanging", async () => {
  const timed = fetchWithTimeout(hangingFetch(), 50);
  const { value: analytics, ms } = await elapsed(() =>
    readAnalyticsSummaryWith({ baseUrl: "https://seos.example", token: "t", months: 6, fetchImpl: timed }),
  );
  assert.ok(ms < 1000);
  assert.equal(analytics.ok, false);
  assert.equal(analytics.configured, true);
  const content = await readContentSummaryWith({ baseUrl: "https://seos.example", token: "t", fetchImpl: timed });
  assert.equal(content.ok, false);
});

test("withDeadline resolves in time, rejects late reads with ReadTimeoutError", async () => {
  assert.equal(await withDeadline(Promise.resolve(7), 50), 7);
  const never = new Promise(() => {});
  const { ms } = await elapsed(() => assert.rejects(withDeadline(never, 40, "ops"), (e) => e instanceof ReadTimeoutError && /ops/.test(e.message)));
  assert.ok(ms < 1000);
});

test("the hq_ops pool gives up connecting after the read timeout", () => {
  const cfg = opsPoolConfig("postgres://u:p@db.example:5432/hq?sslmode=require");
  assert.equal(cfg.connectionTimeoutMillis, HQ_READ_TIMEOUT_MS);
  assert.deepEqual(cfg.ssl, { rejectUnauthorized: false });
  assert.equal(opsPoolConfig("postgres://u:p@localhost/hq").ssl, undefined);
});

test("seosBaseUrl keeps the existing env order", () => {
  assert.equal(seosBaseUrl({ SEOS_INTERNAL_URL: "a", NEXT_PUBLIC_SEOS_URL: "b" }), "a");
  assert.equal(seosBaseUrl({ NEXT_PUBLIC_SEOS_URL: "b" }), "b");
  assert.equal(seosBaseUrl({}), "https://seos.sooklabs.com");
});

test("every SEOS / Sookly reader and the ops store are wired to the timeout", () => {
  const read = (f) => readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
  for (const f of ["analytics-client.js", "content-client.js", "enquiries-client.js", "kpis-server.js"]) {
    const src = read(f);
    assert.match(src, /fetchImpl:\s*fetchWithTimeout\(fetch\)/, `${f} uses fetchWithTimeout`);
    assert.doesNotMatch(src, /fetchImpl:\s*fetch\s*,/, `${f} still passes a raw fetch`);
  }
  const authority = read("authority-client.js");
  assert.match(authority, /const timedFetch = fetchWithTimeout\(fetch\)/);
  assert.match(authority.slice(authority.indexOf("export async function readAuthoritySummary"), authority.indexOf("export async function decideAuthorityApproval")), /await timedFetch\(/);
  const pg = read("ops-pg.js");
  assert.match(pg, /new Pool\(opsPoolConfig\(url\)\)/);
  assert.match(pg, /SELECT data FROM hq_ops[\s\S]{0,80}query_timeout: HQ_READ_TIMEOUT_MS/);
});

test("a database that accepts the connection but never answers fails the ops read in about 3s", async () => {
  // Local TCP server that never speaks Postgres: without a timeout, pg would wait forever.
  const sockets = new Set();
  const server = net.createServer((s) => sockets.add(s));
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address();
  const prev = process.env.HQ_DATABASE_URL;
  process.env.HQ_DATABASE_URL = `postgres://u:p@127.0.0.1:${port}/hq`;
  try {
    const { readOpsDataFromPg } = await import(`./ops-pg.js?silent-db=${port}`);
    const { ms } = await elapsed(() => assert.rejects(readOpsDataFromPg()));
    assert.ok(ms >= HQ_READ_TIMEOUT_MS - 250 && ms < HQ_READ_TIMEOUT_MS + 1500, `ops read failed after ${Math.round(ms)}ms`);
  } finally {
    if (prev === undefined) delete process.env.HQ_DATABASE_URL;
    else process.env.HQ_DATABASE_URL = prev;
    for (const s of sockets) s.destroy();
    await new Promise((r) => server.close(r));
  }
});
