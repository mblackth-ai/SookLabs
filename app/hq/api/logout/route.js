import { NextResponse } from "next/server";
import { HQ_COOKIE } from "@/lib/hq/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HQ_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
