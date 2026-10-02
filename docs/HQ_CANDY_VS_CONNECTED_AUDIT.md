# HQ candy vs connected audit

**Date:** 2 Oct 2026  
**Scope:** major HQ sections, cards, and widgets on the signed-in shell.  
**Rule:** CONNECTED means the surface reads ops, a contract scorecard, or the control plane. CANDY means decorative, unused, or unactivated.

| Section | Class | Evidence | Action |
| --- | --- | --- | --- |
| Overview pulse (priorities, tasks, blockers, goals, storage) | CONNECTED | Counts come from `readOpsData()` and `getOpsStorageMode()` | Left in the primary scroll |
| Morning loop, priorities, goals, blockers, top open items, attention | CONNECTED | Ops store editors and derived lists | Left in the primary scroll |
| Client retainers summary | CONNECTED | `rdusaRetainerContract` and `jakaRetainerContract` | Left in the primary scroll |
| All fronts board | CONNECTED | `lib/hq/hq-fronts.js` ratios and recorded four-front estimates | Replaced the four-card summary in the primary scroll |
| Engineering four-front board | CONNECTED | `lib/hq/four-fronts.js` (Journey 85, SEOS 80, RDUSA ledger 45, HQ 35, overall 61) | Kept at `/hq/engineering/four-fronts`. Not the only progress surface |
| Retainers page | CONNECTED | Same retainer snapshots as the control plane | Left |
| SEOS hub, Authority, Social GTM | CONNECTED | Hub links to the SEOS app and the ops social board. Stubs say operator work stays in SEOS | Left. They refuse a fake HQ scoreboard |
| Sookly action plan and other ops boards | CONNECTED | `data/hq/ops.json` workstreams | Left |
| LLM & Agents, briefing, decisions, goals, settings | CONNECTED | Ops jobs, notes, decisions, and env status | Left |
| More today (jobs, portfolio strip, end of day) | CONNECTED | Ops jobs and checklist percents. Collapsed unless a job is running | Left collapsed |
| Knowledge usage demo table | CANDY | `lib/hq/knowledge-mock.js` static rows. Page subtitle already said it was not a live sync | Removed from the primary page. Listed under Upcoming / Not Yet Released |
| Community pillar cards | CANDY | Hard-coded Psychology, Investment, and Technology blurbs with no ops rows | Removed from the community primary scroll. The ops board stays |
| RoastMyOpSec live scanner | CANDY | Page badge is Manual · 0 live scan. No scanner API | Scanner claim listed under Upcoming. The inventory board stays |
| Clients `/clients/rdusa` and `/clients/jaka` | CANDY | No routes. MVP map marks them SPEC | Listed under Upcoming. Not built |
| Approval trigger cards | CANDY | Specified in `docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` section 5. No card UI | Listed under Upcoming |
| Quo ingest | CANDY | No route or scorecard row | Listed under Upcoming. Front percentage is 0 because it is unbuilt |
| SEOS visual calendar, movable blocks, GA/GSC/GBP | CANDY | Unchecked boxes in `docs/BUSINESS_SUITE_MVP_MAP.md` | Listed under Upcoming. Not the SEOS 80 four-front estimate |
| MetricCard, ProductCard, QuickLinks, ActivityRow | CANDY | Components exist and are not mounted. ProductCard includes unused MRR fields | Listed under Upcoming. Not deleted |
| Upcoming / Not Yet Released | CONNECTED index of candy | Collapsed by default at the bottom of the HQ shell | Added |

No social publish, customer email, merge, or production deploy was performed for this audit.
