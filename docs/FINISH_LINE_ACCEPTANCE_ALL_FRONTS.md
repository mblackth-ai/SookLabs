# Finish-line acceptance — all fronts (releasable product start-to-finish)

**As of:** 2 Oct 2026 (Asia/Bangkok)  
**Source:** Mark voice brief same day  
**Audience:** Mark click-through · CoS · Cursor · swarm seats  
**Hard:** No social publishes, no external customer sends from this doc alone. Pass = evidenced on HQ/SEOS/control-plane or named repo receipt. Fail = missing evidence or open Mark-only gate.

**Canonical name on repo (when landed):** `docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md`  
**Voice aliases:** “QO” → **Quo**; “Sutely” → **Sookly**.

---

## Global constraints (every front inherits)

| # | Constraint | Pass when |
|---|------------|-----------|
| G1 | No model APIs as product path | Swarm/ops use **webhooks, relays, repo workflows** only — not “call Claude/OpenAI from prod as the product” |
| G2 | Subscription ceilings | Client seats stay within **max/enterprise** plan limits as they grow; documented per product |
| G3 | Future per-key environments | Roadmap accepted: separate env + knowledge base + repo **per product API key**, later consolidating into a self-learning brain |
| G4 | HQ managed-only until trained | HQ stays **operator-managed** until an agent is trained on **two clients’** real data and Mark unlocks handoff |
| G5 | Niche SOPs → SaaS | Client-specific SOPs are written so they can **generalize** into releasable SaaS, not one-off scripts |
| G6 | Day-one data pathways = moat | First-class, durable paths for CRM/chat/email/phone/name/status/callbacks/threads exist on day one — not bolted-on later |

**Mark click rule:** A front is **releasable start-to-finish** only when every **Must** row in that front is PASS. Should/Could rows do not block release but must be listed as loose ends on the front detail view.

---

## Front 1 — HQ (hq.sooklabs.com)

**Finish line:** Mark can assess the whole business from HQ without relying on one chat window — Clients, candy parked, all fronts with live %, clickable detail, approval triggers.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| HQ-1 | **Clients section** live for **RDUSA** and **Jaka** only | `/clients/rdusa`, `/clients/jaka` (or HQ Clients nav) with read-only adapters; client role works | Missing routes, fake metrics, or SookLabs/Sookly shown as “clients” |
| HQ-2 | **SookLabs + Sookly** = Mark direct holdings | No client portal for SookLabs/Sookly; founder boards only | Client-shaped UI for Mark’s own products |
| HQ-3 | **Candy → Upcoming** | Bottom section titled exactly **Upcoming / Not Yet Released**, collapsed by default; primary scroll has no dead candy | Candy still in primary scroll |
| HQ-4 | **All fronts + live %** | Board lists every active front (not only four); % from control-plane/contracts | Invented % or four-fronts-only |
| HQ-5 | **Clickable front detail** | Each front opens detail: what’s stopping it, what’s going on, where it lands, loose ends, edge cases | Cards with % only, no detail |
| HQ-6 | **Approval trigger cards** | Cards with id, kind, why_manual, who clicks, preview, Approve \| Request changes \| Hold → named signal (no silent publish) | Silent auto-post or cards not built |
| HQ-7 | Control-plane single truth | UI + MCP read same `control-plane` snapshot | Divergent numbers across surfaces |

### Should

| ID | Criterion |
|----|-----------|
| HQ-S1 | Candy audit doc `docs/HQ_CANDY_VS_CONNECTED_AUDIT.md` current |
| HQ-S2 | `docs/HQ_FRONTS_PROGRESS.md` lists front → % → tracker path |
| HQ-S3 | Retainers board `/hq/retainers` shows RDUSA/Jaka day/week/month/90d |

**Landing:** SookLabs repo · PR #5 (or successor) · deploy HQ after Mark merge yes.

---

## Front 2 — SEOS (seos.sooklabs.com)

