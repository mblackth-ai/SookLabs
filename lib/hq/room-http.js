import "server-only";
import { NextResponse } from "next/server";
import { HQ_COOKIE, resolveSessionSecret, verifySessionToken } from "./auth";
import { identifySeatAny } from "./seat-auth";
import {
  gateRoomKind,
  normalizeBaton,
  normalizeBody,
  normalizeChannel,
  normalizeKind,
  normalizeRefs,
} from "./swarm-contract";

export function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function isSpectatorRequest(request) {
  return request.nextUrl.searchParams.get("as") === "spectator";
}

export function presentedConnection(request, bodyToken) {
  const header = (request.headers.get("x-hq-room-connection") || "").trim();
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
  const body = String(bodyToken || "").trim();
  const unique = [...new Set([header, bearer, body].filter(Boolean))];
  if (unique.length > 1) return { ok: false, status: 400, error: "Send one connection." };
  return { ok: true, token: unique[0] || "" };
}

function requestHost(request) {
  return (request.headers.get("host") || "").split(":")[0].toLowerCase();
}

export function browserWriteAllowed(request) {
  const fetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).hostname.toLowerCase() === requestHost(request);
  } catch {
    return false;
  }
}

export async function sessionPresent(request) {
  const token = request.cookies.get(HQ_COOKIE)?.value;
  const secret = resolveSessionSecret();
  if (!token || !secret) return false;
  return verifySessionToken(token, secret);
}

export async function requireLiveRead(request) {
  if (isSpectatorRequest(request)) {
    return { ok: false, status: 401, error: "Spectators cannot read the room." };
  }
  const presented = presentedConnection(request);
  if (!presented.ok) return presented;
  if (presented.token) {
    const auth = await identifySeatAny({ token: presented.token });
    if (!auth.ok) return auth;
    return { ok: true, seat: auth.seat, mode: "seat" };
  }
  if (await sessionPresent(request)) return { ok: true, seat: "", mode: "session" };
  return { ok: false, status: 401, error: "Send this seat's connection." };
}

export async function requireSeatPost(request, body) {
  if (isSpectatorRequest(request)) {
    return { ok: false, status: 403, error: "Spectators cannot post." };
  }
  if (!browserWriteAllowed(request)) {
    return { ok: false, status: 403, error: "Cross-site posts are blocked." };
  }
  const presented = presentedConnection(request, body?.connection);
  if (!presented.ok) return presented;
  return identifySeatAny({
    token: presented.token,
    claimedSeat: body?.seat ?? body?.seatId,
    claimedAuthor: body?.author,
    sharedLogin: Boolean(request.cookies.get(HQ_COOKIE)?.value),
  });
}

export function parseRoomPost(body, seatId) {
  const kind = normalizeKind(body?.kind ?? body?.type);
  if (!kind.ok) return kind;
  const text = normalizeBody(body?.body ?? body?.text ?? body?.message);
  if (!text.ok) return text;
  const gate = gateRoomKind(seatId, kind.kind);
  if (!gate.ok) return gate;
  const refs = normalizeRefs(body?.refs);
  if (!refs.ok) return refs;
  const baton = normalizeBaton(body?.baton, kind.kind);
  if (!baton.ok) return baton;
  const channel = normalizeChannel(body?.channel);
  if (!channel) return { ok: false, status: 400, error: "Channel is invalid." };
  return { ok: true, channel, kind: kind.kind, body: text.body, refs: refs.refs, baton: baton.baton };
}

export async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return { ok: true, body: await request.json() };
    } catch {
      return { ok: false, status: 400, error: "Invalid JSON." };
    }
  }
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      return { ok: true, body: Object.fromEntries(form.entries()) };
    } catch {
      return { ok: false, status: 400, error: "Invalid form." };
    }
  }
  const raw = await request.text();
  if (!raw.trim()) return { ok: true, body: {} };
  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON." };
  }
}

/** A request that must carry one seat connection (agents polling their inbox). Session cookies do not count. */
export async function requireSeatConnection(request) {
  if (isSpectatorRequest(request)) return { ok: false, status: 403, error: "Spectators have no inbox." };
  const presented = presentedConnection(request);
  if (!presented.ok) return presented;
  if (!presented.token) return { ok: false, status: 401, error: "Send this seat's connection." };
  return identifySeatAny({ token: presented.token });
}
