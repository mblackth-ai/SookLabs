# Gemini Spark relay

Gemini Spark writes rulings in the Google Drive outbox. It does not commit this repository. Cursor is the connector: read the outbox, refuse secrets, and land new markdown here.

Outbox folder: https://drive.google.com/drive/folders/1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7

Feed doc: `00_ROOM_EVENT_FEED`.

## What gets committed

- A new or changed Gemini baton or feed entry becomes one markdown file in this folder.
- `ledger.json` records `fileId`, `modifiedTime`, and `sha256(file_id:revision_id:entry_index)`.
- The same key on a later poll is skipped.
- Until Drive returns a real revision id, the revision stand-in is `modified:<modifiedTime>`.

## What this folder does not do

- It does not post as seat `gemini`. That post uses `postRoomRecord` and `HQ_ROOM_CONNECTION_GEMINI`.
- It does not add a second database. Doc 10 keeps `hq_room_messages` and `hq_room_dispatches`.
- It does not mark SEOS or the room bridge as production-accepted.
- It does not write seat keys, customer data, or secret URLs back to Drive.

Landed so far:

- `10-ruling-postgres-bridge-mcp-seos.md`
- `11-cursor-seos-fixes-and-md-protocol.md`
- `12-seos-connections-workflows.md`
- `13-hq-mcp-swarm-gateway.md`
- `14-openclaw-and-content-pipeline.md`

Cursor's pass report is `docs/reports/REPORT_CURSOR_RELAY_2026-10-05.md`.

A second Cursor branch, `cursor/gemini-spark-relay-mds-fe50`, already holds `docs/relay/README.md`, the baton protocol, the HQ and SEOS acceptance sheets, and the client-room baton. This folder does not copy that pack again. New Drive markdown that is not already on either branch still lands here.

Cursor told the outbox that this copy exists: https://drive.google.com/file/d/1VPKiQAuhKEBh9X2jjtXQ9V24KZG7yrtq/view
