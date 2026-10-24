"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { NavSearch } from "./NavSearch";
import { usePageChrome } from "./PageChrome";
import { icons } from "@/lib/hq/icons";
import { currentUser } from "@/lib/hq/mock-data";

/**
 * Sticky top bar for every HQ dashboard page: nav toggle (mobile), page search, action items, account.
 * On narrow screens the page title takes the middle and search folds into an icon that expands over it.
 */
export function CommandBar({ sidebarOpen, onOpenSidebar }) {
  const { pageTitle } = usePageChrome();
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className={`hq-commandbar${searchOpen ? " is-searching" : ""}`}>
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
      <span className="hq-commandbar-title" title={pageTitle || undefined}>
        {pageTitle || "SookLabs HQ"}
      </span>
      <NavSearch expanded={searchOpen} onExpandedChange={setSearchOpen} />
      <div className="hq-commandbar-actions">
        <button
          type="button"
          className="hq-iconbtn hq-search-trigger"
          aria-label="Search pages"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen(true)}
        >
          <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons.search }} />
        </button>
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
