"use client";

/**
 * CSS-class Card — interactive hover/focus via hq.css.
 */
export function Card({
  children,
  padding = "md",
  interactive = false,
  selected = false,
  accent = false,
  onClick,
  style: styleProp,
  id,
  className = "",
}) {
  const classes = [
    "hq-card",
    `hq-card--pad-${padding}`,
    interactive ? "hq-card--interactive" : "",
    selected ? "hq-card--selected" : "",
    accent ? "hq-card--accent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={id}
      className={classes}
      style={styleProp}
      onClick={onClick}
      role={interactive && onClick ? "button" : undefined}
      tabIndex={interactive && onClick ? 0 : undefined}
      onKeyDown={
        interactive && onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
