import { getTopOpenItems } from "./ops-shared";

function buildOpsContext(ops) {
  const openPriorities = (ops.todayPriorities || []).filter((p) => !p.done);
  const topOpen = getTopOpenItems(ops, 5);
  const recentDecisions = (ops.decisions || []).slice(0, 3);

  return [
    "## Today's open priorities",
    openPriorities.length ? openPriorities.map((p) => `- ${p.title}`).join("\n") : "- None",
    "",
    "## Top open workstream items",
    topOpen.length
      ? topOpen.map((i) => `- [${i.priority}] ${i.title} (${i.streamLabel}, ${i.status})`).join("\n")
      : "- None",
    "",
    "## Recent decisions",
    recentDecisions.length
      ? recentDecisions.map((d) => `- ${d.date}: ${d.title}`).join("\n")
      : "- None",
    "",
    "## Current briefing notes",
    `Priorities: ${ops.briefingNotes?.sections?.priorities || "(empty)"}`,
    `Risks: ${ops.briefingNotes?.sections?.risks || "(empty)"}`,
    `Decisions to make: ${ops.briefingNotes?.sections?.decisions || "(empty)"}`,
  ].join("\n");
}

export async function generateBriefingWithLlm(ops, { followUp = "" } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const model = process.env.HQ_LLM_MODEL || "claude-sonnet-4-20250514";
  const context = buildOpsContext(ops);

  const system = `You are the SookLabs HQ executive briefing assistant. Be concise, actionable, and honest. 
Do not invent revenue metrics or live integrations. Focus on priorities, risks, and decisions based only on the ops context provided.
Format with short sections: Priorities focus, Risks & blockers, Decisions to make, Suggested actions today.`;

  const userContent = followUp
    ? `${context}\n\n---\nFollow-up question from founder:\n${followUp}`
    : `${context}\n\n---\nGenerate a morning executive briefing draft for today based on this ops data.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || `Anthropic API error ${res.status}`);
  }

  const text = json.content?.find((c) => c.type === "text")?.text || "";
  return { text, model };
}

export function parseBriefingSections(text) {
  const sections = { priorities: "", risks: "", decisions: "" };
  const lower = text.toLowerCase();
  const parts = text.split(/\n(?=#{1,3}\s|\*\*)/);

  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    const l = p.toLowerCase();
    if (l.includes("priorit") && !l.includes("risk")) sections.priorities = p;
    else if (l.includes("risk") || l.includes("blocker")) sections.risks = p;
    else if (l.includes("decision")) sections.decisions = p;
  }

  if (!sections.priorities && !sections.risks && !sections.decisions) {
    sections.priorities = text;
  }
  return sections;
}
