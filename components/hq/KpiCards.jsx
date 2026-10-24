import Link from "next/link";
import { icons } from "@/lib/hq/icons";

const ICON = { revenue: "dollar", customers: "users", reach: "share", tasks: "check" };
const STATE_LABEL = { not_connected: "Not connected", empty: "No data yet", error: "Unavailable" };

function KpiCard({ kpi }) {
  const hasValue = kpi.status === "ok" && kpi.display != null;
  const body = (
    <>
      <div className="hq-kpi-head">
        <span className={`hq-kpi-icon hq-kpi-icon--${kpi.accent}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[ICON[kpi.icon]] || "" }} />
        <h3 className="hq-kpi-label">{kpi.label}</h3>
      </div>
      {hasValue ? (
        <p className="hq-kpi-value" data-kpi-status="ok">
          {kpi.display}
        </p>
      ) : (
        <p className={`hq-kpi-state hq-kpi-state--${kpi.status}`} data-kpi-status={kpi.status}>
          {STATE_LABEL[kpi.status] ?? "Not connected"}
        </p>
      )}
      {kpi.detail ? <p className="hq-kpi-detail">{kpi.detail}</p> : null}
      <p className="hq-kpi-source">
        <span className="hq-visually-hidden">Source: </span>
        {kpi.source}
      </p>
    </>
  );
  return (
    <li className={`hq-kpi hq-kpi--${kpi.accent}${hasValue ? "" : " hq-kpi--muted"}`}>
      {kpi.href ? (
        <Link href={kpi.href} className="hq-kpi-link">
          {body}
        </Link>
      ) : (
        <div className="hq-kpi-link hq-kpi-link--static">{body}</div>
      )}
    </li>
  );
}

/** Home KPI row. Cards come from lib/hq/kpis.js; a card without a real source shows its state, never a number. */
export function KpiCards({ kpis }) {
  return (
    <section aria-labelledby="hq-kpi-heading" className="hq-kpis">
      <h2 id="hq-kpi-heading" className="hq-visually-hidden">
        Key numbers
      </h2>
      <ul className="hq-kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </ul>
    </section>
  );
}
