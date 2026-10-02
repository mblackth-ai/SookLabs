/**
 * Pure layout for one repository's read-only Git graph.
 * Input is commit/ref/PR evidence. Nothing here talks to git or GitHub.
 */

const REPO = "mblackth-ai/SookLabs";

function commitTime(commit) {
  const value = Date.parse(commit?.committedAt || "");
  return Number.isNaN(value) ? null : value;
}

function ancestorsOf(start, commitsBySha, cache) {
  if (cache.has(start)) return cache.get(start);
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const sha = stack.pop();
    if (!sha || seen.has(sha)) continue;
    const cached = cache.get(sha);
    if (cached) {
      for (const item of cached) seen.add(item);
      continue;
    }
    seen.add(sha);
    const commit = commitsBySha.get(sha);
    if (!commit) continue;
    for (const parent of commit.parents) stack.push(parent);
  }
  cache.set(start, seen);
  return seen;
}

function bestMergeBases(a, b, commitsBySha, cache) {
  const left = ancestorsOf(a, commitsBySha, cache);
  const right = ancestorsOf(b, commitsBySha, cache);
  const common = [];
  for (const sha of left) {
    if (right.has(sha)) common.push(sha);
  }
  return common.filter((sha) => {
    return !common.some((other) => other !== sha && ancestorsOf(other, commitsBySha, cache).has(sha));
  });
}

function firstParentMainline(tip, commitsBySha) {
  const shas = [];
  const seen = new Set();
  let sha = tip;
  while (sha && commitsBySha.has(sha) && !seen.has(sha)) {
    seen.add(sha);
    shas.push(sha);
    sha = commitsBySha.get(sha).parents[0] || null;
  }
  shas.reverse();
  return shas;
}

function forkOnMainline(tip, mainlineSet, commitsBySha) {
  const seen = new Set();
  let sha = tip;
  while (sha && !seen.has(sha)) {
    seen.add(sha);
    if (mainlineSet.has(sha)) return sha;
    const commit = commitsBySha.get(sha);
    if (!commit) return null;
    sha = commit.parents[0] || null;
  }
  return null;
}

function pickLatest(shas, commitsBySha) {
  if (!shas.length) return null;
  return [...shas].sort((a, b) => {
    const ta = commitTime(commitsBySha.get(a)) ?? -1;
    const tb = commitTime(commitsBySha.get(b)) ?? -1;
    if (ta !== tb) return tb - ta;
    return a.localeCompare(b);
  })[0];
}

function slimPull(pull) {
  const merged = Boolean(pull.merged || pull.mergedAt);
  let state = pull.state || "closed";
  if (merged) state = "merged";
  else if (state !== "open" && state !== "closed") state = "closed";
  return {
    number: pull.number,
    title: pull.title || "",
    state,
    merged,
    mergedAt: pull.mergedAt || null,
    htmlUrl: pull.htmlUrl || `https://github.com/${REPO}/pull/${pull.number}`,
    headRef: pull.headRef || null,
    headSha: pull.headSha || null,
    mergeCommitSha: pull.mergeCommitSha || null,
  };
}

