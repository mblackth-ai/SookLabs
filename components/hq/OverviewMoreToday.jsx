"use client";

import { useState } from "react";

/**
 * Collapsible "More today" band for secondary overview blocks.
 */
export function OverviewMoreToday({ children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="hq-band hq-band--review" aria-label="Review">
      <button
        type="button"
        className="hq-band-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="hq-section-label">More today</span>
        <span className="hq-band-toggle-hint">{open ? "Hide" : "Portfolio · jobs · drafts"}</span>
        <span className="hq-band-chevron" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? <div className="hq-band-body">{children}</div> : null}
    </section>
  );
}
