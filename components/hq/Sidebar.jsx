"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { OpsStorageChip } from "./OpsStorageChip";
import { icons } from "@/lib/hq/icons";
import { currentUser } from "@/lib/hq/mock-data";
import { nav } from "@/lib/hq/nav";
import { isHqNavActive, normalizeHqPathname } from "@/lib/hq/paths";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

/** Top-level items with the rows nested under them (subitems and subsubitems belong to the preceding item). */
function groupNav(rows) {
  const groups = [];
  for (const row of rows) {
    if (row.kind === "item") groups.push({ item: row, children: [] });
    else if ((row.kind === "subitem" || row.kind === "subsubitem") && groups.length) groups.at(-1).children.push(row);
  }
  return groups;
}

const GROUPS = groupNav(nav);

function NavRow({ row, active, onNavigate, nested = false, depth = 1, groupActive = false }) {
  const cls = [
    "hq-sidebar-nav-link",
    nested ? "hq-sidebar-nav-link--nested" : "",
    nested && depth > 1 ? "hq-sidebar-nav-link--nested-2" : "",
    active ? "hq-sidebar-nav-link--active" : "",
    !active && groupActive ? "hq-sidebar-nav-link--group-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Link href={row.href} className={cls} onClick={onNavigate} aria-current={active ? "page" : undefined}>
      <span className="hq-sidebar-nav-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[row.icon] || "" }} />
      <span className="hq-sidebar-nav-label">{row.label}</span>
      {row.soon ? <span className="hq-sidebar-nav-badge hq-sidebar-nav-badge--soon">Soon</span> : null}
      {row.badge != null && <span className="hq-sidebar-nav-badge">{row.badge}</span>}
      {row.id === "settings" ? <OpsStorageChip /> : null}
    </Link>
  );
}

export function Sidebar({ mobileOpen = false, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();
  // Explicit open/closed choices per group; groups without a choice follow the current route.
  const [toggled, setToggled] = useState({});

  const isActive = (row) =>
    row.exact ? normalizeHqPathname(pathname) === normalizeHqPathname(row.href) : isHqNavActive(pathname, row.href);

  async function signOut() {
    await fetch("/hq/api/logout", { method: "POST" });
    router.push("/hq/login");
    router.refresh();
  }

  return (
    <aside className={`hq-sidebar${mobileOpen ? " hq-sidebar--open" : ""}`} aria-label="HQ">
      <div className="hq-sidebar-header">
        <Image
          src={GLYPH}
          alt=""
          width={28}
          height={28}
          priority
          style={{ borderRadius: "var(--radius-lg)", objectFit: "cover", flexShrink: 0 }}
        />
        <span className="hq-sidebar-brand">SookLabs HQ</span>
        <button type="button" className="hq-sidebar-close" onClick={onMobileClose} aria-label="Close navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="hq-sidebar-nav" aria-label="Main">
        <ul className="hq-nav-list">
          {GROUPS.map(({ item, children }) => {
            const itemActive = isActive(item);
            const childActive = children.some((c) => isActive(c));
            const collapsible = children.some((c) => !c.alwaysOpen);
            const open = toggled[item.id] ?? (itemActive || childActive);
            const visible = children.filter((c) => c.alwaysOpen || open);
            const listId = `hq-nav-group-${item.id}`;
            return (
              <li key={item.id} className="hq-nav-group">
                <div className="hq-nav-item-row">
                  <NavRow row={item} active={itemActive} groupActive={childActive} onNavigate={onMobileClose} />
                  {collapsible ? (
                    <button
                      type="button"
                      className={`hq-nav-toggle${open ? " hq-nav-toggle--open" : ""}`}
                      aria-expanded={open}
                      aria-controls={listId}
                      aria-label={`${open ? "Hide" : "Show"} ${item.label} pages`}
                      onClick={() => setToggled((t) => ({ ...t, [item.id]: !open }))}
                    >
                      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons.chevron }} />
                    </button>
                  ) : null}
                </div>
                {visible.length ? (
                  <ul id={listId} className="hq-nav-sublist">
                    {visible.map((row) => (
                      <li key={row.id}>
                        <NavRow
                          row={row}
                          active={isActive(row)}
                          onNavigate={onMobileClose}
                          nested
                          depth={row.kind === "subsubitem" ? 2 : 1}
                        />
                      </li>
                    ))}
                  </ul>
                ) : collapsible ? (
                  <ul id={listId} className="hq-nav-sublist" hidden />
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="hq-sidebar-footer">
        <div className="hq-sidebar-user">
          <Avatar name={currentUser.name} size="sm" />
          <div className="hq-sidebar-user-meta">
            <div className="hq-sidebar-user-name">{currentUser.name}</div>
            <div className="hq-sidebar-user-role">{currentUser.role}</div>
          </div>
        </div>
        <button type="button" className="hq-sidebar-signout" onClick={signOut} aria-label="Sign out of SookLabs HQ">
          <svg className="hq-sidebar-signout-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
