# HQ ↔ Cursor / Codex / Claude agent wiring (no LLM API keys in Vercel)

## Goal

Ask AI and morning cron dispatch jobs to your tools via **webhook + callback**.
HQ does not need `ANTHROPIC_API_KEY` when `HQ_AGENT_MODE=webhook` (default).

```
HQ Ask AI / cron
  → POST HQ_AGENT_WEBHOOK_URL (n8n)  OR  queue pending job
  → Cursor / Codex / Claude produce briefing text
  → POST /hq/api/agents/callback  (Bearer HQ_AGENT_CALLBACK_SECRET)
  → briefingNotes + agentJobs updated in Postgres
```

## Env (Vercel Production + Preview)

| Variable | Required | Purpose |
|----------|----------|---------|
| `HQ_AGENT_MODE` | No (default `webhook`) | `webhook` or `anthropic` |
| `HQ_AGENT_WEBHOOK_URL` | Recommended | n8n Production webhook URL (`https://hooks.sookly.co/webhook/hq-agent`) |
| `HQ_AGENT_WEBHOOK_SECRET` | Recommended | Shared with n8n; sent as Bearer + `X-HQ-Agent-Dispatch-Secret` (defaults to callback secret if unset) |
| `HQ_AGENT_CALLBACK_SECRET` | Yes for callback | Shared secret for callback + optional poll |
| `HQ_AGENT_DEFAULT_PROVIDER` | No | `cursor` \| `codex` \| `claude` (default `cursor`) |
| `HQ_N8N_BASE_URL` | No | Link shown on Automation Registry (`https://hooks.sookly.co`) |
| `HQ_PUBLIC_BASE_URL` | No | Defaults to `https://hq.sooklabs.com` |

## Cursor / auto path (recommended)

With n8n Agent Router active, **Ask AI** and **Run morning** (provider `cursor`) are fully automated:

```
HQ → POST hooks.sookly.co/webhook/hq-agent
  → n8n (Qwen / OpenAI-compatible) generates briefing
  → POST /hq/api/agents/callback
  → briefingNotes updated in Postgres
```

No copy-paste required. Codex / Claude remain Manual (Complete UI or callback webhook).

### Override (optional)

On **LLM & Agents**, **Copy Cursor prompt** / **Complete** still work if you want a human rewrite.



### Optional: local poller

```bash
HQ_BASE_URL=https://hq.sooklabs.com \
HQ_AGENT_CALLBACK_SECRET=... \
HQ_POLL_SECRET=... \
HQ_AGENT_PROVIDER=cursor \
HQ_RUNNER_AUTO_COMPLETE=1 \
node scripts/hq-agent-runner.example.mjs
```

## Codex path

1. Dispatch with provider **Codex** (or set `HQ_AGENT_DEFAULT_PROVIDER=codex`).
2. Point n8n’s Codex branch at `scripts/hq-agent-runner.example.mjs --listen`, **or** poll pending jobs with `HQ_AGENT_PROVIDER=codex`.
3. Replace `generateBriefing()` in the runner with your Codex CLI call.
4. Callback uses the same `/hq/api/agents/callback` contract.

## Claude path (no API)

1. Dispatch with provider **Claude**.
2. In n8n, use a Manual Task / sticky note: copy `context`, paste into Claude (or Claude-in-Cursor).
3. Paste the reply into n8n and HTTP Request → HQ callback (see `docs/n8n/hq-agent-router.json`).

## n8n on hooks.sookly.co

Live suite (provisioned via API):

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **HQ Agent Router** | `POST /webhook/hq-agent` | Ask AI / morning dispatch → route by provider |
| **HQ Agent Callback** | `POST /webhook/hq-agent-callback` | Manual Claude / external → HQ callback |
| **HQ Morning Cron** | 06:00 Asia/Bangkok | Backup morning trigger (also Vercel Cron) |
| **HQ Spine Health** | every 6h | healthz + pending poll smoke |
| **HQ SookLabs Automations** | board only | Sticky suite map (`/workflow/mCOGgJLgolbF2TyP`) |

### Import / re-provision

```bash
# From sooklabs app dir; needs N8N_API_KEY (Settings → API) with workflow scopes
N8N_API_KEY=… node scripts/provision-hq-n8n-workflows.mjs
node scripts/battle-test-hq-n8n.mjs
```

JSON exports: [`docs/n8n/hq-agent-router.json`](./n8n/hq-agent-router.json), `hq-agent-callback.json`, `hq-morning-cron.json`, `hq-spine-health.json`.

Droplet n8n env (compose): `HQ_PUBLIC_BASE_URL`, `HQ_CRON_SECRET`, `HQ_AGENT_CALLBACK_SECRET`, `HQ_AGENT_WEBHOOK_SECRET`, `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`.

1. Activate workflows; Production URL for Agent Router → Vercel `HQ_AGENT_WEBHOOK_URL`.
2. Set `HQ_AGENT_WEBHOOK_SECRET` to match n8n (same as callback secret is fine).
3. Redeploy HQ.

## Honest badges

Automation Registry (`/hq/automation`) only shows:

- **Manual** — human step required
- **Workflow Ready** — webhook / poll path configured
- **Future API** — Anthropic direct mode (optional later)

Never mark providers as Connected without a real integration.
