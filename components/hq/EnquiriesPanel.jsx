import Link from "next/link";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { MetricCard } from "./MetricCard";
import { NotConnectedRow } from "./ContentSocialBoard";
import { channelLabel, fmtMinutes } from "@/lib/hq/enquiries.js";

const small = { fontSize: "var(--text-xs)", color: "var(--text-tertiary)" };
const cell = { padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)", fontSize: "var(--text-sm)", verticalAlign: "top" };

function pct(v) {
  return v == null ? "–" : `${v}%`;
}

function counts(obj) {
  const rows = Object.entries(obj || {}).sort((a, b) => b[1] - a[1]);
  return rows.length ? rows.map(([k, v]) => `${k} ${v}`).join(" · ") : "none yet";
}

/** RDUSA enquiries from Sookly: 30-day measurement, needs-attention list and recent conversations. Read-only. */
export function EnquiriesPanel({ result, day, start, inboxUrl = "https://app.sookly.co/inbox" }) {
  if (!result?.ok) {
    return (
      <Card padding="md">
        <div className="hq-card-title">Enquiries (Sookly)</div>
        <div style={{ marginTop: 10 }}>
          <NotConnectedRow label="Sookly enquiries" note={result?.error || "Not connected."} />
        </div>
      </Card>
    );
  }
  const d = result.data;
  const m = d.metrics || {};
  const window = day > 0 ? `Day ${day} of 30 since launch` : `Before launch (${new Date(start).toUTCString().slice(0, 16)}): last 30 days, test chats excluded`;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={small}>{window}</span>
        {(d.channels || []).map((c) => (
          <Badge key={`${c.channelType}-${c.name}`} variant={c.connected ? "success" : "outline"} size="sm">
            {channelLabel(c.channelType)}: {c.connected ? "connected" : "not connected"}
          </Badge>
        ))}
        <a href={inboxUrl} target="_blank" rel="noreferrer" style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)", marginLeft: "auto" }}>Open Sookly inbox →</a>
      </div>
      <div className="hq-grid-4">
        <MetricCard label="Enquiries" value={m.enquiries ?? 0} neutral delta={counts(m.byChannel)} />
        <MetricCard label="Median first response" value={fmtMinutes(m.medianFirstResponseMinutes)} neutral delta={`within 1 h: ${pct(m.answeredWithin1hPct)}`} />
        <MetricCard label="Waiting / follow-ups due" value={`${m.needsReplyNow ?? 0} / ${m.followUpsDue ?? 0}`} pos={!m.needsReplyNow && !m.followUpsDue} delta={`${m.waitingOver24h ?? 0} waiting over 24 h`} />
        <MetricCard label="Needed a person" value={pct(m.humanTouchedPct)} neutral delta={`by staff: ${counts(m.repliesByStaff)}`} />
      </div>
      <Card padding="md">
        <div className="hq-card-header">
          <div>
            <div className="hq-card-title">Needs your attention</div>
            <p style={small}>Customers waiting on a reply, then follow-ups that are due. Reply in Sookly; this list clears itself.</p>
          </div>
        </div>
        {(d.attention || []).length === 0 ? (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>Nobody is waiting and no follow-ups are due.</p>
        ) : (
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {d.attention.map((c) => (
              <a key={c.id} href={inboxUrl} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 8, textDecoration: "none", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <Badge variant={c.needsReply ? ((c.waitingMinutes ?? 0) >= 1440 ? "error" : "warning") : "neutral"} size="sm">{c.needsReply ? `waiting ${fmtMinutes(c.waitingMinutes)}` : "follow up"}</Badge>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
                  {c.contact} · {channelLabel(c.channel)}
                  <span style={{ display: "block", ...small }}>{c.preview || "(no text)"} · owner: {c.assignee || "unassigned"}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </Card>
      {(d.conversations || []).length ? (
        <Card padding="md">
          <div className="hq-card-title">Recent enquiries</div>
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Customer", "Channel", "Status", "Owner", "First reply", "Person needed"].map((h) => (
                    <th key={h} style={{ ...cell, ...small, textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.conversations.slice(0, 25).map((c) => (
                  <tr key={c.id}>
                    <td style={cell}>{c.contact}<span style={{ display: "block", ...small }}>{c.preview}</span></td>
                    <td style={cell}>{channelLabel(c.channel)}</td>
                    <td style={cell}>{c.status}</td>
                    <td style={cell}>{c.assignee || "–"}</td>
                    <td style={cell}>{fmtMinutes(c.firstResponseMinutes)}</td>
                    <td style={cell}>{c.humanTouched ? c.staffRepliers.join(", ") || "yes" : "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

/** Daily Briefing card: RDUSA customers waiting / follow-ups due. */
export function EnquiryActionItems({ items, error }) {
  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title">Enquiries: needs your attention</div>
          <p className="hq-briefing-ask-hint">RDUSA customers waiting on a reply and follow-ups due, from Sookly. Reply in Sookly; this list clears itself.</p>
        </div>
        <Link href="/hq/clients/rdusa" style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}>RDUSA →</Link>
      </div>
      {error ? <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Sookly not connected: {error}</p> : null}
      {!error && items.length === 0 ? <p style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>Nobody is waiting and no follow-ups are due.</p> : null}
      <div style={{ display: "grid", gap: 6 }}>
        {items.map((i) => (
          <a key={i.id} href={i.href} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 8, alignItems: "flex-start", textDecoration: "none", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <Badge variant={i.severity} size="sm">{i.business}</Badge>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
              {i.title}
              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{i.detail}</span>
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
