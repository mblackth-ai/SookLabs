#!/usr/bin/env node
/** Initialize HQ Postgres schema (hq_ops table). Requires HQ_DATABASE_URL or DATABASE_URL. */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, "sooklabs.env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (!process.env[key]) process.env[key] = t.slice(i + 1).trim();
  }
}

const { ensureOpsSchema, readOpsDataFromPg } = await import("../lib/hq/ops-pg.js");

await ensureOpsSchema();
const data = await readOpsDataFromPg();
console.log(JSON.stringify({ ok: true, message: "hq_ops table ready", priorities: data.todayPriorities?.length }, null, 2));
