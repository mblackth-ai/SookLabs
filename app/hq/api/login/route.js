import { NextResponse } from "next/server";
import {
  HQ_COOKIE,
  SESSION_MAX_AGE_SEC,
  createSessionToken,
  resolveAccessPassword,
  resolveSessionSecret,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/hq/auth";

export async function POST(request) {
  const password = resolveAccessPassword();
  const secret = resolveSessionSecret();

  if (!password || !secret) {
    return NextResponse.json(
      { ok: false, error: "HQ access is not configured." },
      { status: 503 }
    );
  }

  let submitted = "";
  try {
    const body = await request.json();
    submitted = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!submitted || !(await verifyPassword(submitted, password))) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HQ_COOKIE, token, sessionCookieOptions(SESSION_MAX_AGE_SEC));
  return res;
}
