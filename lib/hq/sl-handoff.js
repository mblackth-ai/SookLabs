// SL handoff rules for an existing room baton. Pure: no I/O and no new store.
// slId and reviewer live on the baton the room already saves.

export const SL_STATUSES = ["dispatched", "claimed", "in_review", "reviewed", "approved", "blocked"];

const SL_ID = /^SL-\d+$/;

function word(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pull SL fields off a baton object.
 * No slId and no reviewer means this is not an SL baton.
 * `resolveSeat` maps an id or callsign to `{ id }` or null.
 */
export function slBatonFields(source, resolveSeat) {
  const raw = source && typeof source === "object" ? source : {};
  const slText = String(raw.slId ?? "").trim();
  const reviewerText = String(raw.reviewer ?? "").trim();
  if (!slText && !reviewerText) return { ok: true, sl: null };
  if (!slText) return { ok: false, status: 400, error: "An SL reviewer needs an slId." };
  if (!SL_ID.test(slText)) return { ok: false, status: 400, error: "slId must be SL- followed by digits." };
  if (!reviewerText) return { ok: false, status: 400, error: "An SL baton needs a reviewer seat." };
  const reviewer = resolveSeat(reviewerText);
  if (!reviewer?.id) return { ok: false, status: 400, error: "Reviewer is not a seat." };
  const toText = String(raw.to ?? "").trim();
  if (!toText) return { ok: false, status: 400, error: "An SL baton needs an assignee seat." };
  const assignee = resolveSeat(toText);
  if (!assignee?.id) return { ok: false, status: 400, error: "Baton target is not a seat." };
  if (reviewer.id === assignee.id) return { ok: false, status: 400, error: "The reviewer cannot be the assignee." };
  const status = word(raw.status);
  if (!SL_STATUSES.includes(status)) {
    return {
      ok: false,
      status: 400,
      error: "SL status must be dispatched, claimed, in_review, reviewed, approved, or blocked.",
    };
  }
  return { ok: true, sl: { slId: slText, to: assignee.id, reviewer: reviewer.id, status } };
}

function hasReviewRef(refs) {
  return Array.isArray(refs) && refs.some((ref) => ref && (ref.type === "doc" || ref.type === "pr"));
}

function createdKey(message) {
  const raw = message?.createdAt ?? message?.created_at ?? "";
  const text = raw instanceof Date ? raw.toISOString() : String(raw);
  return `${text}\0${String(message?.id || "")}`;
}

/**
 * The first stored baton for an slId. Later posts are checked against it,
 * so a seat cannot pick a new assignee or reviewer for a handoff that already exists.
 */
export function priorSlHandoff(messages, slId) {
  const id = String(slId || "").trim();
  if (!id) return null;
  let best = null;
  let bestKey = "";
  for (const message of messages || []) {
    const baton = message?.baton;
    if (message?.kind !== "baton" || !baton || baton.slId !== id || !baton.to || !baton.reviewer) continue;
    const key = createdKey(message);
    if (!best || key < bestKey) {
      best = message;
      bestKey = key;
    }
  }
  if (!best) return null;
  return { slId: id, to: best.baton.to, reviewer: best.baton.reviewer };
}

/** Same gate as a room write: history supplies the assignee and reviewer when this slId was already posted. */
export function gateStoredSlPost(messages, input) {
  const prior = priorSlHandoff(messages, input?.baton?.slId);
  return gateSlPost({ ...input, prior });
}

/**
 * Who may post an SL handoff. `seatId` is the authenticated seat, never a claimed author.
 * A non-SL baton (no slId) is left to the existing room rules.
 * `prior` is the first stored handoff for this slId, when the write path has one.
 */
export function gateSlPost({ seatId, kind, baton, refs, prior = null }) {
  if (!baton?.slId) return { ok: true };
  const bound = prior?.slId === baton.slId && prior.to && prior.reviewer ? prior : null;
  if (bound && (baton.to !== bound.to || baton.reviewer !== bound.reviewer)) {
    return { ok: false, status: 403, error: "This SL handoff already has an assignee and a reviewer." };
  }
  const assignee = baton.to || "";
  const reviewer = baton.reviewer || "";
  if (reviewer && assignee && reviewer === assignee) {
    return { ok: false, status: 400, error: "The reviewer cannot be the assignee." };
  }
  if (kind === "decision" && seatId === assignee) {
    return { ok: false, status: 403, error: "The assignee cannot post a decision for this SL handoff." };
  }
  if (kind !== "baton") {
    return { ok: false, status: 400, error: "SL handoff fields belong on a baton." };
  }
  const status = baton.status || "";
  if (!SL_STATUSES.includes(status)) {
    return {
      ok: false,
      status: 400,
      error: "SL status must be dispatched, claimed, in_review, reviewed, approved, or blocked.",
    };
  }
  switch (status) {
    case "reviewed": {
      if (seatId === assignee) {
        return { ok: false, status: 403, error: "The assignee cannot record their own review." };
      }
      if (seatId !== reviewer) {
        return { ok: false, status: 403, error: "Only the reviewer can post a review for this SL handoff." };
      }
      if (!hasReviewRef(refs)) return { ok: false, status: 400, error: "A review needs a doc or pr ref." };
      return { ok: true };
    }
    case "approved":
      if (seatId !== "mark") return { ok: false, status: 403, error: "Only Mark can mark an SL handoff approved." };
      return { ok: true };
    case "dispatched":
    case "claimed":
    case "in_review":
    case "blocked":
      return { ok: true };
    default: {
      const unexpected = status;
      return { ok: false, status: 400, error: `Unhandled SL status: ${unexpected}` };
    }
  }
}

function looseSlSources(raw) {
  const sources = [];
  if (raw?.baton && typeof raw.baton === "object") sources.push(raw.baton);
  if (raw && typeof raw === "object" && (raw.slId != null || raw.reviewer != null)) sources.push(raw);
  return sources;
}

/** HTTP and MCP entry check. SL fields on a non-baton are rejected, not dropped. */
export function authorizeSlPost({ seatId, kind, raw, baton, refs, resolveSeat }) {
  if (kind === "baton") return gateSlPost({ seatId, kind, baton, refs });
  for (const source of looseSlSources(raw)) {
    const parsed = slBatonFields(source, resolveSeat);
    if (!parsed.ok) return parsed;
    if (!parsed.sl) continue;
    return gateSlPost({
      seatId,
      kind,
      baton: { slId: parsed.sl.slId, to: parsed.sl.to, reviewer: parsed.sl.reviewer, status: parsed.sl.status },
      refs,
    });
  }
  return { ok: true };
}
