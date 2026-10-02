import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { FrontFamilyTree } from "@/components/hq/FrontFamilyTree";
import { RepoBranchLayer } from "@/components/hq/RepoBranchLayer";
import { buildGrokHandoff, getEightFront, getEightFronts, getFrontTimeline } from "@/lib/hq/eight-fronts";
import { planStatusVariant } from "@/lib/hq/four-fronts";
import { getHqFront, getHqFronts } from "@/lib/hq/hq-fronts";

function progressLabel(progress) {
  if (progress == null) return "No score";
  return `${progress}%`;
}

export function generateStaticParams() {
  const ids = new Set([
    ...getEightFronts().map((front) => front.id),
    ...getHqFronts().map((front) => front.id),
  ]);
  return [...ids].map((id) => ({ id }));
}

function LegacyFront({ front }) {
  const rows = [
    ["What's stopping it", front.stopping],
    ["What's going on", front.goingOn],
    ["Where it lands", front.landing],
    ["Loose ends", front.looseEnds],
    ["Edge cases", front.edgeCases],
  ];
  return (
    <div>
      <TopBar
        title={front.name}
        subtitle={front.formula}
        crumbs={[
          { label: "Overview", href: "/hq" },
          { label: "Eight fronts", href: "/hq/fronts" },
          { label: front.name },
        ]}
        actions={<Badge variant="outline" size="sm">{progressLabel(front.progress)}</Badge>}
      />
      <div className="hq-page-content">
        <Card padding="md">
          <div className="hq-section-label">Tracker</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>
            {front.tracker}
            {front.code ? ` · ${front.code}` : ""}
          </p>
          <p className="hq-text-xs-muted">This is an evidence row. It is not one of the eight founder fronts.</p>
        </Card>
        {rows.map(([label, body]) => (
          <Card key={label} padding="md">
            <div className="hq-section-label">{label}</div>
            <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EightFront({ front }) {
  const branches = front.branches.map((branch) => ({
    ...branch,
    examine: buildGrokHandoff(front, branch, "examine"),
    visualize: buildGrokHandoff(front, branch, "visualize"),
  }));

  return (
    <div>
      <TopBar
        title={front.name}
        subtitle={front.formula}
        crumbs={[
          { label: "Overview", href: "/hq" },
          { label: "Eight fronts", href: "/hq/fronts" },
          { label: front.name },
        ]}
        actions={<Badge variant="accent" size="sm">{front.progress}%</Badge>}
      />
      <div className="hq-page-content">
        <Card padding="md">
          <div className="hq-section-label">What&apos;s holding it back</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{front.holdingBack}</p>
        </Card>
        <Card padding="md">
          <div className="hq-section-label">Where it&apos;s going</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{front.going}</p>
          <p className="hq-text-xs-muted">{front.landing}</p>
        </Card>
        <Card padding="md">
          <div className="hq-section-label">Task finish line</div>
          <p className="hq-text-xs-muted">{front.tracker}{front.mustNote ? ` · ${front.mustNote}` : ""}</p>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {front.must.map((row) => (
              <div key={row.id}>
                <strong style={{ fontSize: "var(--text-sm)" }}>{row.id}</strong>
                <span className="hq-text-xs-muted"> · {row.status} · {row.criterion}</span>
                <div className="hq-text-sm-secondary">{row.evidence}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="md">
          <div className="hq-section-label">Progress</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{front.progress}% · {front.formula}</p>
          {front.engineeringNote ? <p className="hq-text-xs-muted">{front.engineeringNote}</p> : null}
        </Card>
        <Card padding="md">
          <div className="hq-section-label">Roadmap</div>
          <p className="hq-text-xs-muted">Review windows only. They are not ship dates.</p>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {front.roadmap.map((item) => (
              <div key={item.id} className="hq-flex-between" style={{ gap: 12 }}>
                <div>
                  <div className="hq-text-sm-secondary">{item.title}</div>
                  <div className="hq-text-xs-muted">{item.window} · {item.owner}</div>
                </div>
                <Badge variant={planStatusVariant(item.status)} size="sm">{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="md">
          <FrontFamilyTree nodes={getFrontTimeline(front)} branches={front.branches} />
          <RepoBranchLayer branches={branches} />
        </Card>
      </div>
    </div>
  );
}

export default async function FrontDetailPage({ params }) {
  const { id } = await params;
  const eight = getEightFront(id);
  if (eight) return <EightFront front={eight} />;
  const legacy = getHqFront(id);
  if (legacy) return <LegacyFront front={legacy} />;
  notFound();
}
