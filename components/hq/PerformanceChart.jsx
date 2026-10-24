import Link from "next/link";
import { chartGeometry, formatAxis } from "@/lib/hq/performance";
import { formatCount } from "@/lib/hq/kpis";

const STATE_LABEL = { not_connected: "Not connected", empty: "No data yet", error: "Unavailable" };

/**
 * Home "Performance Overview": an SVG line of a real monthly series (lib/hq/performance.js).
 * Without a series it shows its state and says what isn't connected; it never draws placeholder points.
 */
export function PerformanceChart({ series }) {
  const ok = series?.status === "ok" && series.points.some((p) => p.value != null);
  return (
    <section className="hq-card hq-perf" aria-labelledby="hq-perf-heading">
      <div className="hq-perf-head">
        <div>
          <h2 id="hq-perf-heading" className="hq-perf-title">
            {series.title}
          </h2>
          <p className="hq-perf-metric">{series.metric}</p>
        </div>
        {series.href ? (
          <Link href={series.href} className="hq-perf-link">
            Reports →
          </Link>
        ) : null}
      </div>

      {ok ? <Chart series={series} /> : (
        <div className="hq-perf-empty" data-chart-status={series.status}>
          <p className={`hq-kpi-state hq-kpi-state--${series.status}`}>{STATE_LABEL[series.status] ?? "Not connected"}</p>
          <p className="hq-perf-empty-text">{series.detail}</p>
        </div>
      )}

      {ok && series.detail ? <p className="hq-kpi-detail">{series.detail}</p> : null}
      <p className="hq-kpi-source">
        <span className="hq-visually-hidden">Source: </span>
        {series.source}
      </p>
    </section>
  );
}

function Chart({ series }) {
  const g = chartGeometry(series.points);
  const real = g.points.filter((p) => p.y != null);
  const summary = `${series.metric}: ${series.points
    .map((p) => `${p.label} ${p.value == null ? "no data" : formatCount(p.value)}`)
    .join(", ")}.`;
  return (
    <figure className="hq-perf-figure" data-chart-status="ok">
      <svg viewBox={`0 0 ${g.width} ${g.height}`} className="hq-perf-svg" role="img" aria-label={summary}>
        <defs>
          <linearGradient id="hq-perf-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b7cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b7cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {g.ticks.map((t) => (
          <g key={t.y}>
            <line x1={g.padX} x2={g.width - g.padX} y1={t.y} y2={t.y} className="hq-perf-grid" />
            <text x={g.padX - 8} y={t.y + 4} textAnchor="end" className="hq-perf-axis">
              {formatAxis(t.value)}
            </text>
          </g>
        ))}
        {g.areas.map((d) => (
          <path key={`a${d}`} d={d} fill="url(#hq-perf-fill)" />
        ))}
        {g.paths.map((d) => (
          <path key={d} d={d} className="hq-perf-line" />
        ))}
        {real.map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r="3.5" className="hq-perf-dot" />
        ))}
        {g.points.map((p) => (
          <text key={`x${p.month}`} x={p.x} y={g.height - 8} textAnchor="middle" className="hq-perf-axis">
            {p.label}
          </text>
        ))}
      </svg>
      <figcaption className="hq-visually-hidden">
        <table>
          <caption>{series.metric}</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Sessions</th>
            </tr>
          </thead>
          <tbody>
            {series.points.map((p) => (
              <tr key={p.month}>
                <th scope="row">{p.label}</th>
                <td>{p.value == null ? "No data" : formatCount(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
