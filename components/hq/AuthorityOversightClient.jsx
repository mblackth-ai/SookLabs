"use client";

import { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

function Metric({ label, value, tone = "neutral" }) {
  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "warning"
      ? "var(--color-warning)"
      : tone === "error"
      ? "var(--color-error)"
      : "var(--text-primary)";
  return (
    <Card padding="sm">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{label}</span>
        <strong style={{ fontSize: "var(--text-xl)", color, fontVariantNumeric: "tabular-nums" }}>{value}</strong>
      </div>
    </Card>
  );
}

export function AuthorityOversightClient({ initialResult, seosUrl = "https://seos.sooklabs.com" }) {
  const [result, setResult] = useState(initialResult);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(initialResult.error || "");
  const workspaces = result.data?.workspaces || [];

  async function refresh() {
    setError("");
    const response = await fetch("/hq/api/authority", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || "Authority oversight refresh failed");
      return;
    }
    setResult(payload);
  }

  async function decide(approvalId, decision) {
    setBusyId(approvalId);
    setError("");
    try {
      const response = await fetch("/hq/api/authority", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, decision }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Approval update failed");
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Approval update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!result.configured) {
    return (
      <Card accent>
        <div className="hq-card-title">SEOS authority connection requires configuration</div>
        <p style={{ marginTop: 8, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Set the same long random <code>SEOS_HQ_API_TOKEN</code> in both HQ and SEOS, plus{" "}
          <code>NEXT_PUBLIC_SEOS_URL</code> (or <code>SEOS_INTERNAL_URL</code>) in HQ.
        </p>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button href="/hq/settings" size="sm" variant="secondary">
            Open Settings
          </Button>
          <Button href={seosUrl} external size="sm" variant="primary">
            Open SEOS
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {error && (
        <div style={{ border: "1px solid rgba(239,68,68,.25)", background: "var(--color-error-muted)", color: "var(--color-error)", padding: 12, borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)" }}>
          <div>{error}</div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button size="sm" variant="secondary" onClick={refresh}>
              Retry
            </Button>
            <Button href="/hq/settings" size="sm" variant="ghost">
              Settings
            </Button>
            <Button href={seosUrl} external size="sm" variant="ghost">
              Open SEOS
            </Button>
          </div>
        </div>
      )}

      {workspaces.map((workspace) => (
        <section key={workspace.id} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{workspace.name}</h2>
                  <Badge variant={workspace.campaign.status === "active" ? "success" : "warning"}>{workspace.campaign.status}</Badge>
                </div>
                <p style={{ marginTop: 5, color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                  {workspace.domain} · {workspace.campaign.name}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" onClick={refresh}>
                  Refresh
                </Button>
                <Button href={seosUrl} external variant="primary" size="sm">
                  Open SEOS
                </Button>
              </div>
            </div>
          </Card>

          <div className="hq-grid-4">
            <Metric label="Completed tasks" value={workspace.summary.completedTasks} tone="success" />
            <Metric label="Pending approvals" value={workspace.summary.pendingApprovals} tone={workspace.summary.pendingApprovals ? "warning" : "neutral"} />
            <Metric label="Links + citations won" value={workspace.summary.linksWon + workspace.summary.citationsWon} tone="success" />
            <Metric label="Overdue / blocked" value={workspace.summary.overdueTasks + workspace.summary.blockedTasks} tone={workspace.summary.overdueTasks + workspace.summary.blockedTasks ? "error" : "neutral"} />
          </div>

          <Card>
            <div className="hq-card-header">
              <div className="hq-card-title">Campaign health</div>
              <Badge variant="accent">{workspace.summary.sprintCompletion}% sprint</Badge>
            </div>
            <div style={{ display: "grid", gap: 10, fontSize: "var(--text-sm)", marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Evidence coverage</span>
                <strong>{workspace.evidenceCoverage}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Low-value open tasks</span>
                <strong>{workspace.lowValueTaskCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Monthly outreach limit</span>
                <strong>
                  {workspace.summary.outreachSent}/{workspace.campaign.monthlyOutreachLimit}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Last activity</span>
                <strong>{workspace.lastActivityAt ? new Date(workspace.lastActivityAt).toLocaleDateString() : "None"}</strong>
              </div>
            </div>
          </Card>

          <Card>
            <div className="hq-card-title" style={{ marginBottom: 10 }}>
              Pending approvals
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(workspace.pendingApprovals || []).map((approval) => (
                <div
                  key={approval.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    borderBottom: "1px solid var(--border-faint)",
                    paddingBottom: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}>
                      {String(approval.type || "").replaceAll("_", " ")}
                    </p>
                    <p style={{ marginTop: 3, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
                      Requested by {approval.requestedBy} · version {approval.versionReviewed}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button size="sm" variant="primary" disabled={busyId === approval.id} onClick={() => decide(approval.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busyId === approval.id} onClick={() => decide(approval.id, "revision_requested")}>
                      Revision
                    </Button>
                    <Button size="sm" variant="danger" disabled={busyId === approval.id} onClick={() => decide(approval.id, "rejected")}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              {!(workspace.pendingApprovals || []).length && (
                <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>No approvals are waiting.</p>
              )}
            </div>
          </Card>
        </section>
      ))}

      {!error && !workspaces.length && (
        <Card>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            No authority workspaces were returned. Seed SEOS (<code>npm run authority:seed</code>) or open the operator desk.
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button href={seosUrl} external size="sm" variant="primary">
              Open SEOS
            </Button>
            <Button href="/hq/settings" size="sm" variant="ghost">
              Settings
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
