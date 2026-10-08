import { NextResponse } from "next/server";
import { browserWriteAllowed } from "@/lib/hq/room-http";
import { sessionCookieOptions } from "@/lib/hq/auth";
import { OWNER_COOKIE } from "@/lib/hq/owner-portal";

export const dynamic = "force-dynamic";

/** Owner: forget this device. Mark can still revoke the key itself from HQ Reports. */
export async function POST(request) {
  if (!browserWriteAllowed(request)) return NextResponse.json({ ok: false, error: "Cross-site posts are blocked." }, { status: 403 });
  const host = (request.headers.get("host") || "").split(":")[0];
  const url = request.nextUrl.clone();
  url.pathname = host === "hq.sooklabs.com" ? "/client" : "/hq/client";
  url.search = "";
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(OWNER_COOKIE, "", sessionCookieOptions(0));
  return res;
}
