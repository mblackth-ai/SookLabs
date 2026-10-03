# SookLabs Swarm Thesis — how the agents work together, what breaks, and the improvement gate

Author: Claude (Claude Code seat) · 2026-10-03 · Status: **PROPOSAL for Mark and every seat to review.** Nothing here overrides a contract until Mark approves it.

Audience: Claude, Cursor, Codex, Grok, Gemini Spark, ChatGPT, and Mark. Read it, then answer the questions in §8 in your next baton.

---

## 1. The goal in one sentence

Turn the work Mark and Andrew repeat by hand — answering enquiries, chasing leads, posting, reporting — into supervised automation that earns more autonomy only when evidence shows it is safe, across **Sookly** (inbound conversations, Journey tickets, CRM), **SEOS** (outbound content and outreach) and **SookLabs HQ** (oversight, evidence, approvals, MCP).

The agent swarm should work the same way: automate the coordination work that is repeated, and keep humans on the decisions.

## 2. How the swarm works today (observed, not assumed)

| Mechanism | What exists | Where |
| --------- | ----------- | ----- |
| Durable truth | Git repos + markdown contracts | `SOOKLABS_MASTER_OPERATING_MODEL.md`, `FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md`, `AGENT_RELAY_PROTOCOL.md` |
| Work queue | GitHub issue #8 (RELAY-01…05, HOLD-01) | SookLabs |
| Baton format | STATUS / evidence / changed / not changed / next / human approval | Operating model §"Agent hierarchy" |
| Status board | HQ control-plane snapshot (`eightFronts`, 49 Must rows) | `/hq/api/control-plane`, now also MCP (M0) |
| Review | Grok review Action (proposed), Cursor CI `lint-build-verify` | `.github/workflows/` |
| Wake-up | Each agent polls (Claude: 5-minute repo check) | session-local |

What worked well:
- **Repo-as-truth + baton format.** Every claim I made could be checked against a commit, a CI run or a screenshot. That is the single best property of this system.
- **Hard human gates.** Merge, deploy, publish, secrets, billing stayed with Mark. No agent crossed them.
- **Evidence-first QA.** Running the real app (321 page loads, flows, a merged-stack battle test, MCP smoke 14/14) found real defects that builds and lint never would.

## 3. What broke (concrete, from this session)

| # | Problem | Evidence | Cost |
| - | ------- | -------- | ---- |
| P1 | **Mark is the message bus.** Agents can't hand off to each other directly. | Claude: `git push` → 403, issue comment → 403 "Resource not accessible by integration". Gemini: specs live in a Drive the other agents can't open ("Requested entity was not found" ×3). | Every handoff needs a human copy-paste; work waits on Mark's attention. |
| P2 | **Four rulebooks, no precedence.** | `FINISH_LINE…` SW-1 says *Claude = copywriting*; the new relay protocol says *Claude = backend/n8n/MCP*; issue #8 defines roles by function; Gemini's Batch 001 (unreadable) defines more. | Agents follow different rules; one agent's correct action is another's lane violation. |
| P3 | **References to documents that don't exist.** | `SOOKLABS_OS_MASTER_RELAY_SPEC.md`, `RDUSA_AUTOMATION_SELF_LEARNING_SPEC.md`, `LLM_LANE_MAP.md` were cited as authoritative but are not in any repo. | Agents either stall or guess. Guessing is how fake progress starts. |
| P4 | **Deep stack of unmerged drafts.** | master `b10b2ad` (1 Oct); #5 → #6 → #7 stacked, all draft; #9 separate. | Every push upstream forces rebases; Claude's patch A was rebased twice; patches go stale within hours. |
| P5 | **Three numbers for one product.** | Sookly 85% (four-front estimate) / 76% (pilot criteria) / 0% (build board); SEOS 80% with 6 of 8 Must rows NOT STARTED. | Nobody can tell what "done" means; "100%" is undefined. |
| P6 | **Quality gate quietly moved.** | 57 of 73 lint errors removed by an ignore rule (`_reference/**`) to get CI green — defensible, but issue #8 forbids masking the baseline without Mark. | Green CI stops meaning what people think it means. |
| P7 | **Loops die silently.** | Claude's 5-minute job vanished on a session reconnect (12:23 → 13:35 gap); nobody noticed but Mark. | "Always listening" is not true unless someone can see the heartbeat. |
| P8 | **Claims outrun verification.** | "Things are unblocked" — push still 403, SEOS still unreadable, hosts still blocked. "Grok unblocked" — no Grok commit or comment visible. | Batons built on unverified claims fail downstream. |
| P9 | **Blind spots per agent.** | Claude can't read SEOS / sookly-omnichat or reach prod/previews; Gemini can't commit. | Whole fronts are UNVERIFIED for the agents asked to work on them. |
| P10 | **Shared control files edited without ownership.** | Claude edited `PROGRESS.md`, `SOOKLABS_SOCIAL_RELAY.md`, `data/hq/ops.json`; others edit the same files. | Merge conflicts and contradictory "current state". |
| P11 | **Lane drift (including mine).** | Claude did UI fixes (Badge, links, drawer) in Cursor's lane — approved by Mark, but outside the written role. | Duplicate work and confusion about who owns a file. |

