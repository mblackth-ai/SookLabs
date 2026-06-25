import React from "react";

/**
 * SookLabs Switch — quiet toggle. Off = inset track; On = accent fill.
 */
export function Switch({ checked = false, onChange, disabled = false, label, id, style = {} }) {
  const fid = id || React.useId();
  const toggle = () => { if (!disabled && onChange) onChange(!checked); };

  const sw = (
    <button
      id={fid}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      style={{
        position: "relative",
        width: 42,
        height: 24,
        flex: "none",
        borderRadius: 999,
        border: "1px solid",
        borderColor: checked ? "var(--accent)" : "var(--border-strong)",
        background: checked ? "var(--accent)" : "var(--surface-inset)",
        boxShadow: checked ? "0 0 14px rgba(47,124,240,0.40)" : "inset 0 1px 2px rgba(0,0,0,0.4)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: checked ? "#fff" : "var(--silver-300)",
          transition: "left var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out)",
        }}
      />
    </button>
  );

  if (!label) return sw;
  return (
    <label htmlFor={fid} style={{ display: "inline-flex", alignItems: "center", gap: "11px", cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      {sw}
      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)" }}>{label}</span>
    </label>
  );
}