**Finish line:** Operator can visually edit, schedule, and report for each business with real Google + social connectivity — expansion OS, not a brochure.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| SE-1 | **Visual editing** | Editable surfaces for content/blocks without raw DB hacks | Read-only mock only |
| SE-2 | **API connectivity** | Documented live connectors (or honest Manual/Draft/Future badges — no fake “Connected”) | Fake Connected badges |
| SE-3 | **Socials sections** | Per-channel boards with real queue/status from ops store or APIs Mark unlocked | Empty shells |
| SE-4 | **Movable-block project tables** | Blocks reorderable; state persists | Static table mock |
| SE-5 | **Per-business pages** | At least RDUSA + Jaka (and Mark holdings as needed) have distinct pages | One undifferentiated dump |
| SE-6 | **Visual scheduling calendar + filters** | Calendar UI with filters (business, channel, status) | List-only, no calendar |
| SE-7 | **Reporting visuals** | Charts/tiles from real metrics sources once connected | Placeholder charts with invented numbers |
| SE-8 | **GA / GSC / GBP** | Pathways for Google Analytics, Search Console, Google Business Profile — connected or Upcoming with clear gate | Claimed live without tokens |

### Should

| ID | Criterion |
|----|-----------|
| SE-S1 | Attack calendar / produce schedule acceptance finalized with Mark |
| SE-S2 | Knowledge Base remains canonical marketing truth (HQ does not duplicate FAQ stores) |

**Landing:** SEOS product repo + `seos.sooklabs.com` deploy after Mark yes.

---

## Front 3 — Swarm

**Finish line:** Multi-seat loop produces draft → critique → implement → approval → act, with repo as contract and HQ/SEOS as the human layer.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| SW-1 | **Claude = copywriting** | Named seat produces copy into repo/HQ draft cards | Claude used as silent publisher |
| SW-2 | **Codex = posting** (named channels only) | Posting seat only after approval signal; channel allowlist | Posts without Approve |
| SW-3 | **Cursor = chief of staff / implement** | Specs → PRs; one coding job at a time unless Mark says otherwise | Unscoped parallel coding thrash |
| SW-4 | **Approval layer** | HQ (or SEOS) trigger cards; Approve = named signal to owning seat | Chat-only “just post it” without card when HQ path exists |
| SW-5 | **Repo → HQ/SEOS relay** | Contracts/scorecards in repo surface on HQ/SEOS within one deploy cycle | Docs exist but UI never reads them |
| SW-6 | Constraint G1 | No production “model API as product”; webhooks/repo workflows | Prod features that require vendor model keys as the wedge |

### Should

| ID | Criterion |
|----|-----------|
| SW-S1 | Journey Prism swarm sequencing doc followed for RDUSA pilot |
| SW-S2 | LinkedIn triple-agent POC only after Mark unlock |

**Landing:** Repo contracts + HQ approval UI + seat runbooks.

---

## Front 4 — MCP

**Finish line:** LLMs and tools read (then controlled-write) the same HQ truth; Quo + Sookly relay cover transcription and CRM/chat paths.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| MCP-1 | **HQ → LLMs** | Read tools: status, projects, pending approvals, next actions (names may match `hq_*`) | Tools invent state |
| MCP-2 | **HQ → socials** (relay) | Social status/queue via MCP or documented Future; no fake Connected | Fake live posting via MCP |
| MCP-3 | **Quo transcription** | Ingest path for Quo transcripts into HQ/ops (or Upcoming + gate) | Claimed without connector/path |
| MCP-4 | **Sookly relay** | CRM fields relayed: email, phone, name, prospect status, callbacks, threads, live chats | Missing day-one fields (breaks G6) |
| MCP-5 | Controlled writes | Writes need policy + approval receipts; cannot bypass merge/deploy/token/spend/publish gates | Write tools that publish or spend |
| MCP-6 | Transport | Streamable HTTP remote + stdio local as designed | Secrets in tool output |

### Should

| ID | Criterion |
|----|-----------|
| MCP-S1 | `docs/HQ-MCP-CONTROL-PLANE.md` matches shipped tools |
| MCP-S2 | Retainer delivery readable via MCP (`retainer_delivery` or equivalent) |

**Landing:** SookLabs MCP surface + Quo/Sookly connector lanes.

---

## Front 5 — Sookly app (app.sookly.co / product)

**Finish line:** Product start-to-finish for the omnichannel inbox + Journey — releasable for founding/paid use under Mark’s caps and gates.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| APP-1 | Omnichannel inbox usable | Facebook-first (and stated channels) with auto-responses + MITL training model | Demo-only playground as “live” |
| APP-2 | Journey engine ship gates | Prod migrate + deploy approved; staging smoke; live 10–20 Journeys when Mark opens pilot | `pilotReady` false while claiming live |
| APP-3 | RDUSA pilot contract | Golden Rule in `RDUSA_PILOT_ACCEPTANCE_CONTRACT` met before “pilot ready” | Four-front % treated as pilot ready |
| APP-4 | Founding/pricing locks | Founding 10 until Checkout live; prices as Mark locked | Copy says first 50 while cap is 10 |
| APP-5 | No AI-fake customer assets as product proof | Real evidence only | Fake screenshots as acceptance |

