import React from "react";
import { injectOnce } from "../_lib/styles.js";

const CSS = `
.sl-badge{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 10px;
  font-family:var(--font-mono);font-size:11px;font-weight:500;letter-spacing:.02em;line-height:1;
  border-radius:var(--radius-pill);border:1px solid var(--border);background:var(--surface-card);
  color:var(--text-secondary);white-space:nowrap;}
.sl-badge--dot::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;
  box-shadow:0 0 8px currentColor;}
.sl-badge--neutral{color:var(--text-secondary);}
.sl-badge--cyan{background:var(--tint-cyan);color:var(--cyan-300);border-color:rgba(43,210,224,.3);}
.sl-badge--success{background:var(--tint-success);color:var(--success-500);border-color:rgba(63,209,152,.3);}
.sl-badge--warning{background:var(--tint-warning);color:var(--warning-500);border-color:rgba(230,180,80,.3);}
.sl-badge--danger{background:var(--tint-danger);color:var(--danger-500);border-color:rgba(237,107,138,.3);}
.sl-badge--violet{background:var(--tint-violet);color:var(--violet-400);border-color:rgba(142,131,242,.3);}
.sl-badge--blue{background:var(--tint-blue);color:var(--blue-400);border-color:rgba(91,140,240,.3);}
`;

export function Badge({ tone = "neutral", dot = false, className = "", children, ...rest }) {
  injectOnce("sl-badge", CSS);
  const cls = [
    "sl-badge",
    `sl-badge--${tone}`,
    dot && "sl-badge--dot",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