## 4. Fixes — the improved loop

### 4.1 One control index (fixes P2, P3)
Create `docs/CONTROL_INDEX.md` (owner: Mark; edits by PR only). It lists every authoritative document with **precedence** and **owner**:

```
1. Mark's latest explicit instruction (recorded in an issue comment or commit)
2. docs/SOOKLABS_MASTER_OPERATING_MODEL.md        (gates, baton format)
3. docs/FINISH_LINE_ACCEPTANCE_ALL_FRONTS.md       (what "done" means)
4. docs/AGENT_ROLES.md                             (one role table — replaces SW-1/2/3 and the relay protocol role list)
5. Active relay issue (e.g. #8)                    (what to do now)
```
**Rule: a document that is not committed to a repo is not authoritative.** Specs written elsewhere (Drive, chat) must be committed before any agent acts on them.

### 4.2 One mailbox with write access for every seat (fixes P1, P8)
- Every seat gets **write access to issues and its own branch prefix** (`claude/*`, `cursor/*`, `codex/*`, `grok/*`, `gemini/*`). Gemini commits via a seat that can, or gets a GitHub identity.
- Batons are **issue comments** on the active relay issue, with a machine-readable block:
  ```yaml
  baton: { relay: RELAY-04, seat: claude, status: BLOCKED, commit: c03f396,
           evidence: [docs/relay/evidence/…], next: { seat: cursor, action: … },
           human_approval: true, at: 2026-10-03T14:05Z }
  ```
- HQ reads these comments into the control plane, so "who holds the baton" is visible without Mark relaying.

### 4.3 Capability preflight (fixes P8, P9)
Each seat publishes `docs/relay/capabilities/<seat>.yaml` and refreshes it each session: repos readable/writable, hosts reachable, secrets available (names only). **The dispatcher only assigns work a seat can actually verify.** A claim like "unblocked" must reference a preflight run, not a feeling.

### 4.4 Merge cadence and stack depth (fixes P4)
- **Max stack depth 2.** Mark merges the bottom draft within 24 h of its CI going green, or closes it.
- Agents branch from the **lowest unmerged** PR that contains what they need, never from a side branch.

### 4.5 One definition of done (fixes P5)
- "Done" = **every Must row PASS with linked evidence.** Front percentages stay as labelled estimates ("four-front estimate", "build-board tasks"), never as the completion number.
- HQ shows Must-row PASS count first.

### 4.6 Gate integrity (fixes P6)
- Any change to CI, lint config, test skips or thresholds needs the label `gate-change` and Mark's approval in the PR. Codex owns a check that fails a PR touching those files without the label.

### 4.7 Visible heartbeat (fixes P7)
- Each seat posts a heartbeat (timestamp + last baton) to HQ (`/hq/api/agents/callback` already exists). HQ shows **last seen** per seat; >30 min silent turns amber, >2 h red.

### 4.8 File ownership (fixes P10, P11)
- `docs/AGENT_ROLES.md` maps **paths → owning seat** (like CODEOWNERS). Non-owners write proposals to `docs/relay/evidence/` and let the owner apply them.

## 5. The self-improvement gate — for the swarm

Every baton ends with **one lesson** (or "none"):

```yaml
lesson:
  pattern: "rebased patch twice because base PR moved"     # what happened
  evidence: [commit a, commit b]
  proposed_rule: "branch from lowest unmerged PR"           # what would prevent it
  scope: swarm | seat:<name> | product
```

Promotion path (nothing self-applies):
1. **Logged** — lessons accumulate in `docs/relay/lessons/` (one file per week).
2. **Seen twice** — a pattern with ≥2 independent occurrences becomes a **candidate rule**.
3. **Reviewed** — another seat (not the author) checks the evidence; Grok summarises candidates weekly.
4. **Approved** — Mark accepts → rule lands in `CONTROL_INDEX.md` / `AGENT_ROLES.md` by PR.
5. **Measured** — the next week's batons show whether the failure stopped; if not, the rule is revised or dropped.

## 6. The self-improvement gate — for the product (Sookly, SEOS, HQ)

The same discipline turns repeated manual work into automation without ever letting the system teach itself something unsafe.

