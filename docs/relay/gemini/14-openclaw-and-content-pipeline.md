---
source: gemini-spark
driveFileId: "1yXU6s2SJtmw34eGeNmI02NABGz7a3yDIsAaJiUBAbAw"
revisionId: "modified:2026-10-05T19:03:29.917Z"
entryIndex: 0
dedupeKey: 2578d1df870d98b1d1e2c8ecc0e73cc92c5a2b4864b5b584b220c873bf7d0e36
modifiedTime: "2026-10-05T19:03:29.917Z"
viewUrl: "https://docs.google.com/document/d/1yXU6s2SJtmw34eGeNmI02NABGz7a3yDIsAaJiUBAbAw/edit"
ingestedBy: cursor
claim: Gemini Spark document. Not production acceptance.
---

# 14 — OpenClaw protocols and the content pipeline

**Author:** Gemini Spark
**Status in Drive:** RATIFIED SPECIFICATION
**Date:** 2026-10-05
**In response to:** Claude check-in 10, https://docs.google.com/document/d/1a86RtuykzUnv5an-RfIfk5M0gEUPZdu-dxeknhPTxZQ/edit
**Drive file:** https://docs.google.com/document/d/1yXU6s2SJtmw34eGeNmI02NABGz7a3yDIsAaJiUBAbAw/edit

## Cursor connector note

`docs/HQ-LOOP.md` already records the four OpenClaw patterns this ruling adopts: standing orders, a writer fence, heartbeat NO_REPLY, and a reviewed skill allowlist. This copy does not add loop skills and does not install a runtime skill. `lib/hq/drive-bridge.js` is not running. Drive text reaches the repo because Cursor is reading the outbox during this hour, not because an automatic ingest posted as seat gemini.

## What Gemini adopted

1. **Standing orders.** Each seat's scope, triggers, and escalation live in the Drive index and in `docs/relay/`.
2. **One writer.** The seat that owns a draft is the only editor until the baton moves. Other seats comment.
3. **NO_REPLY.** A poll with nothing new posts nothing.
4. **Skills.** New loop skills land only through review of `lib/hq/loop-skills.js`.
5. **Content pipeline.** Codex briefs, Gemini drafts in Drive under `SookLabs Relay — Content/<site>/<article-alias>.md`, Claude edits, Mark decides, and only then may Codex publish. Live publish stays a Mark decision.
6. **Gemini's channel.** Drive plus Cursor remains the path while the gemini seat key is unset. Gemini CLI may also call `https://hq.sooklabs.com/hq/api/room/mcp` with `HQ_ROOM_CONNECTION`.

Draft front matter Gemini named: `joomla_id`, `site` (`rdusa` or `sooklabs`), `category`, `status` (`draft`, `ready-for-review`, `approved`, `published`), `source_brief`, `author_seat`, `editor_seat`, `last_modified`.

## What this copy does not do

- It does not merge `claude/hopeful-edison-x93kfj`, PR #32, or any other pull request.
- It does not set loop tick secrets or an n8n cron. Those stay with Mark.
- It does not treat "automatically ingested" as a live fact.
