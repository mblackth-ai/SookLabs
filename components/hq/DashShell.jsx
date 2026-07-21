"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageChromeProvider, usePageChrome } from "./PageChrome";
import { Sidebar } from "./Sidebar";
import { SaveStatusProvider } from "./SaveStatus";

function MobileBar({ sidebarOpen, onOpenSidebar }) {
  const { pageTitle } = usePageChrome();

  return (
    <div className="hq-mobile-bar">
      <button
        type="button"
        className="hq-mobile-nav-toggle"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      {pageTitle ? (
        <span className="hq-mobile-page-title" title={pageTitle}>
          {pageTitle}
        </span>
      ) : (
        <Link href="/hq" className="hq-mobile-brand">
          SookLabs HQ
        </Link>
      )}
    </div>
  );
}

function DashShellInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  return (
    <div className="hq-dash">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="hq-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="hq-dash-main">
        <MobileBar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
        {children}
      </div>
    </div>
  );
}

export function DashShell({ children }) {
  return (
    <SaveStatusProvider>
      <PageChromeProvider>
        <DashShellInner>{children}</DashShellInner>
      </PageChromeProvider>
    </SaveStatusProvider>
  );
}
