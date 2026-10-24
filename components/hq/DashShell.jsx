"use client";

import { useEffect, useState } from "react";
import { CommandBar } from "./CommandBar";
import { PageChromeProvider } from "./PageChrome";
import { Sidebar } from "./Sidebar";
import { SaveStatusProvider } from "./SaveStatus";

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
      <a href="#hq-main" className="hq-skip-link">
        Skip to content
      </a>
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="hq-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="hq-dash-main" id="hq-main" tabIndex={-1}>
        <CommandBar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
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
