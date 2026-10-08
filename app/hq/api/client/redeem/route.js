import { NextResponse } from "next/server";
import { browserWriteAllowed } from "@/lib/hq/room-http";
import { sessionCookieOptions } from "@/lib/hq/auth";
import { OWNER_COOKIE, OWNER_COOKIE_MAX_AGE_SEC, redeemOwnerInvite } from "@/lib/hq/owner-portal";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function back(request, path) {
  const host = (request.headers.get("host") || "").split(":")[0];
  const url = request.nextUrl.clone();
  url.pathname = host === "hq.sooklabs.com" ? path : `/hq${path}`;
  url.search = "";
  return url;
}

/** Owner: uses the one-time link (form POST from the join page) and sets the owner cookie. */
export async function POST(request) {
  if (!browserWriteAllowed(request)) return NextResponse.json({ ok: false, error: "Cross-site posts are blocked." }, { status: 403 });
  let token = "";
  try {
    const form = await request.formData();
    token = String(form.get("token") || "");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  let result;
  try {
    result = await redeemOwnerInvite({ token });
  } catch {
    result = { error: { status: 503, error: "Owner access is unavailable right now." } };
  }
  if (result.error) {
    const url = back(request, `/client/join/${encodeURIComponent(token)}`);
    url.searchParams.set("error", result.error.error);
    return NextResponse.redirect(url, 303);
  }
  const res = NextResponse.redirect(back(request, "/client"), 303);
  res.cookies.set(OWNER_COOKIE, result.key, sessionCookieOptions(OWNER_COOKIE_MAX_AGE_SEC));
  return res;
}
