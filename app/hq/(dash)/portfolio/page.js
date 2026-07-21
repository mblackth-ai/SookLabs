import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { PortfolioStrip } from "@/components/hq/PortfolioStrip";
import { TopOpenItems } from "@/components/hq/TopOpenItems";
import { readOpsData, getPortfolioSummary, getStreamCounts, getTopOpenItems } from "@/lib/hq/ops";

const BOARDS = [
  {
    href: "/hq/sookly/action-plan",
    title: "Sookly MVP1",
    subtitle: "Website + app workstreams",
    streamKeys: ["sooklyWebsite", "sooklyApp"],
  },
  {
    href: "/hq/seos/social-gtm",
    title: "SEOS Social GTM",
    subtitle: "7 platforms · Content Engine → queue",
    streamKeys: ["seosSocial"],
  },
  {
    href: "/hq/roastmyopsec",
    title: "RoastMyOpSec",
    subtitle: "Exposure auditor plan board",
    streamKeys: ["roastMyOpSec"],
  },
  {
    href: "/hq/community",
    title: "Community",
    subtitle: "Discord · Psychology · Investment · Technology",
    streamKeys: ["community"],
  },
];

export default async function PortfolioPage() {
  const ops = await readOpsData();
  const portfolio = getPortfolioSummary(ops);
  const topOpen = getTopOpenItems(ops, 8);

  return (
    <div>
      <TopBar title="Build boards" subtitle="Portfolio GTM trackers — from HQ ops store (Manual)" />
      <div className="hq-page-content">
        <PortfolioStrip products={portfolio} />
        <div style={{ marginBottom: "var(--space-4)" }}>
          <TopOpenItems
            items={topOpen}
            href="/hq/sookly/action-plan"
            linkLabel="All boards →"
          />
        </div>
        <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
          {BOARDS.map((b) => {
            const counts = b.streamKeys.reduce(
              (acc, key) => {
                const c = getStreamCounts(ops.workstreams?.[key]);
                return {
                  open: acc.open + c.open,
                  blocked: acc.blocked + c.blocked,
                  p0: acc.p0 + c.p0,
                };
              },
              { open: 0, blocked: 0, p0: 0 }
            );
            return (
              <Link key={b.href} href={b.href} className="hq-tile-link">
                <Card padding="md" className="hq-card--tile">
                  <div className="hq-card-header hq-mb-2">
                    <div className="hq-card-title">{b.title}</div>
                    <Badge variant={counts.blocked ? "error" : counts.p0 ? "warning" : "accent"} size="sm">
                      {counts.open} open
                    </Badge>
                  </div>
                  <p className="hq-text-sm-secondary">{b.subtitle}</p>
                  {(counts.blocked > 0 || counts.p0 > 0) && (
                    <p className="hq-text-xs-muted hq-mt-2">
                      {counts.p0 ? `${counts.p0} P0` : null}
                      {counts.p0 && counts.blocked ? " · " : null}
                      {counts.blocked ? `${counts.blocked} blocked` : null}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
