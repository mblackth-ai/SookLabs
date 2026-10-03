import { createHash, timingSafeEqual } from "crypto";
import {
  ROOM_CONNECTIONS,
  connectionEnvKey,
  connectionForSeat,
  mcpSeatEnvKey,
  roomSeat,
} from "./swarm-contract.js";

function digest(value) {
  return createHash("sha256").update(String(value), "utf8").digest();
}

function secretMatch(left, right) {
  if (!left || !right) return false;
  return timingSafeEqual(digest(left), digest(right));
}

export function tokenHash(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex");
}

export function isRoomDraft(env = process.env) {
  return String(env.HQ_ROOM_STATUS || "").trim().toLowerCase() !== "live";
}

export function githubWriteAvailable() {
  return false;
}

function seatSecrets(name, env) {
  return [env[connectionEnvKey(name)], env[mcpSeatEnvKey(name)]].map((value) => value?.trim() || "").filter(Boolean);
}

export function listRoomConnections(env = process.env) {
  return ROOM_CONNECTIONS.map((item) => ({
    seat: item.seat,
    name: item.name,
    configured: seatSecrets(item.name, env).length > 0,
  }));
}

function sharedSecrets(env) {
  return [env.HQ_ACCESS_PASSWORD, env.HQ_SESSION_SECRET].map((value) => value?.trim() || "").filter(Boolean);
}

function matchingSeats(token, env) {
  return ROOM_CONNECTIONS.filter((item) => seatSecrets(item.name, env).some((secret) => secretMatch(token, secret)));
}

export function identifySeat({ token, claimedSeat, claimedAuthor, sharedLogin = false, env = process.env }) {
  const presented = String(token || "").trim();
  if (!presented) {
    return {
      ok: false,
      status: 401,
      error: sharedLogin ? "The shared HQ login cannot post as a seat." : "Send this seat's connection.",
    };
  }
  if (sharedSecrets(env).some((secret) => secretMatch(presented, secret))) {
    return { ok: false, status: 403, error: "The shared HQ login cannot post as a seat." };
  }
  const matches = matchingSeats(presented, env);
  if (matches.length !== 1) {
    return {
      ok: false,
      status: 403,
      error:
        matches.length === 0
          ? "That connection is not configured for a seat. This draft cannot post."
          : "That connection does not identify one seat.",
    };
  }
  const seat = roomSeat(matches[0].seat);
  const claimed = [claimedSeat, claimedAuthor].filter((value) => value != null && String(value).trim() !== "");
  for (const value of claimed) {
    const parsed = roomSeat(value);
    if (!parsed) return { ok: false, status: 400, error: "Unknown seat." };
    if (parsed.id !== seat.id) {
      return { ok: false, status: 403, error: "That connection cannot post as another seat." };
    }
  }
  return { ok: true, seat: seat.id, tier: seat.tier, connection: seat.id, tokenHash: tokenHash(presented) };
}

export function authorizeSeatConnection({ seat, token, sharedLogin = false, env = process.env }) {
  const spec = connectionForSeat(seat);
  if (!spec) return { ok: false, status: 400, error: "Choose a seat before posting." };
  return identifySeat({ token, claimedSeat: seat, sharedLogin, env });
}
