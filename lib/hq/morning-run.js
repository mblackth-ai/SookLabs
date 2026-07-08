import { newId } from "./ops-shared";
import { generateBriefingWithLlm, parseBriefingSections } from "./briefing-llm";

export async function runMorningBriefing(readOps, writeOps) {
  const jobId = newId("job");
  const startedAt = new Date().toISOString();
  const ops = await readOps();

  const runningJobs = [
    { id: jobId, type: "morning-briefing", status: "running", startedAt, summary: "Generating morning briefing…" },
    ...(ops.agentJobs || []).filter((j) => j.type !== "morning-briefing" || j.status !== "running"),
  ].slice(0, 20);

  await writeOps({ ...ops, agentJobs: runningJobs });

  try {
    const { text, model } = await generateBriefingWithLlm(ops);
    const sections = parseBriefingSections(text);
    const completedAt = new Date().toISOString();

    const latest = await readOps();
    const agentJobs = [
      {
        id: jobId,
        type: "morning-briefing",
        status: "completed",
        startedAt,
        completedAt,
        model,
        summary: text.slice(0, 200) + (text.length > 200 ? "…" : ""),
      },
      ...(latest.agentJobs || []).filter((j) => j.id !== jobId),
    ].slice(0, 20);

    const next = await writeOps({
      ...latest,
      briefingNotes: {
        date: new Date().toISOString().slice(0, 10),
        sections: {
          priorities: sections.priorities || text,
          risks: sections.risks || latest.briefingNotes?.sections?.risks || "",
          decisions: sections.decisions || latest.briefingNotes?.sections?.decisions || "",
        },
        lastGeneratedAt: completedAt,
        lastGeneratedBy: "morning-cron",
      },
      agentJobs,
    });

    return { ok: true, jobId, briefingLength: text.length, data: next };
  } catch (err) {
    const latest = await readOps();
    const agentJobs = [
      {
        id: jobId,
        type: "morning-briefing",
        status: "failed",
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
