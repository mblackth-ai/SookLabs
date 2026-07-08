const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2 };
const STATUS_ORDER = { blocked: 0, doing: 1, todo: 2, done: 3 };

export function getTopOpenItems(ops, limit = 3) {
  const items = [];
  for (const [streamKey, stream] of Object.entries(ops.workstreams || {})) {
    for (const item of stream.items || []) {
      if (item.status === "done") continue;
      items.push({ ...item, streamKey, streamLabel: stream.label });
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
  };
}
