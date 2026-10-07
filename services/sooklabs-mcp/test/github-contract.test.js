import assert from "node:assert/strict";
import { test } from "node:test";
import { SOOKLABS_GITHUB_REPO } from "../src/constants.js";
import { createGitHubClient, projectStatus } from "../src/github.js";

const REPO_API = `https://api.github.com/repos/${SOOKLABS_GITHUB_REPO}`;

test("GitHub client only requests the hard-locked SookLabs repository", async () => {
  const seen = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    seen.push(url);
    if (!url.startsWith(REPO_API)) {
      return new Response("wrong repo", { status: 404 });
    }
    const path = url.slice(REPO_API.length).split("?")[0];
    if (path === "") {
      return Response.json({
        full_name: SOOKLABS_GITHUB_REPO,
        default_branch: "master",
        pushed_at: "2026-01-01T00:00:00Z",
        private: true,
      });
    }
    if (path === "/issues") {
      return Response.json([
        { title: "real issue" },
        { title: "pr disguised as issue", pull_request: { url: "https://github.example/pr/1" } },
      ]);
    }
    if (path === "/git/ref/heads/master") {
      return Response.json({ object: { sha: "abc" } });
    }
    if (path.startsWith("/commits/")) {
      if (path.endsWith("/check-runs")) return Response.json({ check_runs: [] });
      if (path.endsWith("/status")) return Response.json({ statuses: [] });
    }
    if (path === "/deployments") return Response.json([]);
    return new Response("unexpected", { status: 404 });
  };
  try {
    const github = createGitHubClient({ token: "fixture-token" });
    await github.getRepository();
    const openIssues = await github.listOpenIssues();
    assert.equal(openIssues.length, 1);
    assert.equal(openIssues[0].title, "real issue");
    await github.getDefaultBranchHeadSha("master");
    await github.listCheckRunsForRef("abc");
    await github.listCommitStatusesForRef("abc");
    await github.listDeployments(5);
    assert.ok(seen.length > 0);
    assert.ok(seen.every((url) => url.startsWith(REPO_API)), seen.join("\n"));
    assert.ok(!seen.some((url) => url.includes("/repos/other-org/")));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("project_status open_issue_count ignores pull requests", async () => {
  const github = {
    async getRepository() {
      return {
        full_name: SOOKLABS_GITHUB_REPO,
        default_branch: "master",
        pushed_at: "2026-01-01T00:00:00Z",
        homepage: null,
        private: true,
      };
    },
    async listOpenIssues() {
      return [{ title: "issue" }];
    },
  };
  const payload = await projectStatus(github, "codex");
  assert.equal(payload.open_issue_count, 1);
  assert.equal(payload.repo, SOOKLABS_GITHUB_REPO);
});
