import Link from "next/link";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { sparklinePoints } from "@/lib/hq/analytics-summary.js";

// Single-series trend: HQ accent. Movement: reserved status green/red, always with an arrow and words.
const TREND = "var(--color-cyan-400)";
const GOOD = "#0ca30c";
const BAD = "#d03b3b";

function formatMonth(key) {
  if (!key) return "—";
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

function sourceLabel(name, status, last) {
  if (last) return `${name}: pulled ${new Date(last).toLocaleDateString("en-US")}`;
  return `${name}: ${status === "configured" ? "configured, not pulled" : "not configured"}`;
}

function Sparkline({ trend, label }) {
  const width = 140;
  const height = 36;
  const points = sparklinePoints(trend, width, height, 4);
  if (points.length === 0) return <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>No ranking history</span>;
  const segments = [];
  let current = [];
  for (const p of points) {
    if (p) current.push(p);
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);
  const summary = trend.map((t) => `${formatMonth(t.month)} ${t.averagePosition ?? "not ranking"}`).join(", ");
  return (
    <svg width={width} height={height} role="img" aria-label={`${label} average position by month: ${summary}`}>
      <title>{`Average position (lower is better): ${summary}`}</title>
      {segments.map((seg, i) => (
        <polyline key={i} points={seg.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={TREND} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {points.filter(Boolean).map((p) => (
        <circle key={p.month} cx={p.x} cy={p.y} r="2.5" fill={TREND} stroke="var(--bg-surface)" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

function Movement({ up, down }) {
  return (
    <span style={{ display: "inline-flex", gap: 10, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
      <span><span aria-hidden="true" style={{ color: GOOD }}>▲</span> {up} up</span>
      <span><span aria-hidden="true" style={{ color: BAD }}>▼</span> {down} down</span>
    </span>
  );
}

function GroupCard({ group }) {
  return (
    <Card padding="sm">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{group.group}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <strong style={{ fontSize: "var(--text-2xl)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {group.averagePosition ?? "—"}
            </strong>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>avg position</span>
          </div>
        </div>
        <Sparkline trend={group.trend} label={group.group} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
        <span>{group.top10Count} in top 10</span>
        <span>{group.rankedCount}/{group.tracked} ranking</span>
        <span>{group.clicks} clicks</span>
        <Movement up={group.up} down={group.down} />
      </div>
    </Card>
  );
}

function WorkList({ work }) {
  if (!work || (work.done.length === 0 && work.inProgress.length === 0)) return null;
  const col = (title, items, render) => (
    <div>
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 4 }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>—</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 2, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          {items.map((item, i) => (
            <li key={`${item.title}-${i}`}>{render(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
  return (
    <Card padding="sm">
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        {col("Done in the last 30 days", work.done, (w) => (
          <>
            {w.title} <span style={{ color: "var(--text-tertiary)" }}>· {new Date(w.at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </>
        ))}
        {col("In progress", work.inProgress, (w) => w.title)}
      </div>
    </Card>
  );
}

export function BusinessSection({ business, seosUrl, ownerView = false }) {
  const sessions = business.traffic.filter((t) => typeof t.sessions === "number");
  const lastSessions = sessions[sessions.length - 1];
  const prevSessions = sessions[sessions.length - 2];
  return (
    <section aria-labelledby={`biz-${business.slug}`} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <h2 id={`biz-${business.slug}`} style={{ fontSize: "var(--text-lg)", color: "var(--text-primary)", margin: 0 }}>
            {business.name}
          </h2>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>
            {business.domain}
            {ownerView ? "" : ` · ${business.organisation?.name}`} · rankings for {formatMonth(business.latestMonth)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {(!ownerView || business.sources.lastSucceeded.gsc) && (
              <Badge variant={business.sources.lastSucceeded.gsc ? "accent" : "outline"} size="sm">
                {sourceLabel("Search Console", business.sources.gsc, business.sources.lastSucceeded.gsc)}
              </Badge>
            )}
            {(!ownerView || business.sources.lastSucceeded.ga4) && (
              <Badge variant={business.sources.lastSucceeded.ga4 ? "accent" : "outline"} size="sm">
                {sourceLabel("GA4", business.sources.ga4, business.sources.lastSucceeded.ga4)}
              </Badge>
            )}
          </div>
        </div>
        {!ownerView && (
          <Button href={`${seosUrl}/`} external variant="secondary" size="sm">
            Open in SEOS
          </Button>
        )}
      </div>

      {!business.hasData ? (
        <Card padding="sm">
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            {ownerView
              ? "Your first rankings report is being prepared. It will appear here once the data is in."
              : `No ranking or traffic data yet. ${business.groups.length ? `${business.totals.trackedCount} keywords tracked; ` : "No keywords tracked yet; "}connect Search Console / GA4 or import a file in SEOS → Analytics.`}
          </p>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {business.groups.map((g) => (
              <GroupCard key={g.group} group={g} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            <span>
              Top 10: <strong style={{ color: "var(--text-primary)" }}>{business.totals.top10Count}</strong>/{business.totals.trackedCount} keywords
            </span>
            <span>
              Clicks from tracked keywords: <strong style={{ color: "var(--text-primary)" }}>{business.totals.clicks}</strong>
            </span>
            {lastSessions && (
              <span>
                Sessions {formatMonth(lastSessions.month)}: <strong style={{ color: "var(--text-primary)" }}>{lastSessions.sessions}</strong>
                {prevSessions ? ` (${lastSessions.sessions >= prevSessions.sessions ? "+" : ""}${lastSessions.sessions - prevSessions.sessions} vs month before)` : ""}
              </span>
            )}
          </div>
        </>
      )}
      <WorkList work={business.work} />
    </section>
  );
}

export function ReportsBoard({ result, seosUrl, selected }) {
  const all = result.data?.workspaces ?? [];
  const businesses = selected ? all.filter((w) => w.slug === selected) : all;
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {!result.ok && (
        <Card padding="sm">
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            {result.configured
              ? `SEOS analytics unavailable: ${result.error}`
              : "Set the same SEOS_HQ_API_TOKEN in HQ and SEOS, plus NEXT_PUBLIC_SEOS_URL (or SEOS_INTERNAL_URL) in HQ."}
          </p>
        </Card>
      )}
      {all.length > 1 && (
        <nav aria-label="Businesses" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <Link href="/hq/reports" className={`hq-crumb-link`} aria-current={!selected ? "page" : undefined}>
            <Badge variant={!selected ? "accent" : "outline"}>All businesses</Badge>
          </Link>
          {all.map((w) => (
            <Link key={w.slug} href={`/hq/reports?business=${encodeURIComponent(w.slug)}`} aria-current={selected === w.slug ? "page" : undefined}>
              <Badge variant={selected === w.slug ? "accent" : "outline"}>{w.name}</Badge>
            </Link>
          ))}
        </nav>
      )}
      {result.ok && businesses.length === 0 && (
        <Card padding="sm">
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>No businesses in SEOS yet.</p>
        </Card>
      )}
      {businesses.map((b) => (
        <BusinessSection key={b.slug} business={b} seosUrl={seosUrl} />
      ))}
      {result.data?.generatedAt && (
        <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
          Read from SEOS at {new Date(result.data.generatedAt).toLocaleString("en-US")}. SEOS is the source of truth.
        </p>
      )}
    </div>
  );
}