### Should

| ID | Criterion |
|----|-----------|
| APP-S1 | ai-safety-product + four-dimensions-in-product landed |
| APP-S2 | Resend/email path proven on droplet (CSRF/forgot-password green) |

**Landing:** sookly-omnichat · app.sookly.co · Mark migrate/deploy yes.

---

## Front 6 — Sookly chat as SaaS wedge

**Finish line:** Chat widget / omnichat is the sellable wedge — clear ICP path, embed path, and founding motion — not only an internal tool.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| WDG-1 | Public wedge narrative | sookly.co states omnichannel unified inbox + MITL clearly | Buried or contradicted |
| WDG-2 | Embed path | Documented embed for customer sites (RDUSA hold until Mark paste-yes is OK as status) | No install path |
| WDG-3 | Founding motion | Cap + pricing + Checkout gate match Mark locks | Open floodgates early |
| WDG-4 | Enterprise organic order | FB/IG/Threads → LinkedIn → groups (clinic cold Message 1 parked) | Cold clinic spam while parked |
| WDG-5 | Day-one data pathways | Prospect/chat data lands in CRM/relay (see MCP-4) | Chats die in a silo |

### Should

| ID | Criterion |
|----|-----------|
| WDG-S1 | Clients HQ shows RDUSA widget status honestly |
| WDG-S2 | Niche clinic SOPs generalized into SaaS playbook (G5) |

**Landing:** Marketing site + app + HQ Clients status.

---

## Front 7 — Revenue (retainers)

**Finish line:** Per-client retainer economics are explicit, scored on HQ, and deliverable without inventing fees or delivery.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| REV-1 | Band **$500–$1,500**/client/mo | Written on contracts/HQ; Mark may adjust | Invented fees in public copy |
| REV-2 | **RDUSA $1,500/mo** flagship | Contract lists: **40 posts**, socials, SEO/geo, analytics, competitive ranking | Scope drift without Mark |
| REV-3 | **Jaka $750/mo month 2** | Fee confirmed with Mark and shown on retainer scorecard | Placeholder fee treated as signed |
| REV-4 | Delivery scorecards | Day/week/month/90d PASS/FAIL with evidence on `/hq/retainers` | Healthy=true without evidence |
| REV-5 | Blockers honest | e.g. RDUSA Meta token BLOCKED does not get scored PASS | PASS while Graph blocked |
| REV-6 | No publish from score alone | Score ≠ permission to post | Auto-post on green day |

### Should

| ID | Criterion |
|----|-----------|
| REV-S1 | Window dates (e.g. 1 Oct–29 Dec 2026) editable by Mark |
| REV-S2 | Competitive ranking + analytics artifacts linked from retainer detail |

**Landing:** `RDUSA_RETAINER_DELIVERY_CONTRACT` · `JAKA_RETAINER_DELIVERY_CONTRACT` · HQ retainers UI.

---

## Front 8 — Journey Prisma (Sookly × HQ)

**Finish line:** On Sookly, Journey Prisma is a **customizable connectivity layer** operated through HQ. It syncs any external CRM ↔ Sookly’s in-built CRM **per user**, unifies identity across channels (e.g. email to Andrew then a phone call → same contact), and shows a **Journey indicator** for where that person is in the pipeline and what to do next. **Visual oversight first** via HQ; **automation later** only when the Sookly intelligence layer flags automation potential and Mark/approval gates allow it.

**Depends on:** Front 5 (Sookly app Journey engine ship gates) for persistence/prod; Front 1 (HQ visual layer); Front 4 (relay fields). Does **not** replace the RDUSA pilot Golden Rule — pilot ready still requires `RDUSA_PILOT_ACCEPTANCE_CONTRACT`.

### Must (pass/fail)

