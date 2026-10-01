# RDUSA Pilot Acceptance Contract

Status: **not pilot ready**. This file is the fixed finish line for RDUSA pilot readiness. Mark, the Chief of Staff, Cursor, and other LLMs use this definition and do not replace it with a shorter checklist, a percentage on the four-fronts board, or a passing engine suite.

Canonical path: `docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md`

Machine scoreboard: `lib/hq/rdusa-pilot-contract.js`, exposed as `rdusaPilotContract` on `GET /hq/api/control-plane` and on the HQ Four Fronts page. That snapshot records evidence against this file. It is not a second definition. If a status and this file disagree, this file wins until both are updated together.

Four-front percentages are a separate evidence board. Sookly Journey at 75% is not pilot ready.

This HQ slice records a CoS-verified engine bundle. It did not re-run sookly-omnichat tests, did not read engine enum source, and did not merge, deploy, migrate, or message a customer.

## Golden Rule

RDUSA is pilot ready when a real RDUSA operator can open a contact in Sookly, understand exactly where that contact is in the business process, see what must happen next and who owns it, perform or approve the next permitted action, hand the work to another operator if necessary, close and reopen the app, and find the same correct operational state preserved, without relying on human memory, spreadsheets, side messages or undocumented knowledge.

Do not redefine or weaken that sentence. `pilotReady` stays false until every major scorecard criterion is PASS under this rule.

## How this contract is used

Sections 1–12 are the finish line. The scorecard is the current evidence against that finish line. A sub-gate PASS does not close its parent. In-memory tests and tool unit tests do not close a product criterion.

Operator-facing stage labels are fixed:

Inquiry → Qualification → Requirements → Quote → Review & Payment → Fulfilment → Complete

This slice did not cite engine enum tokens. If the engine uses different tokens, the product maps them onto these labels. Renaming a stage is a change to this contract, not a local UI choice.

## 1. Canonical RDUSA Journey lifecycle

A Journey is one business cycle for one contact in one tenant. Closing the app does not reset it. A new enquiry after Complete is a new Journey, or an explicit recorded continuation. This contract does not allow a silent rewind.

Conversation state, contact classification, and ownership are not stages. They are the other three dimensions in section 2.

AI permission on a stage is the assistant's ceiling: **advise**, **propose**, or **execute with approval**. Advise and propose never send a customer-visible message. Execute with approval is allowed only through an existing human approval gate.

### Inquiry

- **Entry condition:** A new RDUSA enquiry exists and has not been accepted as a qualified display opportunity.
- **Required information:** Who the contact is, the channel (phone, web, email, or other), and what they asked.
- **Next action:** Acknowledge the enquiry in Sookly and record the ask.
- **Action owner:** The VA or the first assigned sales operator. Unassigned is a loose end, not a resting state.
- **Possible blockers:** The contact cannot be identified. The enquiry is for another tenant.
- **Exit condition:** An operator can tell whether the enquiry should be qualified or closed as not a fit, and that judgement is recorded.
- **SOP guidance:** Capture the enquiry on the Journey. Do not leave it in email, a spreadsheet, or a side message. Do not quote.
- **AI permission level:** advise. Summarize the ask and list missing identity fields.

### Qualification

- **Entry condition:** The enquiry is a possible RDUSA display job.
- **Required information:** Classification (Prospect, Customer, Architect, or another real class), project or site type, rough need, and any known timing.
- **Next action:** Confirm fit, or record the missing fact that blocks that confirmation.
- **Action owner:** Sales (Andrew, Mark, or assigned sales). A VA may capture answers and must not invent the fit decision.
- **Possible blockers:** The contact is a supplier or otherwise out of scope. A duplicate open Journey already covers this ask. Identity conflicts with another contact.
- **Exit condition:** Fit is confirmed and requirements can start, or the Journey is closed as not a fit. The classification tag is set separately from the stage.
- **SOP guidance:** Set classification and stage as two fields. Do not skip to Quote.
- **AI permission level:** propose. Draft qualification questions. Do not reclassify across tenants or advance the stage.

### Requirements

- **Entry condition:** The opportunity is qualified and the quote still depends on missing facts.
- **Required information:** Display type, dimensions or site constraints, quantity, location, timing, and any condition that would change the price.
- **Next action:** Collect the single missing fact that blocks a truthful quote.
- **Action owner:** Sales, or a VA while the action is capture only. Andrew or Mark owns a judgement call.
- **Possible blockers:** A dimension, quantity, or site fact is missing. A recorded fact has no source.
- **Exit condition:** The facts required to quote are on the Journey, each with its source (customer statement, drawing, or call).
- **SOP guidance:** Do not invent measurements. Do not start a quote from memory.
- **AI permission level:** propose. List missing requirements and draft the question. Do not fill an unknown measurement.

