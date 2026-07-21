import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";

const LINKS = [
  {
    href: "/hq/sookly/action-plan",
    title: "Sookly action plan",
    subtitle: "Build checklist for sookly.co and app.sookly.com",
    badge: "Board",
  },
  {
    href: "/hq/automation",
    title: "LLM & Agents",
    subtitle: "Dispatch briefing jobs — Manual / webhook callback only",
    badge: "Manual",
  },
  {
    href: "/hq/portfolio",
    title: "Portfolio",
    subtitle: "Cross-product open tasks and milestones",
    badge: "Ops",
  },
];

export default function EngineeringHubPage() {
  return (
    <div>
      <TopBar
        title="Engineering"
        subtitle="Delivery and architecture shortcuts. No fake deploy metrics or CI dashboards."
        actions={
          <Badge variant="warning" size="sm">
            Thin hub
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            This hub is intentionally thin — real engineering work lives on product boards and in repos. Use boards
            for checklist work; use Automation for agent-assisted drafting only (Draft Export, not Connected).
          </p>
        </Card>
        <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
          {LINKS.map((link) => (
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
