# RDUSA Retainer Delivery Contract

Status: **retainer not healthy**. This file is the marketing and operations retainer score for Retail Display USA. It is not the Journey pilot finish line.

Canonical path: `docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md`

Machine scoreboard: `lib/hq/rdusa-retainer-contract.js`, exposed as `rdusaRetainerContract` on `GET /hq/api/control-plane` and on `/hq/retainers`. Relays cite that snapshot. They do not invent a second score.

The Journey product finish line stays in [`docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md`](./RDUSA_PILOT_ACCEPTANCE_CONTRACT.md). This file does not restate or replace that Golden Rule. Journey/CRM is an expansion opportunity, not a marketing-retainer gate.

## Golden Rule

We keep the retainer when promised day/week/month delivery criteria PASS with evidence, and HQ/MCP is the only score source relays may cite.

Do not redefine or weaken that sentence. `retainerHealthy` stays false until every criterion marked required for health is PASS. A BLOCKED Mark gate is not a FAIL. A missing artifact is not a PASS.

## Window and fee

Active window: **1 Oct 2026 through 29 Dec 2026** (90 inclusive days, Asia/Bangkok). Score date `asOf` is **2026-10-02**. Mark may move the window. This is not a signed SOW date.

Engagement truth: **USD 1,500/month** for SEO, content, social media, and growth support.

Phone and order-desk standby is a separate optional line, about **$3.50/hr**, Monday through Friday, about 9–5 ET. It is not required for marketing-retainer PASS. No standby usage is recorded here.

## How a period is scored

Period rollups use only rows with `countsTowardPeriod`. Standing rules and optional lines stay on the scorecard and do not flip the day by themselves.

Rollup order: any FAIL, else any BLOCKED, else any UNKNOWN, else any NOT STARTED, else PASS.

- Today: Friday 2 Oct 2026
- This week: 2026-W40, Monday 28 Sep through Sunday 4 Oct. The week is still open. Only 1–2 Oct sit inside the retainer window.
- This month: October 2026
- 90 days: 1 Oct–29 Dec 2026

## Promises

Daily social path: real-product-photo Instagram publishing when the Meta token is valid. Do not invent testimonials. Never publish from the wrong brand. `META_PAGE_TOKEN_RDUSA` expired about 25 Sep 2026, so the daily path is BLOCKED until Mark remints it.

Weekly: the commercial scorecard (`rdusa-weekly-commercial-scorecard`) is PASS only when that week's artifact is in HQ. None is recorded for 2026-W40, and the week is open, so the row is NOT STARTED.

Weekly growth support continues. The SEO/GEO ledger row is verified at `510724bef68d3daaa21fa53436c22d75481dbc24` on draft PR https://github.com/mblackth-ai/rdusa/pull/3. Other ledger rows are OPEN pending Andrew and Mark and are not PASS. The weekly support row stays BLOCKED.

90-day goals, not closed on day 2:

1. Keep the weekly commercial scorecard habit.
2. Restore the Graph publish path and continue real-product Instagram toward 100 posts from the prior 50/57 baseline. No current count is invented.
3. Threads and Facebook after Instagram, when tokens allow.
4. Journey/CRM stays on the pilot acceptance contract.

`retainerHealthy` is false. The Meta token is still blocked, and the W40 scorecard is not PASS.

