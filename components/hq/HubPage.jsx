import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { TopBar } from "./TopBar";

export function HubPage({ title, subtitle, links, footerNote }) {
  return (
    <div>
      <TopBar title={title} subtitle={subtitle} />
      <div className="hq-page-content">
        <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hq-tile-link">
              <Card padding="md" className="hq-card--tile">
                <div className="hq-card-header hq-mb-2">
                  <div className="hq-card-title">{link.title}</div>
                  {link.badge && (
                    <Badge variant="outline" size="sm">
                      {link.badge}
                    </Badge>
                  )}
                </div>
                <p className="hq-text-sm-secondary">{link.subtitle}</p>
              </Card>
            </Link>
          ))}
        </div>
        {footerNote && (
          <Card padding="md" className="hq-mt-4">
            <p className="hq-text-xs-muted">{footerNote}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    manual: "neutral",
    draft_export: "warning",
    workflow_ready: "success",
    future_api: "accent",
  };
  const labels = {
    manual: "Manual",
    draft_export: "Draft Export",
    workflow_ready: "Workflow Ready",
    future_api: "Future API",
  };
  return (
    <Badge variant={map[status] || "neutral"} size="sm" caps>
      {labels[status] || status}
    </Badge>
  );
}
