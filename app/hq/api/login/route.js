import { NextResponse } from "next/server";
import { HQ_COOKIE, createSessionToken, timingSafeEqual } from "@/lib/hq/auth";

export async function POST(request) {
  const password = process.env.HQ_ACCESS_PASSWORD;
  const secret = process.env.HQ_SESSION_SECRET;

  if (!password || !secret) {
    return NextResponse.json(
      { ok: false, error: "HQ access is not configured." },
      { status: 500 }
    );
  }

  let submitted = "";
  try {
    const body = await request.json();
    submitted = body?.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!submitted || !timingSafeEqual(submitted, password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HQ_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
