import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { readOpsData, patchOpsData } from "@/lib/hq/ops";
import { generateBriefingWithLlm, parseBriefingSections } from "@/lib/hq/briefing-llm";
import { newId } from "@/lib/hq/ops-shared";

export async function POST(request) {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let followUp = "";
  try {
    const body = await request.json();
    followUp = body.followUp || body.question || "";
  } catch {
    // empty body ok
  }

  const ops = await readOpsData();
  const jobId = newId("job");
  const startedAt = new Date().toISOString();

  try {
    const { text, model } = await generateBriefingWithLlm(ops, { followUp });
    const sections = parseBriefingSections(text);
    const completedAt = new Date().toISOString();

    const agentJobs = [
      {
        id: jobId,
        type: followUp ? "briefing-follow-up" : "briefing-ask-ai",
        status: "completed",
        startedAt,
        completedAt,
        model,
        summary: followUp ? `Follow-up: ${followUp.slice(0, 80)}` : "Ask AI briefing generated",
      },
      ...(ops.agentJobs || []),
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
        lastGeneratedBy: followUp ? "ask-ai-follow-up" : "ask-ai",
      },
      agentJobs,
    });

    return NextResponse.json({ ok: true, text, model, data });
  } catch (err) {
    const agentJobs = [
      {
        id: jobId,
        type: "briefing-ask-ai",
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        summary: err.message || "LLM request failed",
      },
      ...(ops.agentJobs || []),
    ].slice(0, 20);
    await patchOpsData({ agentJobs });
    return NextResponse.json({ ok: false, error: err.message || "LLM request failed" }, { status: 503 });
  }
}