### Quote

- **Entry condition:** Requirements are sufficient to price.
- **Required information:** Scope, price, inclusions, exclusions, and the quote's validity if one is stated.
- **Next action:** Record the quote, or record the internal hold that prevents sending it.
- **Action owner:** Sales. Andrew or Mark owns the commercial decision. A VA may prepare a draft.
- **Possible blockers:** Requirements changed. The price is not internally accepted. The quote would go to the wrong contact.
- **Exit condition:** The quote is stored as evidence and has been sent through an approved action, or an explicit hold is the next action.
- **SOP guidance:** A sent quote is not payment and is not fulfilment. The quote artefact stays on the Journey.
- **AI permission level:** propose. Draft wording. Sending the quote or changing the price is execute with approval, and only through the existing human approval gate.

### Review & Payment

- **Entry condition:** The quote is with the customer, or payment has been requested.
- **Required information:** Quote reference, amount requested, payment state, and who the Journey is waiting on.
- **Next action:** Follow up for a decision, or record that payment terms for fulfilment are met. The follow-up has an owner and a due date.
- **Action owner:** Sales for the commercial follow-up. Operations does not take the Journey while payment terms are unmet.
- **Possible blockers:** Payment was requested and there is no response. The customer disputed scope. Nobody holds approval to take or confirm payment.
- **Exit condition:** The recorded payment terms allow fulfilment to start, or the Journey is closed as lost. A verbal promise is not the exit.
- **SOP guidance:** Recommend the payment action. Do not answer with generic customer-service chatter. Do not start fulfilment on an unrecorded promise.
- **AI permission level:** propose. Draft the payment follow-up. Do not mark paid, take payment, or skip to Fulfilment. A customer-visible send is execute with approval.

### Fulfilment

- **Entry condition:** The Review & Payment exit condition is recorded.
- **Required information:** What will be delivered or installed, the due date, and the customer-facing commitment.
- **Next action:** The next fulfilment step (schedule, produce, deliver, or confirm).
- **Action owner:** Operations, or the named staff member assigned to that step.
- **Possible blockers:** Site access or a delivery fact is missing. An unpaid balance still gates delivery under the recorded terms.
- **Exit condition:** Completion evidence is on the Journey and the customer-facing work of this cycle is done.
- **SOP guidance:** Record completion evidence before Complete. Do not tell the customer the work is done until that evidence exists and any customer-visible message is approved.
- **AI permission level:** advise. Identify stalls and missing evidence. Do not mark Complete.

### Complete

- **Entry condition:** Fulfilment exit evidence is recorded, and no blocker is open.
- **Required information:** Completion evidence, the operator who closed the Journey, and any follow-up written as its own next action or a new Journey.
- **Next action:** None for this Journey, unless a dated follow-up is explicitly open.
- **Action owner:** The operator who closes. A follow-up has a named owner. "Someone should check in" is not an owner.
- **Possible blockers:** Open blocker, missing completion evidence, or payment still unresolved.
- **Exit condition:** Journey status is Complete. History remains. Reopening the app still shows Complete.
- **SOP guidance:** Close in Sookly. A later enquiry is a new Journey or a recorded continuation, not a silent edit of this history.
- **AI permission level:** advise. Summarize the closed Journey. Do not reopen it, delete evidence, or send a review request without approval.

Journey status is separate from the stage. Allowed status values for this contract: Active, Blocked, Waiting, Complete, Cancelled. Waiting means the recorded next action depends on the customer or another party. That is not the Conversation state Waiting.

## 2. Four state dimensions

These dimensions stay separate. A tag is not a Journey. Setting VIP does not move the stage. Resolving a conversation does not complete the business process.

| Dimension | Values | What it answers |
| --- | --- | --- |
| Conversation | Open, Waiting, Resolved, Closed | Is there an open thread with the contact? |
| Contact classification | Prospect, Customer, Supplier, Architect, VIP, or another configured class | What kind of contact is this? |
| Journey state | The stage in section 1, plus Journey status | Where is this business cycle, and is it active, blocked, waiting, complete, or cancelled? |
| Ownership | Andrew, Mark, VA, sales, operations, or another named staff member | Who must perform or approve the next action? |

Unassigned ownership is allowed only as a detected loose end. The steady state names a person or one of the roles above. "Other" without a name is not an owner.

Changing one dimension must not silently rewrite the others.

