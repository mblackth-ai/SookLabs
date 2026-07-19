#!/usr/bin/env node
/**
 * Example Codex / local agent runner for HQ webhook jobs.
 *
 * Modes:
 *   1) Poll pending jobs:
 *        HQ_BASE_URL=https://hq.sooklabs.com HQ_AGENT_CALLBACK_SECRET=... \
 *        HQ_POLL_SECRET=$HQ_CRON_SECRET node scripts/hq-agent-runner.example.mjs
 *
 *   2) HTTP listener (n8n → this runner):
 *        HQ_AGENT_CALLBACK_SECRET=... HQ_RUNNER_PORT=8787 \
 *        node scripts/hq-agent-runner.example.mjs --listen
 *
 * This example prints the ops context and optionally posts a stub briefing.
 * Replace `generateBriefing()` with your Codex CLI invocation.
 */

import { createServer } from "http";

const BASE = (process.env.HQ_BASE_URL || "https://hq.sooklabs.com").replace(/\/$/, "");
const CALLBACK_SECRET = process.env.HQ_AGENT_CALLBACK_SECRET?.trim();
const POLL_SECRET =
  process.env.HQ_POLL_SECRET?.trim() ||
  process.env.HQ_CRON_SECRET?.trim() ||
  CALLBACK_SECRET;
const PROVIDER = process.env.HQ_AGENT_PROVIDER || "codex";
const LISTEN = process.argv.includes("--listen");
const PORT = Number(process.env.HQ_RUNNER_PORT || 8787);
const AUTO_COMPLETE = process.env.HQ_RUNNER_AUTO_COMPLETE === "1";

function generateBriefing(payload) {
  // Replace with: spawn Codex CLI, pipe payload.context, capture stdout.
  const ctx = payload?.context || "(no context)";
  return [
    "## Priorities focus",
    "Review open HQ priorities from the ops context below.",
    "",
    "## Risks & blockers",
    "Check blocked / overdue items in the context.",
    "",
    "## Decisions to make",
    "Capture one decision in the Decision Log after this run.",
    "",
    "## Suggested actions today",
    "1. Complete one P0 on the active board.",
    "2. Update briefing notes if this stub is replaced by Codex output.",
    "",
    "---",
    "### Ops context (for Codex)",
    ctx,
  ].join("\n");
}

async function postCallback(jobId, text, provider = PROVIDER) {
  if (!CALLBACK_SECRET) throw new Error("HQ_AGENT_CALLBACK_SECRET required");
  const res = await fetch(`${BASE}/hq/api/agents/callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CALLBACK_SECRET}`,
    },
    body: JSON.stringify({ jobId, text, provider, summary: `${provider} runner completed` }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Callback HTTP ${res.status}`);
  return json;
}

async function pollOnce() {
  if (!POLL_SECRET) throw new Error("HQ_POLL_SECRET or HQ_CRON_SECRET required to poll");
  const res = await fetch(`${BASE}/hq/api/agents/pending?provider=${encodeURIComponent(PROVIDER)}`, {
    headers: { Authorization: `Bearer ${POLL_SECRET}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `Pending HTTP ${res.status}`);
  return json.jobs || [];
}

async function handleJob(job) {
  const payload = job.payload || job;
  const jobId = job.id || payload.jobId;
  console.log(`\n=== Job ${jobId} (${PROVIDER}) ===`);
  console.log(payload.context || "(empty context)");
  const text = generateBriefing(payload);
  if (AUTO_COMPLETE) {
    const result = await postCallback(jobId, text, PROVIDER);
    console.log("Callback ok:", result.status || result.ok);
  } else {
    console.log("\n(Stub briefing generated. Set HQ_RUNNER_AUTO_COMPLETE=1 to POST callback.)");
  }
}

async function runPollLoop() {
  console.log(`Polling ${BASE}/hq/api/agents/pending?provider=${PROVIDER}`);
  const jobs = await pollOnce();
  if (!jobs.length) {
    console.log("No running jobs.");
    return;
  }
  for (const job of jobs) await handleJob(job);
}

function runListen() {
  const server = createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end("POST only");
      return;
    }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let body;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    } catch {
      res.writeHead(400).end("Invalid JSON");
      return;
    }
    try {
      await handleJob({ id: body.jobId, payload: body });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  });
  server.listen(PORT, () => {
    console.log(`HQ agent runner listening on :${PORT}`);
  });
}

if (LISTEN) runListen();
else runPollLoop().catch((e) => {
  console.error(e);
  process.exit(1);
});
