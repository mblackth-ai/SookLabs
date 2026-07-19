import { DEFAULT_OPS } from "./ops-default";

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2 };
const STATUS_ORDER = { blocked: 0, doing: 1, todo: 2, done: 3 };

const STAGE_LABELS = {
  discover: "Discover",
  prototype: "Prototype",
  mvp1: "MVP1",
  beta: "Beta",
  gtm: "GTM",
  thin: "Thin",
};

const PLATFORM_MODE_LABELS = {
  auto: "Auto",
  draft: "Draft",
  manual: "Manual",
  future_oauth: "Future OAuth",
};

/**
 * @typedef {object} OpsWorkItem
 * @property {string} id
 * @property {string} title
 * @property {"todo"|"doing"|"blocked"|"done"} status
 * @property {"P0"|"P1"|"P2"} priority
 * @property {string} [owner]
 * @property {string} [due]
 * @property {{ label: string, url: string }[]} [links]
 * @property {string} [pillar]
 * @property {string} [platform]
 */

/**
 * @typedef {object} OpsWorkstream
 * @property {string} label
 * @property {string} [product]
 * @property {string} [boardHref]
 * @property {OpsWorkItem[]} items
 */

/**
 * @typedef {object} OpsGoal
 * @property {string} id
 * @property {string} title
 * @property {string} [horizon]
 * @property {"active"|"paused"|"done"} status
 * @property {string} [product]
 * @property {string} [notes]
 */

/**
 * @typedef {object} OpsBlocker
 * @property {string} id
 * @property {string} title
 * @property {string} [detail]
 * @property {"open"|"resolved"} status
 * @property {string} [stream]
 * @property {string} [sourceItemId]
 */

/**
 * @typedef {object} OpsData
 * @property {string|null} updatedAt
 * @property {{ id: string, title: string, done: boolean, stream?: string }[]} todayPriorities
 * @property {OpsGoal[]} [goals]
 * @property {OpsBlocker[]} [blockers]
 * @property {Record<string, OpsWorkstream>} workstreams
 * @property {{ id: string, name: string, stage: string, href: string, workstreamKeys: string[] }[]} [mvpMilestones]
 * @property {{ id: string, label: string, mode: string, note?: string }[]} [platformMatrix]
 * @property {{ date: string, sections: { priorities: string, risks: string, decisions: string } }} briefingNotes
 * @property {{ id: string, date: string, title: string, body: string, tags?: string[] }[]} decisions
 * @property {object[]} agentJobs
 * @property {{ date: string, stepsChecked: string[] }} [morningLoop]
 * @property {string} [primaryBoardHref]
 */

export function getTopOpenItems(ops, limit = 5) {
  const items = [];
  for (const [streamKey, stream] of Object.entries(ops.workstreams || {})) {
    for (const item of stream.items || []) {
      if (item.status === "done") continue;
      items.push({
        ...item,
        streamKey,
        streamLabel: stream.label,
        boardHref: stream.boardHref || "/hq/sookly/action-plan",
      });
    }
  }
  items.sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 9;
    const pb = PRIORITY_ORDER[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
  });
  return items.slice(0, limit);
}

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function mergeOpsPatch(current, partial) {
  return {
    ...current,
    ...partial,
    workstreams: partial.workstreams
      ? { ...current.workstreams, ...partial.workstreams }
      : current.workstreams,
    goals: partial.goals !== undefined ? partial.goals : current.goals,
    blockers: partial.blockers !== undefined ? partial.blockers : current.blockers,
    mvpMilestones: partial.mvpMilestones !== undefined ? partial.mvpMilestones : current.mvpMilestones,
    platformMatrix: partial.platformMatrix !== undefined ? partial.platformMatrix : current.platformMatrix,
    briefingNotes: partial.briefingNotes
      ? {
          ...current.briefingNotes,
          ...partial.briefingNotes,
          sections: {
            ...current.briefingNotes?.sections,
            ...partial.briefingNotes?.sections,
          },
        }
      : current.briefingNotes,
    agentJobs: partial.agentJobs !== undefined ? partial.agentJobs : current.agentJobs,
    morningLoop: partial.morningLoop !== undefined ? partial.morningLoop : current.morningLoop,
    primaryBoardHref: partial.primaryBoardHref !== undefined ? partial.primaryBoardHref : current.primaryBoardHref,
  };
}

