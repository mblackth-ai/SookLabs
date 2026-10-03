import { createHash, createHmac, timingSafeEqual } from "crypto";

// GitHub adapter for the HQ room: resolve evidence refs, read CI, verify
// webhooks, and commit promoted batons. Token: HQ_GITHUB_TOKEN (fine-grained,
// SookLabs only: Contents read/write, Pull requests read, Checks read,
// Commit statuses read). Without it every ref stays unverified and promote
// falls back to a paste block.

const API = "https://api.github.com";
const TIMEOUT_MS = 5000;

export function githubConfig(env = process.env) {
  const repo = (env.HQ_GITHUB_REPO || "mblackth-ai/SookLabs").trim();
  const repos = (env.HQ_GITHUB_REPOS || repo)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return {
    token: (env.HQ_GITHUB_TOKEN || "").trim(),
    webhookSecret: (env.HQ_GITHUB_WEBHOOK_SECRET || "").trim(),
    repo,
    repos,
    logBranch: (env.HQ_ROOM_LOG_BRANCH || "room/log").trim(),
  };
}

export class GitHubError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function gh(path, { token, method = "GET", body, fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`${API}${path}`, {
    method,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "sooklabs-hq-room",
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new GitHubError(res.status, `GitHub ${method} ${path.split("?")[0]} → ${res.status}`);
  return res.status === 204 ? {} : res.json();
}

const REPO = "[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+";
const SHA = "[0-9a-f]{7,40}";

/** Parse a room ref into a GitHub target, or null when it is not checkable. */
export function parseRef(input, defaultRepo) {
  const type = String(input?.type || "").toLowerCase();
  const text = String(input?.url || input?.ref || "").trim();
  let m;
  if ((m = text.match(new RegExp(`^https://github\\.com/(${REPO})/pull/(\\d+)`)))) {
    return type === "ci" ? { kind: "ci-pr", repo: m[1], number: Number(m[2]) } : { kind: "pr", repo: m[1], number: Number(m[2]) };
  }
  if ((m = text.match(new RegExp(`^https://github\\.com/(${REPO})/commit/(${SHA})`, "i")))) {
    return { kind: type === "ci" ? "ci" : "commit", repo: m[1], sha: m[2].toLowerCase() };
  }
  if ((m = text.match(new RegExp(`^https://github\\.com/(${REPO})/actions/runs/(\\d+)`)))) {
    return { kind: "run", repo: m[1], id: Number(m[2]) };
  }
  if ((m = text.match(new RegExp(`^https://github\\.com/(${REPO})/blob/([^/]+)/(.+)$`)))) {
    return { kind: "file", repo: m[1], ref: m[2], path: m[3] };
  }
  if (type === "pr" && (m = text.match(new RegExp(`^(?:(${REPO}))?#?(\\d+)$`)))) {
    return { kind: "pr", repo: m[1] || defaultRepo, number: Number(m[2]) };
  }
  if ((type === "commit" || type === "ci") && (m = text.match(new RegExp(`^(?:(${REPO})@)?(${SHA})$`, "i")))) {
    return { kind: type === "ci" ? "ci" : "commit", repo: m[1] || defaultRepo, sha: m[2].toLowerCase() };
  }
  if (type === "file" && (m = text.match(new RegExp(`^(?:(${REPO}):)?([^@\\s]+)(?:@(\\S+))?$`)))) {
    return { kind: "file", repo: m[1] || defaultRepo, path: m[2], ref: m[3] || "" };
  }
  return null;
}

const FAILED = new Set(["failure", "cancelled", "timed_out", "action_required", "startup_failure", "stale"]);

/** pass | fail | pending | unknown for one commit, from check runs and commit statuses. */
export async function commitCiState({ repo, sha, token, fetchImpl }) {
  const [checks, status] = await Promise.all([
    gh(`/repos/${repo}/commits/${sha}/check-runs?per_page=100`, { token, fetchImpl }),
    gh(`/repos/${repo}/commits/${sha}/status`, { token, fetchImpl }),
  ]);
  const states = [];
  for (const run of checks?.check_runs || []) {
    if (run.status !== "completed") states.push("pending");
    else states.push(FAILED.has(run.conclusion) ? "fail" : "pass");
  }
  if ((status?.total_count || 0) > 0) {
    states.push(status.state === "success" ? "pass" : status.state === "pending" ? "pending" : "fail");
  }
  if (states.includes("fail")) return "fail";
  if (states.includes("pending")) return "pending";
  return states.length ? "pass" : "unknown";
}

async function resolveTarget(target, { token, fetchImpl }) {
  const enc = (path) => path.split("/").map(encodeURIComponent).join("/");
  switch (target.kind) {
    case "pr":
      return Boolean(await gh(`/repos/${target.repo}/pulls/${target.number}`, { token, fetchImpl }));
    case "commit":
      return Boolean(await gh(`/repos/${target.repo}/commits/${target.sha}`, { token, fetchImpl }));
    case "ci":
      return (await commitCiState({ repo: target.repo, sha: target.sha, token, fetchImpl })) === "pass";
    case "ci-pr": {
      const pr = await gh(`/repos/${target.repo}/pulls/${target.number}`, { token, fetchImpl });
      if (!pr) return false;
      return (await commitCiState({ repo: target.repo, sha: pr.head.sha, token, fetchImpl })) === "pass";
    }
    case "run": {
      const run = await gh(`/repos/${target.repo}/actions/runs/${target.id}`, { token, fetchImpl });
      return run?.status === "completed" && run.conclusion === "success";
    }
    case "file": {
      const query = target.ref ? `?ref=${encodeURIComponent(target.ref)}` : "";
      return Boolean(await gh(`/repos/${target.repo}/contents/${enc(target.path)}${query}`, { token, fetchImpl }));
    }
    default:
      return false;
  }
}

/**
 * Mark each ref resolves: true|false. With no token the refs come back
 * untouched, so evidence stays unverified rather than being guessed.
 */
export async function resolveRefs(refs, { env = process.env, fetchImpl } = {}) {
  const { token, repo } = githubConfig(env);
  if (!token || !Array.isArray(refs) || refs.length === 0) return refs;
  const checkedAt = new Date().toISOString();
  return Promise.all(
    refs.map(async (ref) => {
      const target = parseRef(ref, repo);
      if (!target) return { ...ref, resolves: false, checkedAt };
      try {
        return { ...ref, resolves: await resolveTarget(target, { token, fetchImpl }), checkedAt };
      } catch {
        return { ...ref, resolves: false, checkedAt, checkError: true };
      }
    })
  );
}

/** Verify X-Hub-Signature-256 over the exact raw request bytes. */
export function verifyWebhookSignature(raw, header, secret) {
  if (!secret || !header || !header.startsWith("sha256=")) return false;
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`, "utf8");
  const presented = Buffer.from(header, "utf8");
  return expected.length === presented.length && timingSafeEqual(expected, presented);
}

export function sha256Hex(raw) {
  return createHash("sha256").update(raw).digest("hex");
}

export function prFromApi(pr, repo, ciState = "unknown") {
  return {
    repo,
    number: pr.number,
    title: String(pr.title || "").slice(0, 300),
    url: pr.html_url,
    state: pr.state,
    draft: pr.draft === true,
    merged: pr.merged === true || Boolean(pr.merged_at),
    author: pr.user?.login || "",
    headRef: pr.head?.ref || "",
    headSha: pr.head?.sha || "",
    baseRef: pr.base?.ref || "",
    ciState,
    updatedAt: pr.updated_at || new Date().toISOString(),
    ingestedAt: new Date().toISOString(),
  };
}

/** Open PRs for every linked repo, with CI state for each head. */
export async function fetchOpenPrs({ env = process.env, fetchImpl } = {}) {
  const { token, repos } = githubConfig(env);
  if (!token) return [];
  const out = [];
  for (const repo of repos) {
    const list = (await gh(`/repos/${repo}/pulls?state=open&per_page=30&sort=updated&direction=desc`, { token, fetchImpl })) || [];
    for (const pr of list) {
      let ci = "unknown";
      try {
        ci = await commitCiState({ repo, sha: pr.head.sha, token, fetchImpl });
      } catch {
        ci = "unknown";
      }
      out.push(prFromApi(pr, repo, ci));
    }
  }
  return out;
}

const LOG_PATH = "docs/relay/ROOM_LOG.md";
const LOG_HEADER = "# Room log\n\nBatons and decisions Mark promoted from the HQ room. Append-only.\n\n";

/**
 * Commit one promoted message to the log branch: a line in ROOM_LOG.md and a
 * baton YAML file, as a single commit. Idempotent on the message id.
 */
export async function commitPromotion({ id, line, yamlPath, yaml, env = process.env, fetchImpl }) {
  const { token, repo, logBranch } = githubConfig(env);
  if (!token) throw new GitHubError(0, "HQ_GITHUB_TOKEN is not set.");
  const opts = { token, fetchImpl };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let head = await gh(`/repos/${repo}/git/ref/heads/${logBranch}`, opts);
    if (!head) {
      const meta = await gh(`/repos/${repo}`, opts);
      const base = await gh(`/repos/${repo}/git/ref/heads/${meta.default_branch}`, opts);
      head = await gh(`/repos/${repo}/git/refs`, {
        ...opts,
        method: "POST",
        body: { ref: `refs/heads/${logBranch}`, sha: base.object.sha },
      });
    }
    const headSha = head.object.sha;
    const existing = await gh(`/repos/${repo}/contents/${LOG_PATH}?ref=${encodeURIComponent(logBranch)}`, opts);
    const current = existing ? Buffer.from(existing.content, "base64").toString("utf8") : LOG_HEADER;
    if (current.includes(` ${id} `)) return { sha: headSha, repo, branch: logBranch, already: true };
    const commit = await gh(`/repos/${repo}/git/commits/${headSha}`, opts);
    const tree = await gh(`/repos/${repo}/git/trees`, {
      ...opts,
      method: "POST",
      body: {
        base_tree: commit.tree.sha,
        tree: [
          { path: LOG_PATH, mode: "100644", type: "blob", content: `${current.replace(/\n*$/, "\n")}${line}\n` },
          { path: yamlPath, mode: "100644", type: "blob", content: `${yaml}\n` },
        ],
      },
    });
    const created = await gh(`/repos/${repo}/git/commits`, {
      ...opts,
      method: "POST",
      body: { message: `relay(room): promote ${id}`, tree: tree.sha, parents: [headSha] },
    });
    try {
      await gh(`/repos/${repo}/git/refs/heads/${logBranch}`, {
        ...opts,
        method: "PATCH",
        body: { sha: created.sha, force: false },
      });
      return { sha: created.sha, repo, branch: logBranch, already: false };
    } catch (error) {
      // 422 = the branch moved under us (another promote). Rebuild on the new head once.
      if (!(error instanceof GitHubError) || error.status !== 422 || attempt === 1) throw error;
    }
  }
  throw new GitHubError(409, "The log branch kept moving.");
}
