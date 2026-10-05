# SookLabs relay — Gemini Spark ↔ repository loop

This folder is the **repo-side mirror** of the [SookLabs Relay Outbox](https://drive.google.com/drive/folders/1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7) on Google Drive. Use it so **Gemini Spark** (specs / contract authority) and **implementers** (Cursor, Claude, Codex) can exchange work without Mark as a message bus.

## Authority (read this first)

| Layer | Wins on conflict |
| --- | --- |
| Product acceptance | Canonical files in each repo (see below) |
| HQ mechanics | `docs/HQ-MCP-CONTROL-PLANE.md`, `docs/HQ-DEVELOPER.md`, `docs/HQ-LOOP.md` |
| Relay / Spark | This folder + Drive batons **coordinate**; they do not override acceptance |

Older Drive docs that mention Drizzle `agent_events` or `/api/hq/events` are **superseded** by [CANONICAL-TRUTH.md](./CANONICAL-TRUTH.md) (Postgres room + `/hq/api/room/stream`).

## Files in this folder

| File | Purpose |
| --- | --- |
| [00-INDEX.md](./00-INDEX.md) | Numbered index aligned with Drive batons |
| [GEMINI-SPARK-LOOP.md](./GEMINI-SPARK-LOOP.md) | Where Spark sits in the hour loop |
| [MARKDOWN-BATON-PROTOCOL.md](./MARKDOWN-BATON-PROTOCOL.md) | `.md` schema, filenames, check statuses |
| [DRIVE-SYNC.md](./DRIVE-SYNC.md) | Drive IDs, ingest rules, what never goes on Drive |
| [CANONICAL-TRUTH.md](./CANONICAL-TRUTH.md) | HQ + SEOS SoT vs stale relay specs |
| [acceptance/HQ-MVP-FINISH.md](./acceptance/HQ-MVP-FINISH.md) | HQ swarm / MCP finish line |
| [acceptance/SEOS-MVP-FINISH.md](./acceptance/SEOS-MVP-FINISH.md) | SEOS MVP finish line (repo pointers + open gates) |
| [templates/](./templates/) | Copy-paste baton and report templates |

## Live surfaces

| Surface | URL / path |
| --- | --- |
| HQ room | https://hq.sooklabs.com/hq/room |
| Room MCP | https://hq.sooklabs.com/hq/api/room/mcp |
| Room SSE | `/hq/api/room/stream?channel=room` |
| Drive event feed | [00_ROOM_EVENT_FEED](https://docs.google.com/document/d/1pAiSqJJsIEZQARpZG5qgIVwK_Hkm6amM7BdbQkKqO60/edit) |
| Implementation reports (repo) | `docs/reports/` |

## One-hour loop (Mark + Spark + repo)

1. **Spark** publishes or updates a baton in Drive (and optionally commits the same text under `docs/relay/batons/`).
2. **Mark** posts one objective in the HQ room (or `@cursor` / `@claude` with baton id).
3. **Implementer** executes on branch, writes `docs/reports/REPORT_<front>_<date>.md`, opens PR.
4. **Spark** reads report + PR diff, updates checklist section in the baton, appends one line to `00_ROOM_EVENT_FEED` (no secrets).
5. **Codex** runs smoke / E2E where assigned; extends report with PASS / NOT_MET / UNRUN.
6. **Mark** promotes decision or merges when acceptance rows are green **in the required environment**.

Gemini seat in HQ: `gemini` — MCP pull or operator relay; pairing via room enroll, not pasted keys.
