import {
  RETAINER_AS_OF,
  RETAINER_GOLDEN_RULE,
  RETAINER_WINDOW,
  buildRetainerPeriods,
  countRetainerStatuses,
  finalizeRetainerSnapshot,
  isRetainerHealthy,
  isRetainerWindowComplete,
  retainerCriterion,
} from "./retainer-delivery";

export const JAKA_RETAINER_CONTRACT_PATH = "docs/JAKA_RETAINER_DELIVERY_CONTRACT.md";

export const JAKA_RETAINER_CONTRACT_URL =
  "https://github.com/mblackth-ai/SookLabs/blob/cursor/hq-four-front-evidence-sync-f8c4/docs/JAKA_RETAINER_DELIVERY_CONTRACT.md";

export const JAKA_RETAINER_CRITERIA = [
  retainerCriterion({
    id: "jaka-daily-fb-buffer",
    criterion: "Facebook Planner buffer at 2 posts per day",
    cadence: "daily",
    status: "PASS",
    owner: "Site",
    requiredForHealth: true,
    evidence:
      "Operating state recorded for 2 Oct 2026: Facebook Planner buffer is at least 7 days at 2 posts per day for JAKA movers & Transportation. This HQ slice does not contain the planner export. A later asOf without that evidence must not keep this PASS. Never post Jaka from SookLabs.",
  }),
  retainerCriterion({
    id: "jaka-daily-ig-threads",
    criterion: "Instagram and Threads when those apps are signed in",
    cadence: "daily",
    status: "BLOCKED",
    owner: "Mark",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Instagram and Threads publish only when those apps are signed in. They are often signed out as of 2 Oct 2026. That is BLOCKED, not FAIL, and it does not fail the Facebook daily promise.",
  }),
  retainerCriterion({
    id: "jaka-daily-blog-draft-buffer",
    criterion: "Blog draft and noindex buffer",
    cadence: "daily",
    status: "PASS",
    owner: "Site",
    requiredForHealth: true,
    evidence:
      "Operating state recorded for 2 Oct 2026: the blog draft and noindex buffer is at least 7 days. Site owns the drafts. Live publish is not claimed. A later asOf without that evidence must not keep this PASS.",
  }),
  retainerCriterion({
    id: "jaka-daily-blog-live",
    criterion: "Live blog publish",
    cadence: "daily",
    status: "BLOCKED",
    owner: "Mark",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Live blog publish waits on Origin connecting to Vercel. Do not claim the live blog shipped. This is BLOCKED, not FAIL, and it is outside the daily buffer score.",
  }),
  retainerCriterion({
    id: "jaka-weekly-seo-pack-rule",
    criterion: "KC-metro SEO packs follow the buffer rule",
    cadence: "weekly",
    status: "PASS",
    owner: "Site",
    requiredForHealth: true,
    evidence:
      "Keyword, title, and FAQ packs for KC-metro are produced when the blog buffer window triggers. The buffer is full, so HOLD is the correct state for 2026-W40. This PASS is the operating rule. It is not a claim that a new pack shipped this week.",
  }),
  retainerCriterion({
    id: "jaka-weekly-hire-board",
    criterion: "Hire-board and Marketplace lead passes",
    cadence: "weekly",
    status: "BLOCKED",
    owner: "CoS",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Hire-board and Marketplace lead passes are on HOLD until the CoS unlocks them. HOLD is BLOCKED, not FAIL. It does not fail the weekly SEO-pack rule.",
  }),
  retainerCriterion({
    id: "jaka-monthly-october-cadence",
    criterion: "October Facebook cadence held for the month",
    cadence: "monthly",
    status: "NOT STARTED",
    owner: "Site",
    requiredForHealth: false,
    evidence:
      "October Facebook cadence cannot be scored for the whole month on 2 Oct 2026. The day-level planner buffer is a separate PASS. No monthly artifact beyond that operating rule is in HQ.",
  }),
  retainerCriterion({
    id: "jaka-90d-fb-cadence",
    criterion: "Consistent Facebook cadence and planner buffer",
    cadence: "90d",
    status: "NOT STARTED",
    owner: "Site",
    requiredForHealth: false,
    evidence:
      "90-day goal: consistent Facebook cadence and a planner buffer through 29 Dec 2026. The 2 Oct buffer PASS does not close this goal.",
  }),
  retainerCriterion({
    id: "jaka-90d-seo-schedule",
    criterion: "SEO packs on schedule across the window",
    cadence: "90d",
    status: "NOT STARTED",
    owner: "Site",
    requiredForHealth: false,
    evidence:
      "90-day goal: KC-metro SEO packs on schedule. The current week is HOLD because the blog buffer is full. The 90-day schedule is not closed.",
  }),
  retainerCriterion({
    id: "jaka-90d-hire-board",
    criterion: "Hire-board pipeline when unlocked",
    cadence: "90d",
    status: "BLOCKED",
    owner: "CoS",
    requiredForHealth: false,
    evidence: "90-day goal: hire-board pipeline when the CoS unlocks it. Still HOLD, so BLOCKED rather than FAIL.",
  }),
  retainerCriterion({
    id: "jaka-90d-site-golive",
    criterion: "Site content ready for go-live when Origin and Vercel connect",
    cadence: "90d",
    status: "BLOCKED",
    owner: "Mark",
    requiredForHealth: false,
    evidence:
      "Draft buffer is a separate daily PASS. Go-live waits on Origin connecting to Vercel. Live site is not claimed. This goal is BLOCKED, not FAIL.",
  }),
  retainerCriterion({
    id: "jaka-90d-craigslist-nextdoor",
    criterion: "Craigslist and Nextdoor",
    cadence: "90d",
    status: "BLOCKED",
    owner: "Mark",
    requiredForHealth: false,
    evidence:
      "Craigslist and Nextdoor remain Mark-gated costs and logins. Not started as paid or logged-in channels. BLOCKED rather than FAIL.",
  }),
  retainerCriterion({
    id: "jaka-brand-lock",
    criterion: "Brand and listing truth",
    cadence: "daily",
    status: "UNKNOWN",
    owner: "Site",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Brand is JAKA movers & Transportation. Site is jakatransportation.com. Google listing truth is Open Door Movers (Tim / Open Door Movers LLC). Never post Jaka from SookLabs. No wrong-brand incident is recorded in HQ, and no clean-day proof is recorded either, so this is UNKNOWN.",
  }),
];

