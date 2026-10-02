#!/usr/bin/env node
// Agent driver for SookLabs HQ (Next.js on :3008). Run from the repo root:
//   node .claude/skills/run-sooklabs/driver.mjs <command> [...args]
//
//   start                     write a throwaway sooklabs.env.local if missing, start `next dev`, wait until ready
//   login                     log in to HQ, save the session cookie
//   api <METHOD> <path> [json] call an HQ route with the session cookie, print status + JSON
//   ss <path> [out.png]       screenshot an HQ page (logged in), print the PNG path
//   callback [text]           signed POST to /hq/api/agents/callback (the secret-auth inbound pattern)
//   stop                      stop the server, remove the throwaway env file, restore data/hq/ops.json
//
// State (pid, cookie, logs, screenshots) lives in $RUN_SOOKLABS_STATE or /tmp/run-sooklabs.

import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 3008);
const BASE = `http://localhost:${PORT}`;
const STATE = process.env.RUN_SOOKLABS_STATE || "/tmp/run-sooklabs";
const ENV_FILE = join(ROOT, "sooklabs.env.local");
const OPS_FILE = join(ROOT, "data/hq/ops.json");
const S = (name) => join(STATE, name);
mkdirSync(STATE, { recursive: true });

if (!existsSync(join(ROOT, "next.config.mjs")) || !existsSync(join(ROOT, "lib/hq"))) {
  die("run this from the SookLabs repo root");
}

function die(msg) {
  console.error(`driver: ${msg}`);
  process.exit(1);
}

