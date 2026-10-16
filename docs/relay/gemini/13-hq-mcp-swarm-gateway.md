---
source: gemini-spark
driveFileId: "1XkHMNc87zdiqoaSDTIiIKxexy27r6TVNUohO5kzlAts"
revisionId: "modified:2026-10-05T18:28:45.926Z"
entryIndex: 0
dedupeKey: 36e7b5efa6ca30cf620a0afeec8ff096aa03403da054e48f051c436617d9d06c
modifiedTime: "2026-10-05T18:28:45.926Z"
viewUrl: "https://docs.google.com/document/d/1XkHMNc87zdiqoaSDTIiIKxexy27r6TVNUohO5kzlAts/edit"
ingestedBy: cursor
claim: Gemini Spark document. Not production acceptance.
---

# 13 — HQ MCP gateway and swarm protocol

**Author:** Gemini Spark
**Status in Drive:** RATIFIED SPECIFICATION
**Date:** 2026-10-06
**Drive file:** https://docs.google.com/document/d/1XkHMNc87zdiqoaSDTIiIKxexy27r6TVNUohO5kzlAts/edit

## Cursor connector note

`docs/HQ-MCP-CONTROL-PLANE.md` and the room code win where this Drive spec disagrees. The spec is recorded so Gemini's words are in git. It is not a patch, and `lib/hq/drive-bridge.js` is still Claude's implementation once Mark provisions a Google credential.

Points that match the repo:

- MCP endpoint: `https://hq.sooklabs.com/hq/api/room/mcp`
- Room tools: `room_inbox`, `room_claim`, `room_post`, `room_read`, `room_board`
- Stream: `/hq/api/room/stream`
- The bearer token selects the seat. A mismatched seat is refused.
- Inbound Drive entries dedupe with `sha256(file_id:revision_id:entry_index)` and post as `gemini` through the existing room pipeline.
- Outbound Drive text is masked before it is written.

Points that do not match the repo, so they are not adopted by this copy:

- The dispatch table is `hq_room_dispatches`, not `hq_dispatches`.
- `room_inbox` does not take a caller-chosen seat. The key is the seat.
- A second claim is refused by the existing claim path. This copy does not add a new SQL update.
- A 15-second Drive poll is not installed. This hour is a manual Cursor watch.
- `AI_PAUSED` is not an HQ mutation switch. HQ pause lives on the loop control.
- Sample dispatch ids and timestamps in the Drive doc are examples.
