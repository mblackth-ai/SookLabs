import { newId } from "./ops-shared";
import { dispatchBriefingJob } from "./agent-provider";

export async function runMorningBriefing(readOps, writeOps) {
  const jobId = newId("job");
  const startedAt = new Date().toISOString();
  const ops = await readOps();
  const provider = process.env.HQ_AGENT_DEFAULT_PROVIDER || "cursor";

  const runningJobs = [
    {
      id: jobId,
      type: "morning-briefing",
      status: "running",
      provider,
      startedAt,
      summary: "Dispatching morning briefing…",
    },
    ...(ops.agentJobs || []).filter((j) => j.type !== "morning-briefing" || j.status !== "running"),
  ].slice(0, 20);

  await writeOps({ ...ops, agentJobs: runningJobs });

  try {
    const result = await dispatchBriefingJob(ops, {
      jobId,
      type: "morning-briefing",
      provider,
    });

    if (result.status === "completed") {
      const completedAt = new Date().toISOString();
      const latest = await readOps();
      const agentJobs = [
        {
          id: jobId,
          type: "morning-briefing",
          status: "completed",
          provider: result.provider,
          startedAt,
          completedAt,
          model: result.model,
          summary: result.text.slice(0, 200) + (result.text.length > 200 ? "…" : ""),
        },
        ...(latest.agentJobs || []).filter((j) => j.id !== jobId),
      ].slice(0, 20);

      const next = await writeOps({
        ...latest,
        briefingNotes: {
          date: new Date().toISOString().slice(0, 10),
          sections: {
            priorities: result.sections?.priorities || result.text,
            risks: result.sections?.risks || latest.briefingNotes?.sections?.risks || "",
            decisions: result.sections?.decisions || latest.briefingNotes?.sections?.decisions || "",
          },
          lastGeneratedAt: completedAt,
          lastGeneratedBy: "morning-cron",
        },
        agentJobs,
      });

      return { ok: true, status: "completed", jobId, briefingLength: result.text.length, data: next };
    }

    const latest = await readOps();
    const agentJobs = [
      {
        id: jobId,
        type: "morning-briefing",
        status: "running",
        provider: result.provider,
        startedAt,
        summary: result.summary,
        externalRef: result.webhookPosted ? "webhook" : "pending",
      },
      ...(latest.agentJobs || []).filter((j) => j.id !== jobId),
    ].slice(0, 20);

    const next = await writeOps({ ...latest, agentJobs });

    return {
      ok: true,
      status: "running",
      jobId,
      provider: result.provider,
      mode: result.mode,
      webhookPosted: result.webhookPosted,
      summary: result.summary,
      data: next,
    };
  } catch (err) {
    const latest = await readOps();
    const agentJobs = [
      {
        id: jobId,
        type: "morning-briefing",
        status: "failed",
        provider,
        startedAt,
        completedAt: new Date().toISOString(),
        summary: err.message || "Morning briefing failed",
      },
      ...(latest.agentJobs || []).filter((j) => j.id !== jobId),
    ].slice(0, 20);
    await writeOps({ ...latest, agentJobs });
    throw err;
  }
}
