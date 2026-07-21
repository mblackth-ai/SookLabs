"use client";

import { useMemo, useState } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { CLICK_PLAY_SECTIONS, buildClickPlayResult } from "@/lib/hq/click-play";

/**
 * Zero-OAuth click-and-play: walk steps → draft result. No Connected claims.
 */
export function ClickPlaySandbox({ sectionId }) {
  const section = CLICK_PLAY_SECTIONS[sectionId];
  const [values, setValues] = useState(() => {
    const init = {};
    for (const step of section?.steps || []) {
      init[step.id] = step.type === "multi" ? [] : "";
    }
    return init;
  });
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState("");

  const canRun = useMemo(() => {
    if (!section) return false;
    return section.steps.every((step) => {
      const v = values[step.id];
      if (step.type === "multi") return Array.isArray(v) && v.length > 0;
      return String(v || "").trim().length > 0;
    });
  }, [section, values]);

  if (!section) return null;

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

  function run() {
    const built = buildClickPlayResult(sectionId, values);
    setResult(built);
    try {
      const key = `hq-click-play:${sectionId}`;
      const prev = JSON.parse(sessionStorage.getItem(key) || "[]");
      sessionStorage.setItem(key, JSON.stringify([built, ...prev].slice(0, 8)));
    } catch {
      /* ignore */
    }
    setToast("Draft saved in this browser session (Draft Export — not published)");
    setTimeout(() => setToast(""), 3500);
  }

  function reset() {
    const init = {};
    for (const step of section.steps) init[step.id] = step.type === "multi" ? [] : "";
    setValues(init);
    setResult(null);
  }

  return (
    <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
      <div className="hq-card-header" style={{ marginBottom: 8 }}>
        <span className="hq-card-title">{section.title}</span>
        <Badge variant="warning" size="sm">
          {section.badge}
        </Badge>
      </div>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 16px", lineHeight: 1.55 }}>
        {section.blurb}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {section.steps.map((step) => (
          <div key={step.id}>
            <label
              htmlFor={`cp-${sectionId}-${step.id}`}
              style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginBottom: 6 }}
            >
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
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, alignItems: "center" }}>
        <Button size="sm" disabled={!canRun} onClick={run}>
          Generate draft
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset
        </Button>
        {toast ? (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{toast}</span>
        ) : null}
      </div>

      {result ? (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            background: "var(--bg-base)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <strong style={{ fontSize: "var(--text-sm)" }}>Draft result</strong>
            <Badge variant="accent" size="sm">
              Draft Export
            </Badge>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            {result.summary}
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "8px 0 0" }}>
            Not posted. No OAuth. Promote to the board checklist when ready.
          </p>
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
