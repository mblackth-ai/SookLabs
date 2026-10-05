// One read model for the room header, /hq/api/room/summary and the room MCP's
// read tools, so a seat over MCP sees exactly what Mark sees on the page.
// Pure: callers pass in the control-plane snapshot, ops data and seat strip.

const clip = (text, max) => {
  const value = String(text ?? "");
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

export const FINISH_LINE_BASIS = "Four-front estimate: the average of the progress set for each front in HQ. Not acceptance.";

/** The room header: finish-line estimate, approvals waiting on Mark, control-plane blockers. */
export function summarizeSnapshot(snapshot) {
  return {
    generatedAt: snapshot.generatedAt,
    finishLine: {
      percent: snapshot.overallProgress,
      basis: FINISH_LINE_BASIS,
      fronts: (snapshot.fronts || []).map((front) => ({ id: front.id, name: front.name, progress: front.progress })),
    },
    approvals: (snapshot.approvals || []).map((job) => ({
      id: job.id,
      type: job.type || "",
      summary: job.summary || "",
      provider: job.provider || "",
      status: job.status,
      startedAt: job.startedAt || "",
    })),
    blockers: (snapshot.blockers || []).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail || "",
      href: item.href || "",
    })),
  };
}

/** Offline agent seats as blockers, worded as the room page shows them. */
export function seatBlockerRows(strip) {
  return (strip || [])
    .filter((row) => !row.ready)
    .map((row) => {
      const noAdapter = String(row.missing || "").startsWith("HQ_SEAT_ADAPTER_");
      const awaitingKey = row.adapter === "pull" && String(row.missing || "").startsWith("HQ_ROOM_CONNECTION_");
      return {
        id: `seat-${row.seatId}`,
        seatId: row.seatId,
        title: awaitingKey ? `${row.callsign} connected, waiting for its key` : `${row.callsign} offline`,
        detail: awaitingKey
          ? `Ask ${row.callsign} to run the pairing step, then approve its code in Seat key requests.`
          : `${row.missing} is not set, so this seat gets no dispatches.`,
        action: noAdapter ? "connect" : awaitingKey ? "disconnect" : "",
        href: "",
      };
    });
}

/** Seat availability without secrets: adapter kind, ready/online and last seen. */
export function seatRows(strip) {
  return (strip || []).map((row) => ({
    seat: row.seatId,
    callsign: row.callsign,
    adapter: row.adapter,
    ready: Boolean(row.ready),
    online: Boolean(row.online),
    lastSeenAt: row.lastSeenAt || "",
    missing: row.missing || "",
  }));
}

/**
 * The four-front execution board (ops workstreams.executionMode): owner, next
 * action and acceptance test per front. A repository seed until it is applied
 * through ops; an owner is not proof of a dispatch.
 */
export function executionBoard(ops, front = "") {
  const board = ops?.workstreams?.executionMode || {};
  const items = (board.items || [])
    .filter((item) => !front || item.front === front)
    .map((item) => ({
      id: item.id,
      front: item.front,
      title: item.title || "",
      priority: item.priority || "",
      status: item.status || "",
      owner: item.owner || "",
      currentState: clip(item.currentState, 600),
      nextAction: clip(item.nextAction, 600),
      deliverable: clip(item.deliverable, 400),
      acceptanceTest: clip(item.acceptanceTest, 600),
      acceptanceStatus: item.acceptanceStatus || "",
      dispatchStatus: item.dispatchStatus || "",
      authority: clip(item.authority, 300),
      evidence: (item.evidence || []).slice(0, 10),
    }));
  return {
    label: board.label || "",
    note: board.items?.length
      ? "Board of record for the four fronts. Status is what ops says; only production acceptance evidence proves done."
      : "The ops store has no execution board yet. The repository seed (data/hq/ops.json workstreams.executionMode) must be applied through the ops interface by Mark; until then there is no board of record.",
    items,
  };
}
