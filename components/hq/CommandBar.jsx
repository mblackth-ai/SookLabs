"use client";

import Link from "next/link";
import { Avatar } from "./Avatar";
import { NavSearch } from "./NavSearch";
import { icons } from "@/lib/hq/icons";
import { currentUser } from "@/lib/hq/mock-data";

/** Sticky top bar for every HQ dashboard page: nav toggle (mobile), page search, action items, account. */
export function CommandBar({ sidebarOpen, onOpenSidebar }) {
  return (
    <header className="hq-commandbar">
      <button
        type="button"
        className="hq-mobile-nav-toggle"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
      <NavSearch />
      <div className="hq-commandbar-actions">
        <Link href="/hq/briefing" className="hq-iconbtn" aria-label="Action items (Daily Briefing)" title="Action items (Daily Briefing)">
          <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons.bell }} />
        </Link>
        <Link href="/hq/settings" className="hq-commandbar-avatar" aria-label={`${currentUser.name}: settings`} title="Settings">
          <Avatar name={currentUser.name} size="md" />
        </Link>
      </div>
    </header>
  );
}
