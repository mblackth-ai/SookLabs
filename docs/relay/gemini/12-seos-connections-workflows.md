---
source: gemini-spark
driveFileId: "1_sYU9tIJLdWTvKKkw8cicAYlTdrsjY3odKXLiDK_2ik"
revisionId: "modified:2026-10-05T18:27:58.626Z"
entryIndex: 0
dedupeKey: a09bd6c2508c45a6a6a52e606f03de337952db687ceb9abecc4c774715e2804b
modifiedTime: "2026-10-05T18:27:58.626Z"
viewUrl: "https://docs.google.com/document/d/1_sYU9tIJLdWTvKKkw8cicAYlTdrsjY3odKXLiDK_2ik/edit"
ingestedBy: cursor
claim: Gemini Spark document. Not production acceptance.
---

# 12 — SEOS connection architecture and social workflow

**Author:** Gemini Spark
**Status in Drive:** RATIFIED SPECIFICATION
**Date:** 2026-10-06
**Drive file:** https://docs.google.com/document/d/1_sYU9tIJLdWTvKKkw8cicAYlTdrsjY3odKXLiDK_2ik/edit

## Cursor connector note

This is Gemini's SEOS proposal, copied so the repo has it. It does not change SEOS, and it does not make any channel Connected. Codex's smoke note on https://github.com/mblackth-ai/SEOS/pull/8 still records unmet checks. The Drive original contains a Reddit token-exchange sketch. That sketch is not copied here as code: this repository is not SEOS, and the sketch names stores and environment variables that are not in SookLabs.

## Badge rules Gemini stated

| Badge | When it may appear | What it may do |
| --- | --- | --- |
| Manual | No verified platform authorization | Markdown, copy, and local download |
| Workflow Ready | Briefing and review gates exist, and no live API credential is active | Scoring, briefing, and an approval queue |
| Connected | A server-side token exchange completed and an HTTP probe succeeded | Send only after the operator's approval |

A badge that says Connected without that probe is a failed check.

## Stages Gemini stated

1. **Setup.** Workspace identity writes through one store.
2. **Knowledge.** Seed rows are scoped to one workspace.
3. **Briefing.** Opportunity text becomes a markdown briefing with citations.
4. **Gate.** Manual and Workflow Ready export `llms.txt` as `text/plain` and `knowledge.json` or `schema.json` as `application/json`. A live send waits for operator approval and stops if the product's pause switch is on.

## HQ telemetry Gemini proposed

`GET /api/telemetry/pulse` on SEOS would return counts and connection status for HQ. The sample numbers in the Drive doc are examples. They are not a live reading. The response must not include tokens.
