import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { getHqFronts } from "@/lib/hq/hq-fronts";

function progressLabel(progress) {
  if (progress == null) return "No score";
  return `${progress}%`;
}

export default function FrontsIndexPage() {
  const fronts = getHqFronts();

  return (
    <div>
      <TopBar
        title="All fronts"
        subtitle="Each percentage cites a scorecard ratio or a recorded four-front estimate."
        crumbs={[{ label: "Overview", href: "/hq" }, { label: "All fronts" }]}
      />
      <div className="hq-page-content">
        <div style={{ display: "grid", gap: 8 }}>
          {fronts.map((front) => (
            <Link key={front.id} href={`/hq/fronts/${front.id}`} className="hq-tile-link">
              <div style={{ padding: 12, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                <div className="hq-flex-between">
                  <strong style={{ fontSize: "var(--text-sm)" }}>{front.name}</strong>
                  <Badge variant="outline" size="sm">{progressLabel(front.progress)}</Badge>
                </div>
                <div className="hq-text-xs-muted hq-mt-2">{front.formula}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