## 3. Operator UI integration

Preferred workspace: a collapsible right rail with three panels, **Contact**, **Journey**, and **AI Assistant**. The operator does not leave the contact to learn the business state.

The Journey view shows, at minimum:

- Current stage
- Journey status
- Owner
- Next action
- Due date
- Blocker
- Important indicators
- SOP guidance for the current stage
- Recent evidence and history

A VA on a phone call keeps the contact open and can read that Journey view without leaving the workspace. The call does not depend on a second screen, a spreadsheet, or a side message.

This UI is not built. See scorecard rows `operator-ui-integration`, `operator-journey-rail`, `journey-view-minimum`, and `phone-va-workspace`.

## 4. Real persistent application path

The product path calls Prisma-backed Journey storage. The production modules named by the verified engine bundle are **PrismaJourneyStore** and **persistent-approval**. **MemoryJourneyStore** is not the production path and must not be a silent fallback when the product route fails, times out, or lacks configuration.

Operators can, where their permissions allow:

- Create and read a Journey
- Update the situation
- Advance the stage
- Assign the owner
- Set and clear a blocker
- Create and update a case
- Record evidence
- Complete or cancel

Engine persistence is PASS at `a30aeddb7f737191a275fed2039a6b7cd89078ed`. The product path is FAIL: no product HTTP route and no inbox UI calls PrismaJourneyStore. There has been no staging smoke. The production migration has not been run.

Verified engine evidence used here, without re-running it in this slice:

- Repo `mblackth-ai/sookly-omnichat`, branch `cursor/operational-journey-engine-v1`
- Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 (mergeable, unmerged)
- Tip `a30aeddb7f737191a275fed2039a6b7cd89078ed`
- CI `postgres-migrate-and-build` SUCCESS: https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813
- `npm run test:operational-journey:persistent` 9/0
- `npm run test:operational-journey` 9/0
- `npm run test:human-approval-gate` 8/0
- `npm run test:ops-command` 102/0
- `tools.test.ts` 12/0
- Ephemeral Prisma validate, generate, and migrate, `tsc`, and `next build` passed in that CI run

## 5. AI operational awareness

The assistant's context for an operational answer is the contact, the conversation, the Journey, the relevant SOP guidance in this contract, and the operator's permissions. A missing dimension is a reason to say what is missing, not a reason to guess.

From that context the assistant must be able to answer:

- What stage is this Journey in?
- Who is the Journey waiting on?
- What happens next?
- Who owns the next action?
- Is it blocked, and by what?
- What information is missing?
- Is it stalled?
- What reply should be proposed?

Guidance is stage-aware. In Review & Payment the assistant recommends the payment action. It does not fall back to generic customer-service advice. In Requirements it asks for the missing fact. It does not draft a price.

Product AI context is NOT STARTED. The agent tool suite at 12/0 does not close this section.

## 6. AI safety and approval boundaries

The assistant may:

- Summarize the contact, conversation, and Journey
- List missing information
- Recommend the next permitted action
- Draft a reply or an internal note
- Identify a stall
- Suggest a stage change
- Suggest a blocker

The assistant must not silently:

- Send a restricted or customer-visible communication
- Skip a stage
- Bypass a blocker
- Read or write across tenants
- Approve its own restricted action
- Execute an approval that was rejected or has expired

Existing human approval gates stay intact. Engine evidence for those gates is PASS (`npm run test:human-approval-gate` 8/0 at `a30aedd`, CI run 36909457813). Product enforcement of this list is NOT STARTED and is not implied by the engine PASS.

## 7. Staff handoff

Operator A stops. Operator B continues using only Sookly. B does not need A's memory, a spreadsheet, or a side message.

The handoff preserves:

- Stage
- Activity and history
- Situation
- Blocker
- Next action
- Due date
- Evidence
- Customer context
- Ownership

Scenario C in section 9 is the acceptance test for this section. It is NOT STARTED.

## 8. Loose-end detection

Detection is deterministic. A Journey surfaces when any of these is true:

- The next action's due date is before now and the action is not done
- The stage is Quote, quote evidence exists, and there is no open follow-up
- The stage is Review & Payment, payment was requested, and there is no later customer response and no later operator follow-up
- A blocker is set and not cleared
- The Journey is not Complete or Cancelled, and no activity is recorded for the configured idle threshold
- The owner is unassigned
- The latest customer response has no operator action after it

The v1 idle threshold is 3 business days. Mark may change that number in configuration. The acceptance test uses the configured value. A stalled fixture that does not surface is a failure of this section.

