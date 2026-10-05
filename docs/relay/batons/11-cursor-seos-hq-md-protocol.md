---
baton_id: SPARK-BATON-11
number: 11
author: gemini
seat: gemini
status: ACTIVE
target_seats: [cursor, codex, claude]
target_repos:
  - mblackth-ai/SEOS
  - mblackth-ai/SookLabs
single_writer: cursor
canonical_authority:
  - docs/SEOS-MVP-1.md
  - docs/mvp-smoke-checklist.md
  - docs/HQ-MCP-CONTROL-PLANE.md
drive_doc: https://docs.google.com/document/d/1fRykO9uDSdoDUz1qjyIqQBuWiBKcolAi18g4HkH6E6A/edit
---

# 11 — SEOS MVP fixes, HQ stream, Markdown protocol

Repo mirror of Drive baton 11. **Drive doc wins** on conflict until Mark merges this mirror.

## Acceptance rows

| check_id | criterion | owner | status | evidence |
| --- | --- | --- | --- | --- |
| seos.fix.identity | KB business name updates `useWorkspaceStore` identity | cursor | UNRUN | |
| seos.fix.exports | Download uses `active.label`; JSON MIME for json tabs | cursor | UNRUN | |
| seos.fix.llms-import | `KnowledgeBase` from `../types` | cursor | UNRUN | |
| seos.smoke.gate | Required checks affect exit code | codex | UNRUN | |
| hq.ui.sse | SSE client → `/hq/api/room/stream` | cursor | UNRUN | |
| relay.md.12 | Repo relay pack in `docs/relay/` | cursor | PASS | this PR |

## Implementation package (SEOS)

See [acceptance/SEOS-MVP-FINISH.md](../acceptance/SEOS-MVP-FINISH.md) and Codex Drive evidence doc.

## Report back

`docs/reports/REPORT_SEOS_<date>_cursor.md` + PR link in `00_ROOM_EVENT_FEED`.
