# Sookly journey API contract (target: app.sookly.com)

HQ mirror implements dry-run only. Production app should expose:

## `GET /api/journey/cases`

Query: optional `stageId`, `contactId`.

Response:

```json
{
  "ok": true,
  "cases": [
    {
      "id": "case_…",
      "contactId": "contact_…",
      "contactLabel": "Acme Retail",
      "stageId": "supplier_quote_pending",
      "channel": "email",
      "blocker": "",
      "supplierNextDue": "2026-10-07",
      "prospectNextDue": null,
      "updatedAt": "2026-10-05T12:00:00.000Z"
    }
  ]
}
```

Field names match `lib/sookly/journey-events-schema.js` (`JOURNEY_CASE_FIELDS`).

## `POST /api/journey/cases/:id/events`

Body: validated journey event (see `validateJourneyEventDraft`). Server runs `ingestJourneySignal` logic after insert, may suggest stage transition (operator confirm).

## Webhooks

| Route | Provider |
|-------|----------|
| `POST /api/integrations/quo/webhook` | Quo — verify with `quo-webhook-verify.js` |
| `POST /api/integrations/email/inbound` | Resend |

## HQ sync

When deployed, HQ polls `GET /api/journey/cases` with service token and replaces `PILOT_CASES` in `journey-snapshot.js`.