At least one deliberately stalled RDUSA test Journey must surface. That fixture is NOT STARTED.

## 9. Controlled acceptance scenarios

Run these on the product path, in one RDUSA tenant, against Prisma-backed storage. Passing engine unit tests are not a substitute.

No scenario may lose state, leak another tenant, bypass an approval gate, or depend on an undocumented repair.

### A. Happy path

Start at Inquiry. Advance only when that stage's exit condition is recorded, through Qualification, Requirements, Quote, Review & Payment, Fulfilment, and Complete. Record evidence at each stage. Close the app and reopen it. The Journey is still Complete, in the same tenant, with the same history. No customer message is sent unless an approved action recorded it.

### B. Blocked path

On a Journey at Quote or later, set a blocker. An attempt to advance is refused. Clear the blocker with a recorded reason. Advance is then allowed only if the stage exit condition is also met. History keeps both the set and the clear.

### C. Staff handoff

Andrew or Mark records the stage, situation, next action, due date, evidence, and ownership, and may set a blocker. That operator stops. A VA opens the same contact in Sookly and continues with one permitted action. The fields in section 7 are still present and still correct.

## 10. Production release gate checklist

These are human gates. A Composer slice documents them and stops. It does not perform them.

| Step | Gate | Current status |
| --- | --- | --- |
| 1 | PR #60 reviewed by a human | BLOCKED pending Mark |
| 2 | CI green | PASS for the engine branch at Actions run 36909457813. This does not release production. |
| 3 | Persistent Journey tests and human approval tests green | PASS at the counts in section 4. This does not release production. |
| 4 | Operator integration acceptance (sections 3, 4, and 9) green | NOT STARTED |
| 5 | Merge approval | BLOCKED pending Mark |
| 6 | Merge | BLOCKED pending Mark. Do not merge from this work. |
| 7 | Production migration reviewed | BLOCKED pending Mark. Ephemeral CI migrate is not this review. |
| 8 | Explicit production migrate approval | BLOCKED pending Mark. Do not migrate from this work. |
| 9 | Rollback and backup understood | NOT STARTED |
| 10 | Deploy | BLOCKED pending Mark. Do not deploy from this work. |
| 11 | Controlled production smoke | NOT STARTED |
| 12 | No accidental customer message during smoke | NOT STARTED. No customer message is authorized now. |

## 11. Human pilot handoff SOP

This SOP is for a VA and should take about 30–60 minutes to learn on a real contact. If the VA needs extensive CRM training before they can follow it, treat that as a UX defect in Sookly, not as a training failure.

1. Open the contact.
2. Read the Journey (stage, status, owner, next action, due date, blocker, evidence).
3. Follow the next permitted action. Do not invent a different one from memory.
4. Record the outcome on the Journey.
5. Assign or hand off before stopping, so ownership is never an unrecorded assumption.
6. Never force a stage. If the exit condition is unmet, record the gap or the blocker.
7. Use AI for guidance and drafting. Sending, stage changes, blocker bypass, and restricted actions stay on the approval gates in section 6.
8. Escalate when the next action is unclear. Do not guess the business rule in a side message.

The SOP text lives here. It is not yet published inside the operator product (`va-sop-product-facing` is NOT STARTED).

## 12. Live RDUSA pilot validation

After activation, run 10–20 real RDUSA Journeys. This cohort is NOT STARTED. Do not start it before the release gates in section 10 are actually done.

Track:

- Completions
- Workarounds
- Stalls caught
- Operator errors
- Bad AI guidance
- Handoff quality
- Missing states
- Customer mistakes
- System failures
- Operator feedback

Success, all of which are required:

- No critical data loss
- No tenant isolation failure
- No approval bypass
- No repeated workflow-breaking bug
- A majority of Journeys need no off-system tracking
- Operators can say the next action without leaving Sookly
- Handoffs work from Sookly alone
- Improvements found in the cohort are mostly configuration or UX, not a new architecture

A cohort that needs a new persistence model, a parallel CRM, or a silent memory fallback has failed this contract.

## Not required before pilot

The pilot does not wait on:

- Public signup
- Full billing
- Insurance enterprise
- Every template
- Advanced analytics
- Perfect dashboards
- Full telephony
- Every automation
- A template marketplace
- Perfect mobile
- A broad launch

Absence of these is not a FAIL against this contract. Building them is not a substitute for an unmet criterion above.

## Scorecard

Major criteria are the finish-line gates. Sub-gates are evidence or parts of a major criterion. A sub-gate PASS does not mark its parent PASS.

