# Sookly Journey — RDUSA B2B order SOP (HQ mirror)

Authority for PASS/FAIL remains `sookly-control/release-matrix.md` in **mblackth-ai/sookly-omnichat**. This document is the HQ-readable mirror of the operational journey until that repo is linked in CI.

## Purpose

One **deterministic case** per prospect order: every message, call transcript, email, calendar booking, supplier touchpoint, quote, payment, shipment, and Xero artifact links to the same `journey_case_id`.

## Stage flow (summary)

| # | Stage | Who waits | Automation default |
|---|--------|-----------|-------------------|
| 1 | Inquiry | Operator | auto — ingest Quo/email/chat |
| 2 | Qualify | Operator | assist |
| 3 | Supplier research | Operator | **manual** (portal login) |
| 4 | Awaiting supplier | Supplier | assist |
| 5 | Build customer quote | Operator | assist + Xero quote suggest |
| 6 | Quote sent | Prospect | auto follow-up timer |
| 7 | Payment pending | Prospect | assist + Xero AR invoice suggest |
| 8 | Confirm with supplier | Operator | **manual** portal order |
| 9 | Supplier fulfilment | Supplier | assist |
| 10 | Tracking shared | Prospect | auto email |
| 11 | Delivery confirm | Prospect | assist |
| 12 | Receipt / issue | Operator | assist (conditional) |
| 13 | Closed won | — | auto archive + learn |

Machine-readable definition: `lib/sookly/journey-model.js` (`RDUSA_B2B_JOURNEY`).

## Dual loops

Each case maintains:

- **prospect_next_due** — when the prospect owes a reply, payment, or confirmation.
- **supplier_next_due** — when the supplier owes pricing, confirmation, or tracking.

HQ and the app surface the **earlier** of the two as the operational “next loop” for the operator.

## Signals → stage hints

| Signal | Typical effect |
|--------|----------------|
| `email.inbound` | Attach to case; may advance from inquiry |
| `quo.call.transcript.completed` | Attach dialogue; extract intent for qualify |
| `calendar.booking.confirmed` | Often skips to qualify or quote_sent prep |
| `payment.card.authorized` | Advance to supplier_confirm |
| `shipment.tracking` | Advance to tracking_shared |
| `supplier.portal.manual` | Evidence row only; never auto-advance without operator |

## Xero (suggest-only)

| Stage | Suggested document | Type |
|-------|-------------------|------|
| Build customer quote | Sales quote | ACCREC quote |
| Payment pending | Customer invoice | ACCREC invoice |
| Confirm with supplier | Supplier bill / PO | ACCPAY invoice |

Creation is **suggested** in UI/MCP with operator approval until release-matrix rows say otherwise.

## Self-learning / automation backlog

Manual stages (supplier portal) log: duration, supplier id, operator, outcome. Monthly review promotes repeat flows from `manual` → `assist` (templates, saved logins in vault) → `auto` (API/EDI only when proven).

## HQ reporting

- Kanban: `/hq/sookly/journey`
- API: `GET /hq/api/sookly/journey` (session)
- Control plane field: `sooklyJourney` on `/hq/api/control-plane`
