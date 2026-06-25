import React from "react";

/**
 * SookLabs StatTile — a calm metric cell. Mono value, optional delta + label.
 * Used in dashboards, proof-of-work strips, and snapshots.
 */
export function StatTile({
  value,
  label,
  delta,
  deltaTone = "success",
  caption,
  align = "left",
  style = {},
}) {
  const tones = {
    success: "var(--signal-success)",
    warning: "var(--signal-warning)",
    danger: "var(--signal-danger)",
    info: "var(--signal-info)",
    neutral: "var(--text-muted)",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        alignItems: align === "center" ? "center" : "flex-start",
        textAlign: align,
        padding: "18px 20px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--inset-top)",
        ...style,
      }}
    >
      {label && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {label}
        </span>
      )}
      <span style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "30px", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--text-primary)", lineHeight: 1 }}>
          {value}
        </span>
        {delta && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500, color: tones[deltaTone] || tones.neutral }}>
            {delta}
          </span>
        )}
      </span>
      {caption && (
        <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.45 }}>
          {caption}
        </span>
      )}
    </div>
  );
}
