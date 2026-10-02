# Jaka Retainer Delivery Contract

Status: **required day and week criteria PASS**. The 90-day window is not complete, and the fee is unconfirmed. This file is the content, SEO, and leads retainer score for Jaka Transportation.

Canonical path: `docs/JAKA_RETAINER_DELIVERY_CONTRACT.md`

Machine scoreboard: `lib/hq/jaka-retainer-contract.js`, exposed as `jakaRetainerContract` on `GET /hq/api/control-plane` and on `/hq/retainers`. Relays cite that snapshot. They do not invent a second score.

Jaka is not an engineering front. The four-front board does not include this client.

## Golden Rule

We keep the retainer when promised day/week/month delivery criteria PASS with evidence, and HQ/MCP is the only score source relays may cite.

Do not redefine or weaken that sentence. `retainerHealthy` is true only when every criterion marked required for health is PASS. That is the current day and week promise. It is not a completed 90-day window and it is not a fee confirmation.

## Brand

- Brand: **JAKA movers & Transportation**
- Site: jakatransportation.com
- Google listing truth: **Open Door Movers** (Tim / Open Door Movers LLC)
- Never post Jaka from SookLabs

## Window and fee

Active window: **1 Oct 2026 through 29 Dec 2026** (90 inclusive days, Asia/Bangkok). Score date `asOf` is **2026-10-02**. Mark may move the window. This is not a signed SOW date.

Fee: **confirm with Mark**. HQ does not hold a dollar amount. None is invented here.

## How a period is scored

Period rollups use only rows with `countsTowardPeriod`. Unsigned Instagram and Threads, live blog publish, hire-board HOLD, and Mark-gated Craigslist or Nextdoor stay on the scorecard and do not flip the Facebook day by themselves.

Rollup order: any FAIL, else any BLOCKED, else any UNKNOWN, else any NOT STARTED, else PASS.

A full buffer is PASS for that buffer criterion. HOLD while a buffer is full is PASS for the SEO-pack rule. HOLD on leads is BLOCKED, not FAIL.

## Promises

Daily: Facebook Planner buffer of at least 7 days at 2 posts per day. Instagram and Threads run only when those apps are signed in. They are often signed out, so that row is BLOCKED and is not a Facebook FAIL.

Daily ops: blog draft and noindex buffer of at least 7 days. Site owns the drafts. Live publish waits on Origin connecting to Vercel and is not claimed.

Weekly: KC-metro keyword, title, and FAQ packs when the blog buffer window triggers. The buffer is full, so HOLD is the correct 2026-W40 state. Hire-board and Marketplace leads stay HOLD until the CoS unlocks them.

90-day goals, not closed on day 2:

1. Consistent Facebook cadence and planner buffer.
2. SEO packs on schedule.
3. Hire-board pipeline when unlocked.
4. Site content ready for go-live when Origin and Vercel connect.
5. Craigslist and Nextdoor remain Mark-gated costs and logins.

`retainerHealthy` follows the required day and week rows only. October as a whole and the 90-day goals stay open.

<!-- retainer-scorecard:start -->
| ID | Criterion | Cadence | Status | Owner | Evidence |
| --- | --- | --- | --- | --- | --- |
| jaka-daily-fb-buffer | Facebook Planner buffer at 2 posts per day | daily | PASS | Site | Operating state recorded for 2 Oct 2026: Facebook Planner buffer is at least 7 days at 2 posts per day for JAKA movers & Transportation. This HQ slice does not contain the planner export. A later asOf without that evidence must not keep this PASS. Never post Jaka from SookLabs. |
| jaka-daily-ig-threads | Instagram and Threads when those apps are signed in | daily | BLOCKED | Mark | Instagram and Threads publish only when those apps are signed in. They are often signed out as of 2 Oct 2026. That is BLOCKED, not FAIL, and it does not fail the Facebook daily promise. |
| jaka-daily-blog-draft-buffer | Blog draft and noindex buffer | daily | PASS | Site | Operating state recorded for 2 Oct 2026: the blog draft and noindex buffer is at least 7 days. Site owns the drafts. Live publish is not claimed. A later asOf without that evidence must not keep this PASS. |
| jaka-daily-blog-live | Live blog publish | daily | BLOCKED | Mark | Live blog publish waits on Origin connecting to Vercel. Do not claim the live blog shipped. This is BLOCKED, not FAIL, and it is outside the daily buffer score. |
| jaka-weekly-seo-pack-rule | KC-metro SEO packs follow the buffer rule | weekly | PASS | Site | Keyword, title, and FAQ packs for KC-metro are produced when the blog buffer window triggers. The buffer is full, so HOLD is the correct state for 2026-W40. This PASS is the operating rule. It is not a claim that a new pack shipped this week. |
| jaka-weekly-hire-board | Hire-board and Marketplace lead passes | weekly | BLOCKED | CoS | Hire-board and Marketplace lead passes are on HOLD until the CoS unlocks them. HOLD is BLOCKED, not FAIL. It does not fail the weekly SEO-pack rule. |
| jaka-monthly-october-cadence | October Facebook cadence held for the month | monthly | NOT STARTED | Site | October Facebook cadence cannot be scored for the whole month on 2 Oct 2026. The day-level planner buffer is a separate PASS. No monthly artifact beyond that operating rule is in HQ. |
| jaka-90d-fb-cadence | Consistent Facebook cadence and planner buffer | 90d | NOT STARTED | Site | 90-day goal: consistent Facebook cadence and a planner buffer through 29 Dec 2026. The 2 Oct buffer PASS does not close this goal. |
| jaka-90d-seo-schedule | SEO packs on schedule across the window | 90d | NOT STARTED | Site | 90-day goal: KC-metro SEO packs on schedule. The current week is HOLD because the blog buffer is full. The 90-day schedule is not closed. |
| jaka-90d-hire-board | Hire-board pipeline when unlocked | 90d | BLOCKED | CoS | 90-day goal: hire-board pipeline when the CoS unlocks it. Still HOLD, so BLOCKED rather than FAIL. |
| jaka-90d-site-golive | Site content ready for go-live when Origin and Vercel connect | 90d | BLOCKED | Mark | Draft buffer is a separate daily PASS. Go-live waits on Origin connecting to Vercel. Live site is not claimed. This goal is BLOCKED, not FAIL. |
| jaka-90d-craigslist-nextdoor | Craigslist and Nextdoor | 90d | BLOCKED | Mark | Craigslist and Nextdoor remain Mark-gated costs and logins. Not started as paid or logged-in channels. BLOCKED rather than FAIL. |
| jaka-brand-lock | Brand and listing truth | daily | UNKNOWN | Site | Brand is JAKA movers & Transportation. Site is jakatransportation.com. Google listing truth is Open Door Movers (Tim / Open Door Movers LLC). Never post Jaka from SookLabs. No wrong-brand incident is recorded in HQ, and no clean-day proof is recorded either, so this is UNKNOWN. |

