import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { loadSookLabsRepoGraph } from "@/lib/hq/repo-graph-load.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicError(error) {
  const message = error instanceof Error ? error.message : "Could not read the repository graph.";
  if (/token|authorization|x-access-token|ghp_|github_pat_/i.test(message)) {
    return "Could not read the repository graph.";
  }
  return message.slice(0, 300);
}

export async function GET() {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, readOnly: true, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const graph = await loadSookLabsRepoGraph();
    return NextResponse.json(graph, {
      status: graph.ok ? 200 : 502,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, readOnly: true, error: publicError(error) },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
