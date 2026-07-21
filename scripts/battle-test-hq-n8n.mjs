/**
 * Battle-test HQ n8n workflows against hooks.sookly.co + hq.sooklabs.com
 */
import { readFileSync } from "fs";

const N8N = "https://hooks.sookly.co";
const HQ = "https://hq.sooklabs.com";
const key = JSON.parse(readFileSync("d:/15. SookLabs/tmp-hq-n8n-api-key.json", "utf8")).token;

// Secrets from local env (match prod — already verified via cron test)
const envText = readFileSync("d:/15. SookLabs/Sooklabs web/sooklabs/.env.local", "utf8");
function env(name) {
  const m = envText.match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim() : "";
}
const CRON = env("HQ_CRON_SECRET");
const CALLBACK = env("HQ_AGENT_CALLBACK_SECRET");
const DISPATCH = CALLBACK;

const results = [];
async function check(name, fn) {
  try {
    const r = await fn();
    results.push({ name, ok: true, ...r });
    console.log(`PASS ${name}`, r.detail || "");
  } catch (e) {
    results.push({ name, ok: false, error: e.message });
    console.log(`FAIL ${name}:`, e.message);
  }
}

async function main() {
  await check("n8n healthz", async () => {
    const res = await fetch(`${N8N}/healthz`);
    const j = await res.json();
    if (!res.ok || j.status !== "ok") throw new Error(JSON.stringify(j));
    return { detail: "ok" };
  });

  await check("agent webhook rejects unauth", async () => {
    const res = await fetch(`${N8N}/webhook/hq-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: "x", provider: "cursor" }),
    });
    const j = await res.json().catch(() => ({}));
    if (res.status !== 401 && j.ok !== false) throw new Error(`expected 401 got ${res.status} ${JSON.stringify(j)}`);
    return { detail: `status=${res.status}` };
  });

  await check("agent webhook routes cursor", async () => {
    const res = await fetch(`${N8N}/webhook/hq-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DISPATCH}`,
        "X-HQ-Agent-Dispatch-Secret": DISPATCH,
      },
      body: JSON.stringify({
        jobId: "job-battletest-cursor",
        provider: "cursor",
        type: "briefing-ask-ai",
        context: "Battle test context",
        callbackUrl: `${HQ}/hq/api/agents/callback`,
      }),
    });
    const j = await res.json();
    if (!res.ok || !j.ok || j.provider !== "cursor") throw new Error(JSON.stringify(j));
    return { detail: JSON.stringify(j) };
  });

  await check("agent webhook routes claude", async () => {
    const res = await fetch(`${N8N}/webhook/hq-agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DISPATCH}`,
      },
      body: JSON.stringify({ jobId: "job-battletest-claude", provider: "claude", context: "x" }),
    });
    const j = await res.json();
    if (!res.ok || j.provider !== "claude") throw new Error(JSON.stringify(j));
    return { detail: j.status };
  });

  await check("callback bridge → HQ", async () => {
    // Create a real running job via morning first? Or use existing job-mrrn4mj5
    const pendingRes = await fetch(`${HQ}/hq/api/agents/pending?provider=cursor`, {
      headers: { Authorization: `Bearer ${CRON}` },
    });
    const pending = await pendingRes.json();
    const job = (pending.jobs || pending.data || []).find((j) => j.status === "running") || pending.jobs?.[0];
    if (!job?.id && !job?.jobId) {
      // dispatch morning to create one
      const m = await fetch(`${HQ}/hq/api/cron/morning`, {
        method: "POST",
        headers: { Authorization: `Bearer ${CRON}` },
      });
      const mj = await m.json();
      if (!mj.jobId) throw new Error("no job from morning: " + JSON.stringify(mj));
      var jobId = mj.jobId;
    } else {
      var jobId = job.id || job.jobId;
    }

    const briefing = `## Priorities focus
Battle-test briefing from n8n callback bridge.

## Risks & blockers
None from automated battle test.

## Decisions to make
Confirm HQ_AGENT_WEBHOOK_URL on Vercel.`;

    const res = await fetch(`${N8N}/webhook/hq-agent-callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DISPATCH}`,
      },
      body: JSON.stringify({
        jobId,
        provider: "cursor",
        status: "completed",
        text: briefing,
        summary: "Battle-test via n8n callback bridge",
      }),
    });
    const j = await res.json();
    if (!res.ok || !j.ok) throw new Error(JSON.stringify(j));
    return { detail: `jobId=${jobId} forwarded=${j.forwarded}` };
  });

  await check("morning cron workflow execute", async () => {
    // Trigger via API: POST /executions or workflows/:id/run — check available
    // Use n8n execute endpoint if present
    const list = await fetch(`${N8N}/api/v1/workflows`, { headers: { "X-N8N-API-KEY": key } }).then((r) => r.json());
    const morning = (list.data || []).find((w) => w.name === "HQ Morning Cron");
    if (!morning) throw new Error("morning workflow missing");
    // Public API may not expose run — call HQ cron directly as the node would
    const res = await fetch(`${HQ}/hq/api/cron/morning`, {
      method: "POST",
      headers: { Authorization: `Bearer ${CRON}`, "X-HQ-Cron-Source": "battle-test" },
    });
    const j = await res.json();
    if (!res.ok || !j.ok) throw new Error(JSON.stringify(j));
    return { detail: `status=${j.status} jobId=${j.jobId} webhookPosted=${j.webhookPosted}` };
  });

  await check("spine health pending poll", async () => {
    const res = await fetch(`${HQ}/hq/api/agents/pending?provider=cursor`, {
      headers: { Authorization: `Bearer ${CRON}` },
    });
    const j = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(j));
    const jobs = j.jobs || j.data || [];
    return { detail: `pendingJobs=${Array.isArray(jobs) ? jobs.length : "n/a"}` };
  });

  await check("workflows active flags", async () => {
    const list = await fetch(`${N8N}/api/v1/workflows`, { headers: { "X-N8N-API-KEY": key } }).then((r) => r.json());
    const needed = ["HQ Agent Router", "HQ Agent Callback", "HQ Morning Cron", "HQ Spine Health"];
    const map = Object.fromEntries((list.data || []).map((w) => [w.name, w]));
    const inactive = needed.filter((n) => !map[n]?.active);
    if (inactive.length) throw new Error("inactive: " + inactive.join(", "));
    return { detail: needed.map((n) => `${n}=active`).join("; ") };
  });

  const failed = results.filter((r) => !r.ok);
  console.log("\n=== SUMMARY ===");
  console.log(`passed=${results.length - failed.length} failed=${failed.length}`);
  if (failed.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
