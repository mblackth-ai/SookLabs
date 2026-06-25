import React from "react";

/**
 * SookLabs Input — calm dark field with a quiet focus glow.
 * Supports label, optional leading icon, hint, and error state.
 */
export function Input({
  label,
  hint,
  error,
  iconLeft = null,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const fid = id || React.useId();

  const borderColor = error
    ? "var(--danger-400)"
    : focus
    ? "var(--accent)"
    : "var(--border-default)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px", width: "100%", ...style }}>
      {label && (
        <label htmlFor={fid} style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 14px",
          height: "44px",
          background: "var(--surface-inset)",
          border: `1px solid ${borderColor}`,
          borderRadius: "12px",
          boxShadow: focus && !error ? "var(--focus-ring)" : "none",
          transition: "border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {iconLeft && (
          <span style={{ display: "inline-flex", width: 17, height: 17, color: "var(--text-muted)", flex: "none" }}>{iconLeft}</span>
        )}
        <input
          id={fid}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--text-primary)",
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: error ? "var(--danger-400)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
