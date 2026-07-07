import { NextResponse } from "next/server";
import { HQ_COOKIE, sessionCookieOptions } from "@/lib/hq/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HQ_COOKIE, "", sessionCookieOptions(0));
  return res;
}
