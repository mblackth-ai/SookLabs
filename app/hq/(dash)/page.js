import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { LongDate } from "@/components/hq/LongDate";
import { PriorityList } from "@/components/hq/PriorityList";
import { TopOpenItems } from "@/components/hq/TopOpenItems";
import { PortfolioStrip } from "@/components/hq/PortfolioStrip";
import { OpsAttentionList } from "@/components/hq/OpsAttentionList";
import { MorningLoopCard } from "@/components/hq/MorningLoopCard";
import { GoalsPanel } from "@/components/hq/GoalsPanel";
import { BlockersPanel } from "@/components/hq/BlockersPanel";
import { EndOfDayCard } from "@/components/hq/EndOfDayCard";
import { AgentJobLog } from "@/components/hq/AgentJobLog";
import { ClickPlayDraftHint } from "@/components/hq/ClickPlayDraftHint";
import { OverviewStorageWarn } from "@/components/hq/OverviewStorageWarn";
import { OverviewMoreToday } from "@/components/hq/OverviewMoreToday";
import { FourFrontsSummary } from "@/components/hq/FourFrontsSummary";
import { KpiCards } from "@/components/hq/KpiCards";
import { OpsUnavailable } from "@/components/hq/OpsUnavailable";
import { PerformanceChart } from "@/components/hq/PerformanceChart";
import { countOpenTasks } from "@/lib/hq/kpis";
import { readHomeData } from "@/lib/hq/kpis-server";
import {
  getTopOpenItems,
  getPortfolioSummary,
  getOpsAttention,
  getMergedBlockers,
  getOpsStorageMode,
} from "@/lib/hq/ops";

export const dynamic = "force-dynamic";

function PulseValue({ pulse, value, className }) {
  if (!pulse.live) {
    return (
      <strong className="hq-pulse-na" aria-label={pulse.label}>
        <span aria-hidden="true">—</span>
      </strong>
    );
  }
  return <strong className={className}>{value}</strong>;
}

export default async function OverviewPage() {
  // Ops store and SEOS are read in parallel, each bounded by ~3s; a failed read never throws here.
  const { ops, opsError, kpis, pulse, performance } = await readHomeData();
  const storage = getOpsStorageMode();
  const hasOps = Boolean(ops) && !opsError;
  const topOpen = hasOps ? getTopOpenItems(ops, 5) : [];
  const portfolio = hasOps ? getPortfolioSummary(ops) : [];
  const attention = hasOps ? getOpsAttention(ops) : [];
  const blockers = hasOps ? getMergedBlockers(ops) : [];
  const openPriorities = hasOps ? ops.todayPriorities.filter((p) => !p.done).length : null;
  const openTasks = hasOps ? countOpenTasks(ops) : null;
  const activeGoals = hasOps ? (ops.goals || []).filter((g) => g.status === "active").length : null;
  const primaryHref = (hasOps && ops.primaryBoardHref) || "/hq/sookly/action-plan";
  const hasRunningJobs = hasOps && (ops.agentJobs || []).some((j) => j.status === "running");

  return (
    <div>
      <TopBar
        title="Good morning."
        subtitle={<LongDate suffix=" · Private founder command centre." />}
        actions={
          <Button variant="secondary" size="sm" href="/hq/briefing">
            Briefing · Ask AI
          </Button>
        }
      />

      <div className="hq-page-content">
        <KpiCards kpis={kpis} />

        <PerformanceChart series={performance} />

        {/* Pulse */}
        <section className="hq-band hq-band--pulse" aria-label="Day pulse">
          <div className="hq-overview-pulse">
            <a className="hq-overview-pulse-item" href="#priorities">
              <span className="hq-section-label">Priorities</span>
              <PulseValue pulse={pulse} value={openPriorities} />
            </a>
            <a className="hq-overview-pulse-item" href="/hq/portfolio">
              <span className="hq-section-label">Tasks</span>
              <PulseValue pulse={pulse} value={openTasks} />
            </a>
            <a className="hq-overview-pulse-item" href="#blockers">
              <span className="hq-section-label">Blockers</span>
              <PulseValue pulse={pulse} value={blockers.length} className={blockers.length ? "hq-text-danger" : "hq-text-ok"} />
            </a>
            <a className="hq-overview-pulse-item" href="#goals">
              <span className="hq-section-label">Goals</span>
              <PulseValue pulse={pulse} value={activeGoals} />
            </a>
            <div className="hq-overview-pulse-item hq-overview-pulse-item--wide">
              <Badge
                variant={storage === "postgres" ? "success" : "warning"}
                size="sm"
                title={
                  storage === "file"
                    ? "File ops.json may reset on serverless deploys — set HQ_DATABASE_URL"
                    : "Postgres ops store"
                }
              >
                {storage === "postgres" ? "Ops: Postgres" : "Ops: File"}
              </Badge>
              <Button variant="secondary" size="sm" href={primaryHref}>
                Primary board
              </Button>
              <Button variant="ghost" size="sm" href="/hq/decision-log">
                Decisions
              </Button>
            </div>
          </div>
          {!pulse.live ? (
            <p className={`hq-pulse-note hq-pulse-note--${pulse.status}`}>
              <strong>{pulse.label}.</strong>{" "}
              {pulse.status === "error"
                ? "The ops database didn't respond, so these counts can't be shown right now."
                : "These counts come from the ops database, which isn't linked here, so HQ only has starter data."}
            </p>
          ) : null}
          {storage === "file" && <OverviewStorageWarn />}
        </section>

        {/* Four active delivery tracks */}
        <FourFrontsSummary />

        {hasOps ? (
          <>
            {/* Act */}
            <section className="hq-band hq-band--act" aria-label="Act">
              <p className="hq-band-label">Act</p>
              <MorningLoopCard initialData={ops} />
              <PriorityList initialData={ops} />
              <div className="hq-grid-2">
                <div id="goals">
                  <GoalsPanel initialData={ops} compact />
                </div>
                <div id="blockers">
                  <BlockersPanel initialData={ops} />
                </div>
              </div>
              <div className="hq-grid-2">
                <TopOpenItems items={topOpen} href="/hq/portfolio" linkLabel="Portfolio →" />
                <OpsAttentionList items={attention} />
              </div>
            </section>

            {/* Review / more */}
            <OverviewMoreToday defaultOpen={hasRunningJobs}>
              <ClickPlayDraftHint />
              <AgentJobLog jobs={ops.agentJobs} compact />
              <PortfolioStrip products={portfolio} />
              <EndOfDayCard initialData={ops} />
            </OverviewMoreToday>
          </>
        ) : (
          <section className="hq-band hq-band--act" aria-label="Act">
            <p className="hq-band-label">Act</p>
            <OpsUnavailable />
          </section>
        )}
      </div>
    </div>
  );
}
