"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import "./tools-nav.css";
import { ToolsCoverflow } from "./ToolsCoverflow";

export const TOOLS = [
  {
    id: "sookly",
    title: "Sookly App",
    status: "live",
    statusLabel: "Live",
    description: "Open the live omnichat and AI receptionist workspace.",
    href: "https://app.sookly.co",
  },
  {
    id: "seo-audit",
    title: "SEO Audit",
    status: "live",
    statusLabel: "Live",
    description: "Scan your site for visibility, structure, and search opportunities.",
    href: "/audit",
  },
  {
    id: "seos",
    title: "SEOS",
    status: "soon",
    statusLabel: "Coming soon",
    description:
      "Search Expansion Operating System for diagnostics, content systems, and growth operations.",
    href: null,
  },
  {
    id: "competitor-snapshot",
    title: "Competitor Snapshot",
    status: "planned",
    statusLabel: "Planned",
    description: "Compare your site against competitors and identify practical next moves.",
    href: null,
  },
  {
    id: "workflow-audit",
    title: "Workflow Audit",
    status: "planned",
    statusLabel: "Planned",
    description: "Find repeated tasks, interruptions, and operational bottlenecks.",
    href: null,
  },
];

function Chevron() {
  return (
    <svg
      className="sl-tools-chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ToolStatus({ status, label }) {
  return (
    <span className={`sl-tools-status sl-tools-status--${status}`}>
      <span className="sl-tools-status-dot" aria-hidden />
      {label}
    </span>
  );
}

function ToolCard({ tool, onNavigate }) {
  const isLive = tool.status === "live" && tool.href;
  const className = `sl-tools-item${isLive ? " sl-tools-item--live" : " sl-tools-item--disabled"}`;

  const content = (
    <>
      <div className="sl-tools-item-head">
        <span className="sl-tools-item-title">{tool.title}</span>
        <ToolStatus
          status={tool.status === "live" ? "live" : tool.status === "soon" ? "soon" : "planned"}
          label={tool.statusLabel}
        />
      </div>
      <p className="sl-tools-item-desc">{tool.description}</p>
    </>
  );

  if (isLive) {
    return (
      <li>
        <Link href={tool.href} className={className} onClick={onNavigate}>
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className={className} aria-disabled="true">
        {content}
      </div>
    </li>
  );
}

function ToolsList({ onNavigate }) {
  return (
    <ul className="sl-tools-list" role="list">
      {TOOLS.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

/** @param {{ className?: string, variant?: "grid" | "coverflow" }} props */
export function ToolsNavDropdown({ className = "", variant = "coverflow" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const closeTimer = useRef(null);
  const panelId = useId();
  const isCoverflow = variant === "coverflow";

  const close = useCallback(() => setOpen(false), []);
  const openMenu = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <div
      ref={rootRef}
      className={`sl-tools-nav${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="sl-tools-trigger sl-navlink"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        Tools
        <Chevron />
      </button>
      <div
        id={panelId}
        className={`sl-tools-panel${isCoverflow ? " sl-tools-panel--coverflow" : ""}`}
        role="region"
        aria-label="SookLabs tools"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <div className="sl-tools-panel-grid-bg" aria-hidden />
        {isCoverflow ? (
          <ToolsCoverflow tools={TOOLS} onNavigate={close} />
        ) : (
          <ToolsList onNavigate={close} />
        )}
      </div>
    </div>
  );
}

/** @param {{ onNavigate?: () => void, className?: string, variant?: "grid" | "coverflow" }} props */
export function ToolsNavAccordion({ onNavigate, className = "", variant = "coverflow" }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const isCoverflow = variant === "coverflow";

  return (
    <div className={`sl-tools-accordion${open ? " is-open" : ""}${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="sl-tools-accordion-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Tools</span>
        <Chevron />
      </button>
      {open && (
        <div
          id={panelId}
          className={`sl-tools-accordion-panel${isCoverflow ? " sl-tools-accordion-panel--coverflow" : ""}`}
          role="region"
          aria-label="SookLabs tools"
        >
          {isCoverflow ? (
            <ToolsCoverflow
              tools={TOOLS}
              onNavigate={() => {
                setOpen(false);
                onNavigate?.();
              }}
            />
          ) : (
            <ToolsList
              onNavigate={() => {
                setOpen(false);
                onNavigate?.();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
