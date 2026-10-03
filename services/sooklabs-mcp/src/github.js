import { SOOKLABS_GITHUB_REPO } from "./constants.js";

const GITHUB_API = "https://api.github.com";

/**
 * @param {{ token: string }} options
 */
export function createGitHubClient({ token }) {
  const [owner, name] = SOOKLABS_GITHUB_REPO.split("/");
  const base = `${GITHUB_API}/repos/${owner}/${name}`;

  /**
   * @param {string} path
   * @param {RequestInit} [init]
   */
  async function gh(path, init = {}) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    };
    const response = await fetch(`${base}${path}`, { ...init, headers });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`GitHub API ${response.status} ${path}: ${body.slice(0, 300)}`);
    }
    return response.json();
  }

  /**
   * @param {string} path
   * @param {RequestInit} [init]
   */
  async function ghRaw(path, init = {}) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    };
    return fetch(`${base}${path}`, { ...init, headers });
  }

  return {
    async getRepository() {
      return gh("");
    },

    async listOpenIssues() {
      const issues = [];
      let page = 1;
      for (;;) {
        const batch = await gh(
          `/issues?state=open&per_page=100&page=${page}&sort=updated&direction=desc`
        );
        if (!Array.isArray(batch) || batch.length === 0) break;
        for (const issue of batch) {
          if (issue.pull_request) continue;
          issues.push(issue);
        }
        if (batch.length < 100) break;
        page += 1;
        if (page > 10) break;
      }
      return issues;
    },

    async repoHasLabel(labelName) {
      const response = await ghRaw(`/labels/${encodeURIComponent(labelName)}`);
      if (response.status === 404) return false;
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`GitHub API ${response.status} /labels/${labelName}: ${body.slice(0, 300)}`);
      }
      return true;
    },

    async getDefaultBranchHeadSha(defaultBranch) {
      const ref = await gh(`/git/ref/heads/${encodeURIComponent(defaultBranch)}`);
      const sha = ref?.object?.sha;
      if (typeof sha !== "string") {
        throw new Error("Could not resolve default branch HEAD");
      }
      return sha;
    },

    async listCheckRunsForRef(ref) {
      const data = await gh(`/commits/${encodeURIComponent(ref)}/check-runs?per_page=100`);
      return Array.isArray(data.check_runs) ? data.check_runs : [];
    },

    async listCommitStatusesForRef(ref) {
      const data = await gh(`/commits/${encodeURIComponent(ref)}/status`);
      return Array.isArray(data.statuses) ? data.statuses : [];
    },

    async listDeployments(limit = 30) {
      const data = await gh(`/deployments?per_page=${Math.min(limit, 100)}`);
      return Array.isArray(data) ? data : [];
    },

    async listDeploymentStatuses(deploymentId) {
      const data = await gh(`/deployments/${deploymentId}/statuses?per_page=10`);
      return Array.isArray(data) ? data : [];
    },
  };
}

function mapIssueRow(issue) {
  return {
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    labels: (issue.labels ?? []).map((label) => label.name),
    updated_at: issue.updated_at,
  };
}

function issueHasLabel(issue, labelName) {
  return (issue.labels ?? []).some((label) => label.name === labelName);
}

/**
 * @param {ReturnType<createGitHubClient>} github
 * @param {string} seat
 */
export async function projectStatus(github, seat) {
  const repo = await github.getRepository();
  const openIssues = await github.listOpenIssues();
  return {
    repo: repo.full_name,
    default_branch: repo.default_branch,
    last_push_at: repo.pushed_at,
    open_issue_count: openIssues.length,
    homepage: repo.homepage ?? null,
    visibility: repo.private ? "private" : repo.visibility ?? "public",
    seat,
  };
}

/**
 * @param {ReturnType<createGitHubClient>} github
 * @param {string} seat
 */
export async function blockers(github, seat) {
  const [openIssues, blockerLabelOnRepo] = await Promise.all([
    github.listOpenIssues(),
    github.repoHasLabel("blocker"),
  ]);

  if (!blockerLabelOnRepo) {
    return {
      issues: openIssues.map(mapIssueRow),
      seat,
      label_missing: true,
    };
  }

  const blockerIssues = openIssues.filter((issue) => issueHasLabel(issue, "blocker"));
  return {
    issues: blockerIssues.map(mapIssueRow),
    seat,
  };
}

/**
 * @param {ReturnType<createGitHubClient>} github
 * @param {string} seat
 */
export async function buildStatus(github, seat) {
  const repo = await github.getRepository();
  const sha = await github.getDefaultBranchHeadSha(repo.default_branch);
  const [checkRuns, statuses] = await Promise.all([
    github.listCheckRunsForRef(sha),
    github.listCommitStatusesForRef(sha),
  ]);

  const checks = [
    ...checkRuns.map((run) => ({
      name: run.name,
      state: run.status === "completed" ? run.conclusion ?? run.status : run.status,
      url: run.html_url ?? run.details_url ?? null,
      updated_at: run.completed_at ?? run.started_at ?? null,
    })),
    ...statuses.map((status) => ({
      name: status.context,
      state: status.state,
      url: status.target_url ?? null,
      updated_at: status.updated_at ?? null,
    })),
  ];

  return { sha, checks, seat };
}

/**
 * @param {ReturnType<createGitHubClient>} github
 * @param {string} seat
 */
export async function deployStatus(github, seat) {
  const repo = await github.getRepository();
  const deployments = await github.listDeployments(30);
  const rows = await Promise.all(
    deployments.map(async (deployment) => {
      const statuses = await github.listDeploymentStatuses(deployment.id);
      const latest = statuses[0];
      return {
        environment: deployment.environment,
        sha: deployment.sha,
        created_at: deployment.created_at,
        state: latest?.state ?? "unknown",
        environment_url: latest?.environment_url ?? deployment.url ?? null,
        log_url: latest?.log_url ?? null,
      };
    })
  );

  return {
    deployments: rows,
    homepage: repo.homepage ?? null,
    seat,
  };
}