<!-- retainer-scorecard:start -->
| ID | Criterion | Cadence | Status | Owner | Evidence |
| --- | --- | --- | --- | --- | --- |
| rdusa-daily-ig-publish | Real-product-photo Instagram publishing path | daily | BLOCKED | Mark | META_PAGE_TOKEN_RDUSA expired about 25 Sep 2026. Real-product-photo Instagram publishing is not operational until that token is reminted. No invented testimonials and no wrong-brand publish are claimed for 2 Oct 2026 because no publish artifact is in HQ. Prior baseline cited as 50/57 is not a current count. This is a Mark-gated credential, so the row is BLOCKED rather than FAIL. |
| rdusa-daily-no-invented-testimonials | No invented testimonials on the publish path | daily | UNKNOWN | Cursor | Standing rule: do not invent testimonials. No 2 Oct 2026 publish artifact is in HQ, so this row is UNKNOWN rather than PASS or FAIL. It does not change the daily rollup while the token row is the scored path. |
| rdusa-daily-brand-lock | Never publish RDUSA from the wrong brand | daily | UNKNOWN | Cursor | Standing rule: never publish RDUSA from another brand. No 2 Oct 2026 publish artifact is in HQ, so this row is UNKNOWN rather than PASS or FAIL. |
| rdusa-weekly-commercial-scorecard | Weekly commercial scorecard for retainer ROI attribution | weekly | NOT STARTED | CoS | Routine rdusa-weekly-commercial-scorecard. No scorecard artifact for 2026-W40 is in HQ as of 2 Oct 2026. The week is open through 4 Oct 2026, so this is NOT STARTED rather than FAIL. PASS only when that week's artifact is recorded. |
| rdusa-weekly-seo-geo | SEO/GEO ledger row verified | weekly | PASS | Andrew / Mark | SEO/GEO ledger row verified at 510724bef68d3daaa21fa53436c22d75481dbc24. Draft PR https://github.com/mblackth-ai/rdusa/pull/3 is unmerged. This does not mark other ledger rows PASS and does not close the weekly growth-support row. |
| rdusa-weekly-ledger-open | Other RDUSA ledger rows beyond SEO/GEO | weekly | BLOCKED | Andrew / Mark | Ledger rows other than SEO/GEO are OPEN pending Andrew and Mark. Draft PR https://github.com/mblackth-ai/rdusa/pull/3 is unmerged. OPEN rows are not PASS. |
| rdusa-weekly-growth-support | Content, social, and SEO/growth support for the week | weekly | BLOCKED | Cursor | The marketing retainer scope is content, social, and SEO/growth support. Social publishing is blocked on the expired Meta token. Ledger rows beyond SEO/GEO are OPEN. No W40 content artifact is in HQ. The row stays BLOCKED, not PASS. |
| rdusa-monthly-october | October marketing retainer delivery | monthly | NOT STARTED | CoS | October 2026 has not closed. No month-level delivery artifact is in HQ as of 2 Oct 2026. Engagement truth is USD 1,500/month for SEO, content, social, and growth support. This row does not score dollar outcomes. |
| rdusa-90d-scorecard-habit | Keep the weekly commercial scorecard habit | 90d | NOT STARTED | CoS | 90-day goal: keep the weekly commercial scorecard so retainer value is evidenced from 1 Oct through 29 Dec 2026. W40 has no artifact yet. The goal is not PASS on day 2. |
| rdusa-90d-ig-toward-100 | Restore Graph publish and continue real-product Instagram | 90d | BLOCKED | Mark | 90-day goal: restore the Graph publish path and continue real-product Instagram toward 100 posts from the prior 50/57 baseline. HQ does not hold a current post count, and none is invented. Blocked on META_PAGE_TOKEN_RDUSA expired about 25 Sep 2026. |
| rdusa-90d-threads-fb | Threads and Facebook after Instagram | 90d | NOT STARTED | Mark | Threads and Facebook follow Instagram when tokens allow. Not started. This is not a current-day FAIL. |
| rdusa-90d-journey-separate | Journey/CRM pilot tracked on the acceptance contract | 90d | NOT STARTED | Mark | Expansion opportunity only. Scored on docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md, where pilotReady is false. It is not a marketing-retainer gate and does not change this retainer's period rollups. |
| rdusa-phone-standby-optional | Phone and order-desk standby | monthly | UNKNOWN | Mark | Optional expansion, about $3.50/hr, Monday through Friday about 9–5 ET. Not required for marketing-retainer PASS. No standby usage is recorded in HQ, so this is UNKNOWN. |

