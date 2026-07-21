import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";

const LINKS = [
  {
    href: "/hq/seos",
    title: "SEOS hub",
    subtitle: "Outgoing control — operator work in seos.sooklabs.com",
    badge: "External ops",
  },
  {
    href: "/hq/seos/social-gtm",
    title: "Social GTM board",
    subtitle: "Honest Manual / Draft / Future OAuth badges only",
    badge: "Board",
  },
  {
    href: "/hq/sookly/knowledge-usage",
    title: "Knowledge usage",
    subtitle: "How Sookly consumes SEOS KB — read-only planning",
    badge: "Draft",
  },
];

export default function MarketingHubPage() {
  return (
    <div>
      <TopBar
        title="Marketing"
        subtitle="Campaign and visibility shortcuts. No fake channel stats or Connected claims."
        actions={
          <Badge variant="warning" size="sm">
            Thin hub
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Canonical marketing truth stays in the SEOS Knowledge Base. HQ tracks founder GTM boards only — never
            duplicate FAQ or service stores here.
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
