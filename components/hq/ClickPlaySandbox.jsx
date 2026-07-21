"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  CLICK_PLAY_SECTIONS,
  CLICK_PLAY_BOARD,
  buildClickPlayResult,
  boardTitleFromDraft,
} from "@/lib/hq/click-play";
import { newId } from "@/lib/hq/ops-shared";

/**
 * Zero-OAuth click-and-play: walk steps → draft result → optional promote to board.
 * No Connected claims.
 */
export function ClickPlaySandbox({ sectionId }) {
  const router = useRouter();
  const section = CLICK_PLAY_SECTIONS[sectionId];
  const board = CLICK_PLAY_BOARD[sectionId];
  const [values, setValues] = useState(() => {
    const init = {};
    for (const step of section?.steps || []) {
      init[step.id] = step.type === "multi" ? [] : "";
    }
    return init;
  });
  const [result, setResult] = useState(null);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [toast, setToast] = useState("");
  const [promotedItemId, setPromotedItemId] = useState(null);
  const [promoting, setPromoting] = useState(false);

  const stepStates = useMemo(() => {
    if (!section) return [];
    return section.steps.map((step) => {
      const v = values[step.id];
      const complete =
        step.type === "multi"
          ? Array.isArray(v) && v.length > 0
          : String(v || "").trim().length > 0;
      return { step, complete };
    });
  }, [section, values]);

  const completedCount = stepStates.filter((s) => s.complete).length;
  const totalSteps = stepStates.length;

  const canRun = useMemo(() => {
    if (!section) return false;
    return stepStates.every((s) => s.complete);
  }, [section, stepStates]);

  useEffect(() => {
    try {
      const key = `hq-click-play:${sectionId}`;
      const prev = JSON.parse(sessionStorage.getItem(key) || "[]");
      setRecentDrafts(Array.isArray(prev) ? prev.slice(0, 2) : []);
    } catch {
      setRecentDrafts([]);
    }
  }, [sectionId]);

  if (!section) return null;

  function loadRecentDrafts() {
    try {
      const key = `hq-click-play:${sectionId}`;
      const prev = JSON.parse(sessionStorage.getItem(key) || "[]");
      setRecentDrafts(Array.isArray(prev) ? prev.slice(0, 2) : []);
    } catch {
      setRecentDrafts([]);
    }
  }

  function setField(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id, option) {
    setValues((prev) => {
      const cur = Array.isArray(prev[id]) ? prev[id] : [];
      const next = cur.includes(option) ? cur.filter((x) => x !== option) : [...cur, option];
      return { ...prev, [id]: next };
    });
  }

  function persistDraft(built) {
    try {
      const key = `hq-click-play:${sectionId}`;
      const prev = JSON.parse(sessionStorage.getItem(key) || "[]");
      sessionStorage.setItem(key, JSON.stringify([built, ...prev].slice(0, 8)));
      sessionStorage.setItem(
        "hq-click-play:last",
        JSON.stringify({
          sectionId,
          title: boardTitleFromDraft(built),
          summary: built.summary,
          createdAt: built.createdAt,
          boardHref: board?.boardHref || null,
        })
      );
      loadRecentDrafts();
    } catch {
      /* ignore */
    }
  }

  function run() {
    const built = buildClickPlayResult(sectionId, values);
    setResult(built);
    setPromotedItemId(null);
    persistDraft(built);
    setToast("Draft saved in this browser session (Draft Export — not published)");
    setTimeout(() => setToast(""), 3500);
  }

  function reset() {
    const init = {};
    for (const step of section.steps) init[step.id] = step.type === "multi" ? [] : "";
    setValues(init);
    setResult(null);
    setPromotedItemId(null);
  }

  async function promoteToBoard() {
    if (!result || !board) return;
    setPromoting(true);
    setToast("");
    setPromotedItemId(null);
    try {
      const resGet = await fetch("/hq/api/ops");
      const jsonGet = await resGet.json();
      if (!resGet.ok || !jsonGet.ok) throw new Error(jsonGet.error || "Could not load ops");

      const stream = jsonGet.data?.workstreams?.[board.streamKey] || { label: board.streamKey, items: [] };
      const title = boardTitleFromDraft(result);
      const item = {
        id: newId(board.idPrefix),
        title,
        status: "todo",
        priority: "P2",
        owner: "Mark",
        due: "",
        notes: result.summary || "",
        links: [{ label: "Click-play draft", url: board.boardHref }],
      };
      const items = [item, ...(stream.items || [])];
      const res = await fetch("/hq/api/ops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workstreams: {
            [board.streamKey]: { ...stream, items },
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Promote failed");
      setPromotedItemId(item.id);
      setToast(`Added to board as P2 · ${title.slice(0, 48)}`);
      setTimeout(() => setToast(""), 4000);
      router.refresh();
    } catch (e) {
      setToast(e.message || "Promote failed");
      setTimeout(() => setToast(""), 4000);
    } finally {
      setPromoting(false);
    }
  }

  return (
    <Card padding="md" className="hq-click-play" style={{ marginBottom: "var(--space-4)" }}>
      <div className="hq-card-header" style={{ marginBottom: 8 }}>
        <span className="hq-card-title">{section.title}</span>
        <Badge variant="warning" size="sm">
          {section.badge}
        </Badge>
      </div>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.55 }}>
        {section.blurb}
      </p>

      <div className="hq-click-play-progress" aria-label="Step progress">
        <div className="hq-click-play-progress-meta">
          <span className="hq-section-label">Steps</span>
          <span className="hq-click-play-progress-count">
            {completedCount}/{totalSteps} complete
          </span>
        </div>
        <div className="hq-click-play-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={totalSteps} aria-valuenow={completedCount}>
          <span
            className="hq-click-play-progress-fill"
            style={{ width: totalSteps ? `${(completedCount / totalSteps) * 100}%` : "0%" }}
          />
        </div>
        <ol className="hq-click-play-progress-dots">
          {stepStates.map(({ step, complete }, i) => (
            <li
              key={step.id}
              className={[
                "hq-click-play-progress-dot",
                complete ? "hq-click-play-progress-dot--done" : "",
                !complete && stepStates.slice(0, i).every((s) => s.complete) ? "hq-click-play-progress-dot--next" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              title={step.label}
            >
              {complete ? "✓" : i + 1}
            </li>
          ))}
        </ol>
      </div>

      <div className="hq-click-play-steps">
        {stepStates.map(({ step, complete }, i) => (
          <div
            key={step.id}
            className={[
              "hq-click-play-step",
              complete ? "hq-click-play-step--done" : "",
              !complete && stepStates.slice(0, i).every((s) => s.complete) ? "hq-click-play-step--next" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <label htmlFor={`cp-${sectionId}-${step.id}`} className="hq-click-play-step-label">
              <span className="hq-click-play-step-num">{complete ? "✓" : i + 1}</span>
              {step.label}
            </label>
            {step.type === "select" ? (
              <select
                id={`cp-${sectionId}-${step.id}`}
                value={values[step.id] || ""}
                onChange={(e) => setField(step.id, e.target.value)}
                style={fieldStyle}
              >
                <option value="">Select…</option>
                {step.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : step.type === "multi" ? (
              <div className="hq-click-play-chips" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {step.options.map((opt) => {
                  const on = (values[step.id] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMulti(step.id, opt)}
                      style={{
                        ...chipStyle,
                        background: on ? "var(--accent-muted)" : "var(--bg-raised)",
                        borderColor: on ? "var(--border-accent)" : "var(--border-default)",
                        color: on ? "var(--text-accent)" : "var(--text-secondary)",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              <input
                id={`cp-${sectionId}-${step.id}`}
                type="text"
                value={values[step.id] || ""}
                placeholder={step.placeholder || ""}
                onChange={(e) => setField(step.id, e.target.value)}
                style={fieldStyle}
              />
            )}
          </div>
        ))}
      </div>

      <div className="hq-click-play-actions" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, alignItems: "center" }}>
        <Button size="sm" disabled={!canRun} onClick={run}>
          Generate draft
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
        {toast ? (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{toast}</span>
        ) : null}
        {promotedItemId && board ? (
          <Button
            size="sm"
            variant="ghost"
            href={`${board.boardHref}?focus=${encodeURIComponent(promotedItemId)}`}
          >
            View promoted item →
          </Button>
        ) : null}
      </div>

      {result ? (
        <div className="hq-click-play-result">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <strong style={{ fontSize: "var(--text-sm)" }}>Draft result</strong>
            <Badge variant="accent" size="sm">
              Draft Export
            </Badge>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            {result.summary}
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "8px 0 12px" }}>
            Not posted. No OAuth. Promote adds a P2 todo on the board checklist.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(result.summary || "");
                  setToast("Copied draft summary");
                  setTimeout(() => setToast(""), 2500);
                } catch {
                  setToast("Copy failed");
                  setTimeout(() => setToast(""), 2500);
                }
              }}
            >
              Copy summary
            </Button>
            {board ? (
              <>
                <Button size="sm" variant="secondary" loading={promoting} onClick={promoteToBoard}>
                  Promote to board
                </Button>
                <Button size="sm" variant="ghost" href={board.boardHref}>
                  Open board →
                </Button>
              </>
            ) : null}
            {sectionId === "sooklyReceptionist" ? (
              <Button size="sm" variant="ghost" href="/hq/seos/knowledge-base">
                Fix gaps in SEOS KB →
              </Button>
            ) : null}
          </div>
          {recentDrafts.length > 0 ? (
            <div className="hq-click-play-recent" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 8 }}>
                Last {recentDrafts.length} session draft{recentDrafts.length > 1 ? "s" : ""} (browser only)
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {recentDrafts.map((draft, idx) => (
                  <li key={draft.createdAt || idx}>
                    <button
                      type="button"
                      onClick={() => {
                        setResult(draft);
                        setToast("Loaded session draft");
                        setTimeout(() => setToast(""), 2000);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-raised)",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 4 }}>
                        {draft.createdAt ? new Date(draft.createdAt).toLocaleString() : "Session draft"}
                        {idx === 0 ? " · latest" : ""}
                      </span>
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                        {(draft.summary || "").slice(0, 120)}
                        {(draft.summary || "").length > 120 ? "…" : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

const fieldStyle = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-sm)",
  padding: "8px 10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border-default)",
  background: "var(--bg-base)",
  color: "var(--text-primary)",
};

const chipStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-xs)",
  padding: "6px 10px",
  borderRadius: "var(--radius-md)",
  border: "1px solid",
  cursor: "pointer",
};
