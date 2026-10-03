# Finish-line traceability — The Life Cycle diagram → acceptance rows

Agent: Claude (spec / gap-analysis seat) · 2026-10-03 ~14:00 UTC
Source of status: HQ control-plane snapshot (`/hq/api/control-plane` → `eightFronts`) on PR #7 `d47927a` + Claude B commits; definitions: `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md`. Statuses are the repo's own — this file does not promote anything.

**Overall:** 33% (eight-front mean). **Must rows:** 49 — NOT STARTED 36, PASS 9, BLOCKED 4.

**Contradiction to resolve:** SEOS shows **80%** (a recorded four-front estimate) while 6 of its 8 Must rows are NOT STARTED. Sookly app shows **76%** (pilot criteria) while APP-1…5 have no PASS. The percentages and the Must rows measure different things; neither is wrong, but "100%" must mean **all Must rows PASS with evidence**.


## 1–3 Incoming · Capture · Journey/CRM (Sookly)

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| APP-1 | NOT STARTED |  | Sookly seat / Cursor (sookly-omnichat) | — |
| APP-2 | BLOCKED |  | Sookly seat / Cursor (sookly-omnichat) | Mark gate: prod migrate/deploy approval (issue #8 HOLD-01) |
| APP-3 | BLOCKED |  | Sookly seat / Cursor (sookly-omnichat) | Waits on APP-2 + RDUSA pilot contract golden rule |
| APP-4 | NOT STARTED |  | Sookly seat / Cursor (sookly-omnichat) | — |
| APP-5 | NOT STARTED |  | Sookly seat / Cursor (sookly-omnichat) | — |
| WDG-1 | NOT STARTED |  | Claude (copy) · Cursor (embed) | — |
| WDG-2 | NOT STARTED |  | Claude (copy) · Cursor (embed) | — |
| WDG-3 | NOT STARTED |  | Claude (copy) · Cursor (embed) | — |
| WDG-4 | NOT STARTED |  | Claude (copy) · Cursor (embed) | — |
| WDG-5 | NOT STARTED |  | Claude (copy) · Cursor (embed) | — |
| JP-1 | NOT STARTED |  | Cursor (Sookly × HQ) | — |
| JP-2 | NOT STARTED |  | Cursor (Sookly × HQ) | — |
| JP-3 | NOT STARTED |  | Cursor (Sookly × HQ) | — |
| JP-4 | NOT STARTED |  | Cursor (Sookly × HQ) | — |
| JP-6 | NOT STARTED |  | Cursor (Sookly × HQ) | — |

## 4 Action & execution (approvals, n8n, handover)

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| HQ-6 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Claude: card schema exists in RDUSA_APPROVAL_TRIGGER_CARDS spec (PR #5) → Cursor builds Approve/Request changes/Hold |
| SW-2 | NOT STARTED |  | Mark + all seats (process) | — |
| SW-3 | NOT STARTED |  | Mark + all seats (process) | — |
| SW-4 | NOT STARTED |  | Mark + all seats (process) | Same build as HQ-6 |

## 5 Outreach (SEOS)

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| SE-1 | NOT STARTED |  | SEOS seat / Cursor (SEOS repo) | SEOS repo — no Claude access; SEOS seat |
| SE-2 | PASS |  | SEOS seat / Cursor (SEOS repo) | — |
| SE-3 | PASS |  | SEOS seat / Cursor (SEOS repo) | — |
| SE-4 | NOT STARTED |  | SEOS seat / Cursor (SEOS repo) | — |
| SE-5 | NOT STARTED |  | SEOS seat / Cursor (SEOS repo) | — |
| SE-6 | NOT STARTED |  | SEOS seat / Cursor (SEOS repo) | — |

## 6 Results · Analytics & insights

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| SE-7 | NOT STARTED |  | SEOS seat / Cursor (SEOS repo) | — |
| SE-8 | NOT STARTED |  | SEOS seat / Cursor (SEOS repo) | — |
| REV-4 | PASS |  | Mark (contracts) · HQ evidence | — |

## HQ master control plane

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| HQ-1 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Claude: spec /clients/rdusa + /clients/jaka read-only pages from retainer contracts → Cursor implements |
| HQ-2 | PASS |  | Cursor (implement) · Claude (spec) | — |
| HQ-3 | PASS |  | Cursor (implement) · Claude (spec) | — |
| HQ-4 | PASS |  | Cursor (implement) · Claude (spec) | — |
| HQ-5 | PASS |  | Cursor (implement) · Claude (spec) | — |
| HQ-7 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Cursor: MCP M0 per docs/adr/2026-10-hq-mcp-server.md (Claude A patch) reading getControlPlaneSnapshot() |
| JP-5 | NOT STARTED |  | Cursor (Sookly × HQ) | — |

## Data layer · MCP gateway

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| MCP-1 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Cursor: M0 read tools (hq_status, retainer_delivery, …) per hq-mcp-read-tools.yaml |
| MCP-2 | NOT STARTED |  | Cursor (implement) · Claude (spec) | After SEOS read API (seos-schedule-mirror-gap.md gaps 1–3) |
| MCP-3 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Cursor: Quo webhook per docs/integrations/quo.md after Mark names Quo lines |
| MCP-4 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Claude: spec Sookly relay fields once sookly-omnichat is readable |
| MCP-5 | NOT STARTED |  | Cursor (implement) · Claude (spec) | After MCP-1: approval-receipt writes (ADR phase M3) |
| MCP-6 | NOT STARTED |  | Cursor (implement) · Claude (spec) | Part of M0 (Streamable HTTP route + stdio bridge) |

## Governance & control

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| SW-1 | NOT STARTED |  | Mark + all seats (process) | Evidence candidate: SL-CONTENT-001 copy (Claude patch C, unmerged) — reviewer to score |
| SW-6 | NOT STARTED |  | Mark + all seats (process) | — |
| REV-5 | PASS |  | Mark (contracts) · HQ evidence | — |
| REV-6 | PASS |  | Mark (contracts) · HQ evidence | — |

## RDUSA internal retainer control · Revenue

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| REV-1 | BLOCKED |  | Mark (contracts) · HQ evidence | Mark: confirm fee band on both contracts |
| REV-2 | NOT STARTED |  | Mark (contracts) · HQ evidence | Mark: list RDUSA flagship scope on contract (40 posts, socials, SEO/geo, analytics, ranking) |
| REV-3 | BLOCKED |  | Mark (contracts) · HQ evidence | Mark: confirm Jaka month-2 fee |

## Continuous feedback loop

| Row | Status | Requirement | Owner seat | Next bounded action |
| --- | ------ | ----------- | ---------- | ------------------- |
| SW-5 | NOT STARTED |  | Mark + all seats (process) | Evidence candidate: grok-review Action + PROGRESS.md (Claude patch A, unmerged) |

## Critical path to 100% (dependency order)

1. **Mark gates (no agent can do these):** APP-2 prod migrate/deploy approval; REV-1/REV-3 fees; REV-2 RDUSA scope; `_reference/**` lint decision (issue #8 RELAY-03); Claude GitHub App write access.
2. **Merge the stack** #5 → #6 → #7 (+ #9) and Claude patches A/B/C — battle-tested clean (`BATTLE-TEST-2026-10-03-claude.md`).
3. **HQ-6 approval cards** (unblocks SW-2, SW-4, MCP-5): the single biggest unlock — every outward action (posting, sends, writes) waits on it.
4. **MCP M0** (HQ-7, MCP-1, MCP-6) → then MCP-3 Quo, MCP-4 Sookly relay, MCP-2 SEOS read.
5. **HQ-1 Clients pages** (independent, small).
6. **SEOS SE-1…8** and **Sookly APP/WDG/JP** — need their repos in a Claude session to spec/verify; owned by their seats.

## What Claude can take next (own seat, no Mark gate)

- Spec **HQ-1** Clients pages and **HQ-6** card UI acceptance tests (copy + states), for Cursor.
- Copy for **WDG-1** public wedge narrative (sookly.co) — draft only, Mark approves.
- Spec **MCP-4** Sookly relay fields — needs sookly-omnichat read access.
