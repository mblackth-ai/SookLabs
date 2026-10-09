/** Fixed copy for owner join failures. The URL may only carry one of these codes. */
export const OWNER_JOIN_ERRORS = {
  used: "This link was already used. If that wasn't you, ask SookLabs for a new one.",
  expired: "This link expired. Ask SookLabs for a new one.",
  cancelled: "This link was replaced or cancelled. Ask SookLabs for a new one.",
  unknown: "This link is not valid.",
  unavailable: "Reports are unavailable right now. Try again shortly.",
};

export function ownerJoinErrorText(code) {
  if (typeof code !== "string") return null;
  return Object.prototype.hasOwnProperty.call(OWNER_JOIN_ERRORS, code) ? OWNER_JOIN_ERRORS[code] : null;
}

const REDEEM_STATE_TEXT = {
  used: "This link was already used.",
  expired: "This link expired.",
  cancelled: "This link was replaced or cancelled.",
};

/** Error object redeem returns when the invite exists but cannot be used. */
export function ownerRedeemErrorFromState(state) {
  const known = Object.prototype.hasOwnProperty.call(REDEEM_STATE_TEXT, state);
  const code = known ? state : "unknown";
  const why = known ? REDEEM_STATE_TEXT[state] : "This link is not valid.";
  return {
    status: state === "unknown" ? 404 : 410,
    error: `${why} Ask for a new one.`,
    code,
  };
}

/** Error object redeem returns when the token is not an invite. */
export function ownerRedeemUnknownToken() {
  return { status: 404, error: "This link is not valid.", code: "unknown" };
}

/** Error object the redeem route returns when owner storage throws. */
export function ownerRedeemUnavailable() {
  return { status: 503, error: "Owner access is unavailable right now.", code: "unavailable" };
}
