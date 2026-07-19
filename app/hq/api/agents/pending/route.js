import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { readOpsData } from "@/lib/hq/ops";
import { buildAgentPayload } from "@/lib/hq/agent-provider";

function isCronAuthorized(request) {
  const secret =
    process.env.HQ_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.HQ_AGENT_CALLBACK_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const header =
    request.headers.get("x-hq-cron-secret") ||
    request.headers.get("x-hq-agent-secret") ||
    "";
  return bearer === secret || header === secret;
}

/**
 * List running agent jobs for Cursor Automations / Codex runners to poll.
 * Auth: HQ session cookie OR Bearer cron/callback secret.
 */
export async function GET(request) {
  const sessionOk = await isHqSessionValid();
  const cronOk = isCronAuthorized(request);
  if (!sessionOk && !cronOk) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const providerFilter = searchParams.get("provider")?.toLowerCase();

  const ops = await readOpsData();
  const running = (ops.agentJobs || []).filter((j) => {
    if (j.status !== "running") return false;
    if (providerFilter && (j.provider || "").toLowerCase() !== providerFilter) return false;
    return true;
  });

  const jobs = running.map((job) => ({
    ...job,
    payload: buildAgentPayload(ops, {
      jobId: job.id,
      type: job.type,
      provider: job.provider,
    }),
  }));

  return NextResponse.json({
    ok: true,
    count: jobs.length,
    jobs,
    callbackHint: {
      url: "/hq/api/agents/callback",
      header: "Authorization: Bearer $HQ_AGENT_CALLBACK_SECRET",
      body: { jobId: "<id>", text: "<briefing markdown>", provider: "<cursor|codex|claude>" },
    },
  });
}
