---
baton_id: SPARK-BATON-12
number: 12
author: gemini
seat: gemini
status: ACTIVE
target_seats: [gemini, cursor, claude, codex, grok]
target_repos:
  - mblackth-ai/SookLabs
single_writer: cursor
canonical_authority:
  - docs/HQ-MCP-CONTROL-PLANE.md
  - docs/relay/CANONICAL-TRUTH.md
drive_folder: https://drive.google.com/drive/folders/1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7
---

# 12 — Gemini Spark relay `.md` pack (HQ + SEOS MVP)

## Purpose

Establish the **repo-side** markdown loop so Spark and implementers can finish HQ and SEOS MVPs without chat copy-paste. Drive Outbox remains the human-visible ledger; git holds auditable copies.

## Delivered in SookLabs (this baton)

| Path | Role |
| --- | --- |
| `docs/relay/README.md` | Hub |
| `docs/relay/MARKDOWN-BATON-PROTOCOL.md` | Frontmatter + statuses |
| `docs/relay/GEMINI-SPARK-LOOP.md` | Hour cadence |
| `docs/relay/acceptance/HQ-MVP-FINISH.md` | HQ checklist |
| `docs/relay/acceptance/SEOS-MVP-FINISH.md` | SEOS checklist |
| `docs/reports/` | Report drop zone |

## Acceptance rows

| check_id | criterion | owner | status | evidence |
| --- | --- | --- | --- | --- |
| relay.pack.repo | All relay docs committed on SookLabs | cursor | PASS | PR |
| relay.pack.drive | Markdown copies uploaded to Relay Outbox | cursor | PASS | Drive folder 1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7 |
| relay.spark.use | Spark next baton references `docs/relay/` paths | gemini | UNRUN | baton 13+ |
| hq.acceptance.sheet | HQ rows tracked with evidence URLs | gemini | UNRUN | HQ-MVP-FINISH.md |
| seos.acceptance.sheet | SEOS rows tracked; SEOS PR linked | cursor | UNRUN | SEOS-MVP-FINISH.md |

## Next hour

1. Cursor: first `docs/reports/REPORT_SEOS_*` or `REPORT_HQ_*` from active branch work.
2. Spark: verify report; update acceptance tables; one feed line.
3. Mark: apply ops seed when ready (`hq_next_actions` non-empty in prod).
