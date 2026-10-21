/**
 * Client profiles for HQ → Clients. Facts Mark confirmed (domains, channels, phone numbers, systems of record).
 * No metrics live here: numbers come from SEOS, and anything without a real source is shown as not connected.
 */
export const CLIENTS = [
  {
    slug: "rdusa",
    seosBusiness: "rdusa",
    retainer: "rdusa",
    aliases: ["rdusa", "retail display usa", "retaildisplayusa"],
    name: "Retail Display USA",
    short: "RDUSA",
    domain: "retaildisplayusa.com",
    summary: "Store fixtures and wall systems. Performance is locked on two numbers.",
    lockedMetrics: [
      { key: "outrigger_sales", label: "Outrigger sales", contentLine: "outriggers" },
      { key: "slatwall_sales", label: "Slatwall sales", contentLine: "slatwall" },
    ],
    links: [
      { label: "Website", href: "https://retaildisplayusa.com" },
      { label: "Slatwall range", href: "https://retaildisplayusa.com/slatwall/textured-slatwall" },
      { label: "Samples & quotes", href: "https://retaildisplayusa.com/samples-quotes" },
    ],
    contacts: [{ label: "Phone", value: "(800) 420-1457", href: "tel:+18004201457" }],
    systems: [
      { label: "CRM of record", value: "Andolw's own system", connected: false, note: "No CRM integration yet." },
      { label: "Outrigger / slatwall sales", value: "No sales source", connected: false, note: "Connect a sales export to report the locked metrics." },
      { label: "Joomla article approvals", value: "retaildisplayusa.com", connected: false },
    ],
  },
  {
    slug: "jaka",
    seosBusiness: "jaka",
    retainer: "jaka",
    aliases: ["jaka", "open door movers", "opendoormovers", "jakatransportation"],
    name: "JAKA Transportation",
    short: "JAKA",
    domain: "jakatransportation.com",
    summary: "Kansas City metro movers. Posts go out as Open Door Movers. Focus: KC-metro moving leads and hiring.",
    lockedMetrics: [
      { key: "moving_leads", label: "KC-metro moving leads", contentLine: "leads" },
      { key: "hiring_applicants", label: "Hiring applicants", contentLine: "hiring" },
    ],
    links: [
      { label: "Website", href: "https://jakatransportation.com" },
      { label: "Facebook: Open Door Movers", href: "https://www.facebook.com/opendoormovers" },
      { label: "Instagram: @opendoormovers", href: "https://www.instagram.com/opendoormovers" },
    ],
    contacts: [
      { label: "Phone", value: "(816) 299-7989", href: "tel:+18162997989" },
      { label: "Phone", value: "(913) 957-9311", href: "tel:+19139579311" },
    ],
    systems: [
      { label: "Google listing", value: "Open Door Movers (Jaka Transportation)", connected: false, note: "Google Business Profile not connected to SEOS." },
      { label: "Leads source", value: "Calls / forms / Google listing", connected: false, note: "No lead source connected yet." },
      { label: "Joomla article approvals", value: "jakatransportation.com", connected: false },
    ],
  },
  {
    slug: "sooklabs",
    seosBusiness: "sooklabs",
    retainer: null,
    aliases: ["sooklabs", "sook labs"],
    name: "SookLabs",
    short: "SookLabs",
    domain: "sooklabs.com",
    summary: "Our own brand. Posts go out on the SookLabs Facebook Page.",
    lockedMetrics: [],
    links: [
      { label: "Website", href: "https://sooklabs.com" },
      { label: "Facebook: SookLabs", href: "https://www.facebook.com/875247742331134" },
    ],
    contacts: [],
    systems: [{ label: "Joomla article approvals", value: "sooklabs.com", connected: false }],
  },
  {
    slug: "sookly",
    seosBusiness: "sookly",
    retainer: null,
    aliases: ["sookly", "sookly omnichat", "sookly.co"],
    name: "Sookly Omnichat",
    short: "Sookly Omnichat",
    domain: "sookly.co",
    summary: "Our omnichannel AI receptionist. Posts go out on the Sookly Omnichat Facebook Page.",
    lockedMetrics: [],
    links: [
      { label: "Website", href: "https://sookly.co" },
      { label: "Facebook: Sookly Omnichat", href: "https://www.facebook.com/1219102517955082" },
    ],
    contacts: [],
    systems: [{ label: "Joomla article approvals", value: "sookly.co", connected: false }],
  },
];

/** The pages every client has in HQ. Retainer only where a retainer contract exists. */
export function clientSections(client) {
  const base = `/hq/clients/${client.slug}`;
  const rows = [{ key: "overview", label: "Overview", href: base }];
  if (client.retainer) rows.push({ key: "retainer", label: "Retainer", href: `${base}/retainer` });
  rows.push({ key: "content", label: "Content & Social", href: `${base}/content` });
  rows.push({ key: "briefing", label: "Briefing", href: `${base}/briefing` });
  return rows;
}

/** Sidebar rows under Clients: one group per client (always visible) with its section pages nested under it. */
export function clientNavRows(clients = CLIENTS) {
  const rows = [];
  for (const c of clients) {
    rows.push({ kind: "subitem", id: `client-${c.slug}`, label: c.short, icon: "trending", href: `/hq/clients/${c.slug}`, alwaysOpen: true, exact: true });
    for (const s of clientSections(c)) {
      if (s.key === "overview") continue;
      rows.push({ kind: "subsubitem", id: `client-${c.slug}-${s.key}`, label: s.label, icon: s.key === "retainer" ? "briefcase" : s.key === "briefing" ? "book" : "activity", href: s.href, alwaysOpen: true });
    }
  }
  return rows;
}

/** True when free text (a priority, blocker or note) is about this client. */
export function mentionsClient(text, client) {
  const t = String(text ?? "").toLowerCase();
  if (!t) return false;
  return [client.slug, client.name, client.short, client.domain, ...(client.aliases ?? [])]
    .filter(Boolean)
    .some((k) => {
      const key = String(k).toLowerCase();
      return key.length <= 5 ? new RegExp(`(^|[^a-z0-9])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).test(t) : t.includes(key);
    });
}

/** Briefing action items (from contentActionItems) that belong to this client: ids are "<business slug>:...". */
export function clientActionItems(items, client) {
  return (items ?? []).filter((i) => String(i.id).startsWith(`${client.seosBusiness}:`));
}

export function getClient(slug) {
  return CLIENTS.find((c) => c.slug === slug) ?? null;
}
