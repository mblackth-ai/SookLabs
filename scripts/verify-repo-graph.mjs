import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { buildRepoGraph, reconcileRefFreshness } from "../lib/hq/repo-graph.mjs";
import { readLocalSnapshot } from "../lib/hq/repo-graph-load.mjs";

const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function fixtureGraph() {
  const commits = [
    { sha: "a", parents: [], committedAt: "2026-01-01T00:00:00Z", author: "A", subject: "root", paths: ["a.txt"] },
    { sha: "b", parents: ["a"], committedAt: "2026-01-02T00:00:00Z", author: "A", subject: "base", paths: ["b.txt"] },
    { sha: "c", parents: ["b"], committedAt: "2026-01-03T00:00:00Z", author: "A", subject: "main", paths: ["c.txt"] },
    { sha: "d", parents: ["b"], committedAt: "2026-01-03T01:00:00Z", author: "A", subject: "feature", paths: ["d.txt"] },
    { sha: "e", parents: ["d"], committedAt: "2026-01-04T00:00:00Z", author: "A", subject: "feature tip", paths: ["e.txt"] },
    { sha: "m", parents: ["c", "e"], committedAt: "2026-01-05T00:00:00Z", author: "A", subject: "Merge feature", paths: [] },
    { sha: "t", parents: ["m"], committedAt: "2026-01-06T00:00:00Z", author: "A", subject: "tip", paths: ["t.txt"] },
    { sha: "g", parents: ["e"], committedAt: "2026-01-07T00:00:00Z", author: "A", subject: "open", paths: ["g.txt"] },
  ];
  return buildRepoGraph({
    source: "fixture",
    fetchedAt: "2026-01-08T00:00:00Z",
    sourceAsOf: "2026-01-08T00:00:00Z",
    defaultBranch: "master",
    commits,
    refs: [
      { name: "master", sha: "t", isDefault: true },
      { name: "feature", sha: "e", isDefault: false },
      { name: "topic", sha: "g", isDefault: false },
    ],
    pulls: [{
      number: 9,
      title: "Feature",
      state: "closed",
      merged: true,
      mergedAt: "2026-01-05T00:00:00Z",
      htmlUrl: "https://github.com/mblackth-ai/SookLabs/pull/9",
      headRef: "feature",
      headSha: "e",
      mergeCommitSha: "m",
    }],
    warnings: [],
  });
}

const fixture = fixtureGraph();
assert(fixture.ok, "fixture graph failed");
assert(fixture.mainline.join(",") === "a,b,c,m,t", `fixture mainline ${fixture.mainline.join(",")}`);
assert(fixture.sourceAsOf === "2026-01-08T00:00:00Z", "fixture sourceAsOf did not pass through");
const feature = fixture.branches.find((branch) => branch.name === "feature");
const topic = fixture.branches.find((branch) => branch.name === "topic");
assert(feature?.state === "merged", "feature should be merged");
assert(feature?.divergedFromSha === "b", `feature diverged from ${feature?.divergedFromSha}`);
assert(feature?.mergeSha === "m", `feature merged at ${feature?.mergeSha}`);
assert(topic?.state === "open", "topic should be open");
assert(topic?.mergeBaseSha === "e", `topic merge base ${topic?.mergeBaseSha}`);
assert(fixture.nodes.find((node) => node.sha === "t")?.isTip, "fixture tip missing");
assert(fixture.nodes.find((node) => node.sha === "m")?.isMerge, "fixture merge missing");
assert(fixture.nodes.find((node) => node.sha === "m")?.prs.some((pull) => pull.number === 9), "merge PR missing");
const empty = buildRepoGraph({
  source: "fixture",
  fetchedAt: "2026-01-08T00:00:00Z",
  defaultBranch: "master",
  commits: [],
  refs: [],
});
assert(empty.ok === false, "empty graph should fail");
assert(empty.sourceAsOf === undefined, "an ok:false graph should carry no layout fields");

