import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { loadCommitDetail } from "@/lib/hq/repo-graph-load.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicError(error) {
  const message = error instanceof Error ? error.message : "Could not read that commit.";
  if (/token|authorization|x-access-token|ghp_|github_pat_/i.test(message)) {
    return "Could not read that commit.";
  }
  return message.slice(0, 300);
}

export async function GET(request) {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const sha = request.nextUrl.searchParams.get("sha") || "";
  try {
    const detail = await loadCommitDetail(sha);
    return NextResponse.json(detail, {
      status: detail.ok ? 200 : 400,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: publicError(error) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
