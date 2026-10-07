# Canonical truth — relay vs HQ vs SEOS

Use this when a Drive baton disagrees with the repository or with production behavior.

## HQ (SookLabs repo)

| Topic | Canonical | Stale relay text (ignore) |
| --- | --- | --- |
| Room persistence | Postgres `hq_room_messages`, `hq_room_dispatches`, … | Drizzle `agent_events`, parallel checklist DB |
| Live stream | `GET /hq/api/room/stream` | `/api/hq/events` |
| Agent write path | Seat Bearer → `/hq/api/room/mcp` (`room_post`, …) | Unauthenticated Drive → DB |
| Control-plane reads | `lib/hq/control-plane.js`, `/hq/api/control-plane`, room summary | Static progress only |
| MCP convergence | Room MCP + (future) read-only gateway PR #14 — **one seat identity** | Two competing control planes |
| Launch acceptance | `docs/HQ-MCP-LAUNCH.md` tests 1–5 in **production** | Self-reported local only |

**Drive bridge (when implemented):** ingest into **`postRoomRecord` / `gemini` seat** with dedupe  
`sha256(file_id + ":" + revision_id + ":" + entry_index)` — ratified in Drive baton 10.

## SEOS (mblackth-ai/SEOS repo)

| Topic | Canonical path (SEOS repo) |
| --- | --- |
| MVP definition | `docs/SEOS-MVP-1.md` |
| Acceptance tests | `docs/mvp-smoke-checklist.md` |
| Honesty / badges | `docs/agent/DECISIONS.md` |

**Finish line:** setup → seed → edit → export with **truthful** Manual / Workflow Ready / Draft Export labels — never “Connected” without server persistence evidence.

**Known open items (2026-10-05 evidence, not re-litigation):**

- Lockfile `@swc/helpers` fix may live on integration branch, not `main` — verify SHA before claiming “main green”.
- Smoke checklist wording may **intentionally** differ from old checklist rows (auth copy, Command Center landing, removed fake CC scores) — resolve via **Mark-approved checklist update**, not silent test weakening.
- Codex-documented code fixes: knowledge-base identity sync, `llms.ts` import, export filenames, smoke harness exit codes — see Drive [Codex SEOS evidence](https://docs.google.com/document/d/1tc2b1Mzf2D_n1i6nsYvDEkmPuqGANvKkPhVDOU0Afk8/edit) and baton 11.

## Global workflow (all fronts)

From `docs/HQ-MCP-CONTROL-PLANE.md`:

GOAL → CURRENT STATE → ACCEPTANCE CRITERIA → OWNER → EXECUTE → TEST → EVIDENCE → REVIEW → MERGE → DEPLOY → **PRODUCTION ACCEPTANCE** → HANDOFF

- Merge ≠ production acceptance.
- Agent says done ≠ evidence.
- Relay markdown = **coordination + audit trail**, not proof of deploy.
