// Shared reply gate. Call while holding the dispatch row lock (Postgres) or
// during the single-process file-store mutation. Not a substitute for seat auth.
export function dispatchReplyError(dispatch, { seatId, expectedAttempt = null, now = Date.now() }) {
  if (!dispatch || dispatch.seatId !== seatId) {
    return { status: 403, error: "That dispatch is not for this seat." };
  }
  // A previously committed reply can be replayed, never replaced.
  if (dispatch.replyMessageId) return null;
  if (!["dispatching", "thinking"].includes(dispatch.status)) {
    return { status: 409, error: "That dispatch is not accepting a reply." };
  }
  if (expectedAttempt !== null &&
      (!Number.isSafeInteger(expectedAttempt) || expectedAttempt < 1 || expectedAttempt !== dispatch.attempts)) {
    return { status: 409, error: "That dispatch attempt is no longer current." };
  }
  if (dispatch.leaseUntil &&
      (!Number.isFinite(Date.parse(dispatch.leaseUntil)) || Date.parse(dispatch.leaseUntil) <= now)) {
    return { status: 409, error: "That dispatch lease has expired." };
  }
  return null;
}
