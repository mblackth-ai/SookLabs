---
hq_surface: RDUSA
intended_routes:
  - /hq (COORDINATION / LLM lane — Mark)
  - /hq/retainers (RDUSA retainer panel — Mark)
  - /clients/rdusa Progress (future Client HQ — Andrew; SPEC only until Mark unlock)
status: architecture_sequencing_only
as_of: 2026-10-02
---

# RDUSA · Journey Prism agent swarm (HQ)

Visible for Mark on HQ alongside Journey Prism work. Not a live publish path. Approve buttons and social send stay human-gated.

# Journey Prism + multi-model swarm — architecture & sequencing
**Date:** 2 Oct 2026 · **Lane:** architecture only (no publish / no merge / no deploy)  
**Repo of record for Journey:** `mblackth-ai/sookly-omnichat` branch `cursor/operational-journey-engine-v1` tip `cf3d866` · PR [#60](https://github.com/mblackth-ai/sookly-omnichat/pull/60) **MERGED** 1 Oct 2026 → `eddc7dd` on main (tip was `cf3d866`)  
**Pilot contract:** `docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md` (HQ snapshot also mirrors scorecard)  
**Status:** not pilot ready — engine product path mostly PASS; Mark gates block ship  
**Suite map:** [`docs/BUSINESS_SUITE_MVP_MAP.md`](./BUSINESS_SUITE_MVP_MAP.md) (as of 2 Oct 2026). Architecture only. Not live on hq.sooklabs.com until PR #5 merges and HQ is deployed.

---

## 1) Swarm architecture (models + agents already in the workflow)

Think **one shared repo / contract**, many specialized seats — not three free agents chatting.

```
Mark (send-yes / merge / migrate / deploy)
        │
   CoS (orchestration + credit lock: one coding job)
        │
   ┌────┴────────────────────────────────────────┐
   │              SHARED SOURCE OF TRUTH          │
   │  sookly-omnichat (Journey Prisma engine)     │
   │  RDUSA pilot contract + scorecard            │
   │  prompts/ · queue/ · learning/ (LinkedIn POC)│
   │  Client HQ brief (hq.sooklabs.com /clients)  │
   └────┬────────────────────────────────────────┘
        │
   ┌────┼──────────────┬──────────────┬──────────────┐
   │    │              │              │              │
 Grok Bot          Claude         Codex /         Product AI
 (prompting,       (critique,     Cursor          (in-app Journey
  brand gate,      rewrite,       Composer        assistant:
  QA, handoffs)    deep DoD)      (code only,     advise → propose
                                   one at a time)  → execute+approval)
   │
 RDUSA Brand Social · PO · Cursor Impl · HQ
```

**Repo roles for the swarm**
| Seat | Model/tool | Writes to repo | Never does |
|------|------------|----------------|------------|
| RDUSA Brand Social / Grok | prompting | specs, queue drafts, learning notes | code, clone, publish |
| Claude | reasoning | critique outputs under `prompts/` / `queue/` | silent customer sends |
| Codex / Cursor Composer | coding | PRs on sookly-omnichat / loop tooling | parallel second coding job |
| Product Journey AI | in-app LLM | Journey evidence via approval gates | bypass blockers / self-approve / cross-tenant |
| Mark / CoS | human | merge, migrate, deploy, send-yes | — |

**Synergy rule:** agents improve each other by updating **files** (contract, insights, prompts, PR), not by scraping social or auto-posting.

---

## 2) Concrete steps to wire one coordinated swarm

1. **Freeze the contract** as the swarm constitution (`RDUSA_PILOT_ACCEPTANCE_CONTRACT.md`). Every agent cites gates by id; no private checklists.
2. **Handoff protocol in repo** — short `AGENTS.md` / README: who owns draft → critique → code → QA → Mark click.
3. **One coding seat** — Cursor Impl replies on the Journey slice only until #60 is merged; LinkedIn loop waits or uses prompting-only until unlocked.
4. **Claude seat** — fixed `prompts/claude-critique.md` (LinkedIn) + a `prompts/journey-dod-review.md` for ai-safety / four-dimensions gaps.
5. **Grok / RDUSA seat** — feeds Journey-visible social blockers into Client HQ adapters; Approve button = human approval gate analogue for social.
6. **Product AI** — stays inside advise/propose/execute-with-approval; product must-not list must become PASS before pilot.
7. **Learning loop** — after each published social post or closed Journey stage, append to `learning/` or Journey evidence; next draft/stage reads it.

---

## 3) Blockers for Journey Prism shipping

**Mark-gated (hard)**
- `merge-pr-60` — **DONE** (merged 1 Oct; HQ scorecard artifact was stale)
- `prod-migrate` — production Prisma migrate not approved/run
- `production-deploy` — no prod deploy authorized (Journey not live on droplet until migrate+deploy)

**Product / pilot still open**
- `ai-safety-product` — NOT STARTED (must-not list on product assistant)
- `four-dimensions-in-product` — NOT STARTED (conversation / class / journey / ownership separated)
- `phone-va-workspace` — NOT STARTED
- Staging smoke — NOT STARTED
- `live-pilot-10-20` — NOT STARTED (10–20 real RDUSA Journeys)

**Already green (do not re-litigate)**
- Persistent Journey suite 26/0, human approval 8/0, CI postgres-migrate-and-build SUCCESS
- Operator rail + Journey view + scenarios A/B/C on product path
- PrismaJourneyStore production path (MemoryJourneyStore not silent fallback)

**Adjacent (not Journey core, but gates other swarm work)**
- Resend: box API key valid + test send OK; MCP connector key invalid; droplet env not fully proven (CSRF blocked forgot-password probe)
- Coding credit lock: one Composer at a time
- LinkedIn company admin still blocked for schedule-from-here

---

## 4) Recommended order of operations

1. **Confirm Resend on droplet** (CoS) — close the last-mile env gap; keep LinkedIn/HQ coding parked until Mark says otherwise.
2. **Close remaining pilot holes on main** (one Cursor reply) — `ai-safety-product` + `four-dimensions-in-product` (Claude pre-reviews DoD; Grok QA). Optional: phone-va if Mark wants it in v1.
3. **Mark-approved production migrate**, then droplet deploy of Journey tip (no silent migrate).
4. **Staging smoke** on live tip against the pilot contract (scenarios A/B/C + safety must-nots).
5. **Live pilot** 10–20 real RDUSA Journeys; VA SOP already product-facing.
6. **Only then** unlock LinkedIn triple-agent repo / Client HQ Approve→publish as the *same* swarm pattern feeding Journey + HQ Progress — still no auto-publish.

---

## 5) Approval trigger events on HQ RDUSA (first-class)

HQ is the **human visual guide** and the **manual layer** for work that cannot be fully automated — typically because the channel is **subscription / UI-only** (no usable publish API), or because Mark must stay in the send-yes loop.

### What an approval trigger looks like on the HQ surface

Each trigger is a **card / row** on the RDUSA section (`/hq/retainers` now; later `/clients/rdusa` Social + Tasks) with:

| Field | Meaning |
|-------|---------|
| **Trigger id** | Stable id, e.g. `rdusa.social.linkedin.draft.2026-10-02-slatwall` |
| **Kind** | `social_publish` · `journey_execute` · `meta_token` · `photo_unblock` · `migrate_deploy` · `manual_suite` |
| **Why manual** | Short reason: `no_api` · `subscription_ui_only` · `human_send_yes` · `mark_only_gate` |
| **Needs** | Who must click: Mark · Andrew · Andolw · CoS-on-brief |
| **Payload preview** | Draft text / Journey next action / blocker text (read-only) |
| **Actions** | **Approve** · **Request changes** · **Hold** (no silent auto-run) |
| **On Approve signal** | Named next step only (e.g. “RDUSA Brand Social schedules LI in Suite” or “Journey AI may execute-with-approval”) — never a free agent send |

### Trigger catalogue (RDUSA v1)

1. **Social draft ready** — LinkedIn / IG / FB / Threads draft finished Claude+score loop → HQ card. Approve = send-yes for human or Graph/Suite schedule.  
2. **Subscription-only publish** — channel has no API (or token dead): HQ shows “paste/schedule in Meta Business Suite / LinkedIn UI” checklist; Approve logs that Mark completed the manual step.  
3. **Journey execute-with-approval** — Product AI proposed a restricted customer-visible action → HQ (or Sookly rail) approval gate; same human-approval semantics as pilot contract.  
4. **Photo / outrigger unblock** — ≥500px real photo needed; Approve after Mark/Andolw confirm not-AI and size.  
5. **Token / login remint** — META_PAGE_TOKEN_RDUSA, LinkedIn admin, Threads; Approve after secret remint (value never in chat).  
6. **Ship gates** — prod migrate / droplet deploy / PR merge; Mark-only Approve; swarm stays idle on that FRONT until clicked.

### Connection to the swarm

```
swarm produces work → writes queue/ + learning/ + Journey evidence
        ↓
HQ emits approval trigger card (visible on RDUSA section)
        ↓
Mark/Andrew clicks Approve | Request changes | Hold
        ↓
signal routes to owning seat (RDUSA Brand Social / CoS / Cursor / Product AI)
        ↓
seat acts only within the approved payload — no publishes without this click
```

**Rule:** If there is no API, HQ *is* the automation — checklist + Approve signal + evidence log. Agents do not invent a back door.

