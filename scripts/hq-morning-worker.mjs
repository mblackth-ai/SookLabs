#!/usr/bin/env node
/**
 * Morning HQ automation worker — run via DO cron or systemd timer.
 *
 * Option A (HTTP): POST to deployed HQ cron endpoint
 *   HQ_CRON_URL=https://hq.sooklabs.com/hq/api/cron/morning
 *   HQ_CRON_SECRET=...
 *
 * Option B (direct): read/write ops via Postgres or local file
 *   HQ_DATABASE_URL=postgres://...
 *   ANTHROPIC_API_KEY=...
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile() {
  const path = resolve(root, "sooklabs.env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

async function runViaHttp() {
  const url = process.env.HQ_CRON_URL || "http://localhost:3008/hq/api/cron/morning";
  const secret = process.env.HQ_CRON_SECRET;
  if (!secret) throw new Error("HQ_CRON_SECRET required for HTTP mode");

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

async function runDirect() {
  const { readOpsData, writeOpsData } = await import("../lib/hq/ops.js");
  const { runMorningBriefing } = await import("../lib/hq/morning-run.js");
  return runMorningBriefing(readOpsData, writeOpsData);
}

async function main() {
  const mode = process.env.HQ_CRON_URL || process.env.HQ_CRON_SECRET ? "http" : "direct";
  console.log(`[hq-morning-worker] mode=${mode} at ${new Date().toISOString()}`);

  const result = mode === "http" ? await runViaHttp() : await runDirect();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("[hq-morning-worker] failed:", err.message);
  process.exit(1);
});
