# HQ Control Plane / MCP Gateway

## Purpose

HQ is the private operating control plane for SookLabs. It is not another specialist product and it must not duplicate Sookly or SEOS domain logic.

HQ answers four questions:

1. What is happening across the active businesses/products?
2. What is blocked or waiting for approval?
3. What is the next bounded action?
4. What evidence proves progress or business value?

## Active fronts

- Sookly Journey / CRM
- SEOS Social Control Plane
- RDUSA Internal Retainer Control
- HQ / MCP Gateway

## RDUSA value-expansion path

Current engagement truth remains the USD 1,500/month SEO, content, social and growth-support retainer.

Potential expansion is tracked as opportunity, not assumed revenue:

1. Sookly website receptionist pilot.
2. CRM + deterministic customer Journey from enquiry through quote/payment/fulfilment/follow-up.
3. Central operations sync across customer, order/quote and operational evidence.

The authoritative RDUSA pilot finish line is [`docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md`](./RDUSA_PILOT_ACCEPTANCE_CONTRACT.md). Journey work is pilot ready only when that contract's Golden Rule is met. The control-plane field `rdusaPilotContract` is the current scorecard snapshot. It is not a second definition, and it does not say the pilot is ready.

## Retainer delivery scores

Marketing and operations retainers are a separate score from the Journey pilot and from the four engineering fronts. Jaka is not a fifth front.

HQ and MCP relays cite only these control-plane fields when judging whether a promised day, week, month, or 90-day window passed or failed:

- `rdusaRetainerContract` — [`docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md`](./RDUSA_RETAINER_DELIVERY_CONTRACT.md)
- `jakaRetainerContract` — [`docs/JAKA_RETAINER_DELIVERY_CONTRACT.md`](./JAKA_RETAINER_DELIVERY_CONTRACT.md)
- `retainerDelivery` — thin index of both clients, their period rollups, and `retainerHealthy`

The retainer Golden Rule is: we keep the retainer when promised day/week/month delivery criteria PASS with evidence, and HQ/MCP is the only score source relays may cite.

`asOf` on those snapshots is the score date. `generatedAt` on the control plane is the server clock. Mark may move the 1 Oct–29 Dec 2026 window. The Jaka fee is unconfirmed.

The same snapshots render at `/hq/retainers` and as a summary on `/hq`. Reading them does not publish, merge, migrate, or deploy. No write tool may mark a retainer criterion PASS without evidence, and none may bypass Mark's token, merge, login, or spend gates.

Journey Prism swarm sequencing (architecture only, not a scorecard): [`docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md`](./RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md). That note records sookly-omnichat PR #60 as merged on 1 Oct 2026. Remaining Journey ship gates named there are production migrate, production deploy, `ai-safety-product`, `four-dimensions-in-product`, staging smoke, and live pilot 10–20. `docs/LLM_STATUS.md` is not on this branch. Once this PR is merged and HQ is deployed, the intended surfaces are `/hq` (COORDINATION / LLM lane) and `/hq/retainers` (RDUSA panel). `/clients/rdusa` Client HQ is SPEC-only and is not built.

Any commercial expansion should be supported by demonstrated value and explicit agreement.

## MCP surface

The first MCP release is read-first. It exposes the same normalized truth used by the HQ UI.

Planned read tools:
- `hq_status`
- `project_status`
- `pending_approvals`
- `rdusa_value_expansion`
- `retainer_delivery`
- `next_actions`

Planned controlled-write tools:
- `dispatch_bounded_agent_job`
- `record_decision`
- `update_project_status`
- `approve_action`

Write-capable tools require explicit policy and approval receipts. No MCP tool may directly bypass merge, deployment, production migration, credential, billing/spend or external-publishing approval gates.

## Transport

Remote HQ MCP uses Streamable HTTP. Local Cursor/CLI compatibility can use stdio. The implementation should use the current stable TypeScript MCP SDK and keep transport/auth concerns separate from domain tools.

## Source of truth

UI and MCP must consume one normalized control-plane read model. The first implementation is `lib/hq/control-plane.js`, exposed to the signed-in HQ UI through `/hq/api/control-plane`.

Current percentages in `lib/hq/four-fronts.js` cite a verified `evidenceSha` per front. The control-plane snapshot adds a computed `insight` per front and a `schedule` review horizon for 2–31 Oct 2026. Open draft PRs are review gates and stay below 100 until Mark merges. GitHub event ingestion can replace this static record later.