/** Ensure older ops.json files gain new workstreams / milestones without wiping user edits. */
export function normalizeOpsData(data) {
  const base = data && typeof data === "object" ? data : {};
  const workstreams = { ...DEFAULT_OPS.workstreams, ...(base.workstreams || {}) };
  for (const key of Object.keys(DEFAULT_OPS.workstreams)) {
    if (!workstreams[key]) {
      workstreams[key] = DEFAULT_OPS.workstreams[key];
      continue;
    }
    workstreams[key] = {
      ...DEFAULT_OPS.workstreams[key],
      ...workstreams[key],
      items: workstreams[key].items || DEFAULT_OPS.workstreams[key].items,
    };
  }

  const defaultMilestoneIds = new Set((DEFAULT_OPS.mvpMilestones || []).map((m) => m.id));
  let mvpMilestones = Array.isArray(base.mvpMilestones) ? [...base.mvpMilestones] : [...DEFAULT_OPS.mvpMilestones];
  for (const m of DEFAULT_OPS.mvpMilestones || []) {
    if (!mvpMilestones.some((x) => x.id === m.id)) mvpMilestones.push(m);
  }
  // Keep default order for known ids, then any extras
  mvpMilestones = [
    ...(DEFAULT_OPS.mvpMilestones || []).map((d) => mvpMilestones.find((x) => x.id === d.id) || d),
    ...mvpMilestones.filter((x) => !defaultMilestoneIds.has(x.id)),
  ];

  return {
    ...DEFAULT_OPS,
    ...base,
    workstreams,
    todayPriorities: Array.isArray(base.todayPriorities) ? base.todayPriorities : DEFAULT_OPS.todayPriorities,
    goals: Array.isArray(base.goals) ? base.goals : DEFAULT_OPS.goals,
    blockers: Array.isArray(base.blockers) ? base.blockers : DEFAULT_OPS.blockers,
    mvpMilestones,
    platformMatrix: Array.isArray(base.platformMatrix) ? base.platformMatrix : DEFAULT_OPS.platformMatrix,
    decisions: Array.isArray(base.decisions) ? base.decisions : DEFAULT_OPS.decisions,
    agentJobs: Array.isArray(base.agentJobs) ? base.agentJobs : [],
    briefingNotes: base.briefingNotes || DEFAULT_OPS.briefingNotes,
    morningLoop: base.morningLoop || DEFAULT_OPS.morningLoop,
    primaryBoardHref: base.primaryBoardHref || DEFAULT_OPS.primaryBoardHref,
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function getStreamCounts(stream) {
  const items = stream?.items || [];
  const open = items.filter((i) => i.status !== "done");
  return {
    total: items.length,
    open: open.length,
    done: items.length - open.length,
    blocked: items.filter((i) => i.status === "blocked").length,
    p0: open.filter((i) => i.priority === "P0").length,
  };
}

export function getPortfolioSummary(ops) {
  const normalized = normalizeOpsData(ops);
  return (normalized.mvpMilestones || []).map((m) => {
    const streams = m.workstreamKeys.map((k) => normalized.workstreams[k]).filter(Boolean);
    const allItems = streams.flatMap((s) => s.items || []);
    const open = allItems.filter((i) => i.status !== "done");
    const done = allItems.length - open.length;
    const pct = allItems.length ? Math.round((done / allItems.length) * 100) : 0;
    return {
      ...m,
      stageLabel: STAGE_LABELS[m.stage] || m.stage,
      open: open.length,
      blocked: allItems.filter((i) => i.status === "blocked").length,
      done,
      total: allItems.length,
      pct,
    };
  });
}

/** Ops-derived attention — overdue dues and blocked items. No fake integrations. */
export function getOpsAttention(ops, today = todayIso()) {
  const attention = [];
  const todayMs = Date.parse(`${today}T12:00:00Z`);
  const staleMs = 21 * 86_400_000; // hide ancient overdue noise
  for (const [streamKey, stream] of Object.entries(ops.workstreams || {})) {
    for (const item of stream.items || []) {
      if (item.status === "done") continue;
      if (item.status === "blocked") {
        attention.push({
          sev: "error",
          title: item.title,
          time: item.due || "no due date",
          tag: stream.label,
          action: "Unblock",
          href: stream.boardHref || "/hq",
          id: item.id,
        });
      } else if (item.due && item.due < today) {
        const dueMs = Date.parse(`${item.due}T12:00:00Z`);
        if (Number.isFinite(dueMs) && todayMs - dueMs > staleMs) continue;
        attention.push({
          sev: "warning",
          title: item.title,
          time: `overdue ${item.due}`,
          tag: stream.label,
          action: "Review",
          href: stream.boardHref || "/hq",
          id: item.id,
        });
      }
    }
  }
  attention.sort((a, b) => (a.sev === "error" && b.sev !== "error" ? -1 : a.sev !== "error" && b.sev === "error" ? 1 : 0));
  return attention.slice(0, 8);
}

/** Merge freeform blockers with workstream items marked blocked. */
export function getMergedBlockers(ops) {
  const normalized = normalizeOpsData(ops);
  const fromOps = (normalized.blockers || []).filter((b) => b.status !== "resolved");
  const fromStreams = [];
  for (const [streamKey, stream] of Object.entries(normalized.workstreams || {})) {
    for (const item of stream.items || []) {
      if (item.status !== "blocked") continue;
      fromStreams.push({
        id: `ws-${item.id}`,
        title: item.title,
        detail: `${stream.label} · ${item.priority || "P?"}`,
        status: "open",
        stream: streamKey,
        sourceItemId: item.id,
        href: stream.boardHref || "/hq/portfolio",
      });
    }
  }
  const seen = new Set(fromOps.map((b) => b.sourceItemId).filter(Boolean));
  const merged = [...fromOps];
  for (const row of fromStreams) {
    if (seen.has(row.sourceItemId)) continue;
    merged.push(row);
  }
  return merged;
}

export { STAGE_LABELS, PLATFORM_MODE_LABELS, PRIORITY_ORDER, STATUS_ORDER };
