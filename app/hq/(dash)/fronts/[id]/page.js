import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { getHqFront, getHqFronts } from "@/lib/hq/hq-fronts";

function progressLabel(progress) {
  if (progress == null) return "No score";
  return `${progress}%`;
}

export function generateStaticParams() {
  return getHqFronts().map((front) => ({ id: front.id }));
}

export default async function FrontDetailPage({ params }) {
  const { id } = await params;
  const front = getHqFront(id);
  if (!front) notFound();

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
          { label: "All fronts", href: "/hq/fronts" },
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
