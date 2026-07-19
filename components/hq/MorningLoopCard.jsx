"use client";

import Link from "next/link";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { useOpsData } from "@/components/hq/useOpsData";

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
          return (
            <li key={s.id} className={isDone ? "hq-morning-step--done" : undefined}>
              <button
                type="button"
                className={`hq-morning-loop-num${isDone ? " hq-morning-loop-num--done" : ""}`}
                onClick={() => toggle(s.id)}
                disabled={saving}
                aria-pressed={isDone}
                title={isDone ? "Mark incomplete" : "Mark done"}
              >
                {isDone ? "✓" : i + 1}
              </button>
              <div>
                <Link href={href || "#"} className="hq-morning-loop-link">
                  {s.label}
                </Link>
                <span className="hq-morning-loop-detail"> — {s.detail}</span>
              </div>
            </li>
          );
        })}
      </ol>
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Primary board:</span>
        <Button
          variant={primaryHref.includes("sookly") ? "accent" : "ghost"}
          size="sm"
          disabled={saving}
          onClick={() => setPrimary("/hq/sookly/action-plan")}
        >
          Sookly
        </Button>
        <Button
          variant={primaryHref.includes("social-gtm") ? "accent" : "ghost"}
          size="sm"
          disabled={saving}
          onClick={() => setPrimary("/hq/seos/social-gtm")}
        >
          SEOS Social
        </Button>
        <Link href="/hq/automation" className="hq-morning-loop-alt">
          LLM & Agents →
        </Link>
      </div>
    </Card>
  );
}
