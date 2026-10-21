import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { Card } from "@/components/hq/Card";
import { BusinessContentCard, ContentUnavailable, NotConnectedRow } from "@/components/hq/ContentSocialBoard";
import { readContentSummary } from "@/lib/hq/content-client";
import { businessSummary } from "@/lib/hq/content-summary.js";
import { getClient } from "@/lib/hq/clients";
import { ClientSectionTabs } from "@/components/hq/ClientSectionTabs";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";

const label = { fontSize: "var(--text-xs)", color: "var(--text-tertiary)" };

export default async function ClientPage({ params }) {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const result = await readContentSummary();
  const b = businessSummary(result, client.seosBusiness);
  const seosUrl = getSeosAppUrl();
  const lines = new Map((b?.contentLines ?? []).map((l) => [l.key, l]));

  return (
    <div>
      <TopBar
        title={client.name}
        subtitle={client.summary}
        crumbs={[{ label: "Clients", href: "/hq/clients" }, { label: client.short }]}
        actions={<Button variant="secondary" size="sm" href={seosUrl}>Open in SEOS</Button>}
      />
      <div className="hq-page-content" style={{ display: "grid", gap: 16 }}>
        <ClientSectionTabs client={client} active="overview" />
        {client.lockedMetrics.length ? <section aria-label="Locked metrics">
          <div className="hq-section-label" style={{ marginBottom: 8 }}>Locked metrics</div>
          <div className="hq-grid-2">
            {client.lockedMetrics.map((m) => {
              const line = lines.get(m.contentLine);
              return (
                <Card key={m.key} padding="md">
                  <div style={label}>Locked metric</div>
                  <div className="hq-card-title" style={{ marginTop: 2 }}>{m.label}</div>
                  <div style={{ marginTop: 10 }}>
                    <NotConnectedRow label="Result" note="No data source connected, so no number is shown." />
                  </div>
                  <div style={{ ...label, marginTop: 10 }}>
                    Supporting content (±14 days):{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {line ? `${line.total} posts (${line.published} published, ${line.scheduled} planned)` : b ? "0 posts" : "SEOS unavailable"}
                    </strong>
                  </div>
                </Card>
              );
            })}
          </div>
        </section> : null}

        <div className="hq-grid-2">
          <Card padding="md">
            <div className="hq-card-title">Systems & sources</div>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {client.systems.map((s) => (
                <NotConnectedRow key={s.label} label={`${s.label}: ${s.value}`} note={s.note} />
              ))}
            </div>
          </Card>
          <Card padding="md">
            <div className="hq-card-title">Channels & contacts</div>
            <div style={{ display: "grid", gap: 6, marginTop: 10, fontSize: "var(--text-sm)" }}>
              {client.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{ color: "var(--text-accent)" }}>{l.label}</a>
              ))}
              {client.contacts.map((c) => (
                <a key={c.value} href={c.href} style={{ color: "var(--text-primary)" }}>{c.label}: {c.value}</a>
              ))}
              {b ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {b.accounts.map((a) =>
                    Object.entries(a.connections).map(([k, v]) => (
                      <Badge key={`${a.slug}-${k}`} variant={v === "connected" ? "success" : v === "expiring" ? "warning" : "outline"} size="sm">
                        {k}: {String(v).replace("_", " ")}
                      </Badge>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <section aria-label="Content and social">
          <div className="hq-section-label" style={{ marginBottom: 8 }}>Content & Social</div>
          {b ? <BusinessContentCard b={b} seosUrl={seosUrl} /> : <ContentUnavailable result={result} seosUrl={seosUrl} />}
        </section>
      </div>
    </div>
  );
}