// --- Freshness reconciliation fixtures: GitHub is the authority, by SHA not name. ---

const exactMatch = reconcileRefFreshness(
  [{ name: "master", sha: "aaa111" }, { name: "feature", sha: "bbb222" }],
  [{ name: "master", sha: "aaa111" }, { name: "feature", sha: "bbb222" }],
);
assert(exactMatch.trustLocal === true, "identical refs should be trusted");
assert(exactMatch.warnings.length === 0, "identical refs should produce no warnings");

const movedTip = reconcileRefFreshness(
  [{ name: "master", sha: "aaa111" }, { name: "feature", sha: "bbb222" }],
  [{ name: "master", sha: "aaa111" }, { name: "feature", sha: "ccc333" }],
);
assert(movedTip.trustLocal === false, "a same-name branch with a moved tip must not be trusted");
assert(movedTip.stale.length === 1 && movedTip.stale[0].name === "feature", "moved tip not recorded as stale");
assert(movedTip.stale[0].localSha === "bbb222" && movedTip.stale[0].remoteSha === "ccc333", "stale entry missing both SHAs");
assert(movedTip.missing.length === 0, "moved tip is not a missing branch");
assert(movedTip.warnings.some((w) => w.includes("feature") && w.includes("bbb222") && w.includes("ccc333")), "moved-tip warning missing detail");

const staleOrigin = reconcileRefFreshness(
  [{ name: "master", sha: "aaa111" }],
  [{ name: "master", sha: "aaa111" }, { name: "new-branch", sha: "ddd444" }],
);
assert(staleOrigin.trustLocal === false, "a local clone missing a remote branch must not be trusted");
assert(staleOrigin.missing.join(",") === "new-branch", "missing branch not recorded");
assert(staleOrigin.warnings.some((w) => w.includes("new-branch")), "missing-branch warning missing detail");

const noRemote = reconcileRefFreshness([{ name: "master", sha: "aaa111" }], []);
assert(noRemote.trustLocal === true, "an empty remote ref list has nothing to contradict local data");

// --- Exact-head tests against the real local clone of this very repo. ---

const snapshot = await readLocalSnapshot();
assert(snapshot && !snapshot.shallow, "expected a full local SookLabs clone");
const graph = buildRepoGraph({
  source: "local-git",
  fetchedAt: new Date().toISOString(),
  sourceAsOf: new Date().toISOString(),
  defaultBranch: snapshot.defaultBranch,
  commits: snapshot.commits,
  refs: snapshot.refs,
  pulls: [],
  warnings: [],
});
assert(graph.ok, graph.error || "local graph failed");
assert(graph.readOnly === true, "graph must be marked read-only");
assert(graph.repo === "mblackth-ai/SookLabs", "repo id");
assert(typeof graph.sourceAsOf === "string" && graph.sourceAsOf.length > 0, "sourceAsOf missing from a successful graph");
assert(!JSON.stringify(graph).includes("x-access-token"), "graph leaked a credential");

const master = git(["rev-parse", "origin/master"]);
assert(graph.tipSha === master, `tip ${graph.tipSha} != ${master}`);
assert(graph.defaultBranch === "master", `default branch ${graph.defaultBranch}`);
const mainline = git(["log", "--first-parent", "--reverse", "--format=%H", "origin/master"]).split("\n").filter(Boolean);
assert(graph.mainline.join("\n") === mainline.join("\n"), "mainline is not origin/master first-parent history");

