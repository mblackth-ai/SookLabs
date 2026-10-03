# SL-CONTENT-001 — Claude evidence: Frontier OS mini-series

- Relay: `sooklabs.social.frontier-os.v1` · seat: Claude (copywriting, SW-1)
- Input: ChatGPT drafts 1–3 in [`docs/SOOKLABS_SOCIAL_RELAY.md`](../../SOOKLABS_SOCIAL_RELAY.md) (left unchanged for comparison)
- Date: 2026-10-03 (Asia/Bangkok)
- Gates honoured: **not published, not scheduled.** Mark approves; Codex posts only to a channel Mark names, after HQ Approve.

## What changed from the drafts

- Kept ChatGPT's thesis and structure; tightened every post to one idea, shorter lines, and a first-person founder voice ("I", "we at SookLabs").
- Opened each post with a hook that names the problem in one line, so it reads in the feed preview before "…see more".
- Removed phrasing that implied a finished product ("a visual layer showing…", "solving the handoff problem"). Everything is framed as an experiment we're running, with no results claimed.
- Added one low-pressure question as the CTA. No links, no "DM me", no sales ask.
- Facebook versions only for posts 1 and 3, where the LinkedIn wording leans on work/Git vocabulary a general audience may not share. Post 2 works as-is.

---

## Post 1 — The work was happening

**Hook:** The work was happening. I just couldn't see where it stood.

### LinkedIn

```text
The work was happening. I just couldn't see where it stood.

For the last few months I've been building across several products and repositories at once.

The work was moving. That wasn't the problem.

The problem was knowing where everything actually stood.

Branches in flight. Experiments that started three weeks ago and quietly stalled. Acceptance checks half done. Things waiting on me that I didn't know were waiting on me.

The answer was always "somewhere in GitHub." And a founder shouldn't have to live inside GitHub to understand their own company.

So at SookLabs we've started treating the repository differently. Not only as the place code lives, but as the record of what is actually happening. Then we read that record back as a simple view: what's moving, what's blocked, what's waiting for a decision, and what genuinely finished.

The early lesson surprised me. A better AI model wasn't what we were missing. Being able to see the work was.

It's still an experiment, and I'll share what holds up and what doesn't.

If you run several projects at once, how do you keep track of what's actually blocked?
```

**CTA:** If you run several projects at once, how do you keep track of what's actually blocked?

### Facebook

```text
Something I didn't expect while building SookLabs: the hard part wasn't getting work done. It was knowing where everything stood.

Lots of things moving at once, a few quietly stalled, and some waiting on me without me realising.

So we've started using our project history as the one record of what's going on, and turning it into a simple view: moving, blocked, waiting on a decision, done.

It turns out seeing the work mattered more than having a smarter AI.

Still early days. I'll share what we learn.

How do you keep track of what's stuck when you've got a lot on?
```

---

## Post 2 — AI handoffs

**Hook:** Getting an AI to do the work is the easy part. The handoff is where it breaks.

### LinkedIn

```text
Getting an AI to do the work is the easy part. The handoff is where it breaks.

Something we keep running into while building with several AI agents:

The hard part isn't getting an agent to do a task. It's what happens after it finishes.

Who knows the task is actually complete?
Who owns the next step?
What evidence shows it was really done?
Who hears about it if something is blocked?
When does a human genuinely need to step in?

In most AI workflows I've seen, including ours early on, a person fills those gaps by hand: checking, re-prompting, copying context from one tool to the next, and telling the next system what happened. That's where the time goes.

So at SookLabs we've been trying a simpler rule: treat every piece of work like a relay.

One owner at a time.
A clear finish line.
Evidence attached before the baton moves.
A named next owner.
A human only at a real decision or a real blocker.

It sounds obvious written down. In practice it has changed where our attention goes more than adding another model did.

Where do your AI handoffs break down?
```

**CTA:** Where do your AI handoffs break down?

### Facebook

LinkedIn version works as-is. The question list and the five relay rules read naturally on Facebook too; no adaptation needed.

---

## Post 3 — Git as an operational map

**Hook:** Your Git history already knows what's stalled. Most of us just can't read it that way.

### LinkedIn

```text
Your Git history already knows what's stalled. Most of us just can't read it that way.

Git holds far more than most teams use. It knows when something started, where it branched, what merged, what never merged, and what changed along the way.

But it's presented for developers, not for the people running the business.

At SookLabs we're exploring what happens when you read that same history as an operational map: a timeline where you can follow a product's journey, see branches appear and merge, open a checkpoint to see what changed, and connect engineering progress to ownership, acceptance and priorities.

Not another project board that drifts away from the code. A view of what's actually happening underneath it.

One side effect we didn't plan for: unfinished ideas become very visible. Every branch that started and never landed is right there on the map.

That's uncomfortable to look at. It's also what finally lets us decide, on purpose, what to finish and what to let go.

If you've tried making repo history readable for non-developers, what worked?
```

**CTA:** If you've tried making repo history readable for non-developers, what worked?

### Facebook

```text
Every project leaves a trail: when it started, what changed, what got finished and what quietly stalled.

In software, that trail lives in the code history, but it's written for developers.

We're experimenting at SookLabs with turning it into a simple timeline anyone on the team can read: what's moving, what landed, and what never made it.

The surprise was seeing all the half-finished ideas in one place. Uncomfortable, but it makes it much easier to choose what to finish and what to let go.

Anyone else carrying a pile of half-finished projects?
```

---

## Acceptance (from `SOOKLABS_SOCIAL_RELAY.md` → "Claude acceptance")

| Criterion | Met | Where |
| --------- | --- | ----- |
| All three posts have a polished LinkedIn version | Yes | Posts 1–3 → LinkedIn |
| Facebook adaptation only where it improves fit | Yes | Posts 1 and 3 adapted; post 2 marked as-is, with reason |
| Claims grounded; never "groundbreaking" | Yes | Framed as experiments; no novelty, deployment, automation or results claims (scan below) |
| No private implementation details | Yes | No trigger schemas, endpoints, credentials, tool/agent names, client names or unpublished data (scan below) |
| One suggested hook and one low-pressure CTA per post | Yes | **Hook** / **CTA** lines under each post |
| Result written back to the relay doc or a linked evidence file | Yes | This file, linked from the relay block |

### Checks run on the copy

| Post | Platform | Characters | Banned/private terms found |
| ---- | -------- | ---------- | -------------------------- |
| Post 1 | LinkedIn | 1122 | none |
| Post 1 | Facebook | 572 | none |
| Post 2 | LinkedIn | 1070 | none |
| Post 3 | LinkedIn | 1068 | none |
| Post 3 | Facebook | 553 | none |

Scanned (whole-word, case-insensitive) for: automated, automates, chatgpt, claude, clients, codex, cursor, customers, deployed, endpoint, first, game-chang, grok, groundbreaking, jaka, mcp, n8n, rdusa, revenue, revolutionary, token, unique, webhook, world, and any "%" figure (none found). LinkedIn limit is 3,000 characters; ~1,300 keeps the hook plus first lines above "…see more" on mobile.

## Notes for Analytics (next seat)

- Copy is ready for cadence/timing work. Suggested order follows the thesis: post 1 (problem) → post 2 (handoffs) → post 3 (Git map), but Analytics decides from real performance data.
- Nothing has been scheduled. Mark remains the publish/schedule gate; Codex posts only after HQ Approve on a channel Mark names.
