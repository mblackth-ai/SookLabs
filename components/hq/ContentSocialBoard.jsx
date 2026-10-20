import Link from "next/link";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

const PLATFORM = { instagram: "#d6409f", facebook: "#3987e5", threads: "#a1a1aa", linkedin: "#0ea5e9" };
const muted = { fontSize: "var(--text-xs)", color: "var(--text-tertiary)" };

function fmt(iso, tz) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz || "Asia/Bangkok", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
}

function tzLabel(tz) {
  return tz === "Asia/Bangkok" ? "ICT" : tz === "America/Chicago" ? "US Central" : tz;
}

export function NotConnectedRow({ label, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", padding: "6px 8px", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-md)" }}>
      <div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>{label}</div>
        {note ? <div style={muted}>{note}</div> : null}
      </div>
      <Badge variant="outline" size="sm">not connected</Badge>
    </div>
  );
}

function Count({ value, label, tone }) {
  return (
    <div>
      <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", fontVariantNumeric: "tabular-nums", color: tone || "var(--text-primary)" }}>{value}</div>
      <div style={muted}>{label}</div>
    </div>
  );
}

function PlatformBars({ byPlatform }) {
  const rows = Object.entries(byPlatform || {});
  if (!rows.length) return <div style={muted}>No posts in the window.</div>;
  const max = Math.max(1, ...rows.map(([, v]) => v.scheduled + v.published + v.unverified + v.failed + v.blocked));
  const seg = (n, color, title) => (n ? <span title={`${n} ${title}`} style={{ width: `${(n / max) * 100}%`, background: color, height: 8, display: "inline-block" }} /> : null);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {rows.map(([p, v]) => (
        <div key={p} style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 8, alignItems: "center", fontSize: "var(--text-xs)" }}>
          <span style={{ color: PLATFORM[p] || "var(--text-secondary)" }}>{p}</span>
          <span style={{ display: "flex", borderRadius: 4, overflow: "hidden", background: "var(--bg-float)" }}>
            {seg(v.published, "var(--color-success)", "published")}
            {seg(v.scheduled, "var(--color-cyan-400)", "scheduled")}
            {seg(v.unverified, "var(--text-tertiary)", "unverified")}
            {seg(v.blocked, "var(--color-warning)", "blocked")}
            {seg(v.failed, "var(--color-error)", "failed")}
          </span>
          <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
            {v.published} pub · {v.scheduled} sched{v.blocked ? ` · ${v.blocked} blocked` : ""}{v.failed ? ` · ${v.failed} failed` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ContentLines({ lines }) {
  if (!lines?.length) return null;
  const max = Math.max(1, ...lines.map((l) => l.total));
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {lines.map((l) => (
        <div key={l.key} style={{ display: "grid", gridTemplateColumns: "150px 1fr auto", gap: 8, alignItems: "center", fontSize: "var(--text-xs)" }}>
          <span style={{ color: "var(--text-primary)" }}>{l.label}</span>
          <span style={{ background: "var(--bg-float)", borderRadius: 4, overflow: "hidden", height: 8 }}>
            <span style={{ display: "block", width: `${(l.total / max) * 100}%`, height: 8, background: "var(--color-cyan-400)" }} />
          </span>
          <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>{l.total} ({l.published} published)</span>
        </div>
      ))}
    </div>
  );
}

export function BusinessContentCard({ b, seosUrl, clientHref }) {
  const flagged = b.counts.failed + b.counts.blocked;
  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: b.color || "var(--text-tertiary)" }} />
            {b.name}
          </div>
          <div style={muted}>{b.domain || ""} · times in {tzLabel(b.timezone)}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {flagged ? <Badge variant="warning" size="sm">{flagged} flagged</Badge> : <Badge variant="success" size="sm">no failures</Badge>}
          {clientHref ? <Button variant="ghost" size="sm" href={clientHref}>Client page</Button> : null}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
        <Count value={b.counts.scheduled} label="scheduled (next 14d)" />
        <Count value={b.counts.published} label="published (last 14d)" tone="var(--color-success)" />
        <Count value={b.gapDays.length} label="gap days" tone={b.gapDays.length ? "var(--color-warning)" : undefined} />
        <Count value={flagged} label="failed + blocked" tone={flagged ? "var(--color-error)" : undefined} />
        <Count value={b.counts.unverified} label="unverified" />
      </div>
      <PlatformBars byPlatform={b.byPlatform} />
      {b.contentLines?.length ? (
        <div style={{ marginTop: 12 }}>
          <div className="hq-section-label" style={{ marginBottom: 6 }}>Content mix</div>
          <ContentLines lines={b.contentLines} />
        </div>
      ) : null}
      <div style={{ display: "grid", gap: 4, marginTop: 12, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
        <div>Next: {b.nextPost ? `${fmt(b.nextPost.at, b.timezone)} · ${b.nextPost.platforms.join(" + ")} · ${b.nextPost.title || ""}` : "nothing scheduled"}</div>
        <div>
          Last published: {b.lastPublished ? `${fmt(b.lastPublished.at, b.timezone)} · ${b.lastPublished.platforms.join(" + ")}` : "none recorded"}
          {b.lastPublished?.url ? (
            <>
              {" · "}
              <a href={b.lastPublished.url} target="_blank" rel="noreferrer" style={{ color: "var(--text-accent)" }}>open post</a>
            </>
          ) : null}
        </div>
        {b.gapDays.length ? <div style={{ color: "var(--color-warning)" }}>Gap days: {b.gapDays.map((d) => d.slice(5)).join(", ")}</div> : null}
        {b.missingLines?.length ? <div style={{ color: "var(--color-warning)" }}>No {b.missingLines.join(" or ")} posts in the window.</div> : null}
      </div>
      {b.actionItems.length ? (
        <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
          {b.actionItems.map((a, i) => (
            <div key={i} style={{ fontSize: "var(--text-xs)", padding: "6px 8px", borderRadius: "var(--radius-md)", border: `1px solid ${a.status === "failed" ? "rgba(239,68,68,0.35)" : "rgba(245,158,11,0.35)"}` }}>
              <strong style={{ color: "var(--text-primary)" }}>{a.count} {a.status}</strong> ({a.platforms.join(", ")}): {a.reason}
            </div>
          ))}
        </div>
      ) : null}
      <div style={{ marginTop: 12 }}>
        <NotConnectedRow label="Joomla approvals pending" note={b.approvals?.joomla?.note || "Joomla is not connected to SEOS yet."} />
      </div>
      <div style={{ marginTop: 10 }}>
        <a href={seosUrl} target="_blank" rel="noreferrer" style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}>Open calendar in SEOS →</a>
      </div>
    </Card>
  );
}

