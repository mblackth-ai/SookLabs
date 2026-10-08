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
