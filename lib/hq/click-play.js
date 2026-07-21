/**
 * Zero-OAuth click-and-play sandboxes for HQ project sections.
 * Persist drafts in-browser; promote to workstream board via ops PATCH. Never claim Connected/Live.
 */

/** @type {Record<string, { streamKey: string, idPrefix: string, boardHref: string }>} */
export const CLICK_PLAY_BOARD = {
  seosSocial: { streamKey: "seosSocial", idPrefix: "ss", boardHref: "/hq/seos/social-gtm" },
  community: { streamKey: "community", idPrefix: "cm", boardHref: "/hq/community" },
  roastMyOpSec: { streamKey: "roastMyOpSec", idPrefix: "rm", boardHref: "/hq/roastmyopsec" },
  sooklyReceptionist: { streamKey: "sooklyWebsite", idPrefix: "sw", boardHref: "/hq/sookly/action-plan" },
};

export const CLICK_PLAY_SECTIONS = {
  seosSocial: {
    id: "seosSocial",
    title: "Social pack playground",
    badge: "Manual · 0 OAuth",
    blurb:
      "Compose a draft social pack from one source article. Platforms stay Manual / Draft Export until you approve OAuth later.",
    steps: [
      { id: "source", label: "Paste source article URL or title", type: "text", placeholder: "https://… or headline" },
      { id: "angle", label: "Pick angle", type: "select", options: ["How-to", "Proof / case", "Offer", "Thought leadership"] },
      {
        id: "platforms",
        label: "Target platforms",
        type: "multi",
        options: ["Facebook Page", "Instagram", "TikTok", "Reddit", "LinkedIn", "X", "Threads"],
      },
      { id: "cta", label: "CTA line", type: "text", placeholder: "Book a consult / Read more / Reply YES" },
    ],
    resultKind: "draft_pack",
  },
  community: {
    id: "community",
    title: "Pillar cadence playground",
    badge: "Manual · 0 OAuth",
    blurb: "Plan this week’s Discord pillar posts without hosting or Stripe. Structure first; Future API later.",
    steps: [
      { id: "pillar", label: "Pillar", type: "select", options: ["Psychology", "Investment", "Technology"] },
      { id: "format", label: "Format", type: "select", options: ["Short prompt", "Thread", "AMA seed", "Resource drop"] },
      { id: "title", label: "Working title", type: "text", placeholder: "e.g. Noise diet for founders" },
      { id: "when", label: "Suggested day", type: "select", options: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    ],
    resultKind: "pillar_plan",
  },
  roastMyOpSec: {
    id: "roastMyOpSec",
    title: "Surface inventory playground",
    badge: "Manual · 0 live scan",
    blurb:
      "Click through a public-surface checklist. No live scanner — Future API. Reads exposure hints only; SEOS owns business truth.",
    steps: [
      { id: "domain", label: "Primary domain", type: "text", placeholder: "example.com" },
      {
        id: "surfaces",
        label: "Surfaces to inventory",
        type: "multi",
        options: ["Website", "Email / MX", "Social profiles", "App / API", "CDN / DNS", "Admin panels"],
      },
      { id: "severity", label: "Severity focus", type: "select", options: ["Hygiene", "Exposure", "Auth gaps", "Data leaks"] },
      { id: "note", label: "Operator note", type: "text", placeholder: "What to check first…" },
    ],
    resultKind: "surface_plan",
  },
  sooklyReceptionist: {
    id: "sooklyReceptionist",
    title: "Receptionist reply playground",
    badge: "Demo · not live product",
    blurb:
      "Sketch what the AI receptionist should say from SEOS KB facts. Demo only — no live chat, no separate FAQ store.",
    steps: [
      { id: "intent", label: "Caller intent", type: "select", options: ["Hours / location", "Pricing range", "Book consult", "Service scope", "Escalate to human"] },
      { id: "tone", label: "Tone", type: "select", options: ["Warm / brief", "Formal", "Direct"] },
      { id: "mustSay", label: "Must say (from KB)", type: "text", placeholder: "Fact the assistant is allowed to state…" },
      { id: "mustNot", label: "Must not invent", type: "text", placeholder: "e.g. exact price, medical advice, guarantees" },
    ],
    resultKind: "receptionist_script",
  },
};

export function buildClickPlayResult(sectionId, values) {
  const section = CLICK_PLAY_SECTIONS[sectionId];
  if (!section) return null;
  const stamp = new Date().toISOString();
  return {
    sectionId,
    kind: section.resultKind,
    status: "draft_export",
    createdAt: stamp,
    values: { ...values },
    summary: Object.entries(values)
      .filter(([, v]) => (Array.isArray(v) ? v.length : String(v || "").trim()))
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join(" · "),
  };
}

export function boardTitleFromDraft(result) {
  if (!result) return "Click-play draft";
  const v = result.values || {};
  if (result.sectionId === "seosSocial") {
    return `Social pack: ${String(v.source || "").slice(0, 72) || "untitled"}`;
  }
  if (result.sectionId === "community") {
    return `Pillar ${v.pillar || "?"}: ${v.title || "untitled"} (${v.when || "?"})`;
  }
  if (result.sectionId === "roastMyOpSec") {
    return `Surface inventory: ${v.domain || "domain"} · ${v.severity || "focus"}`;
  }
  if (result.sectionId === "sooklyReceptionist") {
    return `Receptionist demo: ${v.intent || "intent"}`;
  }
  return `Click-play: ${result.summary?.slice(0, 80) || result.kind}`;
}

/** Session keys for latest draft hints (Overview). */
export const CLICK_PLAY_SESSION_KEYS = Object.keys(CLICK_PLAY_SECTIONS).map((id) => `hq-click-play:${id}`);
