import React from "react";

/**
 * SookLabs Card — the matte-glass surface.
 * appearance: "glass" (translucent + blur), "solid" (opaque card), "outline".
 * Optional accent glow and hover lift. Composes freely.
 */
export function Card({
  children,
  appearance = "solid",
  glow = false,
  hover = false,
  padding = "24px",
  radius = "var(--radius-xl)",
  style = {},
  ...rest
}) {
  const [isHover, setHover] = React.useState(false);

  const appearances = {
    glass: {
      background: "var(--glass-bg)",
      backdropFilter: "blur(var(--blur-md))",
      WebkitBackdropFilter: "blur(var(--blur-md))",
      border: "1px solid var(--glass-border)",
    },
    solid: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-default)",
    },
    raised: {
      background: "var(--surface-raised)",
      border: "1px solid var(--border-subtle)",
    },
    outline: {
      background: "transparent",
      border: "1px solid var(--border-default)",
    },
  };

  const base = appearances[appearance] || appearances.solid;
  const lift = hover && isHover;

  return (
    <div
      onMouseEnter={() => hover && setHover(true)}
      onMouseLeave={() => hover && setHover(false)}
      style={{
        position: "relative",
        padding,
        borderRadius: radius,
        boxShadow: lift
          ? "var(--shadow-lg), var(--inset-top)"
          : "var(--shadow-md), var(--inset-top)",
        borderColor: lift ? "var(--border-strong)" : undefined,
        transition: "box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)",
        transform: lift ? "translateY(-2px)" : "translateY(0)",
        ...base,
        ...style,
      }}
      {...rest}
    >
      {glow && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            background: "radial-gradient(120% 80% at 50% -10%, var(--glow-blue), transparent 60%)",
            pointerEvents: "none",
            opacity: 0.7,
          }}
        />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
