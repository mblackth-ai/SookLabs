import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";

const links = [
  {
    href: "/hq/sookly/action-plan",
    title: "MVP1 Action Plan",
    subtitle: "Persisted build checklist for sookly.co and app.sookly.com",
    badge: "Board",
  },
  {
    href: "/hq/sookly/receptionist-readiness",
    title: "Receptionist readiness",
    subtitle: "Planning notes — not live product metrics",
    badge: "Manual",
  },
  {
    href: "/hq/sookly/knowledge-usage",
    title: "Knowledge usage",
    subtitle: "How Sookly should consume SEOS KB (read-only)",
    badge: "Draft",
  },
];

export default function SooklyProductStatusPage() {
  return (
    <div>
      <TopBar
        title="Sookly"
        subtitle="Incoming control product. HQ tracks build progress — live product at sookly.co."
        actions={
          <Badge variant="outline" size="sm">
            In progress
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            No fake ARR, channel counts, or “Live” product metrics in HQ. Use the action plan board for real work.
            Open{" "}
            <a href="https://sookly.co" style={{ color: "var(--text-accent)" }}>
              sookly.co
            </a>{" "}
            for the customer-facing product.
          </p>
        </Card>
        <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none", color: "inherit" }}>
              <Card interactive padding="md">
                <div className="hq-card-header" style={{ marginBottom: "var(--space-2)" }}>
                  <div className="hq-card-title">{link.title}</div>
                  <Badge variant="outline" size="sm">
                    {link.badge}
                  </Badge>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>{link.subtitle}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
