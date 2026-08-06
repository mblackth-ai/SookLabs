import { absoluteUrl } from "@/lib/site";

/** Canonical metadata for the public Resources hub. */
export const RESOURCES_PAGE = {
  path: "/resources",
  name: "Resources",
  title: "Resources — SookLabs",
  description:
    "Free on-page tools for llms.txt readiness, GEO checklists, FAQ embeds, and shareable citations—plus a curated shelf of official docs. No fake Connected badges.",
};

/** Interactive tools shown on /resources (priority order). */
export const RESOURCE_TOOLS = [
  {
    id: "llms-txt",
    title: "llms.txt readiness",
    badge: "On-page tool",
    role: "flagship",
    summary:
      "Draft a copy-ready llms.txt starter and walk a simple public readiness checklist—no live crawl.",
  },
  {
    id: "geo-checklist",
    title: "GEO / AI-answer checklist",
    badge: "On-page tool",
    role: "modular",
    summary:
      "Operator checklist for answer-engine visibility. Export markdown; link to a free GEO audit when you want a deeper read.",
  },
  {
    id: "faq-embed",
    title: "FAQ / answer embed",
    badge: "On-page tool",
    role: "modular",
    summary:
      "Paste helper for one Q&A block as HTML or Markdown. Not a second source of business truth.",
  },
  {
    id: "cite-share",
    title: "Cite / share this page",
    badge: "On-page tool",
    role: "modular",
    summary: "Markdown citation, HTML attribution, and native share intents for any public URL.",
  },
];

/** Curated outbound docs — link shelf only; no iframe embeds. */
export const CURATED_SHELF = [
  {
    id: "llmstxt-spec",
    title: "llms.txt proposal",
    description: "Community proposal for machine-readable site summaries.",
    url: "https://llmstxt.org/",
  },
  {
    id: "google-ai-overviews",
    title: "Google AI features & your website",
    description: "How Google describes AI features that surface web content.",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
  },
  {
    id: "schema-org",
    title: "Schema.org documentation",
    description: "Official vocabulary docs (reference link—not a generator).",
    url: "https://schema.org/docs/documents.html",
  },
  {
    id: "sooklabs-llmstxt",
    title: "SookLabs llms.txt (live example)",
    description: "Our public llms.txt as a concrete starter reference.",
    url: absoluteUrl("/llms.txt"),
  },
  {
    id: "sooklabs-audit",
    title: "Free GEO audit",
    description: "Request a generative visibility read from SookLabs.",
    url: absoluteUrl("/audit"),
  },
];

export function resourcesShareUrl() {
  return absoluteUrl(RESOURCES_PAGE.path);
}
