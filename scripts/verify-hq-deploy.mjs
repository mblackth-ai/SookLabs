#!/usr/bin/env node
/**
 * Verify hq.sooklabs.com deploy readiness: DNS, HTTPS, login page, env checklist.
 * Usage: node scripts/verify-hq-deploy.mjs [baseUrl]
 */

const BASE = process.argv[2] || "https://hq.sooklabs.com";
const HOST = new URL(BASE).hostname;

const REQUIRED_ENV = [
  "HQ_ACCESS_PASSWORD",
  "HQ_SESSION_SECRET",
  "HQ_CRON_SECRET",
  "ANTHROPIC_API_KEY",
];

const RECOMMENDED_ENV = [
  "HQ_DATABASE_URL",
  "NEXT_PUBLIC_SEOS_URL",
];

async function checkDns() {
  try {
    const dns = await import("dns/promises");
    const records = await dns.resolve4(HOST);
    return { ok: true, records };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function checkHttp(path) {
  const url = BASE.replace(/\/$/, "") + path;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { redirect: "follow", signal: ctrl.signal });
    clearTimeout(t);
    const text = await res.text();
    return { path, status: res.status, ok: res.status < 400, hasLogin: /hq.login|HQ access|password/i.test(text) };
  } catch (err) {
    clearTimeout(t);
    return { path, ok: false, error: err.message };
  }
}

async function run() {
  const dns = await checkDns();
  const login = await checkHttp("/hq/login");
  const root = await checkHttp("/");

  const env = await (async () => {
    const { existsSync, readFileSync } = await import("fs");
    const { resolve, dirname } = await import("path");
    const { fileURLToPath } = await import("url");
    const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const envPath = resolve(rootDir, "sooklabs.env.local");
    const found = {};
    if (existsSync(envPath)) {
      for (const line of readFileSync(envPath, "utf8").split("\n")) {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=/);
        if (m) found[m[1]] = true;
      }
    }
    return {
      envFileExists: existsSync(envPath),
      required: REQUIRED_ENV.map((k) => ({ key: k, set: Boolean(found[k]) })),
      recommended: RECOMMENDED_ENV.map((k) => ({ key: k, set: Boolean(found[k]) })),
      note: "Production: set these in Vercel Project → Environment Variables",
    };
  })();

  const report = { base: BASE, host: HOST, dns, login, root, env };
  console.log(JSON.stringify(report, null, 2));

  const failed = !dns.ok || !login.ok;
  if (failed) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
