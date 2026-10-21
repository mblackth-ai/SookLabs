import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { ClientSectionTabs } from "@/components/hq/ClientSectionTabs";
import { ContentActionItems } from "@/components/hq/ContentActionItems";
import { readOpsData } from "@/lib/hq/ops";
import { readContentSummary } from "@/lib/hq/content-client";
import { contentActionItems } from "@/lib/hq/content-summary.js";
import { clientActionItems, getClient, mentionsClient } from "@/lib/hq/clients";
import { getRetainerSnapshot } from "@/lib/hq/retainers";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";

const muted = { fontSize: "var(--text-xs)", color: "var(--text-tertiary)" };

export default async function ClientBriefingPage({ params }) {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const [ops, content] = await Promise.all([readOpsData(), readContentSummary()]);
  const items = clientActionItems(contentActionItems(content, { seosUrl: getSeosAppUrl() }), client);
  const priorities = (ops.todayPriorities ?? []).filter((p) => mentionsClient(`${p.title} ${p.stream ?? ""}`, client));
  const blockers = (ops.blockers ?? []).filter((b) => mentionsClient(`${b.title ?? ""} ${b.detail ?? b.note ?? ""}`, client));
  const notes = Object.entries(ops.briefingNotes?.sections ?? {}).flatMap(([section, text]) =>
    String(text ?? "")
      .split(/\n+/)
      .filter((line) => mentionsClient(line, client))
      .map((line) => ({ section, line: line.trim() }))
  );
  const retainer = getRetainerSnapshot(client.retainer);

  return (
    <div>
      <TopBar
        title={`${client.short} briefing`}
        subtitle="Today's action items for this client: failed or blocked posts, gap days, publisher issues, priorities and notes that mention it."
        crumbs={[{ label: "Clients", href: "/hq/clients" }, { label: client.short, href: `/hq/clients/${client.slug}` }, { label: "Briefing" }]}
      />
      <div className="hq-page-content" style={{ display: "grid", gap: 16 }}>
        <ClientSectionTabs client={client} active="briefing" />
        <ContentActionItems items={items} error={content.ok ? null : content.error} />
        {retainer ? (
          <Card padding="md">
            <div className="hq-card-header">
              <div className="hq-card-title">Retainer: next unmet promise</div>
              <Badge variant={retainer.retainerHealthy ? "success" : "error"} size="sm">{retainer.retainerHealthy ? "healthy" : "not healthy"}</Badge>
            </div>
            <p className="hq-text-sm-secondary" style={{ marginTop: 8 }}>{retainer.nextUnmet.summary}</p>
            <p style={muted}>{retainer.criticalPath}</p>
            <a href={`/hq/clients/${client.slug}/retainer`} style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}>Open retainer →</a>
          </Card>
        ) : null}
        <Card padding="md">
          <div className="hq-card-title">Priorities, blockers and briefing notes</div>
          <p style={muted}>From the HQ ops store, filtered to lines that mention {client.short}.</p>
          <div style={{ display: "grid", gap: 6, marginTop: 10, fontSize: "var(--text-sm)" }}>
            {priorities.map((p) => (
              <div key={p.id}><Badge variant={p.done ? "success" : "outline"} size="sm">{p.done ? "done" : "priority"}</Badge> {p.title}</div>
            ))}
            {blockers.map((b, i) => (
              <div key={b.id ?? i}><Badge variant="warning" size="sm">blocker</Badge> {b.title}</div>
            ))}
            {notes.map((n, i) => (
              <div key={i}><Badge variant="outline" size="sm">{n.section}</Badge> {n.line}</div>
            ))}
            {!priorities.length && !blockers.length && !notes.length ? <div style={muted}>Nothing in today&apos;s briefing mentions {client.short}.</div> : null}
          </div>
          <a href="/hq/briefing" style={{ display: "inline-block", marginTop: 10, fontSize: "var(--text-xs)", color: "var(--text-accent)" }}>Daily Briefing →</a>
        </Card>
      </div>
    </div>
  );
}
