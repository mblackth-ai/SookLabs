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
| `HQ_AGENT_WEBHOOK_URL` | Recommended | n8n Production webhook URL |
| `HQ_AGENT_CALLBACK_SECRET` | Yes for callback | Shared secret for callback + optional poll |
| `HQ_AGENT_DEFAULT_PROVIDER` | No | `cursor` \| `codex` \| `claude` (default `cursor`) |
| `HQ_N8N_BASE_URL` | No | Link shown on Automation Registry |
| `HQ_PUBLIC_BASE_URL` | No | Defaults to `https://hq.sooklabs.com` |

## Cursor path (recommended first)

1. In HQ Briefing, pick **Cursor** and click **Ask AI**.
2. Job appears on Overview → Agent jobs with `status: running`.
3. In Cursor (this repo), run an agent with the **hq-ops** skill:

```
Poll GET https://hq.sooklabs.com/hq/api/agents/pending?provider=cursor
with Authorization: Bearer $HQ_CRON_SECRET (or HQ_AGENT_CALLBACK_SECRET).

For each job, write a concise executive briefing from payload.context
(Priorities focus / Risks / Decisions / Suggested actions).

POST https://hq.sooklabs.com/hq/api/agents/callback
Authorization: Bearer $HQ_AGENT_CALLBACK_SECRET
{ "jobId": "<id>", "provider": "cursor", "text": "<markdown briefing>" }
```

4. Refresh Briefing — notes should update.

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

## n8n import

1. Open n8n on the droplet.
2. Import [`docs/n8n/hq-agent-router.json`](./n8n/hq-agent-router.json).
3. Activate the workflow; copy the **Production** webhook URL.
4. Set on Vercel: `HQ_AGENT_WEBHOOK_URL=<that URL>`.
5. Set n8n env `HQ_AGENT_CALLBACK_SECRET` to match Vercel.
6. Redeploy HQ.

## Honest badges

Automation Registry (`/hq/automation`) only shows:

- **Manual** — human step required
- **Workflow Ready** — webhook / poll path configured
- **Future API** — Anthropic direct mode (optional later)

Never mark providers as Connected without a real integration.
