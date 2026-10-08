# Agent relay document placement

Status: PROPOSED for agent review in [HQ PR #10](https://github.com/mblackth-ai/SookLabs/pull/10)  
Owner: SookLabs HQ reconciler  
Effective only after the linked proposal is reviewed and approved

## One predictable entrypoint

Every participating repo uses `docs/agent-relay/README.md` as its **discovery entrypoint**. Start there, then follow its active PR/evidence links and check the current head SHA. HQ keeps a cross-repo [INDEX.md](./INDEX.md). The index is a pointer, not a claim that a task is complete. The task's PR thread or recorded decision contains the current baton.

Do not move or erase existing product records. Sookly's `sookly-control/agent-reports`, SEOS's `docs/agent/DECISIONS.md`, and RDUSA's root/article-harness reports retain their history and domain authority. Add a link to the old record when a new relay record supersedes it. Product code and deployment truth come from their own repos and runtime evidence, not from this directory.

## Common paths in all four repos

| Path | Owner and purpose |
| --- | --- |
| `docs/agent-relay/README.md` | Discover the local baton and the HQ index; changes need cross-agent review. |
| `docs/agent-relay/records/YYYY-MM-DDTHHMMSSZ__WORK-ID__AGENT__TYPE.md` | One agent's immutable-after-merge finding, handoff, verification, or blocker. Create a new record for a correction. |
| `docs/agent-relay/specs/CONTRACT-ID-vN.md` | Versioned cross-agent contract authored by the domain owner, reviewed by consumers. A Google Doc title ending in `.md` is not a tracked file here. |
| `docs/agent-relay/decisions/DECISION-ID.md` | An approved decision, its authority, alternatives, links and rollback/supersession. Do not record an unapproved proposal as a decision. |

Use lowercase `kebab-case` for `WORK-ID` and `AGENT` (`gemini`, `claude`, `cursor`, `codex`, `grok`). Use UTC in filenames. One record has one author and one work item. Do not create a competing `latest.md`; only the HQ reconciler updates the cross-repo index after verifying a source link. If a repo cannot adopt this layout, document the exception in its local README and the HQ index rather than silently choosing another path.

## Live handoff and review

1. **HQ assigns** one bounded work item in its owning repo's PR thread: owner, exact source SHA, acceptance criterion, evidence required, approval gate and next reviewer.
2. **Agent acknowledges** in that thread before changing code or a shared doc. The agent chooses an exclusive branch/path and names any overlap. No acknowledgement means unclaimed, not approved.
3. **Agent works** on its branch. PR comments can carry interim status; the dated Markdown record is the durable finding once there is evidence. Every claim labels fixture, staging, preview or production data.
4. **Independent reviewer checks** exact commit, tests, runtime and negative cases applicable to the slice. A local screenshot, CI pass, merge, deploy and product acceptance are separate fields.
5. **HQ reconciles** conflicting findings in the same PR thread, links the accepted record from `INDEX.md`, and issues the next baton. Only Mark or his explicitly authorized delegate crosses merge, production deploy, migration, billing, credential and external-send/publish gates.

If a runner is blocked, post the exact failing action, status/error (without secrets), owner able to change it and the observable unblock condition. Polling every five minutes works only while a runner is active; durable wake-up needs a repo event, webhook or HQ job callback. Retried handoffs and external actions need idempotency keys. Do not claim another agent received a chat message merely because it was posted in a different tool.

## Minimum record fields

```yaml
record_version: 1
work_id: sookly-journey-64-live-check
agent: codex
recorded_at_utc: 2026-10-03T00:00:00Z # replace with actual time
repo: mblackth-ai/sookly-omnichat
branch: main
source_sha: FULL_COMMIT_SHA
status: READY|ACTIVE|BLOCKED|PASS|FAIL|UNKNOWN
acceptance: one observable criterion
evidence: [exact PR, CI, run, screenshot or probe links]
data_scope: fixture|staging|preview|production
findings: confirmed facts and unresolved questions
next_owner: named agent or human
next_action: smallest bounded step
human_approval_required: true|false
supersedes: null # link when correcting an older record
```

Use real YAML values in a record; the template's alternatives are explanatory. Never include tokens, customer private data or unreviewed copy for public sending. If the source SHA changes, recheck the claim before carrying it forward. Record a new finding when an earlier one is wrong; leave a pointer on the old PR thread so the correction reaches every reviewer.

## How agents review this proposal

Gemini checks architecture and source precedence; Claude checks backend/n8n/data paths; Cursor checks UI, CI and deploy handoffs; Codex checks deterministic evidence and testability; Grok checks outreach and outcome evidence. Each should reply on [HQ PR #10](https://github.com/mblackth-ai/SookLabs/pull/10) with `ACK`, `AMEND`, or `BLOCK`, the exact file/line or example, and one next owner. Silence is not consensus. Mark decides any policy conflict; HQ then publishes the agreed version and updates the three component entrypoints.
