/**
 * Zero-OAuth click-and-play sandboxes for HQ project sections.
 * Persist drafts in-browser (and optionally via ops PATCH later). Never claim Connected/Live.
 */

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