| ID | Criterion | Pass evidence | Fail if |
|----|-----------|---------------|---------|
| JP-1 | **Customizable connectivity layer** on Sookly | Per-user (or per-tenant) connector config for external CRM ↔ in-built CRM; settings reachable from product and reflected on HQ | Hard-coded single CRM only, or no config surface |
| JP-2 | **CRM sync external ↔ in-built** | Bidirectional or documented one-way sync of contacts with conflict rules; evidence in control-plane or Journey/CRM admin | Sync claimed without durable writes / audit |
| JP-3 | **Phone ↔ email ↔ contact identity match** | Same person resolved across channels (example: emailed Andrew, then phones → caller identified as that email contact); match confidence + manual override | Separate records for phone vs email with no link path |
| JP-4 | **Journey pipeline indicator per contact** | Per-contact UI: stage in pipeline, **what to do next**, evidence of last touch | Stage label only with no next action |
| JP-5 | **HQ visual oversight layer** | HQ (Clients and/or Journey board) shows Journey Prisma status, sync health, open next-actions — oversee before automate | Only in-app; Mark cannot see from HQ |
| JP-6 | **Future automation gate** | Automation is **off by default**; runs only when Sookly intelligence marks potential **and** an approval trigger (or Mark policy) allows; no silent customer messages | Auto-outreach without Approve / policy |

### Should

| ID | Criterion |
|----|-----------|
| JP-S1 | RDUSA first tenant for sync + identity examples (Andrew contact path) |
| JP-S2 | Swarm sequencing doc cites Journey Prisma HQ oversight |
| JP-S3 | Edge cases listed on front detail: duplicate merges, missing phone, CRM auth expiry, partial sync |

**Landing:** sookly-omnichat Journey Prisma · HQ Clients/Journey views · `docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` · pilot contract unchanged for “pilot ready.”


---

## Master releasable checklist (Mark click-through)

Tick only with evidence link (HQ URL, PR, contract SHA, or screenshot path).

### Global
- [ ] G1 No model-API product path
- [ ] G2 Subscription max/enterprise noted
- [ ] G3 Per-key env roadmap accepted (future)
- [ ] G4 HQ managed-only until 2-client trained handoff
- [ ] G5 SOPs written to generalize
- [ ] G6 Day-one data pathways present

### HQ
- [ ] HQ-1 Clients RDUSA+Jaka
- [ ] HQ-2 SookLabs/Sookly Mark-direct
- [ ] HQ-3 Upcoming candy section
- [ ] HQ-4 All fronts + live %
- [ ] HQ-5 Clickable detail
- [ ] HQ-6 Approval triggers
- [ ] HQ-7 Control-plane single truth

### SEOS
- [ ] SE-1 … SE-8 (visual edit, API honesty, socials, movable blocks, per-business, calendar+filters, reporting, GA/GSC/GBP)

### Swarm
- [ ] SW-1 … SW-6

### MCP
- [ ] MCP-1 … MCP-6

### Sookly app
- [ ] APP-1 … APP-5

### Sookly chat SaaS wedge
- [ ] WDG-1 … WDG-5

### Revenue
- [ ] REV-1 … REV-6

### Journey Prisma
- [ ] JP-1 Customizable connectivity layer
- [ ] JP-2 CRM sync external ↔ in-built
- [ ] JP-3 Phone ↔ email ↔ contact identity
- [ ] JP-4 Journey pipeline indicator + next action
- [ ] JP-5 HQ visual oversight
- [ ] JP-6 Future automation gate (off by default)

**Releasable product start-to-finish** = all Must rows PASS for the fronts Mark includes in that release train. Partial trains (e.g. HQ-only) are allowed if Mark scopes them explicitly.

---

## Related docs

| Path | Role |
|------|------|
| `docs/BUSINESS_SUITE_MVP_MAP.md` | Suite map |
| `docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md` | Journey pilot golden rule |
| `docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md` | RDUSA retainer |
| `docs/JAKA_RETAINER_DELIVERY_CONTRACT.md` | Jaka retainer |
| `docs/RDUSA_JOURNEY_PRISM_SWARM_SEQUENCING.md` | Swarm + approval triggers + Journey Prisma context |
| `docs/HQ-MCP-CONTROL-PLANE.md` | MCP + control plane |
| `/workspace/sookly/CLIENT_HQ_RDUSA_ANDREW_BRIEF_2026-10-02.md` | Clients HQ SPEC |
| `/workspace/sooklabs-hq/docs/HQ_CANDY_AUDIT_AND_FRONTS_BRIEF_2026-10-02.md` | Candy + fronts UI brief |

---

## Change log

| Date | Change |
|------|--------|
| 2026-10-02 | Initial finish-line acceptance from Mark voice call; seven fronts + global constraints |
| 2026-10-02 | Added Front 8 Journey Prisma (Must: JP-1…JP-6) from Mark voice |
