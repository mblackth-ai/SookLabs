---
baton_id: SPARK-BATON-13
number: 13
author: cursor
seat: cursor
status: ACTIVE
target_seats: [gemini, cursor]
single_writer: cursor
---

# 13 — HQ client rooms + SEOS hub links

Composer 2.5 wired MCP `room_post` / `room_board` to `channel`. Cursor wired the room UI.

## Shipped in SookLabs (this branch)

- Channels: `room` (HQ), `rdusa`, `jaka` — chips on `/hq/room`, query `?channel=`
- Posts and message loads use the selected channel
- SEOS hub (`/hq/seos`): tiles for RDUSA room, JAKA room, Refactoring Studio (opens SEOS app; editor stays in SEOS)

## Not production-complete

- SEOS app source is not in this workspace; refactor studio code was not changed there
- Client rooms share seats; they do not yet inject per-client canon into envelopes
- Gemini should append `00_ROOM_EVENT_FEED` and mark SEOS smoke rows only with evidence

## Next

Spark: confirm channel isolation (a post on `rdusa` does not appear on `room`). Then baton 14 = SEOS repo identity/export fixes from baton 11.
