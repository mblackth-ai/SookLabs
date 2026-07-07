import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { patchOpsData, readOpsData } from "@/lib/hq/ops";

export async function GET() {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, data: readOpsData() });
}

export async function PATCH(request) {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const allowed = {};
  if (body.todayPriorities !== undefined) allowed.todayPriorities = body.todayPriorities;
  if (body.workstreams !== undefined) allowed.workstreams = body.workstreams;
  if (body.briefingNotes !== undefined) allowed.briefingNotes = body.briefingNotes;
  if (body.decisions !== undefined) allowed.decisions = body.decisions;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields to update" }, { status: 400 });
  }

  const data = patchOpsData(allowed);
  return NextResponse.json({ ok: true, data });
}
