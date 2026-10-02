# Business Suite MVP map — Mark oversee on HQ
**As of:** 2 Oct 2026 ICT  
**Lane:** architecture / sequencing / acceptance only — **no publishes, no external sends**  
**Overseer:** Mark Black · Coordination seats: Claude (copy/spec), Codex (named posting slices), Cursor (implement / CoS coding seat), Grok specialists (brand/ops)  
**Repos of record:** [mblackth-ai/SookLabs](https://github.com/mblackth-ai/SookLabs) → live [hq.sooklabs.com](https://hq.sooklabs.com)  
**Companion swarm note:** `docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` (§5 approval triggers)  
**Finish line:** `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md`

Caller aliases used on voice → canonical names: **Sucli/Sutely → Sookly** (`app.sookly.co`); **suclabs → sooklabs**; **QO → Quo**.

---

## 0. One-sentence end game

One **business-suite OS**: HQ (see + approve) · SEOS (schedule/produce) · Sookly (talk + Journey) · MCP (LLMs + platforms + Quo + Sookly relay) — filtered per business, with Mark as human visual guide for anything that has no API.

---

## 1. Architecture (MVP)

```
                    ┌─────────────────────────────────────┐
                    │  HQ  hq.sooklabs.com                │
                    │  Central truth + approval triggers  │
                    │  Clients: RDUSA · Jaka              │
                    │  Direct: SookLabs · Sookly (Mark)   │
                    └──────────────┬──────────────────────┘
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
    ┌──────▼──────┐        ┌───────▼────────┐      ┌───────▼────────┐
    │ SEOS        │        │ Sookly         │      │ MCP layer      │
    │ seos.       │        │ app.sookly.co  │      │ LLMs + social  │
    │ sooklabs.com│        │ inbox+Journey  │      │ Quo + Sookly   │
    │ expansion OS│        │ client comms   │      │ relay          │
    └──────┬──────┘        └───────┬────────┘      └───────┬────────┘
           │                       │                       │
           └───────────────────────┴───────────────────────┘
                         repos report status → HQ
```

### 1.1 HQ — human visual guide + central truth

| Element | MVP intent |
|---------|------------|
| **Clients** sidebar | Filter by business: **RDUSA**, **Jaka Transportation** only |
| **Direct holdings** | **SookLabs** + **Sookly** owned by Mark — **no** separate client sections; appear as Mark-direct / SEO holdings on HQ home or PROJECTS |
| **Approval triggers** | First-class cards (§5 swarm note): Approve / Request changes / Hold → named signal to owning seat |
| **Manual layer** | When no API (subscription UI only): HQ checklist + Approve after Mark completes Suite/LinkedIn/etc. |
| **Per-business feed** | Social queue, tasks, SEOS status, Journey summary, reporting tiles, Quo/Sookly CRM crumbs |

### 1.2 Swarm roles (locked for this MVP)

| Seat | Owns | Does not |
|------|------|----------|
| **Claude** | Copywriting, research, OpenAPI/specs, gap analysis | Prod implement while Cursor holds coding slot; silent sends |
| **Codex** | Named posting / connector slices **only when Mark names Codex** | Default coding; overlapping Cursor branch |
| **Cursor Composer** | One implement slice at a time; PR; migrate scripts when Mark yes | Second parallel Composer; Auto |
| **Grok / CoS / RDUSA Brand Social** | Spec, QA, brand voice, send-yes coordination | Repo coding |

**Approval layer:** edits that become public or deploys that hit production require HQ (or Mark) Approve — same trigger model as social + Journey execute-with-approval.

### 1.3 SEOS — minimized SookLabs expansion OS (`seos.sooklabs.com`)

MVP map (acceptance criteria §3 still to finalize with Mark):

| Capability | Notes |
|------------|--------|
| Visual editing | Blocks / pages editable without code |
| API connectivity | Connectors where APIs exist; else HQ manual trigger |
| Socials in sections | Per-channel sections on per-business pages |
| Overhead project tables | Line-by-line project tables as **movable blocks** |
| Per-business pages | Each business’s connected Pages / properties |
| Visual scheduling calendar | Filters by business, channel, status |
| Reporting visuals | Feed **into** per-business HQ sections |
| GA / GSC / GBP | Wired throughout schedule → produce → report loop |

### 1.4 Sookly — integral client communications

Omnichannel inbox + Journey Prisma + MITL. End-state: day execution of the suite (talk, stage, approve, evidence). Relays CRM-ish state to HQ via MCP.

### 1.5 MCP layer on HQ

Connects:

- **LLMs** (Claude / Cursor / Codex / Grok tools) to HQ truth  
- **Social platforms** (read status; publish only behind Approve + API)  
- **Quo** transcription API — who is phoning whom  
- **Sookly relay** — CRM new contacts, email↔phone↔name linkage, prospect status, callback flags, email threads, live Sookly chats  

One central truth: HQ control plane (`GET /hq/api/control-plane` + docs under `docs/integrations/`, `docs/openapi/`).

### 1.6 Repo → surface relay

| Repo | Surface | Relays to HQ |
|------|---------|--------------|
| SookLabs | HQ + MCP | Source of truth |
| SEOS | SEOS OS | Schedule/produce/jobs mirror (gap doc → later live) |
| sookly-omnichat | Sookly product | Journey scorecard, retainer health, Sookly chat/CRM events |
| RDUSA social buffers / LinkedIn loop (spec) | Brand Social | Social approval triggers |
| Jaka buffers | Jaka Social | Client filter Jaka |

---

## 2. Sequencing (recommended order)

1. **Freeze this map + approval triggers** on SookLabs docs (PR #5 path).  
2. **Confirm Resend on droplet** (Sookly email path) — box key proven; droplet env last mile.  
3. **Journey Prism go-live** — prod migrate + deploy + staging smoke + safety/four-dimensions gaps (see swarm sequencing note).  
4. **Merge/deploy SookLabs #5** — retainers + pilot contract + this MVP map visible on HQ.  
5. **Clients MVP** — `/clients/rdusa` then `/clients/jaka` (SPEC → build when Mark unlocks; read-only adapters first).  
6. **SEOS acceptance finalize** → then visual calendar + movable blocks + GA/GSC/GBP wiring (one Cursor slice at a time).  
7. **MCP Quo + Sookly relay** — Claude specs → Cursor implement read-only tools first.  
8. **Codex posting slices** only when Mark names channel (e.g. LinkedIn App B) behind HQ Approve.  
9. **Reporting tiles** from SEOS → HQ per-business sections.

Never: auto-publish, parallel coding agents, inventing metrics, client sections for SookLabs/Sookly.

---

## 3. Acceptance criteria

### 3.1 HQ MVP (Mark oversee)

- [ ] Clients sidebar shows **RDUSA** and **Jaka** only  
- [ ] SookLabs + Sookly labeled as **Mark direct** (no fake client portals)  
- [ ] Approval trigger cards visible for waiting social / Journey / ship gates / manual Suite steps  
- [ ] Approve | Request changes | Hold persists; Approve emits named signal only  
- [ ] Control plane exposes retainer + Journey pilot truth without inventing PASS  

### 3.2 SEOS MVP (finalize with Mark — draft bar)

- [ ] Per-business page lists connected Pages/properties  
- [ ] Calendar with filters (business, channel, status)  
- [ ] At least one movable project-table block type  
- [ ] GA or GSC or GBP shows **honest empty** if not connected — no fake charts  
- [ ] Reporting tile can be linked/read into HQ RDUSA or Jaka section  

### 3.3 Sookly / Journey MVP (pilot contract wins)

- [ ] Golden Rule from `RDUSA_PILOT_ACCEPTANCE_CONTRACT.md` unmet → `pilotReady` false  
- [ ] Prod migrate + deploy Mark-approved  
- [ ] Product AI must-not list PASS before live cohort  
- [ ] 10–20 live RDUSA Journeys after smoke  

### 3.4 MCP MVP (read-only first)

- [ ] Quo contract doc + webhook signature plan  
- [ ] Sookly relay fields documented: contacts, linkage, prospect status, callback, threads, live chats  
- [ ] MCP read tools stub: client overview, tasks, retainer usage, transcript search  
- [ ] No write tools until Mark yes  

### 3.5 Swarm MVP

- [ ] Claude copy lands in repo prompts/queue before HQ Approve  
- [ ] Cursor one slice; Codex only when named  
- [ ] No publish without HQ/Mark Approve trigger  

---

## 4. Live vs spec vs blocked (truth table · 2 Oct 2026)

| Item | State | Evidence / note |
|------|-------|-----------------|
| HQ live site | **LIVE** | hq.sooklabs.com (auth; WebFetch 403 from box) |
| HQ Clients `/clients/rdusa` | **SPEC** | `CLIENT_HQ_RDUSA_ANDREW_BRIEF_2026-10-02.md` — no build until Mark unlock |
| HQ Clients `/clients/jaka` | **SPEC** | Same pattern; not briefed as deeply as RDUSA |
| SookLabs / Sookly as clients | **N/A by design** | Mark direct holdings — no client sections |
| SookLabs PR #5 (retainers, pilot, swarm docs) | **SPEC on draft PR** | https://github.com/mblackth-ai/SookLabs/pull/5 — not merged → not live UI |
| Journey Prism code on main | **LIVE in repo** | sookly-omnichat #60 merged `eddc7dd` |
| Journey on production droplet | **BLOCKED** | Needs Mark prod migrate + deploy; safety/four-dim gaps |
| Resend API key (box) | **LIVE** | Test send HTTP 200 2 Oct; domains sookly.co verified |
| Resend on droplet / MCP connector | **BLOCKED / partial** | Droplet env not fully proven; MCP key invalid |
| SEOS live | **LIVE** | seos.sooklabs.com |
| SEOS visual OS MVP (calendar, blocks, GA/GSC/GBP) | **SPEC / partial** | Lifecycle PR #2 etc.; acceptance not finalized |
| Quo → HQ ingest | **SPEC** | Claude Quo docs lane |
| Sookly ↔ HQ MCP relay | **SPEC** | OpenAPI stub path |
| LinkedIn triple-agent loop | **SPEC** | `RDUSA_LINKEDIN_TRIPLE_AGENT_POC` — coding gated |
| RDUSA IG Graph publish | **BLOCKED** | META_PAGE_TOKEN_RDUSA expired |
| Pinterest | **HOLD** | Mark `want_api_later` |
| Approval trigger **UI cards** on HQ | **SPEC** | Documented §5 swarm note; implement after #5 / Clients unlock |
| This MVP map on box | **LIVE (box docs)** | This file |
| This MVP map on HQ site | **SPEC until PR merge+deploy** | Promote via SookLabs docs |

---

## 5. File paths (canonical)

| Path | Role |
|------|------|
| `docs/BUSINESS_SUITE_MVP_MAP.md` | **This map** (canonical SookLabs path; as of 2 Oct 2026). Dated source name was `BUSINESS_SUITE_MVP_MAP_2026-10-02.md`. |
| `/workspace/rdusa/BUSINESS_SUITE_MVP_MAP_2026-10-02.md` | RDUSA-side copy for Brand Social |
| `/workspace/sooklabs-hq/docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` | Swarm + approval triggers |
| `/workspace/rdusa/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING_2026-10-02.md` | Same (RDUSA workspace) |
| `/workspace/sookly/CLIENT_HQ_RDUSA_ANDREW_BRIEF_2026-10-02.md` | Clients RDUSA portal SPEC |
| `/workspace/sooklabs-hq/docs/LLM_LANE_MAP.md` | Claude/Cursor/Codex lanes |
| `/workspace/sooklabs-hq/docs/LLM_STATUS.md` | Living FRONT board |
| SookLabs PR #5 | HQ landing branch for docs → live after merge |

---

## 6. What is on HQ **now** vs still **spec**

**On HQ now (live product, Mark login):** control plane / four fronts / retainers UI as already deployed on hq.sooklabs.com — **not** yet including this full MVP map or Clients Andrew portal.

**On HQ via draft PR #5 (repo, not live site until merge+deploy):** RDUSA pilot contract, retainer contracts, Journey Prism swarm sequencing + approval trigger **spec**, and (this turn) Business Suite MVP map.

**Still spec / blocked:** Clients filter UI, approval trigger cards as interactive UI, SEOS visual OS acceptance lock, Quo+Sookly MCP live tools, Journey prod migrate/deploy, Meta token, Codex posting without Mark name+Approve.