function buildSnapshot() {
  const criteria = JAKA_RETAINER_CRITERIA;
  return {
    field: "jakaRetainerContract",
    clientId: "jaka",
    clientName: "Jaka Transportation",
    brandName: "JAKA movers & Transportation",
    site: "jakatransportation.com",
    listingName: "Open Door Movers",
    listingLegal: "Tim / Open Door Movers LLC",
    path: JAKA_RETAINER_CONTRACT_PATH,
    url: JAKA_RETAINER_CONTRACT_URL,
    authoritative: true,
    asOf: RETAINER_AS_OF,
    timeZone: RETAINER_WINDOW.timeZone,
    window: RETAINER_WINDOW,
    goldenRule: RETAINER_GOLDEN_RULE,
    fee: {
      amountUsd: null,
      cadence: "monthly",
      label: "confirm with Mark",
      scope: "Content, SEO, and leads. Dollar amount is not in HQ.",
      confirmed: false,
    },
    retainerHealthy: isRetainerHealthy(criteria),
    healthBasis:
      "True only because the Facebook buffer, blog draft buffer, and SEO-pack hold rule are PASS. Mark-gated Instagram, live publish, hire-board, Craigslist, and Nextdoor are excluded from this boolean. The 90-day window is not complete. The fee is unconfirmed.",
    windowComplete: isRetainerWindowComplete(criteria),
    counts: countRetainerStatuses(criteria),
    periods: buildRetainerPeriods(criteria),
    criticalPath:
      "Keep the Facebook Planner buffer and the blog draft buffer. SEO packs stay on HOLD while the blog buffer is full. Hire-board, live blog, Craigslist, and Nextdoor stay blocked. Fee amount is unconfirmed.",
    nextUnmet: {
      id: "jaka-monthly-october-cadence",
      also: "jaka-90d-fb-cadence",
      summary: "October cadence and the 90-day Facebook habit are not closed on day 2",
    },
    criteria,
  };
}

export function getJakaRetainerContractSnapshot() {
  return finalizeRetainerSnapshot(buildSnapshot());
}