```json
{
  "path": "docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md",
  "clientId": "rdusa",
  "asOf": "2026-10-02",
  "retainerHealthy": false,
  "healthBasis": "False because the Instagram publish path is BLOCKED on the expired Meta token and the 2026-W40 commercial scorecard is not PASS.",
  "windowComplete": false,
  "counts": {
    "PASS": 1,
    "FAIL": 0,
    "BLOCKED": 4,
    "NOT STARTED": 5,
    "UNKNOWN": 3
  },
  "periods": {
    "today": {
      "id": "2026-10-02",
      "label": "Friday 2 Oct 2026",
      "status": "BLOCKED",
      "criterionIds": [
        "rdusa-daily-ig-publish"
      ]
    },
    "thisWeek": {
      "id": "2026-W40",
      "label": "Week of 28 Sep–4 Oct 2026",
      "status": "BLOCKED",
      "criterionIds": [
        "rdusa-weekly-commercial-scorecard",
        "rdusa-weekly-growth-support"
      ]
    },
    "thisMonth": {
      "id": "2026-10",
      "label": "October 2026",
      "status": "NOT STARTED",
      "criterionIds": [
        "rdusa-monthly-october"
      ]
    },
    "window90d": {
      "id": "2026-10-01..2026-12-29",
      "label": "1 Oct–29 Dec 2026",
      "status": "BLOCKED",
      "criterionIds": [
        "rdusa-90d-scorecard-habit",
        "rdusa-90d-ig-toward-100",
        "rdusa-90d-threads-fb"
      ]
    }
  },
  "criticalPath": "Remint META_PAGE_TOKEN_RDUSA, expired about 25 Sep 2026, then record the 2026-W40 commercial scorecard. Journey pilot stays on the separate acceptance contract. This slice must not publish, merge, or deploy.",
  "nextUnmet": {
    "id": "rdusa-daily-ig-publish",
    "also": "rdusa-weekly-commercial-scorecard",
    "summary": "Remint the RDUSA Meta token, then record this week's commercial scorecard"
  },
  "criteria": [
    {
      "id": "rdusa-daily-ig-publish",
      "criterion": "Real-product-photo Instagram publishing path",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "BLOCKED",
      "owner": "Mark",
      "requiredForHealth": true,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-daily-no-invented-testimonials",
      "criterion": "No invented testimonials on the publish path",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "UNKNOWN",
      "owner": "Cursor",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "rdusa-daily-brand-lock",
      "criterion": "Never publish RDUSA from the wrong brand",
      "cadence": "daily",
      "periodId": "2026-10-02",
      "status": "UNKNOWN",
      "owner": "Cursor",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "rdusa-weekly-commercial-scorecard",
      "criterion": "Weekly commercial scorecard for retainer ROI attribution",
      "cadence": "weekly",
      "periodId": "2026-W40",
      "status": "NOT STARTED",
      "owner": "CoS",
      "requiredForHealth": true,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-weekly-seo-geo",
      "criterion": "SEO/GEO ledger row verified",
      "cadence": "weekly",
      "periodId": "2026-W40",
      "status": "PASS",
      "owner": "Andrew / Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "rdusa-weekly-ledger-open",
      "criterion": "Other RDUSA ledger rows beyond SEO/GEO",
      "cadence": "weekly",
      "periodId": "2026-W40",
      "status": "BLOCKED",
      "owner": "Andrew / Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "rdusa-weekly-growth-support",
      "criterion": "Content, social, and SEO/growth support for the week",
      "cadence": "weekly",
      "periodId": "2026-W40",
      "status": "BLOCKED",
      "owner": "Cursor",
      "requiredForHealth": true,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-monthly-october",
      "criterion": "October marketing retainer delivery",
      "cadence": "monthly",
      "periodId": "2026-10",
      "status": "NOT STARTED",
      "owner": "CoS",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-90d-scorecard-habit",
      "criterion": "Keep the weekly commercial scorecard habit",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "NOT STARTED",
      "owner": "CoS",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-90d-ig-toward-100",
      "criterion": "Restore Graph publish and continue real-product Instagram",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "BLOCKED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-90d-threads-fb",
      "criterion": "Threads and Facebook after Instagram",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "NOT STARTED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": true
    },
    {
      "id": "rdusa-90d-journey-separate",
      "criterion": "Journey/CRM pilot tracked on the acceptance contract",
      "cadence": "90d",
      "periodId": "2026-10-01..2026-12-29",
      "status": "NOT STARTED",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    },
    {
      "id": "rdusa-phone-standby-optional",
      "criterion": "Phone and order-desk standby",
      "cadence": "monthly",
      "periodId": "2026-10",
      "status": "UNKNOWN",
      "owner": "Mark",
      "requiredForHealth": false,
      "countsTowardPeriod": false
    }
  ]
}
```

<!-- retainer-scorecard:end -->
