import { NextResponse } from "next/server";
import { readOpsData, patchOpsData } from "@/lib/hq/ops";
import { parseBriefingSections } from "@/lib/hq/briefing-llm";
import { isHqSessionValid } from "@/lib/hq/session";

function isSecretAuthorized(request) {
  const secret = process.env.HQ_AGENT_CALLBACK_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const header = request.headers.get("x-hq-agent-secret") || "";
  return bearer === secret || header === secret;
}

/**
 * Ingest agent result from n8n / Cursor / Codex / Claude manual path,
 * or from the HQ UI while logged in (session cookie).
 * Body: { jobId, text, provider?, status?, summary?, sections? }
 */
export async function POST(request) {
  const sessionOk = await isHqSessionValid();
  if (!sessionOk && !isSecretAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const jobId = body.jobId || body.id;
  const text = String(body.text || body.result || body.briefing || "").trim();
  const status = (body.status || "completed").toLowerCase();
  const provider = body.provider || "webhook";

  if (!jobId) {
    return NextResponse.json({ ok: false, error: "jobId required" }, { status: 400 });
  }

  if (status === "completed" && !text) {
    return NextResponse.json({ ok: false, error: "text required when status=completed" }, { status: 400 });
  }

  const ops = await readOpsData();
  const completedAt = new Date().toISOString();
  const existing = (ops.agentJobs || []).find((j) => j.id === jobId);
  const startedAt = existing?.startedAt || body.startedAt || completedAt;
  const jobType = existing?.type || body.type || "briefing-ask-ai";

  if (status === "failed") {
    const agentJobs = [
      {
        id: jobId,
        type: jobType,
        status: "failed",
        provider,
        startedAt,
        completedAt,
        summary: body.summary || body.error || "Agent job failed",
      },
      ...(ops.agentJobs || []).filter((j) => j.id !== jobId),
    ].slice(0, 20);
    const data = await patchOpsData({ agentJobs });
    return NextResponse.json({ ok: true, status: "failed", jobId, data });
  }

  const sections = body.sections || parseBriefingSections(text);
  const followUp = Boolean(body.followUp || jobType.includes("follow-up"));

  const agentJobs = [
    {
      id: jobId,
      type: jobType,
      status: "completed",
      provider,
      startedAt,
      completedAt,
      summary: body.summary || text.slice(0, 200) + (text.length > 200 ? "…" : ""),
      externalRef: body.externalRef,
    },
    ...(ops.agentJobs || []).filter((j) => j.id !== jobId),
  ].slice(0, 20);

  const data = await patchOpsData({
    briefingNotes: {
      date: new Date().toISOString().slice(0, 10),
      sections: followUp
        ? {
            ...ops.briefingNotes?.sections,
            priorities: text,
          }
        : {
            priorities: sections.priorities || text,
            risks: sections.risks || ops.briefingNotes?.sections?.risks || "",
            decisions: sections.decisions || ops.briefingNotes?.sections?.decisions || "",
          },
      lastGeneratedAt: completedAt,
      lastGeneratedBy: provider,
    },
    agentJobs,
  });

  return NextResponse.json({ ok: true, status: "completed", jobId, data });
}
