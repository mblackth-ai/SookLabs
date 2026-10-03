# SookLabs agent relay and self-learning gate

Status: proposal for cross-agent review  
Date: 2026-10-03 UTC  
Owner: Codex, on the SookLabs HQ documentation branch  
Applies to: SookLabs HQ, Sookly, SEOS, and the RDUSA proof surface

## Thesis

The swarm works when each agent contributes a different kind of evidence to one bounded decision. It stalls when a message describing intent is mistaken for an executed state change. More agents do not solve that ambiguity. A durable relay needs one owner for each action, a shared state record, independent verification, and a rule that promotes repeated manual work to automation only after its outcomes and safety boundaries are demonstrated.

The intended business loop is: SEOS earns attention; Sookly receives an enquiry and progressively identifies the person; a Journey records owner, next action, and evidence; approved actions are executed; results return to HQ; staff corrections improve the next decision. HQ observes and dispatches; it does not become a second CRM or social publisher. RDUSA supplies real operating evidence, without treating code or a demo as delivered client value.

This is an operating thesis, not permission to merge, deploy, migrate, spend, change secrets, contact customers, or publish content. Mark retains those authorities under the [draft HQ operating model](https://github.com/mblackth-ai/SookLabs/pull/9) and the linked architecture sources below.

## Sources and their status

| Source | What it establishes | Status caveat |
| --- | --- | --- |
| [SookLabs OS master architecture](https://docs.google.com/document/d/1PJyOptaen7h_3ZTjzSNkaM-57Z30g8doU-HQ8we4iRQ/edit) | Four fronts, six lifecycle stages, agent roles, target capabilities | This is a Google Doc whose title ends in `.md`; it is not currently a tracked Markdown file in the checked repositories. |
| [Agent relay Batch 001](https://docs.google.com/document/d/1aDrn_c4PWkbyHRTzqI-FQGvfEgvvd3DAOqP5FmuqXjg/edit) | Assigned Cursor, Claude, Codex, and Grok deliverables | Some instructions differ from current repo truth; reconcile before implementation. |
| [RDUSA automation and self-learning specification](https://docs.google.com/document/d/1LvVpTQU8yKayvpBNfWxb-MZa7IuJ1mI7oGDkFbAhJ0c/edit) | Lead/quote data shapes, five commercial rules, event-triplet learning proposal | Architectural baseline, not evidence that the pipeline or learning engine exists. Andrew's original VA SOP was named but its link was not supplied, so its exact text is not independently verified here. |
| [SookLabs HQ control-plane documentation](https://github.com/mblackth-ai/SookLabs/blob/master/docs/HQ-MCP-CONTROL-PLANE.md) | HQ read model, planned MCP read tools and controlled-write tools | Planned tools must not be reported as connected until tested. |
| [Sookly automation contract](https://github.com/mblackth-ai/sookly-omnichat/blob/6ff8435c3fd53861e278d15351bfa8c44335f44e/docs/n8n-front-desk-workflow-mvp1.md) | Current Sookly/n8n responsibility split, webhook order, approval and cache behavior | Its cache threshold differs from the RDUSA specification. |

The Google Docs and repository Markdown should carry explicit revision IDs, owners, and precedence. A filename, a document title, and a label such as `ACTIVE` cannot substitute for a merged commit or a runtime probe. Git Markdown is editable; the relay can make history auditable with append-only decision records and immutable commit references, not by calling a file immutable.

## What the swarm has done well, and where it failed

1. **Independent review caught real problems.** Codex repaired the SEOS PR #5 lockfile so clean-install CI passed ([PR](https://github.com/mblackth-ai/SEOS/pull/5), [run](https://github.com/mblackth-ai/SEOS/actions/runs/37120445877)). Cursor's Sookly empty-Journey change passed CI and local visual review. Grok and the product owner kept the live gate open until a real deployment. Those are useful, separate contributions.
2. **A local preview was called a virtual deploy.** Cursor's `localhost:3003` screenshots showed the two Journey states, but no other machine could open that host after the agent stopped. The product owner accepted the local visual evidence; that did not create a public URL or test the live RDUSA thread ([PR #64](https://github.com/mblackth-ai/sookly-omnichat/pull/64)). Name the evidence `local_visual_pass` and the host state `not_deployed`.
3. **Merge, CI, deploy, and acceptance were compressed into one status.** PR #64 was squash-merged as `6ff8435c3fd53861e278d15351bfa8c44335f44e`; CI run `37127254884` passed. The last verified baton still had no deploy run and Messenger `27062277` unverified ([handoff](https://github.com/mblackth-ai/sookly-omnichat/pull/64#issuecomment-5969781815)). A release should have independent fields for each gate.
4. **A test actor was mistaken for a production contact.** Scenario C creates an `Andrew` test user and a different temporary `RDUSA shopfront contact`. Searching live Contacts for Andrew consumed time and could have prompted a false data repair ([correction](https://github.com/mblackth-ai/sookly-omnichat/pull/64#issuecomment-5969657674)). Every test persona must be labeled `fixture`, with its workspace and cleanup path.
5. **Credential existence was mistaken for runner access.** A DigitalOcean token visible in an account dashboard did not authenticate the agent's Apps API call; the reported result was 401. Cursor also reported no droplet SSH and denied Actions dispatch. Record the failing runner, endpoint, HTTP status, and request ID without revealing secrets. Do not infer that a token expired or create another one from the dashboard alone.
6. **Control documents and product branches overlapped.** Sookly PRs #62 and #64 both proposed changes to `sookly-control/agent-reports/latest.md`; several draft operating-model PRs described different stages of adoption. One `latest` pointer is a fragile coordination device. Preserve dated reports and derive the current view from evidence and a single reconciler.
7. **The batch plan outran the implementation.** Batch 001 asks for a persisted inbound qualification test, yet the [Sookly contact API](https://github.com/mblackth-ai/sookly-omnichat/blob/6ff8435c3fd53861e278d15351bfa8c44335f44e/src/app/api/contacts/%5Bid%5D/route.ts) returns empty suggestion lists and says the store is not in the schema. Pure helper tests cannot prove receipt-to-review persistence. The [relay reconciliation](https://github.com/mblackth-ai/sookly-omnichat/pull/65) records the prerequisite for Claude and the eventual Codex test.

These are process and integration failures, not a reason to stop independent work. The remedy is to state precisely which edge is blocked and let other agents work on non-overlapping edges.

## One state machine for work, multiple gates for evidence

Each work item has one current owner and an append-only history of batons. A baton is a claim with evidence, not a command that silently changes another system. Use the following states for the **work item**:

`READY -> CLAIMED -> IN_PROGRESS -> REVIEW_READY -> VERIFIED -> ACCEPTED`, with `BLOCKED`, `REJECTED`, and `SUPERSEDED` exits. `BLOCKED` must name the failing dependency, the owner who can change it, and an exact unblock condition. `CLAIMED` expires unless the owner renews its lease. `SUPERSEDED` points to the replacing commit or decision.

Store **release evidence** as separate fields. Never infer one from another:

| Gate | Minimum proof |
| --- | --- |
| Repository | Exact repo, branch, head SHA, diff scope, reviewer ownership. |
| Automated | Named command or CI run, exact SHA, exit result, required checks. |
| Local visual | Screenshot/browser log, URL or local origin, data fixture, SHA, reviewer verdict. |
| Hosted preview | Reachable non-production URL, deployed SHA, isolation, runtime smoke. |
| Production deploy | Authorized run/actor, deployed SHA, target, health probe, rollback point. |
| Live integration | Named real-world scenario, timestamp, input, persisted outputs, negative checks. |
| Product acceptance | Product owner decision tied to the required gates and any accepted exceptions. |

For example, `CI=PASS; LOCAL_VISUAL=PASS; HOSTED_PREVIEW=NONE; PROD_DEPLOY=NONE; LIVE_RDUSA=UNVERIFIED; ACCEPTANCE=OPEN` is a coherent state. `virtual deploy PASS` without a URL or deployed SHA is ambiguous. If a product owner waives a gate, record the exact waiver and what evidence replaces it; do not silently relabel the missing gate as passed.

### Baton record

Use one machine-readable fenced block in each PR handoff, followed by human-readable evidence. The schema is illustrative; implement it only when HQ has a real store and validator.

```yaml
baton_version: 1
id: sookly-journey-64-live-check
front: sookly
repo: mblackth-ai/sookly-omnichat
source_sha: 6ff8435c3fd53861e278d15351bfa8c44335f44e
status: BLOCKED
owner: named-agent-or-human
lease_expires_at: null
acceptance: "Messenger 27062277 shows Where now, Suggested next, Who owns on the deployed SHA"
evidence:
  ci_run: "https://github.com/mblackth-ai/sookly-omnichat/actions/runs/37127254884"
  deploy_run: null
  runtime_url: null
  live_probe: null
blocker:
  dependency: authenticated production deployment route
  unblock_when: deployed SHA and health probe are recorded
  next_owner: Mark-or-authorized-executor
approval:
  required: true
  scope: production deployment
```

The durable record should also contain creation and update UTC timestamps, actor identity, a link to the prior baton, changed files, data classification (`fixture`, `staging`, `production`), and an idempotency key. A single HQ index can point to the latest valid baton per work item. Agents write dated evidence artifacts on their own branches; only the HQ reconciler changes shared pointers after merge order is known.

## Agent ownership and communication

Mark supplies business authority; HQ coordinates. Specialties guide assignments, while one named executor owns each change:

| Agent | Primary contribution | Required handoff |
| --- | --- | --- |
| Gemini Spark | Versioned architecture, data schema and cross-repo contract decisions | Contract diff, source precedence, migration implications. |
| Claude Code | Backend, n8n webhook paths, persistence and data synchronization | Code PR, payload/schema contract, failure and rollback behavior. |
| Cursor | UI, front-desk flow, CI and preview execution | UI PR, build checks, origin/SHA, screenshot or hosted URL. |
| Codex | Deterministic integration tests, fixtures, validation and independent QA | Test PR or review with positive and negative cases, exact run/SHA. |
| GrokBot | Outreach intelligence, copy variants and engagement analysis; current product-owner relay where delegated | Content provenance, channel permission, measured outcomes and decision log. |

Do not send every task through every agent. Add a reviewer when the decision crosses that agent's specialty. The coder and verifier should be different for consequential changes. Reviewer silence is not approval. Cross-agent work happens through durable PR/decision links or the HQ job callback; agents in separate chats cannot rely on being awake, seeing a screen, or receiving an unrecorded prompt.

A relay dispatcher should issue `CLAIM` with a lease, expected output, and source SHA; the agent returns `ACK`, `BLOCKED`, or `DONE` with evidence. On lease expiry, HQ asks for status or reassigns the task. Webhooks or repo events should wake the dispatcher; a five-minute poll is a fallback while a runner is active. A chat turn ending is not a standing background monitor. Retries need an idempotency key so a timeout cannot duplicate a deploy, webhook, send, or decision.

## The operational data loop

Each front owns its own system of record:

- **SEOS:** campaign, approved channel connection, content variant, publish job, engagement observation. A selected channel is not publishing permission.
- **Sookly:** conversation, contact, qualification suggestion, Journey, task and approval. A message is not a confirmed contact field; a draft is not a customer send; a suggested stage is not a completed stage.
- **RDUSA:** client delivery evidence, retainer scope, quote/payment/PO facts and measured outcomes. It is a proof surface, not a synonym for all Sookly test fixtures.
- **HQ:** cross-front references, baton/decision/evidence indexes, approvals and bottlenecks. It stores pointers and normalized summaries, not duplicate customer records.

Introduce a cross-repo event only when a bounded feature needs it. Each event contract must state producer, consumer, tenant/workspace key, schema version, event ID, source object ID, UTC time, consent basis where relevant, delivery/retry rules, and the expected consumer effect. Start with `conversation.received`, `qualification.suggested`, `journey.stage_changed`, `outreach.approved/published`, and `outcome.recorded` only where an actual producer and consumer exist. An event in a north-star list is not an implemented integration.

For the front desk, the smallest useful qualification path is: persist inbound once; associate it with the correct workspace, conversation and contact; derive **suggestions** for missing fields; show the next question in staff review; accept or reject with actor and evidence; update a confirmed field only after the chosen approval path. A complaint or urgent risk routes to staff and suppresses normal sales automation. A Journey records owner, stage, due action and source evidence. The UI must show what is inferred, what is confirmed, and what still needs human action.

## A self-learning improvement gate

Record manual work as a privacy-minimized event triplet: `(ContextState, OperatorAction, ResultState)`. Add actor role, tenant, relevant policy version, source evidence, timestamp, outcome and correction reason. Do not learn directly from raw private conversations when a structured feature suffices. Repeated actions are **candidates**, not authority.

Promotion has six steps:

1. **Observe.** Measure repeated task frequency, time spent, corrected drafts, exceptions and downstream outcomes. Deduplicate retries and exclude test fixtures from production learning.
2. **Propose.** Gemini/Claude define the smallest candidate contract and owner. Show the exact manual action to automate, eligible context, exclusions, cost, and rollback. RDUSA's suggested `>95%` consistency is a screening signal, not a safety proof.
3. **Replay.** Codex runs deterministic historical and adversarial cases across tenants. Include false-positive cost, sensitive cases, missing data, idempotency and policy changes. Compare the candidate against the human decision without executing external side effects.
4. **Shadow.** The candidate produces a suggestion that staff can inspect; the original manual action remains authoritative. Log disagreement, correction, latency and whether the action would have violated a rule.
5. **Supervised execution.** Permit a one-click action for a bounded task with explicit staff approval, visible payload and undo or compensating action. Keep sends, charges, PO transmission, new channel publication and production changes at their human gate.
6. **Limited automation.** Only a policy-approved, measurable low-risk action may execute without per-item review. Scope by tenant, channel, time window and volume; monitor drift, maintain a kill switch, and roll back on threshold breach. Reapproval is required after a material schema, model, policy or business-context change.

Never promote based only on the model's confidence, cluster frequency, a clean CI run, or a high cache similarity score. The gate requires **measured outcome quality**, exception coverage, reviewer approval and a safe rollback. If these are absent, remain in shadow or supervised mode.

### Semantic cache contract

The RDUSA Google Doc proposes similarity `>0.92`; the current Sookly n8n document recommends `0.86`. Gemini and Claude need one versioned decision for **which store owns lookup** and how the threshold is tuned. Until then, avoid a silent threshold change. A cache key must include tenant/workspace, locale, channel, answer/FAQ version and material policy context. Store source and approver, expiry, invalidation reason and hit score. A hit may speed retrieval or draft a response; it cannot grant send permission. Bypass or require review for complaints, urgent risk, stale freight/pricing, appointment availability, low confidence, missing consent or unverified source. A cache correction should invalidate related entries and enter the learning evidence trail.

### RDUSA commercial invariants

The RDUSA specification states: never handle card numbers; require written approval of the full total before charge; transmit a vendor PO only after payment clears; obtain current freight from the supplier; escalate custom discounts, national accounts, complaints/damage, repeated card declines and pricing disputes to Andrew. Tests must prove **refusal paths** as well as happy paths. Neither the semantic cache nor an n8n workflow may fabricate freight, approval or payment state.

## Verification and scorecard

Codex's integration suite should test the complete boundary, once the relevant backend path exists: an inbound event persists once; the correct contact is selected or created under the correct workspace; pending qualification does not mutate confirmed fields; acceptance changes only the approved field; a Journey retains owner/stage/evidence across reload; AI pause and human approval suppress customer-visible sends; n8n retries do not duplicate replies; cache hits obey the same gate; a published SEOS job has an approved channel and recorded outcome. Use fake tenants and synthetic fixtures first. Live RDUSA verification is a separately authorized probe with a timestamp and exact deployed SHA.

HQ should track five families of measures without conflating them: **delivery** (time from ready to deployed and accepted), **correctness** (negative tests, rollback rate, live defects), **human effort** (minutes and touches saved), **customer outcomes** (qualified leads, bookings, completed follow-up, verified revenue where available), and **learning quality** (proposal precision, shadow disagreement, drift, false automation). Segment by tenant, channel and model/policy version. Never present projections, demo outputs or draft copy as realized business results.

## Immediate sequence for the next relay cycle

1. **Close the Sookly release evidence gap.** PR #64 is merged at `6ff8435c`, with CI passing. The authorized deploy owner must establish an authenticated route, record the deployed SHA, URL, health/rollback evidence, then the product owner checks Messenger `27062277` and an existing-Journey regression. No Andrew contact lookup. This is a deployment/acceptance baton, separate from Batch 001 feature work.
2. **Make the source contract durable.** Gemini publishes a reviewed, versioned Markdown copy or pointer for the Google Docs, resolves six versus seven lifecycle-stage language by treating HQ oversight as a cross-cutting control plane, and records precedence against SookLabs PR #9. The original VA SOP link is needed before citing it as independently checked.
3. **Build the qualification persistence seam.** Claude proposes the minimal schema and receipt-to-pending-suggestion route with workspace isolation, acceptance/audit and idempotency. Cursor may build the missing-field UI against that contract. Codex then adds integration tests to the CI job; do not claim a pure helper test covers the path.
4. **Finish SEOS App B and syndication separately.** PR #5's clean-install CI passed after the lockfile repair; functional social-connect and permissions review remain. Claude owns n8n round trip, Grok owns bounded copy/telemetry work, and Codex tests publish authorization and event handoff. No outreach is sent merely because a variant exists.
5. **Advance HQ deliberately.** PR #9 is a draft architecture model with an existing Vercel preview, not an approved production release. Review its control-plane/MCP contracts and human gates, then request the smallest explicit merge/deploy decision from Mark. HQ's read model should show these exact states without inventing a direct agent connection.

## Reusable review prompt for every LLM

> You are reviewing the SookLabs agent relay thesis on its exact branch and commit. Read the source links and the relevant product repo at its current head. Identify one factual error, one hidden dependency, one unsafe automatic promotion, and one small change that would measurably reduce handoff latency; if none exists, say so with evidence. Do not edit another agent's branch or a shared `latest` pointer. Return: agent and UTC time; source revision; claim checked; exact evidence; PASS/FAIL/UNKNOWN; proposed change and owner; tests or runtime proof needed; human approval required. Distinguish proposed architecture from implemented code, CI from deployment, and local visual evidence from live acceptance. Post the result to the HQ thesis PR and link any specialist PR. The HQ reconciler records agreements, disagreements and a next bounded baton.

## Review questions that would change this thesis

- Which Google Doc revision or repo commit is the approved source when their instructions disagree?
- What exact live host and credential path can deploy Sookly `6ff8435c` without a hidden production mutation?
- Is the qualification suggestion store intentionally absent, or implemented on a separate branch that needs review?
- Which n8n instance owns semantic cache today, and what evidence supports its threshold?
- What source is authoritative for Andrew's original VA SOP and RDUSA commercial exceptions?
- Which HQ MCP read and controlled-write endpoints are live, and which remain planned?

Each answer should update a versioned decision record. The loop improves when corrections become testable contracts and measured outcomes, not when the agents repeat a stronger claim about the same unverified state.
