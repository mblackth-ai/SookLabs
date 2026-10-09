# Master thesis: the swarm self-learning gate

Date: 3 Oct 2026, Asia/Bangkok.
Audience: Codex, Claude, Cursor, and the Grok seats (Chief of Staff, Product Owner, Eng Supervisor, Baton Relay, and the branch owners).
Status: reflection for the other models to read and score against. Not a build order. Do not code it. Do not commit it onto a branch that is waiting to deploy. Do not merge or deploy from this file.

## Source of truth

Codex and Cursor read this file in `mblackth-ai/SookLabs`. Gemini Spark and Claude read this Google Doc, not the repo: https://docs.google.com/document/d/1fGIQR06GS7TVISNXkJrYSPMNUZG85lgvPE2vHJLVs60/edit

A note that exists only in Drive is invisible to Codex and Cursor. A note that exists only in this repo is invisible to Gemini Spark and Claude. Chief of Staff must update both when a finding changes.

## One sentence of truth

`6ff8435c3fd53861e278d15351bfa8c44335f44e` is on `main` of `mblackth-ai/sookly-omnichat` after the merge of pull request #64. It is not evidenced on `app.sookly.co`. Messenger thread `27062277` is not accepted. Next owner is Mark, for Actions write on Cursor’s GitHub connection. Until that grant is evidenced, nobody dispatches.

If this sentence has not changed, the swarm stays quiet.

## The common goal

SookLabs HQ is the pass/fail board for the company. SEOS is publication and the connect stepper. Outreach is enterprise pain (hands-on customizable automation and man-in-the-loop agents), not clinic cold messages. Sookly is the omnichannel enquiry handler: one contact thread across social and, later, email; a Journey with where-now, one suggested next, and an owner; a human still approves the send.

The later layer, not this ship, is how repeated owner and admin work becomes optional automation. That layer is a semantic cache on the `app.sookly.co` superuser backend, working with n8n and Qwen: cheaper repeated FAQ replies, and a repeated manual action recorded as an automation candidate. Self-learning is a promotion. It is not the default, and it is not pull request #64.

## How the seats are supposed to work

| Seat | Owns | Must not |
|---|---|---|
| Mark | Pay, production deploy, new logins, off-brief, merge | Be asked to restate a block the room already named |
| Chief of Staff | Sequence, on-brief approval, one sentence of truth | Code, clone, grep a repo, or start a second coder |
| Sookly Product Owner | Acceptance and the live score | Deploy, or treat a local screenshot as production |
| Sookly Cursor Impl | The one coding job on the named branch | A second branch, Apps, Vercel, or SSH probing |
| Eng Supervisor | Watch the named PR and checks; launch only the named coder | Add a coder because a check is slow |
| Baton Relay | Winning SHA, who edits next, who stays off | Merge, deploy, or a second coder |
| Codex | QA against the named SHA | Edit the branch Cursor holds |
| Claude | Docs and critique, off the deploy branch | Land design notes on the SHA waiting to ship |

One implementer per branch. In the HQ Finalization room only, Mark allowed Cursor (code), Codex (QA), and Claude (docs) to run beside each other. That override is not a license to invent a feature or open a second door.

## What worked on 3 Oct 2026

One Product Owner scored acceptance. One Cursor agent held the Journey branch (`bc-666d040a-0caf-5876-b8bb-21be3e21a743`). Eng watched checks and did not add a coder. The baton named the winning SHA and who had to stay off it. When the room repeated the same status, it went quiet instead of starting a second deploy. The merge of #64 was checked on GitHub before anyone called it live. A local screenshot was not treated as `app.sookly.co`. Design notes stayed on the box and in Drive, not on the deploy branch. Pull request #62 was left untouched. Pull request #66 stayed docs-only.

## Where the loop failed

The same block was said five ways: no droplet key, Actions HTTP 403, DigitalOcean Apps 401, “run the workflow,” and “grant Actions write.” Those are one gate. Restating them looked like motion.

A retry was dispatched after a “yes” that did not change the token. The same error came back: `HTTP 403: Resource not accessible by integration` on workflow `336692327` (“Pre-release no-migrate deploy”). A retry is not a fix. An approval card is still a dispatch.

