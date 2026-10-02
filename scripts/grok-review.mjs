#!/usr/bin/env node
/**
 * Grok relay reviewer. Runs in .github/workflows/grok-review.yml.
 *
 * Sends Claude's/Cursor's latest progress (docs/relay/PROGRESS.md), the HQ
 * guardrails, and the diff for this push/PR to Grok (xAI API), then posts
 * Grok's review back to GitHub so the other agents can read it:
 *   - open PR for the branch → one sticky PR comment (updated each run)
 *   - no PR → a commit comment on the pushed SHA
 * Always also writes the GitHub job summary.
 *
 * Env: XAI_API_KEY (secret; job is skipped without it), GROK_MODEL (repo var,
 * default grok-4), GITHUB_* (set by Actions). GROK_DRY_RUN=1 prints the
 * prompt and posts nothing. Put "[skip grok]" in a commit message to skip.
 */

import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const MARKER = "<!-- grok-relay-review -->";
const MAX_DIFF_CHARS = 120_000;
const CONTEXT_FILES = ["docs/relay/PROGRESS.md", "docs/relay/README.md", "docs/HQ-MCP-CONTROL-PLANE.md"];

const env = process.env;
const dryRun = env.GROK_DRY_RUN === "1";
const repo = env.GITHUB_REPOSITORY;
const eventName = env.GITHUB_EVENT_NAME || "workflow_dispatch";
const event = env.GITHUB_EVENT_PATH && existsSync(env.GITHUB_EVENT_PATH)
  ? JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, "utf8"))
  : {};

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }).trim();
const ZERO_SHA = /^0+$/;

function log(msg) {
  console.log(`[grok-review] ${msg}`);
}

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method || "GET"} ${path} → ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function findOpenPr(branch) {
  const owner = repo.split("/")[0];
  const prs = await gh(`/repos/${repo}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`);
  return prs[0] || null;
}

function resolveRange() {
  if (eventName === "pull_request") {
    const pr = event.pull_request;
    return { base: pr.base.sha, head: pr.head.sha, branch: pr.head.ref, pr };
  }
  const head = env.GITHUB_SHA || git("rev-parse", "HEAD");
  const branch = env.GITHUB_REF_NAME || git("rev-parse", "--abbrev-ref", "HEAD");
  let base = event.before && !ZERO_SHA.test(event.before) ? event.before : null;
  if (!base) {
    // New branch or manual run: review everything since it left master.
    for (const ref of ["origin/master", "origin/main"]) {
      try {
        base = git("merge-base", ref, head);
        break;
      } catch {}
    }
  }
  return { base: base || `${head}~1`, head, branch, pr: null };
}

function readContext() {
  return CONTEXT_FILES.filter(existsSync)
    .map((p) => `### ${p}\n\n${readFileSync(p, "utf8")}`)
    .join("\n\n");
}

function buildPrompt({ base, head, branch }) {
  const commits = git("log", "--format=- %h %an: %s", `${base}..${head}`) || "(no commits)";
  const stat = git("diff", "--stat", `${base}...${head}`);
  let diff = git("diff", `${base}...${head}`);
  if (diff.length > MAX_DIFF_CHARS) diff = `${diff.slice(0, MAX_DIFF_CHARS)}\n… diff truncated at ${MAX_DIFF_CHARS} chars`;

  return `Repository: ${repo || "local"}  Branch: ${branch}  Range: ${base.slice(0, 7)}..${head.slice(0, 7)}

## Commits
${commits}

## Agent context (progress report, relay rules, HQ guardrails)
${readContext()}

## Diff stat
${stat}

## Diff
\`\`\`diff
${diff || "(empty)"}
\`\`\``;
}

const SYSTEM = `You are Grok, the reviewing agent in a three-agent relay (Claude, Cursor, Grok) on SookLabs HQ.
Claude and Cursor push work; you review it and they read your review on GitHub. You cannot edit files.
Judge the push against docs/relay/PROGRESS.md (what the agent claims) and the HQ guardrails (no bypassing
Mark's merge/deploy/migration/credential/spend/publishing gates; retainer PASS needs evidence; HQ/MCP is the
only score source). Be specific and brief. Cite file paths. Don't restate the diff.

Reply in exactly this Markdown shape:

**VERDICT:** agree | concerns | block — one line why
**FINDINGS**
1. [severity: high|medium|low] file — issue — suggested fix
**CLAIMS vs DIFF** — anything PROGRESS.md claims that the diff doesn't show, or vice versa (or "consistent")
**SUGGESTED NEXT SLICE** — one bounded next step
**QUESTIONS FOR CLAUDE/CURSOR** — or "none"
**QUESTIONS FOR MARK** — or "none"`;

async function askGrok(prompt) {
  const model = env.GROK_MODEL || "grok-4";
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.XAI_API_KEY}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`xAI API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return { model, text: json.choices?.[0]?.message?.content?.trim() || "(empty reply)" };
}

async function postReview(body, { head, branch, pr }) {
  const target = pr || (await findOpenPr(branch));
  if (target) {
    const comments = await gh(`/repos/${repo}/issues/${target.number}/comments?per_page=100`);
    const mine = comments.find((c) => c.body?.includes(MARKER));
    if (mine) {
      await gh(`/repos/${repo}/issues/comments/${mine.id}`, { method: "PATCH", body: JSON.stringify({ body }) });
      return `updated PR #${target.number} comment ${mine.html_url}`;
    }
    const created = await gh(`/repos/${repo}/issues/${target.number}/comments`, { method: "POST", body: JSON.stringify({ body }) });
    return `commented on PR #${target.number} ${created.html_url}`;
  }
  const created = await gh(`/repos/${repo}/commits/${head}/comments`, { method: "POST", body: JSON.stringify({ body }) });
  return `commented on commit ${head.slice(0, 7)} ${created.html_url}`;
}

async function main() {
  const range = resolveRange();

  if (git("log", "-1", "--format=%B", range.head).includes("[skip grok]")) {
    log("head commit says [skip grok]; skipping");
    return;
  }
  // A push to a branch with an open PR also fires pull_request; review once.
  if (eventName === "push" && !dryRun && (await findOpenPr(range.branch))) {
    log(`open PR exists for ${range.branch}; the pull_request run reviews it`);
    return;
  }

  const prompt = buildPrompt(range);
  if (dryRun) {
    console.log(`--- SYSTEM ---\n${SYSTEM}\n\n--- USER ---\n${prompt}`);
    return;
  }
  if (!env.XAI_API_KEY) {
    log("XAI_API_KEY secret is not set; skipping");
    return;
  }

  const { model, text } = await askGrok(prompt);
  const body = `${MARKER}\n### Grok review — \`${range.head.slice(0, 7)}\` on \`${range.branch}\`\n\n${text}\n\n<sub>${model} · range ${range.base.slice(0, 7)}..${range.head.slice(0, 7)} · scripts/grok-review.mjs</sub>`;

  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${body}\n`);
  log(await postReview(body, range));
}

main().catch((err) => {
  console.error(`[grok-review] ${err.message}`);
  process.exit(1);
});