```json
{
  "path": "docs/JAKA_RETAINER_DELIVERY_CONTRACT.md",
  "clientId": "jaka",
  "asOf": "2026-10-02",
  "retainerHealthy": true,
  "healthBasis": "True only because the Facebook buffer, blog draft buffer, and SEO-pack hold rule are PASS. Mark-gated Instagram, live publish, hire-board, Craigslist, and Nextdoor are excluded from this boolean. The 90-day window is not complete. The fee is unconfirmed.",
  "windowComplete": false,
  "counts": {
    "PASS": 3,
    "FAIL": 0,
    "BLOCKED": 6,
    "NOT STARTED": 3,
    "UNKNOWN": 1
  },
  "periods": {
    "today": {
      "id": "2026-10-02",
      "label": "Friday 2 Oct 2026",
      "status": "PASS",
      "criterionIds": [
        "jaka-daily-fb-buffer",
        "jaka-daily-blog-draft-buffer"
      ]
    },
    "thisWeek": {
      "id": "2026-W40",
      "label": "Week of 28 Sep–4 Oct 2026",
      "status": "PASS",
      "criterionIds": [
        "jaka-weekly-seo-pack-rule"
      ]
    },
    "thisMonth": {
      "id": "2026-10",
      "label": "October 2026",
      "status": "NOT STARTED",
      "criterionIds": [
        "jaka-monthly-october-cadence"
      ]
    },
    "window90d": {
      "id": "2026-10-01..2026-12-29",
      "label": "1 Oct–29 Dec 2026",
      "status": "BLOCKED",
      "criterionIds": [
        "jaka-90d-fb-cadence",
        "jaka-90d-seo-schedule",
        "jaka-90d-hire-board",
        "jaka-90d-site-golive",
        "jaka-90d-craigslist-nextdoor"
      ]
    }
  },
  "criticalPath": "Keep the Facebook Planner buffer and the blog draft buffer. SEO packs stay on HOLD while the blog buffer is full. Hire-board, live blog, Craigslist, and Nextdoor stay blocked. Fee amount is unconfirmed.",
  "nextUnmet": {
    "id": "jaka-monthly-october-cadence",
    "also": "jaka-90d-fb-cadence",
    "summary": "October cadence and the 90-day Facebook habit are not closed on day 2"
  },
  "criteria": [
    {
      "id": "jaka-daily-fb-buffer",
      "criterion": "Facebook Planner buffer at 2 posts per day",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "PASS",
      "owner": "Site",
      "requiredForHealth": true,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-daily-ig-threads",
      "criterion": "Instagram and Threads when those apps are signed in",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "BLOCKED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "jaka-daily-blog-draft-buffer",
      "criterion": "Blog draft and noindex buffer",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "PASS",
      "owner": "Site",
      "requiredForHealth": true,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-daily-blog-live",
      "criterion": "Live blog publish",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "BLOCKED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "jaka-weekly-seo-pack-rule",
      "criterion": "KC-metro SEO packs follow the buffer rule",
      "cadence": "weekly",
      "periodId": "2026-W40",
      "status": "PASS",
      "owner": "Site",
      "requiredForHealth": true,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-weekly-hire-board",
      "criterion": "Hire-board and Marketplace lead passes",
      "cadence": "weekly",
      "periodId": "2026-W40",
      "status": "BLOCKED",
      "owner": "CoS",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "jaka-monthly-october-cadence",
      "criterion": "October Facebook cadence held for the month",
      "cadence": "monthly",
      "periodId": "2026-10",
      "status": "NOT STARTED",
      "owner": "Site",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-90d-fb-cadence",
      "criterion": "Consistent Facebook cadence and planner buffer",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "NOT STARTED",
      "owner": "Site",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-90d-seo-schedule",
      "criterion": "SEO packs on schedule across the window",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "NOT STARTED",
      "owner": "Site",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-90d-hire-board",
      "criterion": "Hire-board pipeline when unlocked",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "BLOCKED",
      "owner": "CoS",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-90d-site-golive",
      "criterion": "Site content ready for go-live when Origin and Vercel connect",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "BLOCKED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-90d-craigslist-nextdoor",
      "criterion": "Craigslist and Nextdoor",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "BLOCKED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "jaka-brand-lock",
      "criterion": "Brand and listing truth",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "UNKNOWN",
      "owner": "Site",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    }
  ]
}
```

<!-- retainer-scorecard:end -->
