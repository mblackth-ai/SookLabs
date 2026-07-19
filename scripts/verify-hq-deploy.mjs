#!/usr/bin/env node
/**
 * Verify hq.sooklabs.com deploy readiness: DNS, HTTPS, login, env, ops health, SEOS token.
 * Usage: node scripts/verify-hq-deploy.mjs [baseUrl]
 */

import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const BASE = process.argv[2] || "https://hq.sooklabs.com";
const HOST = new URL(BASE).hostname;
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_ENV = [
  "HQ_ACCESS_PASSWORD",
  "HQ_SESSION_SECRET",
  "HQ_CRON_SECRET",
  "HQ_AGENT_CALLBACK_SECRET",
];

const RECOMMENDED_ENV = [
  "HQ_DATABASE_URL",
  "NEXT_PUBLIC_SEOS_URL",
  "SEOS_HQ_API_TOKEN",
  "HQ_AGENT_WEBHOOK_URL",
  "ANTHROPIC_API_KEY",
];

function loadLocalEnv() {
  const found = {};
  const values = {};
  for (const name of ["sooklabs.env.local", ".env.local"]) {
    const envPath = resolve(rootDir, name);
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m) continue;
      found[m[1]] = true;
      if (!values[m[1]]) values[m[1]] = m[2].trim();
    }
  }
  return { found, values, envFileExists: Object.keys(found).length > 0 };
}

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

async function checkOpsHealth(password) {
  if (!password) return { ok: false, skipped: true, reason: "HQ_ACCESS_PASSWORD missing locally" };
  try {
    const login = await fetch(`${BASE.replace(/\/$/, "")}/hq/api/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!login.ok) return { ok: false, loginStatus: login.status };
    const cookie = (login.headers.getSetCookie?.() || []).map((c) => c.split(";")[0]).join("; ");
    const health = await fetch(`${BASE.replace(/\/$/, "")}/hq/api/ops/health`, { headers: { cookie } });
    const body = await health.json().catch(() => ({}));
    return {
      ok: health.ok && body.ok === true,
      status: health.status,
      storage: body.storage,
      database: body.env?.database,
      webhook: body.env?.webhook,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function checkSeosToken(token, seosUrl) {
  const configured = Boolean(token && !token.startsWith("change-me"));
  if (!configured) return { configured: false, ok: false };
  const base = (seosUrl || "https://seos.sooklabs.com").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/authority/hq-summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    return {
      configured: true,
      ok: res.ok && body.ok === true,
      status: res.status,
      workspaces: body.data?.workspaces?.length ?? 0,
    };
  } catch (err) {
    return { configured: true, ok: false, error: err.message };
  }
}

async function run() {
  const local = loadLocalEnv();
  const dns = await checkDns();
  const login = await checkHttp("/hq/login");
  const root = await checkHttp("/");
  const opsHealth = await checkOpsHealth(local.values.HQ_ACCESS_PASSWORD);
  const seos = await checkSeosToken(local.values.SEOS_HQ_API_TOKEN, local.values.NEXT_PUBLIC_SEOS_URL);

  const env = {
    envFileExists: local.envFileExists,
    required: REQUIRED_ENV.map((k) => ({ key: k, set: Boolean(local.found[k]) })),
    recommended: RECOMMENDED_ENV.map((k) => ({ key: k, set: Boolean(local.found[k]) })),
    note: "Production: set these in Vercel Project → Environment Variables",
  };

  const report = { base: BASE, host: HOST, dns, login, root, opsHealth, seosAuthority: seos, env };
  console.log(JSON.stringify(report, null, 2));

  const failed = !dns.ok || !login.ok || (opsHealth.ok === false && !opsHealth.skipped);
  if (failed) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