function dedupePulls(pulls) {
  const byNumber = new Map();
  for (const pull of pulls) {
    if (!pull || pull.number == null) continue;
    byNumber.set(pull.number, slimPull(pull));
  }
  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

function assignColumns(nodes) {
  const byTime = [...nodes].sort((a, b) => {
    const ta = commitTime(a) ?? 0;
    const tb = commitTime(b) ?? 0;
    if (ta !== tb) return ta - tb;
    return a.sha.localeCompare(b.sha);
  });
  const column = new Map();
  byTime.forEach((node, index) => column.set(node.sha, index));

  let moved = true;
  let guard = 0;
  while (moved && guard < nodes.length + 2) {
    moved = false;
    guard += 1;
    for (const node of byTime) {
      for (const parent of node.parents) {
        if (!column.has(parent)) continue;
        const min = column.get(parent) + 1;
        if (column.get(node.sha) < min) {
          column.set(node.sha, min);
          moved = true;
        }
      }
    }
  }

  const ranks = [...new Set(column.values())].sort((a, b) => a - b);
  const compact = new Map(ranks.map((rank, index) => [rank, index]));
  for (const [sha, rank] of column) column.set(sha, compact.get(rank));
  return column;
}

/**
 * @param {object} input
 * @param {string} [input.repo]
 * @param {string} input.source
 * @param {string} input.fetchedAt
 * @param {string} input.defaultBranch
 * @param {Array} input.commits
 * @param {Array} input.refs
 * @param {Array} [input.pulls]
 * @param {string[]} [input.warnings]
 */
export function buildRepoGraph(input) {
  const warnings = [...(input.warnings || [])];
  const repo = input.repo || REPO;
  const commitsBySha = new Map();
  for (const commit of input.commits || []) {
    if (!commit?.sha) continue;
    const existing = commitsBySha.get(commit.sha);
    const parents = Array.isArray(commit.parents) ? commit.parents.filter(Boolean) : [];
    const paths = Array.isArray(commit.paths) ? commit.paths.filter(Boolean) : [];
    if (!existing || paths.length > (existing.paths?.length || 0)) {
      commitsBySha.set(commit.sha, {
        sha: commit.sha,
        parents,
        committedAt: commit.committedAt || "",
        author: commit.author || "",
        subject: commit.subject || "",
        paths,
      });
    }
  }

  if (!commitsBySha.size) {
    return {
      ok: false,
      repo,
      error: "No commits were read for mblackth-ai/SookLabs.",
    };
  }

  const defaultName = input.defaultBranch || "master";
  const defaultRef = (input.refs || []).find((ref) => ref.isDefault)
    || (input.refs || []).find((ref) => ref.name === defaultName);
  if (!defaultRef || !commitsBySha.has(defaultRef.sha)) {
    return {
      ok: false,
      repo,
      error: "The default branch tip is not in the commit set.",
    };
  }

  for (const commit of commitsBySha.values()) {
    if (!commit.committedAt || commitTime(commit) == null) {
      warnings.push(`Commit ${commit.sha.slice(0, 7)} has no usable timestamp.`);
    }
    for (const parent of commit.parents) {
      if (!commitsBySha.has(parent)) {
        warnings.push(`Commit ${commit.sha.slice(0, 7)} is missing parent ${parent.slice(0, 7)}.`);
      }
    }
  }

  const cache = new Map();
  const mainline = firstParentMainline(defaultRef.sha, commitsBySha);
  const mainlineSet = new Set(mainline);
  const mainAncestors = ancestorsOf(defaultRef.sha, commitsBySha, cache);

  const include = new Set(mainAncestors);
  for (const ref of input.refs || []) {
    if (!commitsBySha.has(ref.sha)) {
      warnings.push(`Ref ${ref.name} tip is not in the commit set.`);
      continue;
    }
    for (const sha of ancestorsOf(ref.sha, commitsBySha, cache)) include.add(sha);
  }

  const pulls = input.pulls || [];
  const pullsByBranch = new Map();
  const pullsBySha = new Map();
  for (const pull of pulls) {
    const slim = slimPull(pull);
    if (slim.headRef) {
      const list = pullsByBranch.get(slim.headRef) || [];
      list.push(slim);
      pullsByBranch.set(slim.headRef, list);
    }
    for (const sha of [slim.headSha, slim.mergeCommitSha]) {
      if (!sha) continue;
      const list = pullsBySha.get(sha) || [];
      list.push(slim);
      pullsBySha.set(sha, list);
    }
  }

  const branches = [];
  for (const ref of input.refs || []) {
    if (ref.isDefault || ref.name === defaultRef.name) continue;
    if (!commitsBySha.has(ref.sha)) continue;
    const bases = bestMergeBases(defaultRef.sha, ref.sha, commitsBySha, cache);
    const mergeBaseSha = pickLatest(bases, commitsBySha);
    const contained = mainAncestors.has(ref.sha);
    let state = "open";
    if (ref.sha === defaultRef.sha) state = "identical";
    else if (contained) state = "merged";

    const divergedFromSha = forkOnMainline(ref.sha, mainlineSet, commitsBySha);
    let mergeSha = null;
    if (state === "merged") {
      const start = Math.max(mainline.indexOf(divergedFromSha), 0);
      for (let index = start; index < mainline.length; index += 1) {
        if (ancestorsOf(mainline[index], commitsBySha, cache).has(ref.sha)) {
          mergeSha = mainline[index];
          break;
        }
      }
    }

    const branchPulls = dedupePulls(pullsByBranch.get(ref.name) || []);
    const pullMerged = branchPulls.some((pull) => pull.merged);
    let ancestryNote = null;
    if (state === "open" && pullMerged) {
      ancestryNote = "A pull request for this branch is merged, but the branch tip is not an ancestor of the default branch.";
    }
    if (bases.length > 1) {
      warnings.push(`Branch ${ref.name} has ${bases.length} merge bases with ${defaultRef.name}.`);
    }

    branches.push({
      name: ref.name,
      sha: ref.sha,
      state,
      divergedFromSha,
      mergeBaseSha,
      mergeSha,
      containedInDefault: contained,
      ancestryNote,
      htmlUrl: `https://github.com/${repo}/tree/${encodeURI(ref.name)}`,
      prs: branchPulls,
    });
  }

  const sideSets = new Map();
  for (const branch of branches) {
    const reachable = ancestorsOf(branch.sha, commitsBySha, cache);
    const side = new Set();
    if (branch.state === "open") {
      for (const sha of reachable) {
        if (!mainAncestors.has(sha)) side.add(sha);
      }
    } else if (branch.state === "merged") {
      for (const sha of reachable) {
        if (!mainlineSet.has(sha)) side.add(sha);
      }
    }
    sideSets.set(branch.name, side);
  }

  const laneBranches = branches
    .filter((branch) => (sideSets.get(branch.name)?.size || 0) > 0)
    .sort((a, b) => {
      const rank = { open: 0, merged: 1, identical: 2 };
      const ar = rank[a.state] ?? 9;
      const br = rank[b.state] ?? 9;
      if (ar !== br) return ar - br;
      const ai = mainline.indexOf(a.divergedFromSha);
      const bi = mainline.indexOf(b.divergedFromSha);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
  const laneByBranch = new Map(laneBranches.map((branch, index) => [branch.name, index + 1]));

  function ownerBranch(sha) {
    const owners = branches.filter((branch) => sideSets.get(branch.name)?.has(sha));
    if (!owners.length) return null;
    owners.sort((a, b) => {
      const as = sideSets.get(a.name)?.size || 0;
      const bs = sideSets.get(b.name)?.size || 0;
      if (as !== bs) return as - bs;
      return a.name.localeCompare(b.name);
    });
    return owners[0];
  }

  const laneCache = new Map();
  function laneFor(sha) {
    if (laneCache.has(sha)) return laneCache.get(sha);
    if (mainlineSet.has(sha)) {
      laneCache.set(sha, 0);
      return 0;
    }
    const owner = ownerBranch(sha);
    if (owner) {
      const lane = laneByBranch.get(owner.name) || 1;
      laneCache.set(sha, lane);
      return lane;
    }
    laneCache.set(sha, -1);
    const parent = commitsBySha.get(sha)?.parents?.find((item) => include.has(item) && !mainlineSet.has(item));
    if (parent) {
      const lane = laneFor(parent);
      if (lane > 0) {
        laneCache.set(sha, lane);
        return lane;
      }
    }
    const lane = laneByBranch.size + 1;
    laneCache.set(sha, lane);
    return lane;
  }

  const includedCommits = [...include].map((sha) => commitsBySha.get(sha)).filter(Boolean);
  let columns;
  try {
    columns = assignColumns(includedCommits);
  } catch (err) {
    return {
      ok: false,
      repo,
      error: err instanceof Error ? err.message : "Could not lay out the commit graph.",
    };
  }

  const refsAt = new Map();
  for (const ref of input.refs || []) {
    const list = refsAt.get(ref.sha) || [];
    list.push(ref.name);
    refsAt.set(ref.sha, list);
  }

  const divergenceFor = new Map();
  const mergeFor = new Map();
  for (const branch of branches) {
    if (branch.divergedFromSha) {
      const list = divergenceFor.get(branch.divergedFromSha) || [];
      list.push(branch.name);
      divergenceFor.set(branch.divergedFromSha, list);
    }
    if (branch.mergeSha) {
      const list = mergeFor.get(branch.mergeSha) || [];
      list.push(branch.name);
      mergeFor.set(branch.mergeSha, list);
    }
  }

  const nodes = includedCommits.map((commit) => {
    const lane = laneFor(commit.sha);
    const isMainline = mainlineSet.has(commit.sha);
    const isTip = commit.sha === defaultRef.sha;
    const isMerge = commit.parents.length > 1;
    const refNames = refsAt.get(commit.sha) || [];
    const owning = branches
      .filter((branch) => sideSets.get(branch.name)?.has(commit.sha))
      .map((branch) => branch.name);
    let kind = "branch";
    if (isTip) kind = "tip";
    else if (isMerge) kind = "merge";
    else if (isMainline) kind = "mainline";
    return {
      sha: commit.sha,
      shortSha: commit.sha.slice(0, 7),
      subject: commit.subject,
      author: commit.author,
      committedAt: commit.committedAt,
      parents: commit.parents.filter((parent) => include.has(parent)),
      paths: commit.paths,
      lane,
      column: columns.get(commit.sha),
      kind,
      isMerge,
      isMainline,
      isTip,
      refNames,
      branches: isMainline ? refNames.filter((name) => name !== defaultRef.name) : owning,
      divergenceFor: divergenceFor.get(commit.sha) || [],
      mergeFor: mergeFor.get(commit.sha) || [],
      prs: dedupePulls(pullsBySha.get(commit.sha) || []),
      htmlUrl: `https://github.com/${repo}/commit/${commit.sha}`,
    };
  });

  const edges = [];
  for (const node of nodes) {
    node.parents.forEach((parent, index) => {
      edges.push({
        from: parent,
        to: node.sha,
        kind: index === 0 ? "first-parent" : "merge",
      });
    });
  }

  const uniqueWarnings = [...new Set(warnings)].slice(0, 40);
  const openBranches = branches.filter((branch) => branch.state === "open").length;
  const mergedBranches = branches.filter((branch) => branch.state === "merged").length;

  return {
    ok: true,
    readOnly: true,
    repo,
    source: input.source,
    fetchedAt: input.fetchedAt,
    defaultBranch: defaultRef.name,
    tipSha: defaultRef.sha,
    partial: uniqueWarnings.length > 0,
    partialReasons: uniqueWarnings,
    mainline,
    counts: {
      commits: nodes.length,
      mainline: mainline.length,
      openBranches,
      mergedBranches,
    },
    branches: branches.sort((a, b) => {
      const rank = { open: 0, merged: 1, identical: 2 };
      const ar = rank[a.state] ?? 9;
      const br = rank[b.state] ?? 9;
      if (ar !== br) return ar - br;
      return a.name.localeCompare(b.name);
    }),
    nodes,
    edges,
  };
}

export { REPO as SOOKLABS_REPO };
