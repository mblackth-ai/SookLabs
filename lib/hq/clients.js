/**
 * Client profiles for HQ → Clients. Facts Mark confirmed (domains, channels, phone numbers, systems of record).
 * No metrics live here: numbers come from SEOS, and anything without a real source is shown as not connected.
 */
export const CLIENTS = [
  {
    slug: "rdusa",
    seosBusiness: "rdusa",
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
];

export function getClient(slug) {
  return CLIENTS.find((c) => c.slug === slug) ?? null;
}
