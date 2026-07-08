import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { patchOpsData, readOpsData, getOpsStorageMode } from "@/lib/hq/ops";

export async function GET() {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const data = await readOpsData();
  return NextResponse.json({ ok: true, data, storage: getOpsStorageMode() });
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
  if (body.agentJobs !== undefined) allowed.agentJobs = body.agentJobs;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields to update" }, { status: 400 });
  }

  const data = await patchOpsData(allowed);
  return NextResponse.json({ ok: true, data, storage: getOpsStorageMode() });
}
