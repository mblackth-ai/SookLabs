# HQ DigitalOcean Automation Spine

Hybrid deploy: **Vercel** hosts sooklabs.com + hq.sooklabs.com UI. **DigitalOcean** holds Postgres (ops persistence) and optionally a cheap Droplet for cron if Vercel Cron is unavailable.

## 1. Managed Postgres (required for production ops)

1. Create a DO Managed Postgres database.
2. Copy the connection string (use SSL: `?sslmode=require`).
3. Set on Vercel and/or local `sooklabs.env.local`:

```bash
HQ_DATABASE_URL=postgres://user:pass@host:25060/defaultdb?sslmode=require
```

4. Initialize schema (optional — auto-created on first ops read/write):

```bash
npm run hq:init-db
```

Without `HQ_DATABASE_URL`, HQ falls back to git-tracked `data/hq/ops.json` (local only — unsafe on Vercel serverless).

## 2. Env vars (Vercel Production + Preview)

| Variable | Required | Purpose |
|----------|----------|---------|
| `HQ_ACCESS_PASSWORD` | Yes | Login password |
| `HQ_SESSION_SECRET` | Yes | Session HMAC (≥32 chars) |
| `HQ_DATABASE_URL` | Yes (prod) | Postgres ops store |
| `HQ_CRON_SECRET` | Yes (automation) | Authorizes morning cron |
| `ANTHROPIC_API_KEY` | Yes (Ask AI / cron) | Claude API |
| `NEXT_PUBLIC_SEOS_URL` | Recommended | Link to SEOS app |
| `HQ_LLM_MODEL` | No | Default `claude-sonnet-4-20250514` |

## 3. Morning cron

Endpoint: `POST /hq/api/cron/morning` (also `GET` for Vercel Cron)

Auth: `Authorization: Bearer $HQ_CRON_SECRET` or header `x-hq-cron-secret`.

### Vercel Cron

[`vercel.json`](../vercel.json) schedules `0 23 * * *` UTC (= 06:00 Asia/Bangkok). Vercel Cron sends `Authorization: Bearer $CRON_SECRET` on Hobby/Pro — if your plan uses `CRON_SECRET`, set `HQ_CRON_SECRET` to the same value, or call the worker instead.

### DO Droplet cron (recommended for reliability)

On a $6 Droplet with Node installed:

```cron
# 06:00 Asia/Bangkok
0 6 * * * cd /opt/sooklabs && HQ_CRON_URL=https://hq.sooklabs.com/hq/api/cron/morning HQ_CRON_SECRET=... /usr/bin/node scripts/hq-morning-worker.mjs >> /var/log/hq-morning.log 2>&1
```

Or run locally against production:

```bash
HQ_CRON_URL=https://hq.sooklabs.com/hq/api/cron/morning HQ_CRON_SECRET=... npm run hq:morning
```

## 4. Verify subdomain

```bash
npm run hq:verify-deploy
# or
node scripts/verify-hq-deploy.mjs https://hq.sooklabs.com
```

Checks DNS, `/hq/login`, and whether local `sooklabs.env.local` has the keys you still need to mirror on Vercel.

## 5. Loop

```
HQ UI → Postgres ops
  ↑           ↓
Ask AI / cron → Anthropic → briefingNotes + agentJobs
```
