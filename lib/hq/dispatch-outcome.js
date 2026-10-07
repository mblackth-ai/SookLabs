import { ROOM_SEATS } from "./swarm-contract.js";

function callsign(seatId) {
  return ROOM_SEATS.find((seat) => seat.id === seatId)?.callsign || seatId;
}

/** Human-readable note when routing created offline or failed dispatches. */
export function dispatchOutcomeNote(dispatches, strip = []) {
  const rows = Array.isArray(dispatches) ? dispatches : [];
  const bySeat = new Map(strip.map((row) => [row.seatId, row]));
  const parts = [];
  for (const row of rows) {
    if (row.status === "offline") {
      const seat = bySeat.get(row.seatId);
      const missing = seat?.missing || row.error || "not connected";
      parts.push(`${callsign(row.seatId)} offline (${missing})`);
    } else if (row.status === "failed") {
      parts.push(`${callsign(row.seatId)} failed (${row.error || "adapter error"})`);
    }
  }
  return parts.length ? `Dispatches: ${parts.join("; ")}.` : "";
}
