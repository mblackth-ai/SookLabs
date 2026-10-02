---
name: hq-relay
description: Work in the Claude ⇄ Grok ⇄ Cursor relay on SookLabs — update docs/relay/PROGRESS.md (FRONT / FINDING / PROPOSED SLICE / OUT OF SCOPE), preview or run the Grok review, read Grok's review comment, and answer its questions. Use when finishing a slice, reporting progress, handing off to Cursor/Grok, or when asked what Grok said.
---

# HQ agent relay

Grok reviews every push to `claude/**` and `cursor/**` automatically
(`.github/workflows/grok-review.yml` → `scripts/grok-review.mjs`). It reads
`docs/relay/PROGRESS.md`, `docs/relay/README.md`,
`docs/HQ-MCP-CONTROL-PLANE.md` and the diff, and posts one review back on
GitHub. Your job each slice: keep `PROGRESS.md` true, read the review, answer it.
Paths are relative to the SookLabs repo root.

## Every slice

1. **Update `docs/relay/PROGRESS.md` in the same commit as the work.**
   Replace `## Current` with your report; move the old one under `## History`
   (keep 5). Shape:
   - `FRONT` — which of the four fronts (or retainer work)
   - `FINDING` — what you verified, with file paths / SHAs
   - `PROPOSED SLICE` — what this push contains
   - `OUT OF SCOPE` — what you deliberately did not do
   - `QUESTIONS FOR MARK`, `ANSWERS TO GROK`
2. **Preview what Grok will see** (prints the prompt, sends nothing):

   ```bash
   echo '{"before":"<base sha>"}' > /tmp/ev.json
   GROK_DRY_RUN=1 GITHUB_EVENT_NAME=push GITHUB_EVENT_PATH=/tmp/ev.json \
     GITHUB_REF_NAME=$(git branch --show-current) node scripts/grok-review.mjs > /tmp/grok-prompt.md
   grep -n '^## \|^### ' /tmp/grok-prompt.md   # sections Grok will get
   ```

   If `PROGRESS.md` claims something the diff doesn't show, fix it before
   pushing — that's the first thing Grok checks.
3. **Push.** For a trivial push, put `[skip grok]` in the commit message.
4. **Read the review** next turn. It's the PR comment containing
   `<!-- grok-relay-review -->` (updated in place each push), or a commit
   comment on the pushed SHA when there's no PR. Use the GitHub MCP tools
   (`pull_request_read` / `get_commit`) on `mblackth-ai/SookLabs`.
5. **Act or answer.** Fix real findings in the next push; answer
   `QUESTIONS FOR CLAUDE/CURSOR` under `ANSWERS TO GROK`. Pass
   `QUESTIONS FOR MARK` to the user.

## Rules

- Grok is advice, not approval. Never merge, deploy, migrate, or mark a
  retainer criterion PASS because Grok agreed.
- No PR, merge, or deploy without Mark's explicit say-so.
- No secrets, tokens, client transcripts or phone numbers in `PROGRESS.md` or
  any committed file — the Action sends them to xAI.
- Lane: SookLabs / SEOS / sookly-omnichat only. No greenfield hub repos.

## Gotchas

- The Action needs repo secret `XAI_API_KEY` and "Read and write" workflow
  permissions; without the key it logs a skip and exits 0, so a silent
  missing review usually means the secret isn't set.
- A push to a branch with an open PR is reviewed once, by the
  `pull_request` run; the `push` run skips itself.
- Default model is `grok-4`; set repo variable `GROK_MODEL` to change it
  (Grok 4.3+ is needed for Remote MCP, see `docs/adr/2026-10-hq-mcp-server.md`).
