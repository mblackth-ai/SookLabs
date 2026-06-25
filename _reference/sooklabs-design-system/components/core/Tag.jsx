import React from "react";
import { injectOnce } from "../_lib/styles.js";

const CSS = `
.sl-tag{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 12px;
  font-family:var(--font-sans);font-size:13px;font-weight:500;line-height:1;border-radius:var(--radius-pill);
  border:1px solid var(--border);background:var(--glass-fill-light);color:var(--text-secondary);
  white-space:nowrap;transition:background var(--dur) var(--ease-out),color var(--dur) var(--ease-out),
  border-color var(--dur) var(--ease-out);}
.sl-tag svg{width:13px;height:13px;}
.sl-tag--interactive{cursor:pointer;}
.sl-tag--interactive:hover{color:var(--text-strong);border-color:var(--border-strong);background:var(--surface-elevated);}
.sl-tag--active{background:var(--tint-cyan);color:var(--cyan-300);border-color:rgba(43,210,224,.4);}
.sl-tag__x{display:inline-flex;margin:0 -4px 0 2px;opacity:.6;}
.sl-tag__x:hover{opacity:1;}
`;

export function Tag({
  active = false,
  interactive = false,
  icon,
  onRemove,
  className = "",
  children,
  ...rest
}) {
  injectOnce("sl-tag", CSS);
  const cls = [
    "sl-tag",
    (interactive || onRemove) && "sl-tag--interactive",
    active && "sl-tag--active",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {icon}
      {children}
      {onRemove && (
        <span
          className="sl-tag__x"
          role="button"
          aria-label="Remove"
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
        >
          <svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </span>
      )}
    </span>
  );
}
