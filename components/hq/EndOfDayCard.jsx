"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useOpsData } from "./useOpsData";
import { newId } from "@/lib/hq/ops-shared";

/**
 * End-of-day 2-minute close — clear done priorities, optional carry, park note.
 */
export function EndOfDayCard({ initialData }) {
  const { data, save, saving } = useOpsData(initialData);
  const open = (data.todayPriorities || []).filter((p) => !p.done);
  const done = (data.todayPriorities || []).filter((p) => p.done);
  const today = new Date().toISOString().slice(0, 10);
  const decidedToday = (data.decisions || []).some((d) => String(d.date || "").startsWith(today));

  async function clearDone() {
    await save({ todayPriorities: open });
  }

  async function carryFirst() {
    if (!open[0]) return;
    const rest = open.slice(1).map((p) => ({ ...p, done: false }));
    const carried = { ...open[0], done: false, id: newId("tp") };
    await save({ todayPriorities: [carried, ...rest.filter((p) => p.id !== open[0].id)] });
  }

  async function closeDay() {
    const keep = open.slice(0, 1);
    await save({
      todayPriorities: keep.map((p) => ({ ...p, done: false })),
      morningLoop: { date: "", stepsChecked: [] },
    });
  }

  return (
    <Card padding="md" className="hq-eod-card">
      <div className="hq-card-header">
        <div>
          <span className="hq-card-title">End of day</span>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
            ~2 min — clear done, carry one, reset loop
          </div>
        </div>
        <Badge variant="outline" size="sm">
          {done.length} done · {open.length} open
        </Badge>
      </div>
      {!decidedToday ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "12px 0 0", lineHeight: 1.5 }}>
          No decision logged today — optional, but useful when you chose a path.{" "}
          <a href="/hq/decision-log" style={{ color: "var(--text-accent)" }}>
            Log one →
          </a>
        </p>
      ) : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <Button variant="secondary" size="sm" disabled={saving || !done.length} onClick={clearDone}>
          Clear done priorities
        </Button>
        <Button variant="ghost" size="sm" disabled={saving || !open.length} onClick={carryFirst}>
          Keep first unfinished
        </Button>
        <Button variant="accent" size="sm" disabled={saving} onClick={closeDay}>
          Close day
        </Button>
        <Button variant="ghost" size="sm" href="/hq/decision-log">
          Log a decision →
        </Button>
      </div>
    </Card>
  );
}
