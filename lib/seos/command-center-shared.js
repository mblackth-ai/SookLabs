import { DEFAULT_COMMAND_CENTER } from "./command-center-default";

/** @typedef {"inactive"|"manual"|"draft_export"|"connected"} ConnectionBadge */

/** @typedef {"oauth"|"n8n"|"browser_manual"|"cursor_cloud_agent"|"codex_script"|"grok_bot_routine"|"static_config"|"unknown"} ConnectionMethod */

/**
 * @typedef {object} CommandCenterConnection
 * @property {string} id
 * @property {string} label
 * @property {string} channel
 * @property {boolean} active
 * @property {ConnectionBadge} badge
 * @property {boolean} healthVerified
 * @property {ConnectionMethod} method
 * @property {string|null|"unknown"} lastHealthCheck
 * @property {string|null|"unknown"} lastSuccessfulAction
 * @property {string} [operatorNotes]
 * @property {boolean} [enabled]
 */

/**
 * @typedef {object} CommandCenterPost
 * @property {string} id
 * @property {string} title
 * @property {"draft"|"scheduled"|"live"|"failed"} status
 * @property {string|null} link
 * @property {string|null} at
 */

/**
 * @typedef {object} CommandCenterWorkflow
 * @property {string} id
 * @property {string} role
 * @property {string} summary
 * @property {string} schedule
 * @property {string[]} destinations
 * @property {string[]} dataSources
 * @property {"running"|"idle"|"blocked"} status
 * @property {CommandCenterPost[]} recentPosts
 * @property {object} editable
 * @property {string} editable.cadence
 * @property {string} [editable.toneLocks]
 * @property {boolean} editable.channelEnabled
 * @property {"draft"|"auto"} editable.mode
 * @property {string} [editable.notes]
 */

/**
 * @typedef {object} CommandCenterProject
 * @property {string} id
 * @property {string} name
 * @property {string} tagline
 * @property {string[]} domains
 * @property {CommandCenterConnection[]} connections
 * @property {CommandCenterWorkflow[]} workflows
 * @property {string} [operatorNotes]
 */

/**
 * @typedef {object} CommandCenterData
 * @property {string|null} updatedAt
 * @property {CommandCenterProject[]} projects
 */

export const CONNECTION_METHOD_LABELS = {
  oauth: "OAuth",
  n8n: "n8n",
  browser_manual: "Browser / manual",
  cursor_cloud_agent: "Cursor cloud agent",
  codex_script: "Codex script",
  grok_bot_routine: "Grok Bot routine",
  static_config: "Static / config",
  unknown: "Unknown",
};

export const CONNECTION_BADGE_LABELS = {
  inactive: "Inactive",
  manual: "Manual",
  draft_export: "Draft Export",
  connected: "Connected",
};

export const WORKFLOW_STATUS_LABELS = {
  running: "Running",
  idle: "Idle",
  blocked: "Blocked",
};

/** Connected badge only when health is explicitly verified — never guess. */
export function resolveConnectionBadge(connection) {
  const badge = connection?.badge || "inactive";
  if (badge === "connected") {
    if (
      connection.healthVerified &&
      connection.lastHealthCheck &&
      connection.lastHealthCheck !== "unknown"
    ) {
      return "connected";
    }
    return connection.active ? "manual" : "inactive";
  }
  return badge;
}

export function countConnections(project) {
  const connections = project.connections || [];
  return {
    total: connections.length,
    active: connections.filter((c) => c.active).length,
    connected: connections.filter((c) => resolveConnectionBadge(c) === "connected").length,
  };
}

export function projectWorkflowStatus(project) {
  const statuses = (project.workflows || []).map((w) => w.status);
  if (statuses.includes("blocked")) return "blocked";
  if (statuses.includes("running")) return "running";
  return "idle";
}

