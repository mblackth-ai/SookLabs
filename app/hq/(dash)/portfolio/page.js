import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { PortfolioStrip } from "@/components/hq/PortfolioStrip";
import { readOpsData, getPortfolioSummary } from "@/lib/hq/ops";

const BOARDS = [
  { href: "/hq/sookly/action-plan", title: "Sookly MVP1", subtitle: "Website + app workstreams" },
  { href: "/hq/seos/social-gtm", title: "SEOS Social GTM", subtitle: "7 platforms · Content Engine → queue" },
  { href: "/hq/roastmyopsec", title: "RoastMyOpSec", subtitle: "Exposure auditor plan board" },
  { href: "/hq/community", title: "Community", subtitle: "Discord · Psychology · Investment · Technology" },
];

export default async function PortfolioPage() {
  const ops = await readOpsData();
  const portfolio = getPortfolioSummary(ops);

  return (
    <div>
      <TopBar title="Build boards" subtitle="Portfolio GTM trackers — from HQ ops store (Manual)" />
      <div className="hq-page-content">
        <PortfolioStrip products={portfolio} />
        <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
          {BOARDS.map((b) => (
            <Link key={b.href} href={b.href} style={{ textDecoration: "none", color: "inherit" }}>
              <Card interactive padding="md">
                <div className="hq-card-header" style={{ marginBottom: 8 }}>
                  <div className="hq-card-title">{b.title}</div>
                  <Badge variant="accent" size="sm">
                    Open
                  </Badge>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>{b.subtitle}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
