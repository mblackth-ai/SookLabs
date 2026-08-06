"use client";

/** Shared visual shell for interactive tools on /resources. */
export function ToolCard({ id, title, badge, summary, children, footer }) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 88,
        padding: 28,
        borderRadius: 18,
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--inset-top)",
        animation: "sl-resources-reveal 420ms ease both",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(22px, 3vw, 28px)",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
        {badge ? (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent-glow, var(--cyan-400))",
              padding: "5px 10px",
              borderRadius: 999,
              border: "1px solid var(--border-subtle)",
              background: "var(--tint-cyan)",
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {summary ? (
        <p
          style={{
            margin: "0 0 22px",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.55,
            color: "var(--text-secondary)",
            maxWidth: 720,
          }}
        >
          {summary}
        </p>
      ) : null}
      {children}
      {footer ? <div style={{ marginTop: 20 }}>{footer}</div> : null}
    </section>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
        }}
      >
        {label}
      </span>
      {children}
      {hint ? (
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-faint)" }}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  borderRadius: 11,
  border: "1px solid var(--border-subtle)",
  background: "var(--surface-inset, var(--ink-600))",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  outline: "none",
};

export const checkboxRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  fontFamily: "var(--font-body)",
  fontSize: 14,
  lineHeight: 1.45,
  color: "var(--text-secondary)",
  cursor: "pointer",
};
