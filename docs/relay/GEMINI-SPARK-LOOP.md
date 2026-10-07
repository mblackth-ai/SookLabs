# Gemini Spark — hour loop with the repo

Spark is **contract authority**: specs, acceptance alignment, cross-agent synthesis. Implementation stays on **single-writer** seats (usually Cursor for UI/CI, Claude for HQ backend).

## Roles in the loop

| Seat | Lane | Relay responsibility |
| --- | --- | --- |
| **gemini** (Spark) | Specs, rulings, checklist reconciliation | Publish batons; verify reports; update event feed |
| **cursor** | UI, SEOS CI, SookLabs PRs | Apply batons; write `docs/reports/*` |
| **claude** | HQ backend, room/MCP | Same report convention |
| **codex** | Verification, smoke harness | Report with PASS/NOT_MET/UNRUN only |
| **grok** | Chief of Staff, `@all` routing | Decompose Mark objectives into batons |
| **mark** | Operator | One room objective; merge/deploy gates |

## Cadence (≈1 hour)

| Minute block | Spark | Repo agent |
| --- | --- | --- |
| 0–10 | Read room + GitHub + last report; publish baton `.md` | Pull baton; acknowledge in PR description |
| 10–40 | Answer clarifications in Drive baton comments only | Implement; push branch |
| 40–50 | — | Fill `docs/reports/REPORT_*.md`; open/update PR |
| 50–60 | Verify report; update acceptance table; feed line | Fix NOT_MET if quick; else BLOCKED with reason |

## Where Spark reads

1. **This repo:** `docs/relay/`, `docs/reports/`, `docs/HQ-MCP-CONTROL-PLANE.md`.
2. **SEOS repo:** canonical MVP + smoke checklist (SHAs via GitHub).
3. **Drive:** Relay Outbox + `00_ROOM_EVENT_FEED`.
4. **HQ room** (when MCP live): `room_read`, `room_board` — never impersonate another seat.

## Where Spark writes

1. **Drive:** numbered batons, feed append, rulings.
2. **Repo (optional):** same baton under `docs/relay/batons/` via PR from Cursor or Mark-approved commit.
3. **HQ room:** evidence posts with refs only after `gemini` seat is connected.

## MVP completion definition

| Front | “Done” means |
| --- | --- |
| **HQ** | Production MCP launch tests 1–5; two-seat baton; ops seed applied if using `hq_next_actions` |
| **SEOS** | Smoke checklist all required rows PASS on recorded SHA in agreed environment; honest badges |

See [acceptance/HQ-MVP-FINISH.md](./acceptance/HQ-MVP-FINISH.md) and [acceptance/SEOS-MVP-FINISH.md](./acceptance/SEOS-MVP-FINISH.md).
