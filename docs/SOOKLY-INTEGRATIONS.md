# Sookly integrations — email, Quo, calendar, Xero

Statuses follow HQ honesty rules: **Manual**, **Workflow Ready**, **Connected** (only with production evidence).

## Email (Resend) ↔ Journey

**Goal:** Every inbound/outbound message on a case timeline becomes `journey_case_events` with type `email.inbound` / `email.outbound`.

**Planned app path**

1. Inbound: Resend receiving webhook → `POST /api/integrations/email/inbound`
2. Match `From` / `To` to `contacts.email` or create lead
3. Append event; run stage classifier (assist)
4. Outbound: send via Resend from case composer; store `message_id` on event

**HQ today:** Resend used for sooklabs.com contact form only. Do not claim Sookly CRM email sync until app deploy proves it.

## Quo (transcripts & SMS)

Quo exposes a **versioned webhook API** (header `Quo-Api-Version: 2026-03-30`).

**Recommended subscription events**

- `call.transcript.completed` — full dialogue segments + `callId`
- `message.received` — SMS thread sync
- `contact.updated` — keep Quo ↔ Sookly contact ids aligned

**Planned app path**

1. `POST /api/integrations/quo/webhook` with HMAC verify (`webhook-signature`)
2. Idempotency: store `webhook-id` header
3. Map `data.context.contacts.ids` to Sookly contact
4. For transcripts: attach summary + link `data.links.quo` on case timeline
5. Optional poll: `GET /v1/call-transcripts/{callId}` (Business/Scale plans)

Docs: https://www.quo.com/docs/2026-03-30/webhooks-overview

**Env (app):** `QUO_API_KEY`, `QUO_WEBHOOK_SECRET`, signing secret from Quo dashboard.

## Calendar booking

Reference UX: `_reference/.../ui_kits/sookly/data.jsx` (`ST.new | assigned | booked`).

**Planned:** public booking page → creates `calendar.booking.confirmed` event → stage `qualify` or dedicated `booked` lane on contacts kanban.

## Xero

Use OAuth in app or MCP in HQ for **suggestions**:

- `create-quote` at customer quote stage
- `create-invoice` ACCREC after payment
- `create-invoice` ACCPAY after supplier confirm

Always show deep link returned by Xero tools; never auto-submit without operator gate.

## Supplier websites

Manual evidence: URL, timestamp, operator, optional screenshot hash. Feeds automation backlog when the same supplier repeats.

## Signal router (shared logic)

`lib/sookly/journey-signal-router.js` (SookLabs HQ mirror; copy to app repo):

- `classifyEmailSignal` — inbound/outbound + subject/body hints (quote, PO, payment, tracking, issues)
- `mapQuoWebhookToSignal` — `call.transcript.completed`, `message.received`, `call.completed`
- `suggestStageFromSignal` — assist-only stage transitions + Xero suggest hooks
- `supplierLoopDue` — highlight when the supplier is the next actor in the loop

HQ `/hq/sookly/journey` surfaces pilot cases, **Suggested next actions**, and routing examples until the app ingests live events.

## Next engineering slices (app repo)

1. `journey_cases` + `journey_case_events` tables
2. Contacts kanban view = group by `stageId`
3. Quo webhook receiver + tests
4. Resend inbound route + idempotency
5. Replace HQ `PILOT_CASES` with `GET /api/journey/cases` sync
