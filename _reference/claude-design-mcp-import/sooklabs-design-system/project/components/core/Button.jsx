import React from "react";
import { injectOnce } from "../_lib/styles.js";

const CSS = `
.sl-btn{--_h:40px;--_px:18px;--_fs:14px;display:inline-flex;align-items:center;justify-content:center;
  gap:8px;height:var(--_h);padding:0 var(--_px);font-family:var(--font-sans);font-size:var(--_fs);
  font-weight:600;letter-spacing:.005em;line-height:1;border-radius:var(--radius-md);
  border:1px solid transparent;cursor:pointer;text-decoration:none;white-space:nowrap;
  transition:background var(--dur) var(--ease-out),border-color var(--dur) var(--ease-out),
  color var(--dur) var(--ease-out),box-shadow var(--dur) var(--ease-out),transform var(--dur-fast) var(--ease-out);
  -webkit-font-smoothing:antialiased;user-select:none;}
.sl-btn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--focus-ring);}
.sl-btn:active{transform:translateY(1px) scale(.99);}
.sl-btn[disabled],.sl-btn[aria-disabled="true"]{opacity:.45;pointer-events:none;}
.sl-btn--sm{--_h:32px;--_px:13px;--_fs:13px;}
.sl-btn--lg{--_h:50px;--_px:26px;--_fs:15px;}
.sl-btn--block{display:flex;width:100%;}
/* primary — cyan fill */
.sl-btn--primary{background:var(--cyan-500);color:var(--on-accent);border-color:var(--cyan-400);}
.sl-btn--primary:hover{background:var(--cyan-400);box-shadow:var(--glow-cyan);}
/* secondary — matte glass */
.sl-btn--secondary{background:var(--glass-fill-light);color:var(--text-primary);border-color:var(--border-strong);
  backdrop-filter:blur(var(--blur-glass));-webkit-backdrop-filter:blur(var(--blur-glass));}
.sl-btn--secondary:hover{background:var(--surface-elevated);border-color:var(--cyan-600);color:var(--text-strong);}
/* ghost */
.sl-btn--ghost{background:transparent;color:var(--text-secondary);border-color:transparent;}
.sl-btn--ghost:hover{background:var(--line-soft);color:var(--text-strong);}
/* danger */
.sl-btn--danger{background:var(--tint-danger);color:var(--danger-500);border-color:rgba(237,107,138,.35);}
.sl-btn--danger:hover{background:rgba(237,107,138,.2);border-color:var(--danger-500);}
.sl-btn__spin{width:14px;height:14px;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;
  animation:sl-btn-spin .6s linear infinite;}
@keyframes sl-btn-spin{to{transform:rotate(360deg)}}
`;

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  href,
  className = "",
  children,
  ...rest
}) {
  injectOnce("sl-button", CSS);
  const cls = [
    "sl-btn",
    `sl-btn--${variant}`,
    size !== "md" && `sl-btn--${size}`,
    fullWidth && "sl-btn--block",
    className,
  ].filter(Boolean).join(" ");

  const inner = (
    <>
      {loading && <span className="sl-btn__spin" aria-hidden="true" />}
      {!loading && iconLeft}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} className={cls} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
}
