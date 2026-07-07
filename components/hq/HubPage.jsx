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
            <Link key={link.href} href={link.href} style={{ textDecoration: "none", color: "inherit" }}>
              <Card interactive padding="md">
                <div className="hq-card-header" style={{ marginBottom: "var(--space-2)" }}>
                  <div className="hq-card-title">{link.title}</div>
                  {link.badge && (
                    <Badge variant="outline" size="sm">
                      {link.badge}
                    </Badge>
                  )}
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: "var(--leading-relaxed)" }}>
                  {link.subtitle}
                </p>
              </Card>
            </Link>
          ))}
        </div>
        {footerNote && (
          <Card padding="md" style={{ marginTop: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>{footerNote}</p>
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
    <Badge variant={map[status] || "neutral"} size="sm">
      {labels[status] || status}
    </Badge>
  );
}
