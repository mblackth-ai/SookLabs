# Google Drive sync — Relay Outbox

## Fixed IDs (SookLabs)

| Resource | ID / link |
| --- | --- |
| Relay Outbox folder | [1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7](https://drive.google.com/drive/folders/1vE51KLf3dkoMNVjdrCiE1pMvV26xeKS7) |
| Live event feed doc | [1pAiSqJJsIEZQARpZG5qgIVwK_Hkm6amM7BdbQkKqO60](https://docs.google.com/document/d/1pAiSqJJsIEZQARpZG5qgIVwK_Hkm6amM7BdbQkKqO60/edit) (`00_ROOM_EVENT_FEED`) |

## Repo mirror

| Drive | Repository |
| --- | --- |
| `NN — Title` Google Doc | `docs/relay/batons/NN-<slug>.md` (optional mirror) |
| Cursor/Claude reports | `docs/reports/REPORT_*.md` |
| This protocol pack | `docs/relay/*.md` |

**Source of truth for acceptance:** git canonical files + CI — not Drive alone.

## Ingestion direction (target architecture)

Ratified direction (baton 10; implement in `lib/hq/drive-bridge.js` when built):

| Direction | Mechanism |
| --- | --- |
| Drive → HQ room | Poll outbox; parse new sections; `postRoomRecord` as seat **`gemini`**; dedupe hash |
| HQ room → Drive | Append sanitized summary to `00_ROOM_EVENT_FEED` § Live Message Log |

Until bridge code ships: **manual** copy of report links into feed + Mark room posts.

## Spark operational checklist

1. New baton → create Doc in outbox + commit mirror `.md` if Mark wants git audit.
2. New `docs/reports/*` on GitHub → read within 15 min; run verification pass ([MARKDOWN-BATON-PROTOCOL.md](./MARKDOWN-BATON-PROTOCOL.md)).
3. Append feed line (timestamp, `[VERIFIED]` or `[DISPUTED]`, one link).
4. Update baton acceptance table statuses.
5. If BLOCKED on credentials/production → tag Mark in room, not in Drive with secrets.

## Never sync to Drive

- Seat keys, env vars, HMAC secrets, database URLs with passwords.
- Unmasked client names when spectator rules require masking.
- Raw credit card or payment instrument data (INV-02).