export function projectLastActivity(project) {
  const stamps = [];
  for (const conn of project.connections || []) {
    if (conn.lastSuccessfulAction && conn.lastSuccessfulAction !== "unknown") {
      stamps.push(conn.lastSuccessfulAction);
    }
  }
  for (const wf of project.workflows || []) {
    for (const post of wf.recentPosts || []) {
      if (post.at) stamps.push(post.at);
    }
  }
  if (!stamps.length) return "unknown";
  return stamps.sort().reverse()[0];
}

export function getProjectRollup(project) {
  const conn = countConnections(project);
  return {
    id: project.id,
    name: project.name,
    tagline: project.tagline,
    domains: project.domains,
    connectionsActive: conn.active,
    connectionsTotal: conn.total,
    connectionsConnected: conn.connected,
    workflowStatus: projectWorkflowStatus(project),
    lastActivity: projectLastActivity(project),
  };
}

export function mergeCommandCenterPatch(current, partial) {
  if (!partial?.projects) {
    return { ...current, ...partial, updatedAt: new Date().toISOString() };
  }

  const byId = new Map((current.projects || []).map((p) => [p.id, p]));
  for (const patchProject of partial.projects) {
    const existing = byId.get(patchProject.id);
    if (!existing) {
      byId.set(patchProject.id, patchProject);
      continue;
    }
    const merged = { ...existing, ...patchProject };
    if (patchProject.connections) {
      const connById = new Map((existing.connections || []).map((c) => [c.id, c]));
      for (const c of patchProject.connections) {
        connById.set(c.id, { ...connById.get(c.id), ...c });
      }
      merged.connections = Array.from(connById.values());
    }
    if (patchProject.workflows) {
      const wfById = new Map((existing.workflows || []).map((w) => [w.id, w]));
      for (const w of patchProject.workflows) {
        const prev = wfById.get(w.id) || {};
        wfById.set(w.id, {
          ...prev,
          ...w,
          editable: { ...prev.editable, ...w.editable },
          recentPosts: w.recentPosts ?? prev.recentPosts,
        });
      }
      merged.workflows = Array.from(wfById.values());
    }
    byId.set(patchProject.id, merged);
  }

  return {
    ...current,
    ...partial,
    projects: Array.from(byId.values()),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCommandCenterData(data) {
  const base = data && typeof data === "object" ? data : {};
  const defaultIds = new Set(DEFAULT_COMMAND_CENTER.projects.map((p) => p.id));
  let projects = Array.isArray(base.projects) ? [...base.projects] : [];
  for (const seed of DEFAULT_COMMAND_CENTER.projects) {
    if (!projects.some((p) => p.id === seed.id)) projects.push(seed);
  }
  projects = DEFAULT_COMMAND_CENTER.projects.map(
    (seed) => {
      const found = projects.find((p) => p.id === seed.id);
      if (!found) return seed;
      return {
        ...seed,
        ...found,
        connections: mergeById(seed.connections, found.connections),
        workflows: mergeWorkflows(seed.workflows, found.workflows),
      };
    },
  );
  projects.push(...(Array.isArray(base.projects) ? base.projects.filter((p) => !defaultIds.has(p.id)) : []));

  return {
    ...DEFAULT_COMMAND_CENTER,
    ...base,
    projects,
    updatedAt: base.updatedAt || null,
  };
}

function mergeById(seedItems, storedItems) {
  const map = new Map((seedItems || []).map((item) => [item.id, item]));
  for (const item of storedItems || []) {
    map.set(item.id, { ...map.get(item.id), ...item });
  }
  return Array.from(map.values());
}

function mergeWorkflows(seedItems, storedItems) {
  const map = new Map((seedItems || []).map((item) => [item.id, item]));
  for (const item of storedItems || []) {
    const prev = map.get(item.id) || {};
    map.set(item.id, {
      ...prev,
      ...item,
      editable: { ...prev.editable, ...item.editable },
      recentPosts: item.recentPosts ?? prev.recentPosts,
    });
  }
  return Array.from(map.values());
}

export { DEFAULT_COMMAND_CENTER };
