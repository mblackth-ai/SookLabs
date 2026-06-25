import React from "react";

/**
 * SookLabs Overline — the recurring mono eyebrow label.
 * Optional leading tick/dot. Use above headings and section starts.
 */
export function Overline({ children, dot = false, tone = "muted", style = {}, ...rest }) {
  const colors = {
    muted: "var(--text-muted)",
    accent: "var(--accent-glow)",
    primary: "var(--text-secondary)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: colors[tone] || colors.muted,
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--accent-glow)", boxShadow: "0 0 8px var(--accent-glow)", flex: "none" }} />
      )}
      {children}
    </span>
  );
}
