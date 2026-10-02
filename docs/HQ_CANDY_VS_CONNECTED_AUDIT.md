# HQ candy vs connected audit

**Date:** 2 Oct 2026  
**Scope:** every signed-in HQ route and the major overview widgets.  
**Classes:**

- **CONNECTED** — reads the ops store, a contract scorecard, the control plane, or a live external summary.
- **THIN** — honest shortcut or local sketch. No invented percentage.
- **CANDY** — decorative, unused, or a static figure with no source.
- **REDIRECT** — the page only sends the operator somewhere else.

| Section | Class | Evidence | Action |
| --- | --- | --- | --- |
| Overview pulse | CONNECTED | `readOpsData()` and `getOpsStorageMode()` | Left in the primary scroll |
| All fronts board | CONNECTED | `lib/hq/hq-fronts.js` | Left. Replaced the four-card summary |
| Client retainers summary | CONNECTED | `rdusaRetainerContract` and `jakaRetainerContract` | Left |
| Morning loop, priorities, goals, blockers, top open, attention | CONNECTED | Ops editors and derived lists | Left |
| More today (jobs, portfolio strip, end of day, click-play hint) | CONNECTED | Ops jobs and checklist percents. Collapsed unless a job is running | Left collapsed |
| `/hq/fronts` and `/hq/fronts/[id]` | CONNECTED | Same `hqFronts` snapshot as `GET /hq/api/control-plane` | Added |
| `/hq/retainers` | CONNECTED | Same retainer snapshots | Left |
| `/hq/engineering/four-fronts` | CONNECTED | `lib/hq/four-fronts.js` (Journey 85, SEOS 80, RDUSA ledger 45, HQ 35, overall 61) | Left. Not the only progress surface |
| `/hq/goals`, `/hq/briefing`, `/hq/decision-log`, `/hq/review` | CONNECTED | Ops goals, notes, decisions, and a 7-day read | Left |
| `/hq/portfolio` and `/hq/sookly/action-plan` | CONNECTED | `data/hq/ops.json` workstreams | Left |
| `/hq/seos/social-gtm` | CONNECTED | Ops social board. Badges stay Manual / Draft / Future OAuth | Left |
| `/hq/seos/authority` | CONNECTED | `readAuthoritySummary()` from the SEOS tracker. Empty when SEOS is unreachable | Left |
| `/hq/automation` | CONNECTED | Ops agent jobs plus env-present flags. No secret values | Left |
| `/hq/settings` | CONNECTED | Storage mode and link status. No secret values | Left |
| `/hq/engineering` | THIN | Shortcut tiles. Page badge is Thin hub. No deploy meter | Left |
| `/hq/marketing` | THIN | Shortcut tiles. Page badge is Thin hub. No channel stats | Left |
| `/hq/sookly` | THIN | Links to the action plan, the reply sketch, and the knowledge note | Left |
| `/hq/community` cadence playground | THIN | Local click-and-play draft. Badge Manual · 0 OAuth | Left. Ops board on the same page stays CONNECTED |
| `/hq/roastmyopsec` inventory board | CONNECTED | Ops surface-inventory items | Left |
| `/hq/sookly/receptionist-readiness` reply sketch | THIN | Founder-typed draft. Badge Demo · not live product | Left after the demo scores were removed |
| `/hq/sookly/knowledge-usage` | REDIRECT | Page now says there is no live sync and points at SEOS | Demo table removed |
| `/hq/seos` | REDIRECT | Hub points at the SEOS app, Authority, and Social GTM | Left |
| `/hq/seos/knowledge-base`, exports, content-gaps, semantic-readiness, competitor-signals, distribution-map | REDIRECT | `OpenInSeosStub`. No parallel score | Left |
| `/hq/agents` | REDIRECT | `redirect("/hq/automation")` | Left |
| `/hq/integrations` | REDIRECT | `redirect("/hq/settings")` | Left |
| Knowledge usage demo table | CANDY | `knowledgeUsage` in `lib/hq/knowledge-mock.js` | Removed from the page. Listed under Upcoming / Not Yet Released |
| Receptionist demo scores | CANDY | `sooklyReadiness` figures 67, 60, and 3/5 | Removed from the page. Listed under Upcoming |
| Community pillar cards | CANDY | Hard-coded Psychology, Investment, and Technology blurbs | Removed. Ops tasks with those names stay |
| RoastMyOpSec live scanner | CANDY | Badge Manual · 0 live scan. No scanner API | Listed under Upcoming. Inventory board stays |
| Clients `/clients/rdusa` and `/clients/jaka` | CANDY | No routes. MVP map marks them SPEC | Listed under Upcoming. Not built |
| Approval trigger cards | CANDY | Swarm note section 5. No card UI | Listed under Upcoming |
| Quo ingest | CANDY | No route or scorecard row | Listed under Upcoming. Front percentage is 0 |
| SEOS visual calendar, movable blocks, GA/GSC/GBP | CANDY | Unchecked boxes in `docs/BUSINESS_SUITE_MVP_MAP.md` | Listed under Upcoming. Not the SEOS 80 estimate |
| MetricCard, ProductCard, QuickLinks, ActivityRow | CANDY | Components exist and are not mounted | Listed under Upcoming. Not deleted |
| Upcoming / Not Yet Released | CONNECTED index of candy | Collapsed by default at the bottom of the HQ shell | Added |

No social publish, customer email, merge, or production deploy was performed for this audit.
