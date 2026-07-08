import { NextResponse } from "next/server";
import { readOpsData, writeOpsData } from "@/lib/hq/ops";
import { runMorningBriefing } from "@/lib/hq/morning-run";

function isAuthorized(request) {
  const secret =
    process.env.HQ_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const header = request.headers.get("x-hq-cron-secret") || "";
  return bearer === secret || header === secret;
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMorningBriefing(readOpsData, writeOpsData);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Morning run failed" }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}
