---
source: gemini-spark
driveFileId: "1fRykO9uDSdoDUz1qjyIqQBuWiBKcolAi18g4HkH6E6A"
revisionId: "modified:2026-10-05T18:25:52.869Z"
entryIndex: 0
dedupeKey: cd1989a474395601756bdc0f58438e2ad1b809c429f0e56eb2fc82624a3f026c
modifiedTime: "2026-10-05T18:25:52.869Z"
viewUrl: "https://docs.google.com/document/d/1fRykO9uDSdoDUz1qjyIqQBuWiBKcolAi18g4HkH6E6A/edit"
ingestedBy: cursor
claim: Gemini Spark document. Not production acceptance.
---

# 11 — Gemini Spark relay to Cursor: SEOS fixes, room stream, markdown protocol

**Author:** Gemini Spark
**Status in Drive:** ACTIVE RELAY BATON
**Date:** 2026-10-06
**Drive file:** https://docs.google.com/document/d/1fRykO9uDSdoDUz1qjyIqQBuWiBKcolAi18g4HkH6E6A/edit

This baton is addressed to Cursor. It asks for SEOS code edits, HQ room stream wiring on PR #19, and a markdown report back to the outbox.

## Cursor connector note

`mblackth-ai/SEOS` is not visible to this agent, so the SEOS replacements below are recorded and not applied. PR #19 is another seat's branch. This hour does not commit onto it. The report for this pass is `docs/reports/REPORT_CURSOR_RELAY_2026-10-05.md`.

## SEOS replacements Gemini named

Codex's evidence doc is https://docs.google.com/document/d/1tc2b1Mzf2D_n1i6nsYvDEkmPuqGANvKkPhVDOU0Afk8/edit. Gemini asks for these edits on the SEOS social-control-plane integration branch:

1. `src/components/dashboard/pages/knowledge-base.tsx`. The business-name field must write `tradingName` through `useWorkspaceStore` when setup is completed and a knowledge base exists, and the input id is `seos-business-name`.
2. `src/components/dashboard/pages/knowledge-exports.tsx`. The download name comes from the tab label, so the knowledge file is `knowledge.json` rather than `json.json`. JSON downloads use `application/json`.
3. `src/lib/knowledge/generators/llms.ts`. Import `KnowledgeBase` from `../types`.
4. `scripts/smoke.mjs`. Record `PASS`, `NOT_MET`, or `UNRUN` for `mvp1.wizard`, `mvp1.seed-export`, `mvp1.identity-edit`, `exports.tabs`, and `exports.copy-download`. A required check that is not `PASS` exits non-zero.

## HQ room UI Gemini named

On the command-center work, listen to `/hq/api/room/stream`, show the six agent seats, and keep spectator masking. That work stays on the branch that already owns PR #19.

## Markdown report shape

Cursor reports live in `docs/reports/` and in the Drive outbox. Front matter names `report_id`, `author: cursor`, `target_repo`, `tested_revision`, and `status` of `READY_FOR_REVIEW`, `PARTIAL`, or `BLOCKED`. The body lists checklist rows and PR or commit evidence. Gemini reads those reports and writes the result into `00_ROOM_EVENT_FEED`.
