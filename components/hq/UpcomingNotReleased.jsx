"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  {
    title: "Knowledge usage demo table",
    detail: "Static rows in lib/hq/knowledge-mock.js. Removed from the primary knowledge page. Not a live Sookly or SEOS sync.",
    href: "/hq/sookly/knowledge-usage",
  },
  {
    title: "Community pillar blurbs",
    detail: "Psychology, Investment, and Technology cards were decorative. The community ops board stays on the page.",
    href: "/hq/community",
  },
  {
    title: "RoastMyOpSec live scanner",
    detail: "No scanner is connected. The surface-inventory board remains Manual.",
    href: "/hq/roastmyopsec",
  },
  {
    title: "Clients portals",
    detail: "/clients/rdusa and /clients/jaka are SPEC. They are not built.",
    href: "/hq/fronts/clients-rdusa",
  },
  {
    title: "Approval trigger cards",
    detail: "Specified in the Journey Prism swarm note. Approve, Request changes, and Hold are not interactive UI.",
    href: "/hq/fronts/business-suite-map",
  },
  {
    title: "Quo ingest and SEOS visual OS",
    detail: "No Quo webhook. SEOS calendar, movable blocks, and GA/GSC/GBP wiring are unchecked acceptance items.",
    href: "/hq/fronts/quo-ingest",
  },
  {
    title: "Unused display widgets",
    detail: "MetricCard, ProductCard, QuickLinks, and ActivityRow are not mounted.",
  },
];

export function UpcomingNotReleased() {
  const [open, setOpen] = useState(false);

  return (
    <section className="hq-page-content" aria-label="Upcoming / Not Yet Released">
      <button
        type="button"
        className="hq-band-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hq-section-label">Upcoming / Not Yet Released</span>
        <span className="hq-band-toggle-hint">{open ? "Hide" : "Collapsed"}</span>
        <span className="hq-band-chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open ? (
        <div className="hq-band-body" style={{ display: "grid", gap: 12 }}>
          {ITEMS.map((item) => (
            <div key={item.title}>
              <div className="hq-card-title">{item.title}</div>
              <p className="hq-text-sm-secondary" style={{ margin: "4px 0 0" }}>{item.detail}</p>
              {item.href ? (
                <Link href={item.href} className="hq-text-xs-muted">
                  Open
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
