export function authorizedSeat(config, subject) {
  if (typeof subject !== "string" || !config.seatAllowlist.includes(subject)) return null;
  return Object.hasOwn(config.seatBySubject, subject) ? config.seatBySubject[subject] : null;
}
