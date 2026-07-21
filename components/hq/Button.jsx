"use client";

/**
 * CSS-class Button — hover/focus via hq.css (keyboard-friendly).
 */
import Link from "next/link";

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  onClick,
  type = "button",
  fullWidth = false,
  href,
  external = false,
  style: styleProp,
  title,
  className = "",
}) {
  const isDisabled = disabled || loading;
  const classes = [
    "hq-btn",
    `hq-btn--${variant}`,
    `hq-btn--${size}`,
    fullWidth ? "hq-btn--full" : "",
    loading ? "hq-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? <span className="hq-btn-spinner" aria-hidden="true" /> : null}
      {icon && iconPosition === "left" && !loading ? (
        <span className="hq-btn-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      ) : null}
      {children}
      {icon && iconPosition === "right" && !loading ? (
        <span className="hq-btn-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      ) : null}
    </>
  );

  if (href && !isDisabled) {
    const isExternal = external || /^https?:\/\//i.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          style={styleProp}
          title={title}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} style={styleProp} title={title} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      style={styleProp}
      disabled={isDisabled}
      onClick={!isDisabled ? onClick : undefined}
      type={type}
      title={title}
    >
      {content}
    </button>
  );
}
