import Link from "next/link";
import { TopBar } from "./TopBar";

/** Honest placeholder for a nav section that has no page yet. No sample data. */
export function ComingSoon({ section }) {
  return (
    <div>
      <TopBar title={section.title} subtitle="Coming soon" />
      <div className="hq-page-content">
        <section className="hq-card hq-card--pad-md hq-coming-soon" aria-labelledby="hq-soon-heading">
          <span className="hq-sidebar-nav-badge hq-sidebar-nav-badge--soon">Coming soon</span>
          <h2 id="hq-soon-heading" className="hq-coming-soon-title">
            {section.title} isn’t built yet
          </h2>
          <p className="hq-coming-soon-body">{section.blurb} This page has no data source connected, so it shows nothing rather than sample numbers.</p>
          {section.today?.length ? (
            <>
              <p className="hq-coming-soon-sub">Where to look today</p>
              <ul className="hq-coming-soon-links">
                {section.today.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label} →</Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
