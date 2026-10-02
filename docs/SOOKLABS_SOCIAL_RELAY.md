# SookLabs Social Relay — Frontier OS Mini-Series

**As of:** 2 Oct 2026 (Asia/Bangkok)
**Purpose:** turn current SookLabs build lessons into useful public content without exposing private implementation details or publishing without founder approval.

## Relay

```yaml
relay:
  relay_id: sooklabs.social.frontier-os.v1
  task_id: SL-CONTENT-001
  current_owner: claude
  status: active
  previous_owner: chatgpt
  next_owner: analytics
  handoff_ready: false
  branch: chatgpt/hq-live-oversight-repo-timeline
  pr: 6
  inputs:
    - docs/AGENT_RELAY_PROTOCOL.md
    - docs/SOOKLABS_SWARM_RUNTIME.md
    - data/hq/ops.json
  output_expected:
    - polished LinkedIn versions of all three posts
    - adapted Facebook versions where platform tone materially differs
    - concise hooks and CTA options that do not reveal private architecture
    - no invented claims of novelty, deployment, automation or results
  gates:
    - no_publish
    - no_schedule
    - mark_approval_required
```

Human-readable baton:

```text
CHATGPT D | CLAUDE A | ANALYTICS - | MARK -
```

The repo records that Claude owns the next editorial step. Until the Butler/webhook runtime exists, this state does **not** itself wake Claude.

## Editorial thesis

Do not sell "another AI agent framework." The useful story is operational:

1. work can be happening while the founder still lacks situational awareness;
2. model quality does not solve broken handoffs;
3. Git/repo history can become a visual operational map;
4. the founder should be pulled in for exceptions, blockers and approvals instead of babysitting every step;
5. SookLabs is testing an HQ layer that makes those states visible while keeping the repository as durable truth.

Do not expose private trigger schemas, credentials, internal MCP endpoints, unpublished business data, customer data, or proprietary relay implementation details.

## Draft 1 — Stop living in the repo

Over the last few months, one problem kept showing up while building across multiple products and repositories:

The work was happening.

The problem was understanding where everything actually stood.

Branches, unfinished experiments, acceptance tasks, blockers, deployments, agent work, ideas that started three weeks ago and quietly disappeared into Git.

A founder should not have to live inside GitHub to understand the state of their company.

So we started treating the repository differently.

Not just as somewhere code lives, but as a source of operational truth that can be translated into a visual layer showing what is moving, what is blocked, what is waiting for approval, what reached the finish line and where attention is actually required.

The interesting lesson has been that better AI models are not always the answer.

Sometimes the biggest improvement comes from making the work itself visible.

That is one of the things we are experimenting with inside SookLabs right now.

## Draft 2 — AI handoffs

Something we learned building with multiple AI agents:

The difficult part is not getting an AI to do work.

The difficult part is what happens after it finishes.

Who knows the task is complete? Who owns the next step? What evidence proves it was actually done? Who gets notified if something is blocked? When does a human genuinely need to enter the loop?

Most AI workflows still rely heavily on someone manually checking, prompting, copying context and telling the next system what happened.

That destroys flow.

We have been experimenting with a different idea at SookLabs: treat every piece of work like a relay.

One owner at a time. A defined finish line. Evidence attached. A clear next owner. Human attention only when a real gate or blocker appears.

It sounds simple.

But solving the handoff problem may be considerably more important than adding another model to the stack.

## Draft 3 — Git as an operational map

Git history contains far more information than most teams actually use.

It knows when something started, where it branched, what merged, what never merged and what changed.

But most of that information is presented for developers rather than operators.

We are exploring what happens when you turn that history into something closer to an operational map: a visual timeline where you can understand the journey of a product, see branches appear and merge, inspect important checkpoints and connect engineering progress with acceptance, ownership and business priorities.

Not another project management board disconnected from the code.

A visual interpretation of what is actually happening underneath it.

One unexpected benefit: you start seeing the cost of unfinished ideas very clearly.

And when you can see that complexity, you can finally start controlling it.

## Claude acceptance

Claude should return the baton only when:

- all three posts have a polished LinkedIn version;
- Facebook adaptation is supplied only where it improves fit;
- claims remain grounded and do not call the system "groundbreaking";
- no private implementation details are disclosed;
- each post has one suggested hook and one low-pressure CTA;
- the result is written back into this document or a linked evidence file.

Then update the relay to:

```yaml
current_owner: analytics
previous_owner: claude
status: active
handoff_ready: false
```

Analytics should use real available performance data to recommend cadence/timing. Mark remains the final publish/schedule gate.
