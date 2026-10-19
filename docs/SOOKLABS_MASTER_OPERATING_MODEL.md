# SookLabs Master Operating Model

Status: architecture north star and agent control contract
Date: 2026-10-03
Authority: Mark retains merge, deploy, production migration, billing, secrets, and external publishing authority.

## The end goal

This is one operating ecosystem, not four unrelated products.

**SEOS creates and amplifies demand. Sookly receives, understands, and progresses relationships. SookLabs HQ observes and coordinates the whole system. RDUSA is a controlled real-world operating/evidence surface. MCP and agent automation provide the connective tissue.**

The lifecycle is a continuous closed loop:

```text
                    SOOKLABS HQ
              MASTER CONTROL PLANE
       observe | govern | coordinate | verify
                       |
                       v
SEOS OUTREACH --> PEOPLE / ATTENTION --> SOOKLY INCOMING
     ^                                      |
     |                                      v
     |                              CAPTURE + IDENTITY
     |                                      |
     |                                      v
     |                               JOURNEY / CRM
     |                                      |
     |                                      v
     +---- INSIGHTS / NEXT ACTION <--- ACTION / EXECUTION
                       |
                       v
             RESULTS + EVIDENCE
                       |
                       +----> HQ learns / reallocates / improves
                       +----> SEOS improves outreach
                       +----> Sookly improves journeys
```

## Product responsibilities

### SEOS: outbound growth control plane
Owns:
- content and campaign preparation
- multi-channel outreach/distribution
- channel-specific variants
- community/social workflows
- engagement and performance evidence
- safe handoff of attention/leads into Sookly

SEOS must never equate a selected channel with permission to publish. Publishing remains governed by connector capability, approval state, and explicit authority.

### Sookly: inbound relationship and Journey/CRM plane
Owns:
- incoming conversations
- identity/contact capture
- intent and context
- AI receptionist/assistive intelligence
- Journey assignment and progression
- CRM/contact state
- tasks, follow-up, opportunities, handoff
- retention/referral relationship continuity

Sookly should turn incoming attention into structured, actionable relationship state.

### SookLabs HQ: master oversight and orchestration plane
Owns:
- portfolio/project visibility
- agent and baton coordination
- evidence and acceptance state
- decisions and governance
- cross-repo operational visibility
- MCP/tool gateway and controlled execution
- analytics, alerts, bottlenecks, and next-action prioritization

HQ is not another duplicate CRM or social tool. It supervises and coordinates the specialist systems.

### RDUSA: internal retainer control and proof surface
Owns:
- contribution/value ledger
- evidence-backed delivery state
- retainer scope truth
- verified outcomes and gaps
- controlled real-world proof of the ecosystem

RDUSA evidence must remain conservative. A capability is not "delivered" because another repo contains code.

## Shared lifecycle vocabulary

Agents should map work to one or more lifecycle stages:

1. Incoming / Attention
2. Capture + Identity
3. Journey / CRM
4. Action + Execution
5. Outreach / Amplification
6. Results + Evidence
7. HQ Oversight + Learning

Every substantial feature should answer:
- Which lifecycle stage does it serve?
- Which product owns the state?
- What event/data crosses a boundary?
- What evidence proves the handoff?
- What requires human approval?

## Cross-system contract

Prefer explicit events/contracts over hidden coupling.

Minimum conceptual event family:
- `attention.created`
- `conversation.received`
- `contact.identified`
- `intent.detected`
- `journey.assigned`
- `journey.stage_changed`
- `task.created`
- `handoff.requested`
- `outreach.prepared`
- `outreach.approved`
- `outreach.published`
- `engagement.observed`
- `opportunity.changed`
- `outcome.recorded`
- `evidence.attached`
- `agent.baton_changed`

Do not implement all events merely because they are listed here. Introduce them only when a bounded feature requires the contract.

## Agent hierarchy and baton rule

The operating hierarchy is:

```text
MARK
  |
SOOKLABS HQ / ORCHESTRATOR
  |
  +--> specialist coding agents
  +--> visual/browser QA agents
  +--> SEOS agents
  +--> Sookly agents
  +--> RDUSA evidence agents
  +--> MCP/tool adapters
```

HQ/orchestrator is the baton master. It should identify the next eligible bounded action, assign it, wait for evidence, then advance or escalate.

Every baton must contain:
- STATUS: READY / ACTIVE / BLOCKED / PASS / FAIL
- repository and branch
- acceptance criterion
- exact evidence
- what changed
- what deliberately did not change
- tests/runtime/visual result
- next baton
- HUMAN APPROVAL REQUIRED: YES / NO

Agents must not invent progress to keep the relay moving.

## Acceptance philosophy

A feature is not complete because code exists.

Where applicable, completion requires:
1. repository truth
2. automated verification
3. runtime verification
4. visual/browser verification
5. integration/handoff evidence
6. control/evidence document update

Existing unrelated quality debt must remain visible. Do not weaken gates to manufacture green status.

## Human authority gates

Without explicit human approval, agents must not:
- merge to the primary branch
- deploy production
- apply production database migrations
- expose/change production secrets
- change billing
- publish/send external customer content
- perform destructive or irreversible external actions

At a gate, report:
1. exactly what is ready
2. evidence
3. risk
4. smallest approval needed

## Architectural decision test

Before adding a new subsystem, ask:

1. Does an existing product already own this responsibility?
2. Does it strengthen the closed lifecycle?
3. Is the system of record clear?
4. Can HQ observe the state without duplicating it?
5. Can the handoff be tested?
6. Does this reduce manual founder coordination?

If not, stop and record the proposal rather than expanding architecture.

## North-star outcome

The ecosystem should eventually demonstrate a measurable loop:

**SEOS generates attention -> Sookly captures and progresses the relationship -> actions and follow-up occur -> outcomes and engagement are measured -> HQ sees evidence and bottlenecks -> agents/humans improve the next cycle -> SEOS and Sookly execute the improved cycle.**

The desired end state is not maximum automation. It is **controlled, observable automation with explicit ownership, evidence, and human authority at consequential boundaries.**

## Instruction to all AI agents

Treat this document as the master architecture intent, not permission to rewrite working systems.

When local repo truth conflicts with this document:
- preserve working behavior
- identify the discrepancy
- propose the smallest reconciliation
- update decision/control documentation if architecture genuinely changes
- never silently reinterpret the product to fit this document

Optimize for completing the closed lifecycle and reducing unverified handoffs, not for adding features.