function readEnvFile() {
  const out = {};
  if (!existsSync(ENV_FILE)) return out;
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function cookieHeader() {
  if (!existsSync(S("cookie"))) die("not logged in — run `login` first");
  return readFileSync(S("cookie"), "utf8").trim();
}

async function waitReady(timeoutMs = 180_000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const res = await fetch(`${BASE}/hq/login`, { redirect: "manual" });
      if (res.status < 500) return res.status;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  die(`server not ready after ${timeoutMs / 1000}s — see ${S("dev.log")}`);
}

async function start() {
  if (existsSync(S("pid"))) {
    try {
      process.kill(Number(readFileSync(S("pid"), "utf8")), 0);
      console.log(`already running (pid ${readFileSync(S("pid"), "utf8").trim()}) on ${BASE}`);
      return;
    } catch {}
  }
  if (!existsSync(ENV_FILE)) {
    const hex = (n) => randomBytes(n).toString("hex");
    writeFileSync(
      ENV_FILE,
      [
        "# Throwaway file written by .claude/skills/run-sooklabs/driver.mjs — removed by `stop`.",
        `HQ_ACCESS_PASSWORD=local-${hex(8)}`,
        `HQ_SESSION_SECRET=${hex(32)}`,
        `HQ_AGENT_CALLBACK_SECRET=${hex(24)}`,
        `HQ_CRON_SECRET=${hex(24)}`,
        "NEXT_PUBLIC_SEOS_URL=http://localhost:3000",
        "",
      ].join("\n")
    );
    writeFileSync(S("created-env"), "1");
    console.log("wrote throwaway sooklabs.env.local (file-mode ops, no Postgres)");
  }
  if (existsSync(OPS_FILE) && !existsSync(S("ops.json.bak"))) copyFileSync(OPS_FILE, S("ops.json.bak"));

  const log = openSync(S("dev.log"), "w");
  const child = spawn("npx", ["next", "dev", "--port", String(PORT)], {
    cwd: ROOT,
    detached: true,
    stdio: ["ignore", log, log],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  child.unref();
  writeFileSync(S("pid"), String(child.pid));
  const status = await waitReady();
  console.log(`ready: ${BASE}/hq/login → ${status} (pid ${child.pid}, log ${S("dev.log")})`);
}

async function login() {
  const password = process.env.HQ_ACCESS_PASSWORD || readEnvFile().HQ_ACCESS_PASSWORD;
  if (!password) die("no HQ_ACCESS_PASSWORD in env or sooklabs.env.local");
  const res = await fetch(`${BASE}/hq/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const body = await res.json().catch(() => ({}));
  const setCookie = res.headers.getSetCookie?.() || [];
  const session = setCookie.map((c) => c.split(";")[0]).find((c) => c.startsWith("hq_session="));
  if (!res.ok || !session) die(`login failed: ${res.status} ${JSON.stringify(body)}`);
  writeFileSync(S("cookie"), session);
  console.log(`logged in (${res.status}); cookie saved to ${S("cookie")}`);
}

async function api(method = "GET", path = "/hq/api/control-plane", json) {
  const res = await fetch(`${BASE}${path}`, {
    method: method.toUpperCase(),
    headers: { Cookie: cookieHeader(), ...(json ? { "Content-Type": "application/json" } : {}) },
    body: json,
  });
  const text = await res.text();
  console.log(`${res.status} ${method.toUpperCase()} ${path}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text.slice(0, 2000));
  }
  if (res.status >= 400) process.exitCode = 1;
}

function loadPlaywright() {
  const roots = [];
  try {
    roots.push(execSync("npm root -g", { encoding: "utf8" }).trim());
  } catch {}
  const cache = join(process.env.HOME || "/tmp", ".cache/run-sooklabs");
  roots.push(join(cache, "node_modules"));
  for (const root of roots) {
    for (const name of ["playwright", "playwright-core"]) {
      try {
        return createRequire(join(root, "noop.js"))(name);
      } catch {}
    }
  }
  console.error("installing playwright-core into ~/.cache/run-sooklabs (one time)…");
  mkdirSync(cache, { recursive: true });
  execSync("npm i --no-save --no-audit --no-fund playwright-core", { cwd: cache, stdio: "inherit" });
  return createRequire(join(cache, "node_modules", "noop.js"))("playwright-core");
}

function chromiumPath() {
  for (const p of [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium"]) {
    if (p && existsSync(p)) {
      try {
        if (readFileSync(p).length > 1_000_000) return p; // a real binary, not a directory or stub
      } catch {}
    }
  }
  return undefined; // let Playwright use its own download
}

async function ss(path = "/hq", out) {
  const { chromium } = loadPlaywright();
  const [name, value] = cookieHeader().split(/=(.*)/s);
  const file = resolve(out || S(`ss-${path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "root"}.png`));
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addCookies([{ name, value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 120_000 });
    await page.screenshot({ path: file, fullPage: true });
    console.log(`${res?.status()} ${page.url()}`);
    console.log(`title: ${await page.title()}`);
    console.log(`screenshot: ${file}`);
    if (page.url().includes("/hq/login")) die("landed on the login page — cookie missing or expired; run `login`");
  } finally {
    await browser.close();
  }
}

async function callback(text = "Driver smoke test from run-sooklabs.") {
  const secret = process.env.HQ_AGENT_CALLBACK_SECRET || readEnvFile().HQ_AGENT_CALLBACK_SECRET;
  if (!secret) die("no HQ_AGENT_CALLBACK_SECRET in env or sooklabs.env.local");
  const jobId = `run-sooklabs-${Date.now()}`;
  const res = await fetch(`${BASE}/hq/api/agents/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hq-agent-secret": secret },
    body: JSON.stringify({ jobId, text, provider: "run-sooklabs", summary: text }),
  });
  const body = await res.json().catch(() => ({}));
  console.log(`${res.status} jobId=${jobId} ok=${body.ok} status=${body.status}`);
  const bad = await fetch(`${BASE}/hq/api/agents/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hq-agent-secret": "wrong" },
    body: "{}",
  });
  console.log(`${bad.status} with a wrong secret (expect 401)`);
  if (!res.ok || bad.status !== 401) process.exitCode = 1;
}

function stop() {
  if (existsSync(S("pid"))) {
    const pid = Number(readFileSync(S("pid"), "utf8"));
    try {
      process.kill(-pid, "SIGTERM"); // whole process group: npx → next → workers
      console.log(`stopped pid group ${pid}`);
    } catch {
      console.log(`pid ${pid} not running`);
    }
    rmSync(S("pid"));
  }
  if (existsSync(S("created-env"))) {
    rmSync(ENV_FILE, { force: true });
    rmSync(S("created-env"));
    console.log("removed throwaway sooklabs.env.local");
  }
  if (existsSync(S("ops.json.bak"))) {
    copyFileSync(S("ops.json.bak"), OPS_FILE);
    rmSync(S("ops.json.bak"));
    console.log("restored data/hq/ops.json");
  }
  rmSync(S("cookie"), { force: true });
}

const [cmd, ...args] = process.argv.slice(2);
const commands = { start, login, api, ss, callback, stop };
if (!commands[cmd]) die(`usage: driver.mjs ${Object.keys(commands).join("|")} [...args]`);
await commands[cmd](...args);
