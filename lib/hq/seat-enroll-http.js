import "server-only";
import { enrollInstalled } from "./seat-enroll.js";

/** null when enrollment can run; otherwise a { status, error } to return. */
export async function enrollUnavailable() {
  try {
    if (await enrollInstalled()) return null;
    return { status: 503, error: "Seat key requests are not installed yet. Mark runs scripts/hq-seat-enroll-migrate.mjs once." };
  } catch (error) {
    return { status: 503, error: error?.code === "no-database" ? "Seat key requests need the HQ database." : "Seat key requests are unavailable." };
  }
}
