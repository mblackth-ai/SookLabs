import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { sooklyHubLinks } from "@/lib/hq/knowledge-mock";

export default function SooklyProductStatusPage() {
  const subLinks = sooklyHubLinks.filter((l) => l.href !== "/hq/sookly");

  return (
    <div>
      <TopBar
        title="Sookly · Product Status"
        subtitle="Channels, routing, SLA — Sookly ops data (not canonical business truth)"
        actions={<Badge variant="success" size="sm">Live</Badge>}
      />
      <div className="hq-page-content">
        <div className="hq-grid-4">
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Active channels</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>4</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>LINE, Messenger, WhatsApp, Web</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>MRR</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--text-accent)" }}>$11.2K</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Active users</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>234</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>KB source</div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginTop: "var(--space-1)" }}>SEOS Knowledge Base</div>
            <Badge variant="accent" size="sm" style={{ marginTop: "var(--space-2)" }}>Read-only</Badge>
          </Card>
        </div>
        <div className="hq-grid-2" style={{ marginTop: "var(--space-4)", gap: "var(--space-3)" }}>
          {subLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none", color: "inherit" }}>
              <Card interactive padding="md">
                <div className="hq-card-header" style={{ marginBottom: "var(--space-2)" }}>
                  <div className="hq-card-title">{link.title}</div>
                  <Badge variant="outline" size="sm">{link.badge}</Badge>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>{link.subtitle}</p>
              </Card>
            </Link>
          ))}
        </div>
        <Card padding="md" style={{ marginTop: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
            Sookly does not own a separate Knowledge Center. Fix business facts in SEOS → Knowledge Base.
          </p>
        </Card>
      </div>
    </div>
  );
}
