"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

const COL_W = 42;
const LANE_H = 68;
const PAD_X = 36;
const PAD_Y = 52;
const LANE_COLORS = ["#f59e0b", "#c084fc", "#fb7185", "#38bdf8", "#fbbf24", "#34d399", "#f472b6", "#94a3b8"];

function laneOffset(lane) {
  if (!lane) return 0;
  const level = Math.ceil(lane / 2);
  return (lane % 2 === 1 ? -1 : 1) * level;
}

function laneColor(lane) {
  if (!lane) return "var(--accent)";
  return LANE_COLORS[(lane - 1) % LANE_COLORS.length];
}

function formatWhen(iso) {
  if (!iso) return "Unknown time";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${formatted} Asia/Bangkok`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function RepoTimeline() {
  const [open, setOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState("");
  const [selectedSha, setSelectedSha] = useState(null);
  const [detail, setDetail] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;

    async function load() {
      setPhase("loading");
      setError("");
      try {
        const response = await fetch("/hq/api/repo-timeline", { cache: "no-store" });
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok || !body.ok) {
          setPhase("error");
          setError(body.error || "Could not read the repository graph.");
          setGraph(null);
          return;
        }
        setGraph(body);
        setPhase("ready");
      } catch {
        if (cancelled) return;
        setPhase("error");
        setError("Could not read the repository graph.");
        setGraph(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, reloadToken]);

  useEffect(() => {
    if (!selectedSha) return undefined;
    let cancelled = false;
    const requestSha = selectedSha;
    fetch(`/hq/api/repo-timeline/commit?sha=${encodeURIComponent(requestSha)}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok || !body.ok) {
          setDetail({ status: "error", sha: requestSha, error: body.error || "Commit detail is unavailable." });
          return;
        }
        setDetail({ status: "ready", sha: requestSha, body });
      })
      .catch(() => {
        if (!cancelled) setDetail({ status: "error", sha: requestSha, error: "Commit detail is unavailable." });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedSha]);

  const activeDetail = selectedSha
    ? (detail?.sha === selectedSha ? detail : { status: "loading", sha: selectedSha })
    : null;

  const nodeBySha = useMemo(() => {
    const map = new Map();
    for (const node of graph?.nodes || []) map.set(node.sha, node);
    return map;
  }, [graph]);

  const layout = useMemo(() => {
    const nodes = graph?.nodes || [];
    if (!nodes.length) return null;
    let maxColumn = 0;
    let maxUp = 0;
    let maxDown = 0;
    for (const node of nodes) {
      maxColumn = Math.max(maxColumn, node.column || 0);
      const offset = laneOffset(node.lane || 0);
      if (offset < 0) maxUp = Math.max(maxUp, -offset);
      if (offset > 0) maxDown = Math.max(maxDown, offset);
    }
    const centerY = PAD_Y + maxUp * LANE_H;
    return {
      width: PAD_X * 2 + (maxColumn + 1) * COL_W,
      height: PAD_Y * 2 + (maxUp + maxDown) * LANE_H,
      centerY,
    };
  }, [graph]);

  useEffect(() => {
    if (phase !== "ready" || !graph?.tipSha || !scrollerRef.current) return;
    const tip = graph.nodes.find((node) => node.sha === graph.tipSha);
    if (!tip) return;
    const left = PAD_X + tip.column * COL_W + COL_W / 2 - scrollerRef.current.clientWidth / 2;
    scrollerRef.current.scrollTo({ left: Math.max(left, 0), behavior: "auto" });
  }, [phase, graph]);

  const selected = selectedSha ? nodeBySha.get(selectedSha) || null : null;

  function scrollBy(direction) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction * Math.max(scroller.clientWidth * 0.75, 240),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  function scrollToSha(sha) {
    const scroller = scrollerRef.current;
    const node = nodeBySha.get(sha);
    if (!scroller || !node) return;
    const left = PAD_X + node.column * COL_W + COL_W / 2 - scroller.clientWidth / 2;
    scroller.scrollTo({
      left: Math.max(left, 0),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setSelectedSha(sha);
  }

  function retry() {
    setSelectedSha(null);
    setGraph(null);
    setReloadToken((value) => value + 1);
  }

  const oldest = graph?.mainline?.length ? nodeBySha.get(graph.mainline[0]) : null;
  const newest = graph?.mainline?.length ? nodeBySha.get(graph.mainline[graph.mainline.length - 1]) : null;

  return (
    <Card padding="md" id="repo-timeline">
      <div className="hq-flex-between" style={{ gap: 12, alignItems: "flex-start" }}>
        <div>
          <div className="hq-section-label">Repo timeline</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>
            Read-only Git history for mblackth-ai/SookLabs. The spine is the default branch, oldest at the left.
            Branch geometry is not a progress percentage.
          </p>
        </div>
        <button
          type="button"
          className="hq-btn hq-btn--secondary hq-btn--sm"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide timeline" : "Expand timeline"}
        </button>
      </div>

      {open ? (
        <div className="hq-repo-timeline" aria-busy={phase === "loading"}>
          <p className="hq-text-xs-muted">This view does not merge, rebase, or delete.</p>

          {phase === "loading" ? (
            <div className="hq-repo-state" role="status">
              <div className="hq-repo-skeleton" />
              <p className="hq-text-sm-secondary">Reading Git history for mblackth-ai/SookLabs.</p>
            </div>
          ) : null}

          {phase === "error" ? (
            <div className="hq-repo-state" role="alert">
              <p className="hq-text-sm-secondary">{error}</p>
              <Button size="sm" variant="secondary" onClick={retry}>Retry</Button>
            </div>
          ) : null}

          {phase === "ready" && graph ? (
            <>
              {graph.partial ? (
                <div className="hq-repo-partial" role="status">
                  <strong>Partial data.</strong>
                  <ul>
                    {graph.partialReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="hq-repo-meta">
                <span>{graph.repo}</span>
                <span>{graph.defaultBranch} tip {graph.tipSha.slice(0, 7)}</span>
                <span>{graph.counts.commits} commits</span>
                <span>{graph.counts.openBranches} open</span>
                <span>{graph.counts.mergedBranches} merged</span>
                <span>Source {graph.source}</span>
              </div>
              {oldest && newest ? (
                <p className="hq-text-xs-muted">
                  Mainline {formatWhen(oldest.committedAt)} to {formatWhen(newest.committedAt)}.
                </p>
              ) : null}

              <div className="hq-repo-nav">
                <Button size="sm" variant="ghost" onClick={() => scrollBy(-1)}>Older</Button>
                <Button size="sm" variant="ghost" onClick={() => scrollBy(1)}>Newer</Button>
                <Button size="sm" variant="secondary" onClick={() => scrollToSha(graph.tipSha)}>Current tip</Button>
              </div>

              <div className={`hq-repo-layout${selected ? " hq-repo-layout--open" : ""}`}>
                <div
                  className="hq-repo-scroll"
                  ref={scrollerRef}
                  tabIndex={0}
                  aria-label="Repository timeline. Scroll horizontally to move through time."
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") scrollBy(1);
                    if (event.key === "ArrowLeft") scrollBy(-1);
                    if (event.key === "Escape") setSelectedSha(null);
                  }}
                >
                  {layout ? (
                    <div className="hq-repo-canvas" style={{ width: layout.width, height: layout.height }}>
                      <svg className="hq-repo-edges" width={layout.width} height={layout.height} aria-hidden="true">
                        {graph.edges.map((edge) => {
                          const from = nodeBySha.get(edge.from);
                          const to = nodeBySha.get(edge.to);
                          if (!from || !to) return null;
                          const x1 = PAD_X + from.column * COL_W + COL_W / 2;
                          const y1 = layout.centerY + laneOffset(from.lane) * LANE_H;
                          const x2 = PAD_X + to.column * COL_W + COL_W / 2;
                          const y2 = layout.centerY + laneOffset(to.lane) * LANE_H;
                          const mid = (x1 + x2) / 2;
                          const d = from.lane === to.lane
                            ? `M ${x1} ${y1} L ${x2} ${y2}`
                            : `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
                          return (
                            <path
                              key={`${edge.from}-${edge.to}-${edge.kind}`}
                              d={d}
                              className={`hq-repo-edge hq-repo-edge--${edge.kind}`}
                            />
                          );
                        })}
                      </svg>
                      {[...graph.nodes].sort((a, b) => a.column - b.column || a.lane - b.lane).map((node) => {
                        const x = PAD_X + node.column * COL_W + COL_W / 2;
                        const y = layout.centerY + laneOffset(node.lane) * LANE_H;
                        return (
                          <button
                            key={node.sha}
                            id={`repo-node-${node.sha}`}
                            type="button"
                            className={`hq-repo-node hq-repo-node--${node.kind}${selectedSha === node.sha ? " hq-repo-node--selected" : ""}`}
                            style={{ left: x, top: y, "--node-color": laneColor(node.lane) }}
                            aria-pressed={selectedSha === node.sha}
                            aria-label={`${node.shortSha} ${node.subject || "commit"} ${formatWhen(node.committedAt)}`}
                            title={`${node.shortSha} ${node.subject}`}
                            onClick={() => setSelectedSha(node.sha)}
                          >
                            <span className="hq-repo-node-dot" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="hq-text-sm-secondary">No commits were returned.</p>
                  )}
                </div>

                {selected ? (
                    <CommitDrawer
                    node={selected}
                    graph={graph}
                    detail={activeDetail}
                    onClose={() => setSelectedSha(null)}
                  />
                ) : null}
              </div>

              <BranchList branches={graph.branches} defaultBranch={graph.defaultBranch} onSelect={scrollToSha} />
            </>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function BranchList({ branches, defaultBranch, onSelect }) {
  if (!branches.length) {
    return <p className="hq-text-xs-muted">No other branches were found beside {defaultBranch}.</p>;
  }
  return (
    <ul className="hq-repo-branches">
      {branches.map((branch) => (
        <li key={branch.name}>
          <button type="button" className="hq-repo-branch" onClick={() => onSelect(branch.sha)}>
            <span className={`hq-repo-state-pill hq-repo-state-pill--${branch.state}`}>{branch.state}</span>
            <span className="hq-repo-branch-name">{branch.name}</span>
            <span className="hq-text-xs-muted">
              {branch.state === "open"
                ? `left ${defaultBranch} at ${(branch.divergedFromSha || "").slice(0, 7) || "unknown"}`
                : branch.mergeSha && branch.mergeSha !== branch.sha
                  ? `joined ${defaultBranch} at ${branch.mergeSha.slice(0, 7)}`
                  : `tip is on ${defaultBranch}`}
            </span>
          </button>
          {branch.ancestryNote ? <p className="hq-text-xs-muted">{branch.ancestryNote}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function CommitDrawer({ node, graph, detail, onClose }) {
  const paths = node.paths?.length ? node.paths : detail?.body?.paths || [];
  const checks = detail?.status === "ready" ? detail.body.checks : null;
  const detailPartial = detail?.status === "ready" && detail.body.partial;

  return (
    <aside className="hq-repo-drawer" aria-label="Commit detail">
      <div className="hq-flex-between" style={{ gap: 8 }}>
        <div className="hq-section-label">{node.kind === "tip" ? "Current tip" : "Commit"}</div>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <h3 className="hq-repo-drawer-title">{node.subject || "Untitled commit"}</h3>
      <dl className="hq-repo-drawer-list">
        <div>
          <dt>Repo</dt>
          <dd>{graph.repo}</dd>
        </div>
        <div>
          <dt>SHA</dt>
          <dd><code>{node.sha}</code></dd>
        </div>
        <div>
          <dt>Committed</dt>
          <dd>{formatWhen(node.committedAt)}</dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{node.author || "Unknown"}</dd>
        </div>
        <div>
          <dt>On default branch</dt>
          <dd>{node.isMainline ? `Yes, ${graph.defaultBranch}` : `No. Lane ${node.lane}.`}</dd>
        </div>
        {node.refNames.length ? (
          <div>
            <dt>Refs here</dt>
            <dd>{node.refNames.join(", ")}</dd>
          </div>
        ) : null}
        {node.branches.length ? (
          <div>
            <dt>Branches</dt>
            <dd>{node.branches.join(", ")}</dd>
          </div>
        ) : null}
        {node.divergenceFor.length ? (
          <div>
            <dt>Branches diverged here</dt>
            <dd>{node.divergenceFor.join(", ")}</dd>
          </div>
        ) : null}
        {node.mergeFor.length ? (
          <div>
            <dt>Branches joined here</dt>
            <dd>{node.mergeFor.join(", ")}</dd>
          </div>
        ) : null}
        {node.parents.length ? (
          <div>
            <dt>Parents</dt>
            <dd>{node.parents.map((parent) => parent.slice(0, 7)).join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      {graph.branches.filter((branch) => branch.sha === node.sha).map((branch) => (
        <p key={branch.name} className="hq-text-xs-muted">
          {branch.name} is {branch.state}.
          {branch.divergedFromSha ? ` Diverged at ${branch.divergedFromSha.slice(0, 7)}.` : ""}
          {branch.mergeSha ? ` Joined ${graph.defaultBranch} at ${branch.mergeSha.slice(0, 7)}.` : ""}
          {branch.ancestryNote ? ` ${branch.ancestryNote}` : ""}
        </p>
      ))}

      <div className="hq-repo-links">
        <a href={node.htmlUrl} target="_blank" rel="noreferrer">Open commit</a>
        {node.refNames.filter((name) => name !== graph.defaultBranch).map((name) => (
          <a key={name} href={`https://github.com/${graph.repo}/tree/${encodeURI(name)}`} target="_blank" rel="noreferrer">
            Branch {name}
          </a>
        ))}
        {node.prs.map((pull) => (
          <a key={pull.number} href={pull.htmlUrl} target="_blank" rel="noreferrer">
            PR #{pull.number} · {pull.state}
          </a>
        ))}
      </div>

      <div className="hq-section-label">Changed paths</div>
      {paths.length ? (
        <ul className="hq-repo-paths">
          {paths.slice(0, 40).map((path) => (
            <li key={path}><code>{path}</code></li>
          ))}
        </ul>
      ) : (
        <p className="hq-text-xs-muted">
          {detail?.status === "loading" ? "Loading changed paths." : "No changed paths were recorded for this commit."}
        </p>
      )}
      {paths.length > 40 ? <p className="hq-text-xs-muted">Showing 40 of {paths.length} paths.</p> : null}

      <div className="hq-section-label">Checks</div>
      {detail?.status === "loading" ? <p className="hq-text-xs-muted">Loading check state.</p> : null}
      {detail?.status === "error" ? <p className="hq-text-xs-muted">{detail.error}</p> : null}
      {checks ? (
        checks.total ? (
          <p className="hq-text-sm-secondary">
            {checks.state || "unknown"} · {checks.total} status{checks.total === 1 ? "" : "es"}
          </p>
        ) : (
          <p className="hq-text-xs-muted">No check runs recorded for this commit.</p>
        )
      ) : null}
      {checks?.statuses?.length ? (
        <ul className="hq-repo-paths">
          {checks.statuses.map((status) => (
            <li key={`${status.context}-${status.state}`}>
              {status.context} · {status.state}
              {status.targetUrl ? (
                <>
                  {" "}
                  <a href={status.targetUrl} target="_blank" rel="noreferrer">Open</a>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {detailPartial ? (
        <div className="hq-repo-partial" role="status">
          <strong>Partial commit detail.</strong>
          <ul>
            {detail.body.partialReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
