# HQ DigitalOcean Automation Spine

Hybrid deploy: **Vercel** hosts sooklabs.com + hq.sooklabs.com UI. **DigitalOcean** holds Postgres (ops persistence), n8n (agent webhook router), and optional cron on the existing droplet (`139.59.117.188`).

## 1. Postgres (ops persistence)

### Current MVP: Postgres container on droplet

```bash
# /opt/hq-ops on 139.59.117.188 — container hq-postgres, host port 5433
HQ_DATABASE_URL=postgres://hq_ops:…@139.59.117.188:5433/hq_ops
```

Init schema: `npm run hq:init-db` (or first ops read/write auto-creates `hq_ops`).

Nightly backup: [`scripts/hq-ops-backup.sh`](../scripts/hq-ops-backup.sh) → `/opt/hq-ops/backups`.

### Future: Managed Postgres

When DO API access allows, migrate to Managed PostgreSQL (`?sslmode=require`), update `HQ_DATABASE_URL`, tighten firewall (remove open `:5433`).

Without `HQ_DATABASE_URL`, HQ falls back to git-tracked `data/hq/ops.json` (local only — unsafe on Vercel serverless).

## 2. Env vars (Vercel Production + Preview)

| Variable | Required | Purpose |
|----------|----------|---------|
| `HQ_ACCESS_PASSWORD` | Yes | Login password |
| `HQ_SESSION_SECRET` | Yes | Session HMAC (≥32 chars) |
| `HQ_DATABASE_URL` | Yes (prod) | Postgres ops store |
| `HQ_CRON_SECRET` | Yes (automation) | Authorizes morning cron |
| `HQ_AGENT_MODE` | No | `webhook` (default) or `anthropic` |
| `HQ_AGENT_WEBHOOK_URL` | Recommended | n8n webhook for agent dispatch (`https://hooks.sookly.co/webhook/hq-agent`) |
| `HQ_AGENT_WEBHOOK_SECRET` | Recommended | Dispatch auth to n8n (same value as callback secret is fine) |
| `HQ_AGENT_CALLBACK_SECRET` | Yes (agents) | Secures `/hq/api/agents/callback` |
| `HQ_AGENT_DEFAULT_PROVIDER` | No | `cursor` \| `codex` \| `claude` |
| `HQ_N8N_BASE_URL` | No | Link on Automation Registry (`https://hooks.sookly.co`) |
| `NEXT_PUBLIC_SEOS_URL` | Recommended | Link to SEOS app |
| `ANTHROPIC_API_KEY` | Optional | Only if `HQ_AGENT_MODE=anthropic` |
| `HQ_LLM_MODEL` | No | Default `claude-sonnet-4-20250514` |

See [`HQ-AGENTS.md`](./HQ-AGENTS.md) for Cursor / Codex / Claude wiring.

## 3. Morning cron

Endpoint: `POST /hq/api/cron/morning` (also `GET` for Vercel Cron)

Auth: `Authorization: Bearer $HQ_CRON_SECRET` or header `x-hq-cron-secret`.

In **webhook** mode the cron dispatches a running job (n8n / pending poll); briefing completes via callback.

### Vercel Cron

[`vercel.json`](../vercel.json) schedules `0 23 * * *` UTC (= 06:00 Asia/Bangkok). Align `HQ_CRON_SECRET` with `CRON_SECRET` when using Vercel Cron auth.

### DO Droplet cron

```cron
CRON_TZ=Asia/Bangkok
0 6 * * * . /root/.hq-cron-env && curl -sS -X POST -H "Authorization: Bearer $HQ_CRON_SECRET" https://hq.sooklabs.com/hq/api/cron/morning >> /var/log/hq-morning.log 2>&1
```

## 4. n8n agent router

Live on `https://hooks.sookly.co` (see [`HQ-AGENTS.md`](./HQ-AGENTS.md)). Set:

- `HQ_AGENT_WEBHOOK_URL=https://hooks.sookly.co/webhook/hq-agent`
- `HQ_N8N_BASE_URL=https://hooks.sookly.co`
- `HQ_AGENT_WEBHOOK_SECRET` (= callback secret)

Re-provision: `node scripts/provision-hq-n8n-workflows.mjs`

## 5. Verify subdomain

```bash
npm run hq:verify-deploy
# or
node scripts/verify-hq-deploy.mjs https://hq.sooklabs.com
```

## 6. Loop

```
HQ UI → Postgres ops
  ↑           ↓
Ask AI / cron → n8n / Cursor / Codex / Claude → callback → briefingNotes + agentJobs
```