const nodeBySha = new Map(graph.nodes.map((node) => [node.sha, node]));
let previousColumn = -1;
for (const sha of graph.mainline) {
  const node = nodeBySha.get(sha);
  assert(node, `mainline commit missing ${sha}`);
  assert(node.committedAt, `mainline commit ${sha} has no timestamp`);
  assert(node.column > previousColumn, `mainline column did not advance at ${sha}`);
  previousColumn = node.column;
}
for (const node of graph.nodes) {
  assert(node.sha && node.shortSha, "node missing sha");
  for (const parent of node.parents) {
    const parentNode = nodeBySha.get(parent);
    assert(parentNode, `missing parent ${parent}`);
    assert(parentNode.column < node.column, `${parent} is not left of ${node.sha}`);
  }
}
assert(nodeBySha.get(master)?.kind === "tip", "current tip is not marked");

for (const ref of snapshot.refs) {
  if (ref.isDefault) continue;
  const branch = graph.branches.find((item) => item.name === ref.name);
  assert(branch, `missing branch ${ref.name}`);
  const contained = isAncestor(ref.sha, master);
  if (ref.sha === master) {
    assert(branch.state === "identical", `${ref.name} should be identical to master`);
  } else if (contained) {
    assert(branch.state === "merged", `${ref.name} should be merged`);
    assert(branch.mergeSha, `${ref.name} missing merge point`);
    assert(isAncestor(ref.sha, branch.mergeSha), `${ref.name} tip is not contained in its merge commit`);
  } else {
    assert(branch.state === "open", `${ref.name} should be open`);
    const mergeBase = git(["merge-base", "origin/master", `origin/${ref.name}`]);
    assert(branch.mergeBaseSha === mergeBase, `${ref.name} merge base ${branch.mergeBaseSha} != ${mergeBase}`);
  }
}

// Two historical merges that are permanent ancestors of master: a stable, exact-head anchor.
const mvp = graph.branches.find((branch) => branch.name === "feat/hq-mvp1-command-centre");
assert(mvp?.mergeSha?.startsWith("5f7d690"), `mvp merge sha ${mvp?.mergeSha}`);
const pr3 = graph.nodes.find((node) => node.sha.startsWith("fabb9f5"));
assert(pr3?.isMerge && pr3.parents.length === 2, "PR #3 merge commit was not detected");

// --- The GitHub refs this exact head currently sees are consistent with the local clone. ---
// (No network call here — this only checks internal consistency of the fixtures above.)
const liveFreshness = reconcileRefFreshness(snapshot.refs, snapshot.refs);
assert(liveFreshness.trustLocal === true, "a ref list compared against itself must always be trusted");

const timeline = readFileSync(new URL("../components/hq/RepoTimeline.jsx", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/hq/api/repo-timeline/route.js", import.meta.url), "utf8");
const commitRoute = readFileSync(new URL("../app/hq/api/repo-timeline/commit/route.js", import.meta.url), "utf8");
const loader = readFileSync(new URL("../lib/hq/repo-graph-load.mjs", import.meta.url), "utf8");
assert(!/>\s*(Merge|Rebase|Delete|Remove)\s*</.test(timeline), "timeline renders a write action label");
assert(!/export async function (POST|PUT|PATCH|DELETE)/.test(route), "graph route exports a write method");
assert(!/export async function (POST|PUT|PATCH|DELETE)/.test(commitRoute), "commit route exports a write method");
assert(timeline.includes("Partial data"), "partial state copy missing");
assert(timeline.includes("Reading Git history"), "loading state copy missing");
assert(timeline.includes("Retry"), "error retry missing");
assert(timeline.includes("Confirmed current against GitHub") || timeline.includes("Freshness against GitHub"), "sourceAsOf copy missing from the UI");
assert(timeline.includes("Actions check"), "Actions check-run copy missing from the drawer");
assert(loader.includes("check-runs"), "loader does not read the GitHub Actions check-runs endpoint");
assert(loader.includes("reconcileRefFreshness"), "loader does not use ref-SHA freshness reconciliation");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `repo graph ok: ${graph.counts.commits} commits, mainline ${graph.counts.mainline}, open ${graph.counts.openBranches}, merged ${graph.counts.mergedBranches}, sourceAsOf ${graph.sourceAsOf}`,
);
