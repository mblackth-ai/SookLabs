/**
 * HQ left nav: the ten command-center sections in mockup order, each with its existing pages nested under it.
 * Rows: "item" (top level), "subitem" and "subsubitem" belong to the nearest preceding item.
 * Every href resolves to a real page; sections without a page yet go to an honest Coming soon page.
 */
import { clientNavRows } from "./clients.js";

/** Sections that have no page yet: /hq/<slug> renders the shared Coming soon page. */
export const COMING_SOON = {
  messages: {
    title: "Messages",
    blurb: "One inbox for customer conversations across channels.",
    today: [
      { label: "RDUSA enquiries from Sookly", href: "/hq/clients/rdusa" },
      { label: "Agent room messages", href: "/hq/room" },
    ],
  },
  campaigns: {
    title: "Campaigns",
    blurb: "Plan and track campaigns across businesses and channels.",
    today: [
      { label: "Social GTM board", href: "/hq/seos/social-gtm" },
      { label: "Content & Social schedule", href: "/hq/content" },
    ],
  },
};

export const TOP_LEVEL_IDS = ["home", "social", "messages", "clients", "tasks", "content", "campaigns", "analytics", "team", "settings"];

export const nav = [
  { kind: "item", id: "home", label: "Home", icon: "home", href: "/hq", keywords: ["overview", "dashboard", "kpi"] },
  { kind: "subitem", id: "briefing", label: "Daily Briefing", icon: "book", href: "/hq/briefing", keywords: ["notes", "action items"] },
  { kind: "subitem", id: "goals", label: "Goals", icon: "trending", href: "/hq/goals" },
  { kind: "subitem", id: "decision-log", label: "Decision Log", icon: "book", href: "/hq/decision-log" },
  { kind: "subitem", id: "review", label: "Weekly Review", icon: "book", href: "/hq/review" },

  { kind: "item", id: "social", label: "Social", icon: "share", href: "/hq/content", keywords: ["content & social", "posts", "schedule", "seos"] },
  { kind: "subitem", id: "social-gtm", label: "Social GTM", icon: "zap", href: "/hq/seos/social-gtm", badge: "board" },

  { kind: "item", id: "messages", label: "Messages", icon: "message", href: "/hq/messages", soon: true, keywords: ["inbox", "enquiries"] },

  { kind: "item", id: "clients", label: "Customers", icon: "users", href: "/hq/clients", keywords: ["clients"] },
  { kind: "subitem", id: "retainers", label: "Retainers", icon: "briefcase", href: "/hq/retainers", alwaysOpen: true },
  ...clientNavRows(),

  { kind: "item", id: "tasks", label: "Tasks", icon: "check", href: "/hq/portfolio", keywords: ["portfolio", "workstreams", "board"] },
  { kind: "subitem", id: "sookly", label: "Sookly", icon: "activity", href: "/hq/sookly" },
  { kind: "subitem", id: "action-plan", label: "Action Plan", icon: "zap", href: "/hq/sookly/action-plan", badge: "board" },
  { kind: "subitem", id: "roastmyopsec", label: "RoastMyOpSec", icon: "alert", href: "/hq/roastmyopsec" },

  { kind: "item", id: "content", label: "Content", icon: "file", href: "/hq/seos", keywords: ["seos", "seo", "articles"] },
  { kind: "subitem", id: "authority", label: "Authority", icon: "activity", href: "/hq/seos/authority", badge: "panel" },

  { kind: "item", id: "campaigns", label: "Campaigns", icon: "megaphone", href: "/hq/campaigns", soon: true },

  { kind: "item", id: "analytics", label: "Analytics", icon: "chart", href: "/hq/reports", keywords: ["reports", "rankings", "traffic"] },

  { kind: "item", id: "team", label: "Team", icon: "team", href: "/hq/automation", keywords: ["llm & agents", "agents", "automation"] },
  { kind: "subitem", id: "room", label: "Room", icon: "activity", href: "/hq/room" },
  { kind: "subitem", id: "community", label: "Community", icon: "grid", href: "/hq/community" },

  { kind: "item", id: "settings", label: "Settings", icon: "settings", href: "/hq/settings" },
];

/** Parent item href for every row (null for top-level items), in nav order. */
export function navParents(rows = nav) {
  const out = [];
  let parent = null;
  let parentSub = null;
  for (const row of rows) {
    if (row.kind === "item") {
      parent = row;
      parentSub = null;
      out.push(null);
    } else if (row.kind === "subitem") {
      parentSub = row;
      out.push(parent);
    } else if (row.kind === "subsubitem") {
      out.push(parentSub || parent);
    } else {
      out.push(null);
    }
  }
  return out;
}

/** Flat list of every page in the nav, with its trail ("Customers › RDUSA › Retainer"), for search. Deduped by href. */
export function navPages(rows = nav) {
  const parents = navParents(rows);
  const top = [];
  let currentTop = null;
  const seen = new Set();
  const pages = [];
  rows.forEach((row, i) => {
    if (row.kind === "item") currentTop = row;
    top.push(currentTop);
    if (!row.href || seen.has(row.href)) return;
    seen.add(row.href);
    const trail = [];
    if (row.kind !== "item" && top[i]) trail.push(top[i].label);
    if (row.kind === "subsubitem" && parents[i]) trail.push(parents[i].label);
    trail.push(row.label);
    pages.push({ id: row.id, label: row.label, href: row.href, trail, soon: Boolean(row.soon), keywords: row.keywords ?? [] });
  });
  return pages;
}

/** Client-side page filter for the top search bar: every whitespace-separated term must match the trail or keywords. */
export function filterNavPages(query, pages = navPages()) {
  const terms = String(query ?? "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored = [];
  for (const p of pages) {
    const hay = [...p.trail, ...p.keywords].join(" ").toLowerCase();
    if (!terms.every((t) => hay.includes(t))) continue;
    const label = p.label.toLowerCase();
    const wordStart = label.split(/[^a-z0-9]+/).some((w) => w.startsWith(terms[0]));
    const score = wordStart ? 0 : label.includes(terms[0]) ? 1 : 2;
    scored.push({ p, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.p.trail.length - b.p.trail.length).map((s) => s.p);
}
