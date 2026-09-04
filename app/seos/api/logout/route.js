import { NextResponse } from "next/server";
import { SEOS_COOKIE, sessionCookieOptions } from "@/lib/seos/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SEOS_COOKIE, "", sessionCookieOptions(0));
  return res;
}