Major counts: **5 PASS, 1 FAIL, 3 BLOCKED, 8 NOT STARTED**.

All rows: **11 PASS, 1 FAIL, 6 BLOCKED, 20 NOT STARTED**.

`pilotReady`: **false**.

### Current critical path

Next Composer slice, on `mblackth-ai/sookly-omnichat`: the operator Journey rail plus a product HTTP/inbox path that calls PrismaJourneyStore. `product-prisma-path` is FAIL. `operator-journey-rail` is NOT STARTED. There must be no silent MemoryJourneyStore fallback.

Merge of PR #60, production migration, and deploy stay BLOCKED pending Mark. They are not the next Composer slice.

### Bounded slices remaining

Honest range: **6–8** slices before a live pilot can start.

1. Product HTTP/inbox path that calls PrismaJourneyStore, with no MemoryJourneyStore fallback.
2. Operator Journey rail, minimum Journey view, and the phone-call VA workspace. The next Composer slice combines 1 and 2.
3. Operator actions on that path: situation, stage, owner, blocker, case, evidence, complete, and cancel.
4. Product AI context, stage-aware guidance, and the section 6 must-not list.
5. Deterministic loose-end detection, including one stalled RDUSA test Journey.
6. Product scenarios A, B, and C, plus staging smoke.
7. Human release gate in section 10: review, merge, migration review, explicit migrate approval, rollback and backup, deploy, and controlled production smoke. Not a Composer slice.
8. Live cohort of 10–20 Journeys, with this SOP available in the operator product.

### Confirmation

All future RDUSA and Sookly Journey work uses `docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md` as the fixed finish line. The Golden Rule is not redefined or weakened by the scorecard. `pilotReady` stays false until every major criterion is PASS.

