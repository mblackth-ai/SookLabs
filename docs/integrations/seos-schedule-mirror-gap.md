# Gap note: HQ ↔ SEOS schedule mirror

Status: **gap note**, not a spec. Build last (after Quo slice), once SEOS
exposes a stable read API. Written from the SookLabs side only — the SEOS repo
was not readable in the session that wrote this, so every SEOS-side item below
is a question, not a claim.

## Principle

SEOS Publication Jobs and connectors are the source of truth for scheduled
posting. HQ **mirrors** status read-only. HQ must not schedule, publish, retry
or edit posts, and must not keep its own copy of the schedule as truth — the
same rule HQ already follows for Authority ("Authority SoT remains in SEOS
Prisma", `HQ-DEVELOPER.md` §5).

## What already exists (SookLabs)

| Piece | Where | Reuse |
| ----- | ----- | ----- |
| Service token HQ→SEOS | `SEOS_HQ_API_TOKEN` (both apps) | Same token for a schedule read endpoint. |
| SEOS base URL | `SEOS_INTERNAL_URL` / `NEXT_PUBLIC_SEOS_URL` | Same. |
| Pull client pattern | `lib/hq/authority-client.js` → `GET /api/authority/hq-summary` | Copy for `readPublicationSummary()`; same `configured:false` / `ok:false` degradation. |
| SEOS front evidence | `lib/hq/four-fronts.js` (`seos-social`, draft SEOS #2) | Unchanged; mirror is not front evidence. |
| Event log | `hq_events` (ADR 2026-10) | Holds SEOS webhooks if/when SEOS emits them. |

## Gaps

| # | Gap | Owner | Needed before mirror |
| - | --- | ----- | -------------------- |
| 1 | No SEOS read endpoint for Publication Jobs. Proposal: `GET /api/publication/hq-summary?from&to` (token-auth like `hq-summary`). | SEOS | Yes |
| 2 | No agreed job status vocabulary in HQ. Need SEOS's lifecycle states (from the lifecycle in SEOS #2) mapped 1:1, not renamed. | SEOS → HQ | Yes |
| 3 | No mapping from SEOS business/workspace → HQ `clientId` (`rdusa`, `jaka`). Proposal: SEOS returns its business id; HQ maps it in `lib/hq/seos-routing.js` (git, no PII), like Quo. | Both | Yes |
| 4 | No SEOS webhooks. Pull-only until SEOS emits signed events; then they land in `hq_events` with `source='seos'`. | SEOS | No (pull first) |
| 5 | Retainer criteria like `rdusa-daily-ig-publish` / `jaka-daily-fb-buffer` describe publishing. The mirror may **show** matching jobs next to a criterion, but never set PASS — evidence stays a reviewed contract change. | HQ | Rule only |
| 6 | SEOS attack-calendar + thin MCP (list businesses / jobs / results) is paused. HQ MCP should **call** that, not re-expose a copy, once it exists. | SEOS | Decide then |
| 7 | Time zone: retainer periods are `Asia/Bangkok`. SEOS must return UTC instants; HQ buckets into Bangkok days. | Both | Yes |

## Minimum read payload HQ needs from SEOS (proposal)

```json
{
  "generatedAt": "2026-10-02T03:00:00Z",
  "jobs": [
    {
      "id": "…",
      "businessId": "…",
      "channel": "instagram",
      "scheduledFor": "2026-10-02T02:00:00Z",
      "status": "<SEOS lifecycle state>",
      "publishedAt": null,
      "url": null,
      "lastError": null
    }
  ]
}
```

## HQ side when unblocked (small)

`lib/hq/publication-client.js` (pull, cached per request) → optional
`publications` summary on the control plane (counts by client/status for
today and this week) → MCP read tool `scheduled_posts` (listed as _planned_
in `hq-mcp-read-tools.yaml`, not specified until gap 1–3 close).
