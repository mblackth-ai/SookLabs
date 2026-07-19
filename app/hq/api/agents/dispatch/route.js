import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { readOpsData, patchOpsData } from "@/lib/hq/ops";
import { newId } from "@/lib/hq/ops-shared";
import { dispatchBriefingJob } from "@/lib/hq/agent-provider";

export async function POST(request) {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let followUp = "";
  let provider;
  let type = "briefing-ask-ai";
  try {
    const body = await request.json();
    followUp = body.followUp || body.question || "";
    provider = body.provider;
    if (body.type) type = String(body.type);
  } catch {
    // empty body ok
  }

  const ops = await readOpsData();
  const jobId = newId("job");
  const startedAt = new Date().toISOString();

  const runningJobs = [
    {
      id: jobId,
      type,
      status: "running",
      provider: provider || process.env.HQ_AGENT_DEFAULT_PROVIDER || "cursor",
      startedAt,
      summary: "Dispatching agent job…",
    },
    ...(ops.agentJobs || []).filter((j) => j.id !== jobId),
  ].slice(0, 20);

  await patchOpsData({ agentJobs: runningJobs });

  try {
    const result = await dispatchBriefingJob(ops, { jobId, type, followUp, provider });

    if (result.status === "completed") {
      const completedAt = new Date().toISOString();
      const agentJobs = [
        {
          id: jobId,
          type,
          status: "completed",
          provider: result.provider,
          startedAt,
          completedAt,
          model: result.model,
          summary: followUp ? `Follow-up: ${followUp.slice(0, 80)}` : "Ask AI briefing generated",
        },
        ...(ops.agentJobs || []).filter((j) => j.id !== jobId),
      ].slice(0, 20);

      const data = await patchOpsData({
        briefingNotes: {
          date: new Date().toISOString().slice(0, 10),
          sections: followUp
            ? {
                ...ops.briefingNotes?.sections,
                priorities: result.text,
              }
            : {
                priorities: result.sections?.priorities || result.text,
                risks: result.sections?.risks || ops.briefingNotes?.sections?.risks || "",
                decisions: result.sections?.decisions || ops.briefingNotes?.sections?.decisions || "",
              },
          lastGeneratedAt: completedAt,
          lastGeneratedBy: followUp ? "ask-ai-follow-up" : "ask-ai",
        },
        agentJobs,
      });

      return NextResponse.json({ ok: true, status: "completed", jobId, text: result.text, model: result.model, data });
    }

    const agentJobs = [
      {
        id: jobId,
        type,
        status: "running",
        provider: result.provider,
        startedAt,
        summary: result.summary,
        externalRef: result.webhookPosted ? "webhook" : "pending",
      },
      ...(ops.agentJobs || []).filter((j) => j.id !== jobId),
    ].slice(0, 20);

    const data = await patchOpsData({ agentJobs });

    return NextResponse.json({
      ok: true,
      status: "running",
      jobId,
      provider: result.provider,
      mode: result.mode,
      webhookPosted: result.webhookPosted,
      webhookConfigured: result.webhookConfigured,
      summary: result.summary,
      data,
    });
  } catch (err) {
    const agentJobs = [
      {
        id: jobId,
        type,
        status: "failed",
        provider: provider || "unknown",
        startedAt,
        completedAt: new Date().toISOString(),
        summary: err.message || "Dispatch failed",
      },
      ...(ops.agentJobs || []).filter((j) => j.id !== jobId),
    ].slice(0, 20);
    await patchOpsData({ agentJobs });
    return NextResponse.json({ ok: false, error: err.message || "Dispatch failed" }, { status: 503 });
  }
}
