# Quo integration (inbound call webhooks)

Status: **spec only** — no code. Data model: [`../adr/2026-10-hq-event-ingest.md`](../adr/2026-10-hq-event-ingest.md).
MCP reads: [`../openapi/hq-mcp-read-tools.yaml`](../openapi/hq-mcp-read-tools.yaml).

Quo (formerly OpenPhone) sends call events to HQ. HQ stores them, attaches
each call to a retainer client, and turns Quo's suggested next steps into
**proposed** tasks that Mark accepts or rejects. Nothing is written back to Quo.

## Events

Quo API version `2026-03-30`. Every event uses one envelope:

```json
{
  "id": "EV123",
  "apiVersion": "2026-03-30",
  "createdAt": "2026-04-13T12:00:00.000Z",
  "type": "call.summary.completed",
  "data": {
    "resource": { "...": "depends on type" },
    "context": {
      "orgId": "OR123",
      "phoneNumberId": "PN123",
      "conversationId": "CN123",
      "phoneNumberType": "shared",
      "userId": "US123",
      "contacts": { "ids": ["CT123"], "lookupStatus": "matched" },
      "participants": { "workspace": ["+1555…"], "external": ["+1555…"], "resolution": "available" }
    },
    "links": { "quo": "https://my.quo.com/inbox/..." }
  }
}
```

| Event | `data.resource` fields HQ reads | HQ action |
| ----- | ------------------------------- | --------- |
| `call.completed` | `id`, `direction`, `status`, `createdAt`, `answeredAt`, `completedAt`, `duration`, `hasVoicemail` | Upsert call by `id`. |
| `call.transcript.completed` | `callId`, `processingStatus`, `dialogue[]` (`userId`, `identifier`, `content`, `start`, `end`) | Upsert call by `callId`, store dialogue. |
| `call.summary.completed` | `callId`, `processingStatus`, `summary[]`, `nextSteps[]` | Upsert call by `callId`, store summary; one proposed task per `nextSteps` item. |
| any other `call.*` / `message.*` | — | Store in the event log, mark `ignored`. |

Transcript and summary events are independent: they can arrive in any order,
before or after `call.completed`, and can be redelivered. Every handler
**upserts by call id** and is safe to replay.

Payload source: Quo `2026-03-30` doc examples, mirrored in
[hookdeck/webhook-samples `providers/quo/2026-03-30`](https://github.com/hookdeck/webhook-samples/tree/main/providers/quo).
Use those three files as test fixtures.

## Endpoint

`POST /hq/api/webhooks/quo` (on `hq.sooklabs.com`: `POST /api/webhooks/quo`).

- Add to `isOpenPath` in `middleware.js`. The route authenticates by Quo
  signature, the same way `agents/callback` authenticates by shared secret.
- Read the **raw body** before parsing; the signature is over raw bytes.
- Order: verify signature → check timestamp (±5 min) → insert event by `id`
  (already present → `200 { ok: true, duplicate: true }`) → process → `200`.
- A processing error after the event is stored still returns `200` and marks
  the event `error`, so it can be replayed from HQ instead of being retried by
  Quo indefinitely.
- Bad or missing signature, or stale timestamp → `401`, nothing stored.

## Signature

`2026-03-30` webhooks use Standard Webhooks headers:

| Header | Value |
| ------ | ----- |
| `webhook-id` | Event id (same as envelope `id`) |
| `webhook-timestamp` | Unix seconds |
| `webhook-signature` | Space-separated `v1,<base64>` entries |

```
signed   = `${webhook-id}.${webhook-timestamp}.${rawBody}`
key      = base64decode(secret with any "whsec_" prefix removed)
expected = base64(HMAC-SHA256(key, signed))
valid    = some v1 entry === expected   // timingSafeEqual
```

Legacy (only if the webhook is created on Quo's unversioned v1 API): header
`openphone-signature: hmac;1;<timestamp_ms>;<base64>`, signed data
`${timestamp}.${rawBody}`, key = base64-decoded signing secret.

Env (names only; values in Vercel, never in git):

| Var | Purpose |
| --- | ------- |
| `QUO_WEBHOOK_SECRET` | Signing secret from the Quo webhook settings |
| `QUO_WEBHOOK_SCHEME` | `standard` (default) or `legacy` |

> To confirm when creating the webhook in Quo: exact secret format, and
> whether a single webhook can subscribe to all three call events.

## Client mapping

Calls are attached to the same `clientId`s the retainer contracts use
(`rdusa`, `jaka` — see `lib/hq/*-retainer-contract.js`).

`lib/hq/quo-routing.js` — in git, no personal data:

```js
/** Quo workspace line (data.context.phoneNumberId) → HQ clientId. */
export const QUO_PHONE_NUMBER_ROUTES = {
  // "PNxxxxxxxx": "rdusa",
  // "PNyyyyyyyy": "jaka",
};
```

Rules:

1. `data.context.phoneNumberId` in the map → that `clientId`.
2. Otherwise `clientId = null` (unassigned). Shown in HQ for Mark to assign.
3. A manual assignment wins over the map and is never overwritten by replay.
4. External phone numbers and contact names are never committed to git.

Open: which Quo lines belong to RDUSA and Jaka, and whether Sookly's own line
is in scope.

## Guardrails

- A call, transcript, summary or proposed task is **not** retainer evidence.
  Nothing in this integration may set a retainer criterion to PASS.
- Proposed tasks only become `todo` through the signed-in HQ UI. No MCP tool
  writes.
- Transcripts live in Postgres only — never in git, never in the `hq_ops` blob.
- No outbound calls, SMS or writes to Quo.

## Acceptance (for the implementation PR)

1. The three fixture payloads, correctly signed → `200`; wrong signature → `401`; timestamp 10 min old → `401`.
2. Same event twice → one stored event, second response `duplicate: true`.
3. Deliver summary, then transcript, then completed → one complete call.
4. `nextSteps: ["Send follow-up email."]` → one proposed task; replay → still one.
5. Unmapped `phoneNumberId` → unassigned call.
6. Retainer snapshots unchanged by any of the above.
7. `npm run lint` and `npm run build` pass; `npm run hq:verify-deploy` still green.
