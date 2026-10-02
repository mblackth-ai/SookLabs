# HQ fronts progress

**Date:** 2 Oct 2026  
**Founder board:** `lib/hq/eight-fronts.js`, also `eightFronts` on `GET /hq/api/control-plane`.  
**Overall:** 33. Rounded mean of the eight percentages below. A Must-row ratio and a recorded estimate are not blended inside one front.

| Front | % | Formula | Tracker |
| --- | --- | --- | --- |
| HQ | 57 | 4 of 7 Must rows PASS (HQ-2, HQ-3, HQ-4, HQ-5) | `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md` |
| SEOS | 80 | Recorded four-front estimate. Not a count of SE-1…SE-8 | `lib/hq/four-fronts.js` (`seos-social`) |
| Swarm | 0 | 0 of 6 Must rows PASS | `docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` |
| MCP | 0 | 0 of 6 Must rows PASS | `docs/HQ-MCP-CONTROL-PLANE.md` |
| Sookly app | 76 | 13 of 17 pilot majors PASS. `pilotReady` is false | `docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md` |
| Sookly chat SaaS | 0 | 0 of 5 Must rows PASS | `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md` |
| Revenue | 50 | 3 of 6 Must rows PASS (REV-4, REV-5, REV-6) | `docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md` |
| Journey Prisma | 0 | 0 of 6 Must rows PASS | `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md` |

Detail is `/hq/fronts/<id>`. Engineering tracks stay at `/hq/engineering/four-fronts`: Journey 85, SEOS 80, RDUSA ledger 45, HQ MCP 35, overall 61. Those numbers are not the eight-front badges except SEOS, which cites the recorded 80 directly.

Evidence rows that are not founder fronts remain in `lib/hq/hq-fronts.js` and still open at `/hq/fronts/<legacy-id>`.

These pages are on draft PR #5. They are not on live hq.sooklabs.com until that PR merges and HQ is deployed.