<!-- rdusa-scorecard:start -->
| ID | Criterion | Level | Status | Evidence |
| --- | --- | --- | --- | --- |
| engine-prisma-persistence | Prisma production path (PrismaJourneyStore + persistent-approval) | major | PASS | Production path modules are PrismaJourneyStore and persistent-approval, not MemoryJourneyStore. npm run test:operational-journey:persistent 9/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| engine-tenant-isolation | Journey engine tenant isolation | major | PASS | Tenant isolation is in the CoS-verified engine bundle, with the persistent suite at 9/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| engine-blockers | Journey engine blockers | major | PASS | Blocker enforcement is in the CoS-verified engine bundle, with the persistent suite at 9/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| engine-approval-reject-expiry | Approval reject and expiry | major | PASS | npm run test:human-approval-gate 8/0. Rejected and expired approvals stay rejected. Persistent suite 9/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| engine-human-approval-boundaries | Human approval boundaries | major | PASS | npm run test:human-approval-gate 8/0. Existing human approval gates stay intact at the engine. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| product-prisma-path | Product HTTP / inbox calls PrismaJourneyStore | major | FAIL | Known gap: no product HTTP route or inbox UI calls PrismaJourneyStore. No staging smoke. Production migration has not been run. MemoryJourneyStore must not become a silent production fallback once that route exists. |
| operator-ui-integration | Operator Journey UI | major | NOT STARTED | No operator Journey rail, Journey view, or phone-call workspace evidence is in the verified bundle. Engine tests do not satisfy this criterion. |
| ai-journey-context | Product AI Journey context | major | NOT STARTED | The product assistant does not yet answer from Contact, Conversation, Journey, SOP, and permissions together. tools.test.ts 12/0 is an engine tool suite, not this criterion. |
| loose-end-surfacing | Loose-end detection surfaced to operators | major | NOT STARTED | No product surface shows overdue next actions, quote follow-up gaps, payment silence, unresolved blockers, idle Journeys, unassigned owners, or unanswered customer responses. |
| scenario-a-happy-path | Acceptance scenario A happy path | major | NOT STARTED | Inquiry through Complete has not been accepted on the product path with close/reopen persistence. |
| scenario-b-blocked-path | Acceptance scenario B blocked path | major | NOT STARTED | Product acceptance has not shown blocker, refused advance, clear, then continue. |
| scenario-c-staff-handoff | Acceptance scenario C staff handoff | major | NOT STARTED | Andrew or Mark to a VA, continuing from Sookly alone, has not been accepted on the product path. This row is also the staff-handoff gate. |
| merge-pr-60 | Merge sookly-omnichat PR #60 | major | BLOCKED | Pending Mark. https://github.com/mblackth-ai/sookly-omnichat/pull/60 is draft and unmerged. This slice must not merge. |
| prod-migrate | Production database migration | major | BLOCKED | Pending Mark. Production migration has not been reviewed, approved, or run. This slice must not migrate. |
| production-deploy | Production deploy | major | BLOCKED | Pending Mark. No production deploy is authorized. This slice must not deploy. |
| live-pilot-10-20 | Live RDUSA pilot, 10 to 20 real Journeys | major | NOT STARTED | No live RDUSA Journey cohort has been run after activation. The success bar in this contract is unmet. |
| va-sop-product-facing | VA handoff SOP inside the operator product | major | NOT STARTED | Section 11 of this contract records the SOP. It is not published inside the Sookly operator workspace. |
| test-operational-journey-persistent | Persistent Journey suite 9/0 | sub-gate | PASS | npm run test:operational-journey:persistent 9/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| test-operational-journey | In-memory Journey suite 9/0 | sub-gate | PASS | npm run test:operational-journey 9/0. This suite is not the production path and does not close product-prisma-path. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| test-human-approval-gate | Human approval gate suite 8/0 | sub-gate | PASS | npm run test:human-approval-gate 8/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| test-ops-command | Ops command suite 102/0 | sub-gate | PASS | npm run test:ops-command 102/0. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| test-agent-tools | Agent tools suite 12/0 | sub-gate | PASS | tools.test.ts 12/0. A passing tool suite does not close ai-journey-context. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| ci-postgres-migrate-and-build | CI postgres-migrate-and-build | sub-gate | PASS | Actions run 36909457813 SUCCESS, including ephemeral Prisma validate, generate, and migrate, tsc, and next build. Tip a30aeddb7f737191a275fed2039a6b7cd89078ed (a30aedd) on cursor/operational-journey-engine-v1. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is unmerged. CI https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36909457813 postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests. |
| operator-journey-rail | Collapsible Contact, Journey, and AI Assistant rail | sub-gate | NOT STARTED | The preferred right rail is not in the product. |
| journey-view-minimum | Journey view minimum fields | sub-gate | NOT STARTED | Current stage, Journey status, owner, next action, due date, blocker, indicators, SOP guidance, and recent evidence are not shown together. |
| phone-va-workspace | Phone-call VA keeps the contact open | sub-gate | NOT STARTED | A phone-call VA cannot yet see operational state without leaving the contact workspace. |
| operator-journey-actions | Operator Journey actions on the product path | sub-gate | NOT STARTED | Create, read, update situation, advance stage, assign owner, set or clear blocker, create or update case, record evidence, and complete or cancel are not available to operators on a Prisma-backed product route. |
| canonical-lifecycle-in-product | Seven-stage lifecycle in the product | sub-gate | NOT STARTED | Operator-facing labels are fixed by this contract. The product does not yet present Inquiry, Qualification, Requirements, Quote, Review & Payment, Fulfilment, and Complete. Engine enum tokens were not re-read in this slice. |
| four-dimensions-in-product | Four state dimensions separated in the product | sub-gate | NOT STARTED | Conversation, contact classification, Journey state, and ownership are defined here. The product does not yet keep them separate. Tags are not the Journey. |
| ai-stage-aware | Stage-aware AI guidance | sub-gate | NOT STARTED | Review & Payment does not yet recommend payment actions instead of generic customer-service replies. |
| ai-safety-product | Product AI must-not boundaries | sub-gate | NOT STARTED | Engine approval boundaries are a separate PASS. The product assistant is not yet shown to refuse silent restricted sends, stage skips, blocker bypass, cross-tenant reads, self-approval, and rejected or expired approvals. |
| loose-end-stalled-fixture | Deliberately stalled RDUSA test Journey surfaces | sub-gate | NOT STARTED | No stalled RDUSA test Journey is surfaced by the product. |
| pr-60-reviewed | Human review of PR #60 | sub-gate | BLOCKED | Pending Mark. https://github.com/mblackth-ai/sookly-omnichat/pull/60 is draft. CI is green at Actions run 36909457813. Review is a human gate. |
| prod-migration-reviewed | Production migration reviewed | sub-gate | BLOCKED | Pending Mark. Ephemeral CI migrate is not a production migration review. |
| prod-migrate-explicit-approval | Explicit production migrate approval | sub-gate | BLOCKED | Pending Mark. No explicit production migrate approval exists. This slice must not approve it. |
| rollback-backup-understood | Rollback and backup understood | sub-gate | NOT STARTED | No recorded rollback and backup understanding exists for a production Journey migration. |
| staging-smoke | Staging smoke of the persistent path | sub-gate | NOT STARTED | No staging smoke has been run against PrismaJourneyStore. |
| controlled-prod-smoke | Controlled production smoke, no accidental customer message | sub-gate | NOT STARTED | No controlled production smoke has been run. No customer message is authorized from this work. |

