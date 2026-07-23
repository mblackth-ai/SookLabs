/** Canonical site facts used by metadata and structured data. Keep aligned with visible page content. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://sooklabs.com";

export const SITE_NAME = "SookLabs";

export const SITE_TAGLINE = "Reduce the noise. Build the system.";

/** Primary organization description — matches root layout metadata. */
export const ORG_DESCRIPTION =
  "SookLabs builds focused AI, SEO, and workflow systems that help website-dependent companies stay relevant as search shifts to AI answer engines.";

/** Footer / hero supporting copy visible on the homepage. */
export const ORG_SUMMARY =
  "Calm digital systems that reduce repetition, interruptions, cognitive load, and waiting time.";

export const DEFAULT_LANGUAGE = "en";

export const LOGO_PATH = "/assets/sooklabs/sooklabs-glyph.png";

/** Public contact email shown in the site footer. */
export const CONTACT_EMAIL = "sooklabs.th@gmail.com";

/** Verified public social profiles — also used in Organization sameAs. */
export const SOCIAL_PROFILES = [
  { id: "instagram", label: "Instagram", url: "https://www.instagram.com/sooklabs/" },
  { id: "facebook", label: "Facebook", url: "https://www.facebook.com/sooklabs" },
  { id: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@sooklabs" },
];

/** Visible on Privacy and Terms pages. Update when policy copy changes materially. */
export const LEGAL_LAST_UPDATED = "2026-07-20";

/** SookLabs Discord community — invite URL from env (set in Vercel for production). */
export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.replace(/\/$/, "") || "";

export const DISCORD_SERVER_NAME = "SookLabs Community";

/** Discord server id for the official embed widget (public widget must be enabled in Discord settings). */
export const DISCORD_WIDGET_ID =
  process.env.NEXT_PUBLIC_DISCORD_WIDGET_ID?.trim() || "427081623469817857";

/** Bot display name used in Discord (first iteration). */
export const DISCORD_BOT_NAME = "SookLabs Bot";

/** Ecosystem projects shown on the homepage — status and copy match visible UI. */
export const ECOSYSTEM_PRODUCTS = [
  {
    name: "Sookly",
    description:
      "Handles enquiries, routes messages, reduces missed leads, and gives teams one calm inbox.",
    url: "https://sookly.co",
    status: "Live",
    category: "Omnichat · AI receptionist",
  },
  {
    name: "SEOS",
    description:
      "SEO diagnostics, website audits, content systems, and growth operations — measurable visibility.",
    url: `${SITE_URL}/audit`,
    status: "In progress",
    category: "Search Expansion OS",
  },
  {
    name: "RoastMyOpSec",
    description:
      "Plain-English exposure checks for founders and small teams. Know what is leaking, first.",
    status: "TBA",
    category: "Security auditor",
  },
  {
    name: "SookLabs Community",
    description:
      "A focused Discord community around technology, psychology, and investment. Sharper thinking, long-term leverage.",
    url: DISCORD_INVITE_URL || undefined,
    status: "Live",
    category: "Builder community",
  },
];

export const AUDIT_PAGE = {
  path: "/audit",
  name: "Free GEO Audit",
  title: "Free GEO Audit — SookLabs",
  description:
    "Request a free generative visibility audit. See how your business appears in AI answer engines—not just blue links—and get a focused action list.",
  serviceName: "Free GEO Audit",
  serviceDescription:
    "A generative visibility audit that shows how your business appears in AI answer engines, maps authority and trust signals, and delivers a prioritised action list.",
  audienceType: "Website-dependent companies",
};

export function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
