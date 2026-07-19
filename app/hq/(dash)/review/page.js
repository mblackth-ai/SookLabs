import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { readOpsData } from "@/lib/hq/ops";

function daysAgoIso(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function WeeklyReviewPage() {
  const ops = await readOpsData();
  const since = daysAgoIso(7);
  const decisions = (ops.decisions || []).filter((d) => d.date >= since);
  const goalsDone = (ops.goals || []).filter((g) => g.status === "done");
  const doneBoard = [];
  for (const stream of Object.values(ops.workstreams || {})) {
    for (const item of stream.items || []) {
      if (item.status === "done") {
        doneBoard.push({ ...item, streamLabel: stream.label });
      }
    }
  }

  return (
    <div>
      <TopBar
        title="Weekly review"
        subtitle={`Last 7 days from ${since} — read-only reflection from ops`}
        actions={
          <Button variant="secondary" size="sm" href="/hq">
            Overview
          </Button>
        }
      />
      <div className="hq-page-content">
        <div className="hq-grid-2">
          <Card padding="md">
            <div className="hq-card-header" style={{ marginBottom: 12 }}>
              <span className="hq-card-title">Decisions</span>
              <Badge variant="outline" size="sm">
                {decisions.length}
              </Badge>
            </div>
            {decisions.length === 0 ? (
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>None logged this week.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {decisions.map((d) => (
                  <li key={d.id}>
                    <strong style={{ color: "var(--text-primary)" }}>{d.title}</strong> · {d.date}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card padding="md">
            <div className="hq-card-header" style={{ marginBottom: 12 }}>
              <span className="hq-card-title">Goals marked done</span>
              <Badge variant="outline" size="sm">
                {goalsDone.length}
              </Badge>
            </div>
            {goalsDone.length === 0 ? (
              <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>No goals closed yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {goalsDone.map((g) => (
                  <li key={g.id}>{g.title}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <Card padding="md" style={{ marginTop: 16 }}>
          <div className="hq-card-header" style={{ marginBottom: 12 }}>
            <span className="hq-card-title">Board items done (all time on boards)</span>
            <Badge variant="outline" size="sm">
              {doneBoard.length}
            </Badge>
          </div>
          {doneBoard.length === 0 ? (
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>No done items yet.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {doneBoard.slice(0, 20).map((i) => (
                <li key={i.id}>
                  {i.title} <span style={{ color: "var(--text-tertiary)" }}>({i.streamLabel})</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
