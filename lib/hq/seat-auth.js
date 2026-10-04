import { identifySeat } from "./room-connection.js";
import { connectionEnvKey, connectionForSeat } from "./swarm-contract.js";
import { ISSUED_KEY_PREFIX, activeIssuedSeats, seatForIssuedKey } from "./seat-enroll.js";

/**
 * identifySeat plus keys issued by self-enrollment. Env-var keys are checked
 * first and need no database; an `hqk_` key is looked up by hash and then run
 * through the same identifySeat rules (claimed seat, shared login) as if it
 * were that seat's configured connection.
 */
export async function identifySeatAny({ token, claimedSeat, claimedAuthor, sharedLogin = false, env = process.env }) {
  const base = identifySeat({ token, claimedSeat, claimedAuthor, sharedLogin, env });
  const presented = String(token || "").trim();
  if (base.ok || !presented.startsWith(ISSUED_KEY_PREFIX)) return base;
  const issued = await seatForIssuedKey(presented);
  if (!issued.seat) {
    if (issued.status === "pending") return { ok: false, status: 403, error: "This key is waiting for approval. Give the approver your pairing code." };
    if (issued.status) return { ok: false, status: 403, error: `This key is ${issued.status}. Request a new one.` };
    return base;
  }
  const name = connectionForSeat(issued.seat)?.name;
  return identifySeat({ token: presented, claimedSeat, claimedAuthor, sharedLogin, env: { ...env, [connectionEnvKey(name)]: presented } });
}

/**
 * process.env plus a readiness marker (HQ_SEAT_ISSUED_<SEAT>=1, never a secret)
 * for each seat holding an active issued key, so a `pull` seat enrolled that
 * way counts as connected.
 */
export async function seatEnv(env = process.env) {
  const seats = await activeIssuedSeats();
  return { ...env, ...Object.fromEntries(seats.map((seat) => [`HQ_SEAT_ISSUED_${seat.toUpperCase()}`, "1"])) };
}
