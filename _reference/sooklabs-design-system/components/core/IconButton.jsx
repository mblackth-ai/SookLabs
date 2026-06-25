import React from "react";
import { injectOnce } from "../_lib/styles.js";

const CSS = `
.sl-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;
  border-radius:var(--radius-md);border:1px solid transparent;background:transparent;cursor:pointer;
  color:var(--text-secondary);transition:background var(--dur) var(--ease-out),color var(--dur) var(--ease-out),
  border-color var(--dur) var(--ease-out),box-shadow var(--dur) var(--ease-out),transform var(--dur-fast);}
.sl-iconbtn svg{width:18px;height:18px;display:block;}
.sl-iconbtn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--focus-ring);}
.sl-iconbtn:active{transform:scale(.94);}
.sl-iconbtn[disabled]{opacity:.4;pointer-events:none;}
.sl-iconbtn--sm{width:32px;height:32px;}
.sl-iconbtn--sm svg{width:16px;height:16px;}
.sl-iconbtn--lg{width:48px;height:48px;}
.sl-iconbtn--lg svg{width:20px;height:20px;}
.sl-iconbtn--ghost:hover{background:var(--line-soft);color:var(--text-strong);}
.sl-iconbtn--solid{background:var(--surface-card);border-color:var(--border);color:var(--text-secondary);}
.sl-iconbtn--solid:hover{background:var(--surface-elevated);color:var(--text-strong);border-color:var(--border-strong);}
.sl-iconbtn--accent{background:var(--tint-cyan);color:var(--cyan-300);border-color:rgba(43,210,224,.3);}
.sl-iconbtn--accent:hover{background:rgba(43,210,224,.2);box-shadow:var(--glow-cyan);}
`;

export function IconButton({
  variant = "ghost",
  size = "md",
  label,
  className = "",
  children,
  ...rest
}) {
  injectOnce("sl-iconbtn", CSS);
  const cls = [
    "sl-iconbtn",
    `sl-iconbtn--${variant}`,
    size !== "md" && `sl-iconbtn--${size}`,
    className,
  ].filter(Boolean).join(" ");
  return (
    <button className={cls} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
