#!/usr/bin/env node
/**
 * Smoke-test webhook agent spine against a running HQ base URL.
 * Usage:
 *   HQ_AGENT_CALLBACK_SECRET=... node scripts/hq-agent-smoke.mjs [baseUrl]
 */
const BASE = (process.argv[2] || process.env.HQ_BASE_URL || "https://hq.sooklabs.com").replace(/\/$/, "");
const SECRET = process.env.HQ_AGENT_CALLBACK_SECRET?.trim();
const CRON = process.env.HQ_CRON_SECRET?.trim() || SECRET;

async function main() {
  if (!SECRET) {
    console.error("Set HQ_AGENT_CALLBACK_SECRET");
    process.exit(1);
  }

  // Create a synthetic running job via cron morning (queues webhook job)
  const morning = await fetch(`${BASE}/hq/api/cron/morning`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CRON}` },
  });
  const morningJson = await morning.json();
  console.log("morning:", morning.status, JSON.stringify(morningJson));

  const pending = await fetch(`${BASE}/hq/api/agents/pending?provider=cursor`, {
    headers: { Authorization: `Bearer ${CRON}` },
  });
  const pendingJson = await pending.json();
  console.log("pending:", pending.status, "count=", pendingJson.count);

  const job = (pendingJson.jobs || [])[0];
  if (!job) {
    console.log("No pending jobs to complete (may already have completed synchronously).");
    return;
  }

  const text = [
    "## Priorities focus",
    "Smoke test briefing from hq-agent-smoke.mjs",
    "",
    "## Risks & blockers",
    "None from smoke test",
    "",
    "## Decisions to make",
    "Confirm webhook agent spine in Automation Registry",
  ].join("\n");

  const cb = await fetch(`${BASE}/hq/api/agents/callback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify({
      jobId: job.id,
      provider: "cursor",
      text,
      summary: "Smoke test callback",
    }),
  });
  const cbJson = await cb.json();
  console.log("callback:", cb.status, JSON.stringify({ ok: cbJson.ok, status: cbJson.status, jobId: cbJson.jobId }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
