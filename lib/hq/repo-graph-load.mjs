/**
 * Read-only evidence for the SookLabs graph.
 * Git subprocesses are limited to inspection commands. No fetch, merge, rebase, or delete.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { buildRepoGraph, SOOKLABS_REPO } from "./repo-graph.mjs";

const execFileAsync = promisify(execFile);
const GIT_ALLOW = new Set(["rev-parse", "for-each-ref", "log", "symbolic-ref", "remote", "merge-base", "diff-tree", "show"]);
const GITHUB_API = "https://api.github.com";

function redact(value) {
  return String(value || "")
    .replace(/x-access-token:[^\s@]+/gi, "x-access-token:[redacted]")
    .replace(/ghp_[A-Za-z0-9]+/g, "[redacted]")
    .replace(/github_pat_[A-Za-z0-9_]+/g, "[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]");
}

function isSookLabsOrigin(url) {
  const cleaned = String(url || "")
    .trim()
    .replace(/:\/\/[^/]*@/, "://")
    .replace(/\.git$/i, "");
  return /github\.com[/:]mblackth-ai\/SookLabs$/i.test(cleaned);
}

async function git(args, cwd) {
  const command = args[0];
  if (!GIT_ALLOW.has(command)) {
    throw new Error("Blocked git command.");
  }
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      timeout: 20000,
    });
    return stdout;
  } catch (err) {
    const message = redact(err instanceof Error ? err.message : "git failed");
    throw new Error(message);
  }
}

function parseLog(stdout) {
  const commits = [];
  for (const record of stdout.split("\x1e")) {
    const trimmed = record.trim();
    if (!trimmed) continue;
    const splitAt = trimmed.indexOf("\n");
    const head = splitAt === -1 ? trimmed : trimmed.slice(0, splitAt);
    const rest = splitAt === -1 ? "" : trimmed.slice(splitAt + 1);
    const [sha, parents, committedAt, author, subject] = head.split("\x1f");
    if (!sha || !/^[0-9a-f]{7,40}$/i.test(sha)) continue;
    commits.push({
      sha,
      parents: parents ? parents.split(" ").filter(Boolean) : [],
      committedAt: committedAt || "",
      author: author || "",
      subject: subject || "",
      paths: rest.split("\n").map((line) => line.trim()).filter(Boolean),
    });
  }
  return commits;
}

function parseRefs(stdout, defaultName) {
  const refs = [];
  for (const line of stdout.split("\n")) {
    if (!line.trim()) continue;
    const [full, sha] = line.split("\0");
    if (!full || !sha || !full.startsWith("origin/")) continue;
    if (full === "origin/HEAD") continue;
    const name = full.slice("origin/".length);
    refs.push({
      name,
      sha,
      isDefault: name === defaultName,
    });
  }
  return refs;
}

export async function readLocalSnapshot(cwd = process.cwd()) {
  let inside = "";
  try {
    inside = (await git(["rev-parse", "--is-inside-work-tree"], cwd)).trim();
  } catch {
    return null;
  }
  if (inside !== "true") return null;

  const originUrl = (await git(["remote", "get-url", "origin"], cwd)).trim();
  if (!isSookLabsOrigin(originUrl)) return null;

  const shallow = (await git(["rev-parse", "--is-shallow-repository"], cwd)).trim() === "true";
  let defaultFull = "origin/master";
  try {
    defaultFull = (await git(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"], cwd)).trim() || defaultFull;
  } catch {
    defaultFull = "origin/master";
  }
  const defaultName = defaultFull.replace(/^origin\//, "") || "master";
  const refText = await git(
    ["for-each-ref", "--format=%(refname:short)%00%(objectname)", "refs/remotes/origin"],
    cwd,
  );
  const refs = parseRefs(refText, defaultName);
  const logText = await git(
    [
      "log",
      "--remotes=origin",
      "--date=iso-strict",
      "--name-only",
      "--pretty=format:%x1e%H%x1f%P%x1f%cI%x1f%aN%x1f%s",
    ],
    cwd,
  );

  return {
    shallow,
    defaultBranch: defaultName,
    refs,
    commits: parseLog(logText),
  };
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sooklabs-hq-repo-timeline",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function githubJson(path) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    throw new Error(`GitHub ${response.status} for ${path.split("?")[0]}`);
  }
  return response.json();
}

function normalizeGithubCommit(item) {
  const message = item.commit?.message || "";
  return {
    sha: item.sha,
    parents: (item.parents || []).map((parent) => parent.sha).filter(Boolean),
    committedAt: item.commit?.committer?.date || item.commit?.author?.date || "",
    author: item.commit?.author?.name || item.commit?.committer?.name || "",
    subject: message.split("\n")[0] || "",
    paths: Array.isArray(item.files) ? item.files.map((file) => file.filename).filter(Boolean) : [],
  };
}

async function listGithubCommits(sha, warnings) {
  const commits = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await githubJson(
      `/repos/${SOOKLABS_REPO}/commits?sha=${encodeURIComponent(sha)}&per_page=100&page=${page}`,
    );
    if (!Array.isArray(data) || data.length === 0) break;
    for (const item of data) commits.push(normalizeGithubCommit(item));
    if (data.length < 100) break;
    if (page === 10) {
      warnings.push(`Commit history for ${String(sha).slice(0, 7)} was capped at 1000 commits.`);
    }
  }
  return commits;
}

async function readGithubSnapshot() {
  const warnings = [];
  const repo = await githubJson(`/repos/${SOOKLABS_REPO}`);
  const defaultBranch = repo.default_branch || "master";
  const refs = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await githubJson(`/repos/${SOOKLABS_REPO}/branches?per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    for (const branch of data) {
      if (!branch?.name || !branch.commit?.sha) continue;
      refs.push({
        name: branch.name,
        sha: branch.commit.sha,
        isDefault: branch.name === defaultBranch,
      });
    }
    if (data.length < 100) break;
  }

  const commits = new Map();
  const defaultRef = refs.find((ref) => ref.isDefault);
  if (defaultRef) {
    for (const commit of await listGithubCommits(defaultRef.sha, warnings)) {
      commits.set(commit.sha, commit);
    }
  }
  for (const ref of refs) {
    if (defaultRef && ref.name === defaultRef.name) continue;
    if (commits.has(ref.sha)) continue;
    for (const commit of await listGithubCommits(ref.sha, warnings)) {
      if (!commits.has(commit.sha)) commits.set(commit.sha, commit);
    }
  }

  return {
    defaultBranch,
    refs,
    commits: [...commits.values()],
    warnings,
    branchNames: refs.map((ref) => ref.name),
  };
}

async function readRemoteBranchNames() {
  const names = [];
  for (let page = 1; page <= 10; page += 1) {
    const data = await githubJson(`/repos/${SOOKLABS_REPO}/branches?per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    for (const branch of data) {
      if (branch?.name) names.push(branch.name);
    }
    if (data.length < 100) break;
  }
  return names;
}

function normalizePull(item) {
  return {
    number: item.number,
    title: item.title || "",
    state: item.state || "closed",
    merged: Boolean(item.merged_at),
    mergedAt: item.merged_at || null,
    htmlUrl: item.html_url || `https://github.com/${SOOKLABS_REPO}/pull/${item.number}`,
    headRef: item.head?.ref || null,
    headSha: item.head?.sha || null,
    mergeCommitSha: item.merge_commit_sha || null,
  };
}

export async function readPullRequests() {
  try {
    const pulls = [];
    for (let page = 1; page <= 5; page += 1) {
      const data = await githubJson(`/repos/${SOOKLABS_REPO}/pulls?state=all&per_page=100&page=${page}`);
      if (!Array.isArray(data) || data.length === 0) break;
      for (const item of data) pulls.push(normalizePull(item));
      if (data.length < 100) break;
      if (page === 5) {
        return {
          pulls,
          partial: true,
          reason: "Pull request list was capped at 500.",
        };
      }
    }
    return { pulls, partial: false, reason: null };
  } catch (err) {
    return {
      pulls: [],
      partial: true,
      reason: `Pull requests could not be loaded. ${redact(err instanceof Error ? err.message : "GitHub request failed")}`,
    };
  }
}

export async function loadSookLabsRepoGraph() {
  const fetchedAt = new Date().toISOString();
  const warnings = [];
  let local = null;
  try {
    local = await readLocalSnapshot();
  } catch (err) {
    warnings.push(redact(err instanceof Error ? err.message : "Local git could not be read."));
    local = null;
  }

  const pullsResult = await readPullRequests();
  if (pullsResult.partial && pullsResult.reason) warnings.push(pullsResult.reason);

  if (local && !local.shallow && local.commits.length && local.refs.some((ref) => ref.isDefault)) {
    try {
      const remoteNames = await readRemoteBranchNames();
      const localNames = new Set(local.refs.map((ref) => ref.name));
      const missing = remoteNames.filter((name) => !localNames.has(name));
      if (missing.length) {
        warnings.push(`Local clone is missing remote branch(es): ${missing.slice(0, 8).join(", ")}.`);
      }
    } catch (err) {
      warnings.push(`Remote branch list was not confirmed. ${redact(err instanceof Error ? err.message : "GitHub request failed")}`);
    }
    return buildRepoGraph({
      repo: SOOKLABS_REPO,
      source: "local-git",
      fetchedAt,
      defaultBranch: local.defaultBranch,
      commits: local.commits,
      refs: local.refs,
      pulls: pullsResult.pulls,
      warnings,
    });
  }

  try {
    const remote = await readGithubSnapshot();
    const reasons = [...warnings, ...remote.warnings];
    if (local?.shallow) reasons.push("The local clone is shallow, so this graph was read from GitHub.");
    return buildRepoGraph({
      repo: SOOKLABS_REPO,
      source: "github",
      fetchedAt,
      defaultBranch: remote.defaultBranch,
      commits: remote.commits,
      refs: remote.refs,
      pulls: pullsResult.pulls,
      warnings: reasons,
    });
  } catch (err) {
    if (local?.commits?.length && local.refs.some((ref) => ref.isDefault)) {
      warnings.push("GitHub history could not be read. Showing the local clone, which may be incomplete.");
      if (local.shallow) warnings.push("The local clone is shallow.");
      warnings.push(redact(err instanceof Error ? err.message : "GitHub request failed"));
      return buildRepoGraph({
        repo: SOOKLABS_REPO,
        source: "local-git",
        fetchedAt,
        defaultBranch: local.defaultBranch,
        commits: local.commits,
        refs: local.refs,
        pulls: pullsResult.pulls,
        warnings,
      });
    }
    return {
      ok: false,
      repo: SOOKLABS_REPO,
      readOnly: true,
      error: `Could not read mblackth-ai/SookLabs history. ${redact(err instanceof Error ? err.message : "Repository read failed")}`,
    };
  }
}

export async function loadCommitDetail(sha) {
  if (!/^[0-9a-f]{7,40}$/i.test(sha || "")) {
    return { ok: false, error: "Invalid commit SHA." };
  }
  const reasons = [];
  let paths = [];
  try {
    const local = await readLocalSnapshot();
    if (local && !local.shallow) {
      const match = local.commits.find((commit) => commit.sha === sha || commit.sha.startsWith(sha));
      if (match) {
        paths = match.paths;
        sha = match.sha;
      }
    }
  } catch {
    reasons.push("Local path list could not be read.");
  }

  let checks = null;
  try {
    const data = await githubJson(`/repos/${SOOKLABS_REPO}/commits/${sha}/status`);
    checks = {
      state: data.state || null,
      total: data.total_count || 0,
      statuses: (data.statuses || []).slice(0, 20).map((status) => ({
        context: status.context || "",
        state: status.state || "",
        description: status.description || "",
        targetUrl: typeof status.target_url === "string" && /^https:\/\//.test(status.target_url)
          ? status.target_url
          : null,
      })),
    };
  } catch (err) {
    reasons.push(`Check state unavailable. ${redact(err instanceof Error ? err.message : "GitHub request failed")}`);
  }

  if (!paths.length) {
    try {
      const data = await githubJson(`/repos/${SOOKLABS_REPO}/commits/${sha}`);
      if (Array.isArray(data.files)) {
        paths = data.files.map((file) => file.filename).filter(Boolean);
      }
    } catch (err) {
      reasons.push(`Changed paths unavailable. ${redact(err instanceof Error ? err.message : "GitHub request failed")}`);
    }
  }

  return {
    ok: true,
    sha,
    paths,
    checks,
    partial: reasons.length > 0,
    partialReasons: reasons,
  };
}

export { redact, SOOKLABS_REPO };
