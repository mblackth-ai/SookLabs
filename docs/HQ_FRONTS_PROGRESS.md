# HQ fronts progress

**Date:** 2 Oct 2026  
**Source:** `lib/hq/hq-fronts.js`, also returned as `hqFronts` on `GET /hq/api/control-plane`.

Scorecard percentages are `Math.round(100 * PASS / total)` on the named rows. Recorded four-front estimates are copied, not recomputed. `No score` means this repo has no criterion row. Nothing here is 100.

| Front | % | Formula | Tracker |
| --- | --- | --- | --- |
| Sookly Journey / RDUSA pilot | 76 | 13 of 17 major criteria PASS | `docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md` · `lib/hq/rdusa-pilot-contract.js` |
| RDUSA retainer delivery | 0 | 0 of 7 period rows PASS | `docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md` · `lib/hq/rdusa-retainer-contract.js` |
| Jaka retainer delivery | 33 | 3 of 9 period rows PASS | `docs/JAKA_RETAINER_DELIVERY_CONTRACT.md` · `lib/hq/jaka-retainer-contract.js` |
| SEOS social control plane | 80 | Recorded four-front estimate | `lib/hq/four-fronts.js` (`seos-social`) |
| RDUSA internal ledger | 45 | Recorded four-front estimate | `lib/hq/four-fronts.js` (`rdusa-internal`) |
| HQ MCP gateway | 35 | Recorded four-front estimate | `lib/hq/four-fronts.js` (`hq-mcp`) |
| Quo ingest | 0 | No route or scorecard row | `docs/BUSINESS_SUITE_MVP_MAP.md` |
| Clients RDUSA | 0 | No `/clients/rdusa` route | `docs/BUSINESS_SUITE_MVP_MAP.md` |
| Clients Jaka | 0 | No `/clients/jaka` route | `docs/BUSINESS_SUITE_MVP_MAP.md` |
| Meta / social Graph | 0 | 0 of 2 Graph rows PASS | `docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md` (`rdusa-daily-ig-publish`, `rdusa-90d-ig-toward-100`) |
| Resend / email on droplet | No score | No HQ scorecard row | `docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` |
| Business Suite MVP map | 0 | 0 of 21 acceptance checkboxes checked | `docs/BUSINESS_SUITE_MVP_MAP.md` |
| OS Story / LLM lanes | No score | `docs/LLM_STATUS.md` and `docs/LLM_LANE_MAP.md` are not on this branch | `docs/HQ-AGENTS.md` |

Detail for each front is `/hq/fronts/<id>`: what is stopping it, what is going on, where it lands, loose ends, and edge cases.

The engineering board at `/hq/engineering/four-fronts` still shows Sookly Journey 85. That 85 is not the 13/17 pilot ratio. The swarm note records sookly-omnichat PR #60 as merged. The pilot scorecard row `merge-pr-60` is still BLOCKED.

These pages are on draft PR #5. They are not on live hq.sooklabs.com until that PR merges and HQ is deployed.