```json
{
  "path": "docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md",
  "pilotReady": false,
  "counts": {
    "PASS": 11,
    "FAIL": 1,
    "BLOCKED": 6,
    "NOT STARTED": 20
  },
  "majorCounts": {
    "PASS": 5,
    "FAIL": 1,
    "BLOCKED": 3,
    "NOT STARTED": 8
  },
  "criticalPath": "Next Composer slice: operator Journey rail plus a product HTTP/inbox path that calls PrismaJourneyStore on mblackth-ai/sookly-omnichat. product-prisma-path is FAIL. operator-journey-rail is NOT STARTED. Merge of PR #60, production migration, and deploy stay BLOCKED pending Mark and are not this slice.",
  "nextUnmet": {
    "id": "product-prisma-path",
    "also": "operator-journey-rail",
    "repo": "mblackth-ai/sookly-omnichat",
    "summary": "Operator Journey rail plus a product HTTP/inbox path that calls PrismaJourneyStore"
  },
  "remainingSlices": {
    "min": 6,
    "max": 8,
    "note": "Six to eight bounded slices remain before a live pilot can start. The next slice combines the Prisma product path and the operator rail. Merge, production migration, and deploy are human gates inside that range, not autonomous Composer work."
  },
  "confirmation": "All future RDUSA and Sookly Journey work uses docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md as the fixed finish line. The Golden Rule in that file is not redefined or weakened by this scorecard. pilotReady stays false until every major criterion is PASS.",
  "criteria": [
    {
      "id": "engine-prisma-persistence",
      "criterion": "Prisma production path (PrismaJourneyStore + persistent-approval)",
      "level": "major",
      "parentId": null,
      "status": "PASS"
    },
    {
      "id": "engine-tenant-isolation",
      "criterion": "Journey engine tenant isolation",
      "level": "major",
      "parentId": null,
      "status": "PASS"
    },
    {
      "id": "engine-blockers",
      "criterion": "Journey engine blockers",
      "level": "major",
      "parentId": null,
      "status": "PASS"
    },
    {
      "id": "engine-approval-reject-expiry",
      "criterion": "Approval reject and expiry",
      "level": "major",
      "parentId": null,
      "status": "PASS"
    },
    {
      "id": "engine-human-approval-boundaries",
      "criterion": "Human approval boundaries",
      "level": "major",
      "parentId": null,
      "status": "PASS"
    },
    {
      "id": "product-prisma-path",
      "criterion": "Product HTTP / inbox calls PrismaJourneyStore",
      "level": "major",
      "parentId": null,
      "status": "FAIL"
    },
    {
      "id": "operator-ui-integration",
      "criterion": "Operator Journey UI",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "ai-journey-context",
      "criterion": "Product AI Journey context",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "loose-end-surfacing",
      "criterion": "Loose-end detection surfaced to operators",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "scenario-a-happy-path",
      "criterion": "Acceptance scenario A happy path",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "scenario-b-blocked-path",
      "criterion": "Acceptance scenario B blocked path",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "scenario-c-staff-handoff",
      "criterion": "Acceptance scenario C staff handoff",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "merge-pr-60",
      "criterion": "Merge sookly-omnichat PR #60",
      "level": "major",
      "parentId": null,
      "status": "BLOCKED"
    },
    {
      "id": "prod-migrate",
      "criterion": "Production database migration",
      "level": "major",
      "parentId": null,
      "status": "BLOCKED"
    },
    {
      "id": "production-deploy",
      "criterion": "Production deploy",
      "level": "major",
      "parentId": null,
      "status": "BLOCKED"
    },
    {
      "id": "live-pilot-10-20",
      "criterion": "Live RDUSA pilot, 10 to 20 real Journeys",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "va-sop-product-facing",
      "criterion": "VA handoff SOP inside the operator product",
      "level": "major",
      "parentId": null,
      "status": "NOT STARTED"
    },
    {
      "id": "test-operational-journey-persistent",
      "criterion": "Persistent Journey suite 9/0",
      "level": "sub-gate",
      "parentId": "engine-prisma-persistence",
      "status": "PASS"
    },
    {
      "id": "test-operational-journey",
      "criterion": "In-memory Journey suite 9/0",
      "level": "sub-gate",
      "parentId": "engine-prisma-persistence",
      "status": "PASS"
    },
    {
      "id": "test-human-approval-gate",
      "criterion": "Human approval gate suite 8/0",
      "level": "sub-gate",
      "parentId": "engine-human-approval-boundaries",
      "status": "PASS"
    },
    {
      "id": "test-ops-command",
      "criterion": "Ops command suite 102/0",
      "level": "sub-gate",
      "parentId": "engine-prisma-persistence",
      "status": "PASS"
    },
    {
      "id": "test-agent-tools",
      "criterion": "Agent tools suite 12/0",
      "level": "sub-gate",
      "parentId": "ai-journey-context",
      "status": "PASS"
    },
    {
      "id": "ci-postgres-migrate-and-build",
      "criterion": "CI postgres-migrate-and-build",
      "level": "sub-gate",
      "parentId": "engine-prisma-persistence",
      "status": "PASS"
    },
    {
      "id": "operator-journey-rail",
      "criterion": "Collapsible Contact, Journey, and AI Assistant rail",
      "level": "sub-gate",
      "parentId": "operator-ui-integration",
      "status": "NOT STARTED"
    },
    {
      "id": "journey-view-minimum",
      "criterion": "Journey view minimum fields",
      "level": "sub-gate",
      "parentId": "operator-ui-integration",
      "status": "NOT STARTED"
    },
    {
      "id": "phone-va-workspace",
      "criterion": "Phone-call VA keeps the contact open",
      "level": "sub-gate",
      "parentId": "operator-ui-integration",
      "status": "NOT STARTED"
    },
    {
      "id": "operator-journey-actions",
      "criterion": "Operator Journey actions on the product path",
      "level": "sub-gate",
      "parentId": "operator-ui-integration",
      "status": "NOT STARTED"
    },
    {
      "id": "canonical-lifecycle-in-product",
      "criterion": "Seven-stage lifecycle in the product",
      "level": "sub-gate",
      "parentId": "operator-ui-integration",
      "status": "NOT STARTED"
    },
    {
      "id": "four-dimensions-in-product",
      "criterion": "Four state dimensions separated in the product",
      "level": "sub-gate",
      "parentId": "operator-ui-integration",
      "status": "NOT STARTED"
    },
    {
      "id": "ai-stage-aware",
      "criterion": "Stage-aware AI guidance",
      "level": "sub-gate",
      "parentId": "ai-journey-context",
      "status": "NOT STARTED"
    },
    {
      "id": "ai-safety-product",
      "criterion": "Product AI must-not boundaries",
      "level": "sub-gate",
      "parentId": "ai-journey-context",
      "status": "NOT STARTED"
    },
    {
      "id": "loose-end-stalled-fixture",
      "criterion": "Deliberately stalled RDUSA test Journey surfaces",
      "level": "sub-gate",
      "parentId": "loose-end-surfacing",
      "status": "NOT STARTED"
    },
    {
      "id": "pr-60-reviewed",
      "criterion": "Human review of PR #60",
      "level": "sub-gate",
      "parentId": "merge-pr-60",
      "status": "BLOCKED"
    },
    {
      "id": "prod-migration-reviewed",
      "criterion": "Production migration reviewed",
      "level": "sub-gate",
      "parentId": "prod-migrate",
      "status": "BLOCKED"
    },
    {
      "id": "prod-migrate-explicit-approval",
      "criterion": "Explicit production migrate approval",
      "level": "sub-gate",
      "parentId": "prod-migrate",
      "status": "BLOCKED"
    },
    {
      "id": "rollback-backup-understood",
      "criterion": "Rollback and backup understood",
      "level": "sub-gate",
      "parentId": "prod-migrate",
      "status": "NOT STARTED"
    },
    {
      "id": "staging-smoke",
      "criterion": "Staging smoke of the persistent path",
      "level": "sub-gate",
      "parentId": "product-prisma-path",
      "status": "NOT STARTED"
    },
    {
      "id": "controlled-prod-smoke",
      "criterion": "Controlled production smoke, no accidental customer message",
      "level": "sub-gate",
      "parentId": "production-deploy",
      "status": "NOT STARTED"
    }
  ]
}
```

<!-- rdusa-scorecard:end -->

## Execution protocol

The Chief of Staff and Cursor convert each criterion in the scorecard to PASS, FAIL, BLOCKED, or NOT STARTED. One bounded Composer slice at a time. A slice may change a criterion only with evidence: a commit, pull request, CI run, test count, screenshot, or smoke, as applicable.

Stop at human gates. Merge, production migration, production deploy, credentials, billing, and customer messages are not implied by a documentation or engine-test PASS.

Do not mark the pilot ready from a four-front percentage, a draft PR, or a green in-memory suite.