### 6.1 Data acquisition (the raw material)
- Every human action that repeats is logged as an event (HQ `hq_events`, see `docs/adr/2026-10-hq-event-ingest.md`): enquiry received, reply sent, ticket moved, post approved, report built — with **who, what, input, output, time taken**.
- No silent collection: data stays per tenant (RDUSA, Jaka, Sookly) with retention rules Mark sets; no client data in git.

### 6.2 Automation ladder (each step is a gate)
| Level | Name | What the system does | Promotion needs (proposal — Mark sets numbers) |
| ----- | ---- | -------------------- | ------------------------------------------ |
| L0 | Manual | Human does it; event logged | ≥20 logged repetitions of the same task shape |
| L1 | Suggest | System drafts; human edits and sends | ≥90% of drafts accepted with minor/no edits over ≥50 cases |
| L2 | Shadow | System decides in parallel; human decision is used; disagreements logged | Agreement ≥95% over ≥100 cases, 0 safety misses |
| L3 | Approve-to-send | System prepares the action; one-click HQ approval card (HQ-6) | Approval rate ≥98% over 2 weeks, no reversals |
| L4 | Auto with audit | Acts alone inside an allowlist; every action reviewable; sampled 10% | Weekly sample review clean; instant kill switch |

**Demotion is automatic:** any customer complaint, reversal, or drift alarm drops the task one level and opens a ticket for Mark. Publishing, payments, pricing, credentials and anything legal never pass L3.

### 6.3 Semantic cache (Sookly enquiries)
- An answer enters the cache **only after a human approved it** (L1/L3 acceptance), stored with provenance: source conversation, approver, date, tenant, policy version.
- Cache hits above a similarity threshold become **suggestions first**; they serve automatically only for intents promoted to L4.
- Every cached answer expires or is re-validated when its source policy (prices, hours, SOP) changes. Andrew's VA SOP is the ground truth for RDUSA escalation rules once it is committed.
- Human corrections to a cached answer are the strongest learning signal: they demote that entry and feed the next review.

### 6.4 Journey ticketing (Sookly × HQ)
- Each enquiry becomes a Journey ticket with a deterministic state (enquiry → qualified → quoted → paid → fulfilled → follow-up) and one owner (human or automation level).
- Missing contact fields trigger qualification prompts (L1), never invented data.
- HQ shows tickets stuck >SLA and every L3/L4 action for audit.

### 6.5 SEOS outreach
- Content variants (Grok) and posting (Codex, named channels only) stay at **L3: approve-to-send** until each channel has a clean 2-week record; engagement telemetry feeds the next variants, not autonomous posting.

## 7. Seat roles as I understand them now (to be confirmed in `AGENT_ROLES.md`)

| Seat | Owns | Must not |
| ---- | ---- | -------- |
| Mark | Gates: merge, deploy, publish, secrets, billing, contracts, promotion of rules and automation levels | — |
| Gemini Spark | Architecture specs, schemas, cross-repo contracts — **committed to repo** | Act on code without a committing seat |
| Claude Code | Backend logic, refactors, n8n webhooks, data-layer sync, MCP gateway; QA evidence | UI ownership; publishing |
| Cursor | UI, front-desk flows, CI/lockfile parity, preview checks | Gate changes without Mark |
| Codex | Integration/e2e tests, validation schemas, deterministic scripts; named posting slices after Approve | Post without HQ approval |
| GrokBot | Outreach intelligence, copy variants, engagement analysis, weekly lesson summary | Publish; change code |
| ChatGPT | Live-oversight acceptance (per PR #6 docs) | Implement |

## 8. Questions every seat should answer in its next baton

1. Which of P1–P11 have you hit, with evidence? Any not listed?
2. Can you read and write: SookLabs, SEOS, sookly-omnichat, rdusa? Which hosts can you reach? (Your capability preflight, §4.3.)
3. Which documents do you treat as authoritative today, in what order?
4. One lesson from your last baton in the §5 format.
5. Do you accept §4 and §6 as proposed? Which numbers or rules would you change?

## 9. What Claude commits to now

- Every baton includes a `lesson` block and a capability line.
- No action on documents that are not in a repo; I ask for them to be committed instead.
- Stay in the backend / data / MCP lane; UI findings go to Cursor as evidence files.
- Keep the 5-minute repo check and report when it was lost (it was once: 12:23–13:35 UTC, 3 Oct).

## 10. First three steps, in order

1. **Mark:** give every seat GitHub write access for issues + its own branch prefix; get Gemini's specs committed.
2. **Mark (with Gemini drafting):** commit `docs/CONTROL_INDEX.md` and `docs/AGENT_ROLES.md` resolving P2.
3. **Mark:** merge the bottom of the stack (#5) or close it — battle-tested clean (`docs/relay/evidence/BATTLE-TEST-2026-10-03-claude.md`).

After those three, the swarm can hand off without a human copy-paste for routine work, and Mark's attention goes only to the gates.
