"use client";

import Link from "next/link";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { commandCenterProjectHref } from "@/lib/seos/paths";
import { WorkflowStatusBadge } from "./CommandCenterBadges";

function formatActivity(value) {
  if (!value || value === "unknown") return "unknown";
  try {
    return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

export function CommandCenterProjectList({ rollups }) {
  return (
    <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
      {rollups.map((project) => (
        <Link key={project.id} href={commandCenterProjectHref(project.id)} className="hq-tile-link">
          <Card padding="md" className="hq-card--tile">
            <div className="hq-card-header hq-mb-2">
              <div>
                <div className="hq-card-title">{project.name}</div>
                <p className="hq-text-xs-muted" style={{ marginTop: 4 }}>
                  {project.tagline}
                </p>
              </div>
              <WorkflowStatusBadge status={project.workflowStatus} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              <Badge variant="outline" size="sm">
                Connections · {project.connectionsActive}/{project.connectionsTotal} active
              </Badge>
              <Badge variant="neutral" size="sm">
                Connected · {project.connectionsConnected}
              </Badge>
              <Badge variant="neutral" size="sm">
                Last activity · {formatActivity(project.lastActivity)}
              </Badge>
            </div>
            <p className="hq-text-xs-muted" style={{ marginTop: 12, marginBottom: 0 }}>
              {project.domains.join(" · ")}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
