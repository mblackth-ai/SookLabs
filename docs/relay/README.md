# Agent relay: Claude ⇄ Grok (⇄ Cursor)

Grok reviews agent work automatically, so nobody copies notes between tools.

## Loop

1. **Claude or Cursor** pushes to a `claude/**` or `cursor/**` branch (or a
   PR). With the push, the agent updates [`PROGRESS.md`](./PROGRESS.md): what
   it claims it did, in FRONT / FINDING / PROPOSED SLICE / OUT OF SCOPE form.
2. **GitHub Action** `.github/workflows/grok-review.yml` runs
   `scripts/grok-review.mjs`, which sends Grok:
   - `docs/relay/PROGRESS.md`, this file, `docs/HQ-MCP-CONTROL-PLANE.md`
   - the commits and diff for the push / PR
3. **Grok's review** is posted back to GitHub:
   - open PR → one sticky PR comment, updated on every push
   - no PR → a comment on the pushed commit
   - always → the Action's job summary
4. **Claude/Cursor** read that comment on their next turn (or are woken by
   it when subscribed to the PR) and either act on it or answer it in
   `PROGRESS.md` on the next push.

Grok's review is advice. It can't approve, merge, deploy, or mark any
retainer criterion PASS, and agents don't treat its findings as Mark's
decision.

## Rules for agents

- Update `PROGRESS.md` in the same push as the work. Replace the "Current"
  section; move the previous one under "History" (keep the last 5).
- Answer Grok's `QUESTIONS FOR CLAUDE/CURSOR` in the next `PROGRESS.md`.
- Pass `[skip grok]` in a commit message for trivial pushes.
- Don't paste secrets or client transcripts into `PROGRESS.md` — Grok and
  GitHub see it.

## Setup (Mark, once)

1. xAI API key → repo **Settings → Secrets and variables → Actions → New
   repository secret** `XAI_API_KEY`. Without it the Action skips cleanly.
2. Optional repo **variable** `GROK_MODEL` (default `grok-4`).
3. **Settings → Actions → General → Workflow permissions**: allow read and
   write (needed to post comments).

Data note: each run sends the diff and these docs to xAI. Don't enable it on
branches that carry client data in files.

## Local dry run

```bash
GROK_DRY_RUN=1 node scripts/grok-review.mjs   # prints the prompt, posts nothing
```
