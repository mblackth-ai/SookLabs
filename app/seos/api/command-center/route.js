import { NextResponse } from "next/server";
import { isSeosSessionValid } from "@/lib/seos/session";
import { patchCommandCenterData, readCommandCenterData } from "@/lib/seos/command-center";

export async function GET() {
  if (!(await isSeosSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const data = await readCommandCenterData();
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(request) {
  if (!(await isSeosSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!body?.projects || !Array.isArray(body.projects)) {
    return NextResponse.json({ ok: false, error: "projects[] required" }, { status: 400 });
  }

  const data = await patchCommandCenterData({ projects: body.projects });
  return NextResponse.json({ ok: true, data });
}