DigitalOcean Apps was tried because a connector existed. Production for this app is the droplet workflow, which runs `scripts/deploy-pre-release-no-migrate.sh` with `SOOKLY_DROPLET_SSH_KEY` and does not run `prisma migrate`. Apps, Vercel, and SSH probing stayed in the conversation after the door was known. The newest successful run of that workflow is still 8 Sep 2026 18:21 UTC, head `a4b93733`. No run exists for `6ff8435c`. The live SHA is unverified. Do not claim the droplet is on an older SHA without a fresh inspect.

The global design (FAQ trust, e-commerce versus clinic, semantic cache) arrived while the live SHA was still unconfirmed. The design is real. It is not a reason to open a second coding job.

## The improvement gate

This is the only pass between LLMs. A later model scores the previous handoff with three lines and nothing else.

1. What the handoff got wrong. One defect, named, with the evidence (the SHA, the HTTP status, the workflow id, the thread id).
2. Who edits next. One seat.
3. Who stays off. Name them.

A green build, a local screenshot, a second agent saying “blocked,” or a rewritten status is not a pass. If the three lines are identical to the last pass, the model does not speak and does not dispatch.

### Permission facts

A 403, 401, or `Permission denied (publickey)` is a fact about a credential. Do not dispatch, probe, search a VM for keys, or reauth the wrong product until the permission change is evidenced on the token that will make the call. “Mark said yes” is not evidence. The next successful API call, or Mark showing the grant on that connection, is evidence.

### One door

Name the door in the handoff. For `app.sookly.co` the door is GitHub workflow “Pre-release no-migrate deploy”: `workflow_dispatch` on `main`, inputs `commit` equal to the main tip and `action=deploy`. Other doors stay closed unless that door is proven dead by evidence, not by impatience.

### Design versus the ship

Architecture lands in a doc the swarm can read (this file, the box ledger, or the Drive spec). It does not land on the branch waiting to deploy. Semantic cache, n8n, FAQ auto-reply, and Andrew SOP automation wait until the live SHA is accepted.

## How repeated work becomes automation

Locked by Mark on 3 Oct 2026. Not implemented by this thesis.

Global, for Sookly, HQ, and SEOS: one thread, Journey stage, one suggested next, an owner, and a human approves the send. The self-learning acknowledgement is global. The n8n e-commerce gate is its own implementation. Clinic and dentist lanes do not inherit Andrew’s freight, payment, or purchase-order rules.

Semantic cache, on the superuser backend, with n8n and Qwen:

- A repeated FAQ that has been verified can be promoted to an optional auto-reply for that owner, case by case.
- Answers that contain variables stay manual and are never collapsed into one FAQ.
- Acceptance is per response, not a global auto-send.
- A repeated manual action becomes an automation candidate. It does not become a running automation until that owner accepts the case.

Andrew and RDUSA only, and only after the global gate exists: never touch card numbers (Authorize.net links); written approval of the total before charging, because site orders do not know freight; a purchase order only after payment clears; freight only from the supplier, never estimated or reused; escalate to Andrew for custom discounts, national accounts, damage or complaints, card declines over two, and pricing disputes. Andrew is the owner, not a CRM contact. Do not create an Andrew contact.

Data acquisition for the later layer is the enquiry thread itself: what the owner edited, what they approved, what they refused, and which reply was promoted. That record is the training set. A model does not invent a label, a stage, or a “Connected” state the thread does not show.

## What the other models should do with this file

Read the one sentence of truth. If your work does not change it, stop. If you are the named next editor, do only that edit. If you are named as staying off, do not open the branch, the workflow, or a second agent. When you finish, replace the three gate lines. Do not add a fourth restatement of the same block.

Current gate, for the next model to beat:

- Wrong: the last dispatch treated an announced “yes” as Actions write. Evidence: HTTP 403 on workflow `336692327`, unchanged.
- Next editor: Mark, to put Actions read and write on Cursor’s GitHub connection for `sookly-omnichat`.
- Stay off: Cursor Impl (no dispatch, no approval card), Eng (no second coder), Product Owner (no live score until the droplet run for `6ff8435c` succeeds), Claude and Codex (no edits on that branch).

After the grant is evidenced: one dispatch of that workflow, ref `main`, commit `6ff8435c3fd53861e278d15351bfa8c44335f44e`, action `deploy`, as a reply to agent `bc-666d040a-0caf-5876-b8bb-21be3e21a743`. Then Product Owner scores Messenger `27062277` only. Pass accepts. Fail is one named defect for that same agent.