export function ContentUnavailable({ result, seosUrl }) {
  return (
    <Card padding="md">
      <div className="hq-card-title">Content & Social is not available</div>
      <p style={{ ...muted, marginTop: 6 }}>
        {result.configured ? `SEOS answered: ${result.error}` : "Set SEOS_HQ_API_TOKEN (the same token SEOS has) on the HQ project."} No numbers are shown until SEOS answers.
      </p>
      <div style={{ marginTop: 8 }}>
        <Link href={seosUrl} style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}>Open SEOS</Link>
      </div>
    </Card>
  );
}

export function ContentSocialBoard({ result, seosUrl, clientSlugs = [] }) {
  if (!result.ok) return <ContentUnavailable result={result} seosUrl={seosUrl} />;
  const t = result.data.totals || { scheduled: 0, published: 0, unverified: 0, failed: 0, blocked: 0, gapDays: 0 };
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="hq-grid-4">
        <Card padding="md"><Count value={t.scheduled} label="Scheduled, next 14 days" /></Card>
        <Card padding="md"><Count value={t.published} label="Published, last 14 days" tone="var(--color-success)" /></Card>
        <Card padding="md"><Count value={t.failed + t.blocked} label="Failed + blocked" tone={t.failed + t.blocked ? "var(--color-error)" : undefined} /></Card>
        <Card padding="md"><Count value={t.gapDays} label="Gap days (all businesses)" tone={t.gapDays ? "var(--color-warning)" : undefined} /></Card>
      </div>
      <div style={muted}>From SEOS at {fmt(result.data.generatedAt, "Asia/Bangkok")} ICT. Unverified = scheduled outside SEOS, time passed, no published record yet; never counted as published.</div>
      <div className="hq-grid-2">
        {result.data.businesses.map((b) => (
          <BusinessContentCard key={b.slug} b={b} seosUrl={seosUrl} clientHref={clientSlugs.includes(b.slug) ? `/hq/clients/${b.slug}` : null} />
        ))}
      </div>
    </div>
  );
}
