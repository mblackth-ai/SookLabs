"use client";

import Link from "next/link";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { useOpsData } from "@/components/hq/useOpsData";
import { getBoardOpenCounts } from "@/lib/hq/ops-shared";

const STEP_DEFS = [
  { id: "priorities", href: "#priorities", label: "Priorities", detail: "Set up to 3 for today · clear yesterday’s done" },
  { id: "goals", href: "/hq/goals", label: "Goals & blockers", detail: "Scan active goals · resolve or park blockers" },
  { id: "board", href: null, label: "Primary board", detail: "Tick one P0 on today’s focus board" },
  { id: "decision", href: "/hq/decision-log", label: "Decision", detail: "Log anything you decided" },
  { id: "briefing", href: "/hq/briefing", label: "Briefing", detail: "Notes + Ask AI" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Stateful founder morning loop — checked steps persist in ops for the calendar day.
 */
export function MorningLoopCard({ initialData }) {
  const { data, save, saving } = useOpsData(initialData);
  const today = todayIso();
  const loop = data.morningLoop?.date === today ? data.morningLoop : { date: today, stepsChecked: [] };
  const checked = new Set(loop.stepsChecked || []);
  const primaryHref = data.primaryBoardHref || "/hq/sookly/action-plan";
  const boardStats = getBoardOpenCounts(data, primaryHref);

  async function toggle(stepId) {
    const next = new Set(checked);
    if (next.has(stepId)) next.delete(stepId);
    else next.add(stepId);
    await save({
      morningLoop: { date: today, stepsChecked: [...next] },
    });
  }

  async function setPrimary(href) {
    await save({ primaryBoardHref: href });
  }

  return (
    <Card padding="md" className="hq-morning-loop">
      <div className="hq-card-header">
        <div>
          <span className="hq-card-title">Morning loop</span>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
            Check off as you go — resets tomorrow
          </div>
        </div>
        <Badge variant="accent" size="sm">
          {checked.size}/{STEP_DEFS.length}
        </Badge>
      </div>
      <ol className="hq-morning-loop-list">
        {STEP_DEFS.map((s, i) => {
          const href = s.id === "board" ? primaryHref : s.href;
          const isDone = checked.has(s.id);
          const isNext = !isDone && STEP_DEFS.slice(0, i).every((prev) => checked.has(prev.id));
          const detail =
            s.id === "board"
              ? `${boardStats.p0} open P0 · ${boardStats.open} open total on primary board`
              : s.detail;
          return (
            <li
              key={s.id}
              className={[
                "hq-morning-step",
                isDone ? "hq-morning-step--done" : "",
                isNext ? "hq-morning-step--next" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className={`hq-morning-loop-num${isDone ? " hq-morning-loop-num--done" : ""}${isNext ? " hq-morning-loop-num--next" : ""}`}
                onClick={() => toggle(s.id)}
                disabled={saving}
                aria-pressed={isDone}
                aria-label={isDone ? `Mark ${s.label} incomplete` : `Mark ${s.label} done`}
                title={isDone ? "Mark incomplete" : "Mark done"}
              >
                {isDone ? "✓" : i + 1}
              </button>
              <div className="hq-morning-step-body">
                <Link href={href || "#"} className="hq-morning-loop-link">
                  {s.label}
                  {s.id === "board" && boardStats.p0 > 0 ? (
                    <Badge variant="warning" size="sm" style={{ marginLeft: 8 }}>
                      {boardStats.p0} P0
                    </Badge>
                  ) : null}
                </Link>
                <span className="hq-morning-loop-detail">{detail}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Primary board:</span>
        {[
          { href: "/hq/sookly/action-plan", label: "Sookly", match: "sookly" },
          { href: "/hq/seos/social-gtm", label: "SEOS Social", match: "social-gtm" },
          { href: "/hq/community", label: "Community", match: "community" },
          { href: "/hq/roastmyopsec", label: "RoastMyOpSec", match: "roastmyopsec" },
        ].map((b) => (
          <Button
            key={b.href}
            variant={primaryHref.includes(b.match) ? "accent" : "ghost"}
            size="sm"
            disabled={saving}
            onClick={() => setPrimary(b.href)}
          >
            {b.label}
          </Button>
        ))}
        <Link href="/hq/automation" className="hq-morning-loop-alt">
          LLM & Agents →
        </Link>
      </div>
    </Card>
  );
}
