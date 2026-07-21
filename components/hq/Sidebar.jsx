"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { OpsStorageChip } from "./OpsStorageChip";
import { icons } from "@/lib/hq/icons";
import { nav, currentUser } from "@/lib/hq/mock-data";
import { isHqNavActive } from "@/lib/hq/paths";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

/** Morning-loop shortcuts pinned above the full nav tree. */
const TODAY_PIN = [
  { id: "pin-overview", label: "Overview", icon: "briefcase", href: "/hq" },
  { id: "pin-board", label: "Action Plan", icon: "zap", href: "/hq/sookly/action-plan" },
  { id: "pin-briefing", label: "Briefing", icon: "book", href: "/hq/briefing" },
  { id: "pin-automation", label: "Agents", icon: "activity", href: "/hq/automation" },
];

function NavRow({ row, active, onNavigate, nested = false }) {
  return (
    <Link
      href={row.href}
      className={`hq-sidebar-nav-link${nested ? " hq-sidebar-nav-link--nested" : ""}${active ? " hq-sidebar-nav-link--active" : ""}`}
      onClick={onNavigate}
    >
      <span
        className="hq-sidebar-nav-icon"
        dangerouslySetInnerHTML={{ __html: icons[row.icon] || "" }}
      />
      <span className="hq-sidebar-nav-label">{row.label}</span>
      {row.badge != null && <span className="hq-sidebar-nav-badge">{row.badge}</span>}
      {row.id === "settings" ? <OpsStorageChip /> : null}
    </Link>
  );
}

function shouldShowSubitem(pathname, parentHref, subitemHref) {
  return isHqNavActive(pathname, parentHref) || isHqNavActive(pathname, subitemHref);
}

export function Sidebar({ mobileOpen = false, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) => isHqNavActive(pathname, href);

  async function signOut() {
    await fetch("/hq/api/logout", { method: "POST" });
    router.push("/hq/login");
    router.refresh();
  }

  let lastParentHref = null;

  return (
    <aside className={`hq-sidebar${mobileOpen ? " hq-sidebar--open" : ""}`}>
      <div className="hq-sidebar-header">
        <Image
          src={GLYPH}
          alt="SookLabs"
          width={28}
          height={28}
          priority
          style={{ borderRadius: "var(--radius-lg)", objectFit: "cover", flexShrink: 0 }}
        />
        <span className="hq-sidebar-brand">SookLabs HQ</span>
        <button
          type="button"
          className="hq-sidebar-close"
          onClick={onMobileClose}
          aria-label="Close navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="hq-sidebar-nav">
        <div className="hq-sidebar-section-label hq-sidebar-section-label--pin">Today</div>
        <div className="hq-sidebar-pin">
          {TODAY_PIN.map((row) => (
            <NavRow key={row.id} row={row} active={isActive(row.href)} onNavigate={onMobileClose} />
          ))}
        </div>

        {nav.map((row, idx) => {
          if (row.kind === "section") {
            return (
              <div key={"sec-" + row.label} className="hq-sidebar-section-label">
                {row.label}
              </div>
            );
          }
          if (row.kind === "divider") {
            lastParentHref = null;
            return <div key={"div-" + idx} className="hq-sidebar-divider" />;
          }
          if (row.kind === "item") {
            lastParentHref = row.href;
            return (
              <NavRow
                key={row.id}
                row={row}
                active={isActive(row.href)}
                onNavigate={onMobileClose}
              />
            );
          }
          if (row.kind === "subitem") {
            if (!lastParentHref || !shouldShowSubitem(pathname, lastParentHref, row.href)) {
              return null;
            }
            return (
              <NavRow
                key={row.id}
                row={row}
                active={isActive(row.href)}
                onNavigate={onMobileClose}
                nested
              />
            );
          }
          return null;
        })}
      </nav>

      <div className="hq-sidebar-footer">
        <div className="hq-sidebar-user">
          <Avatar name={currentUser.name} size="sm" />
          <div className="hq-sidebar-user-meta">
            <div className="hq-sidebar-user-name">{currentUser.name}</div>
            <div className="hq-sidebar-user-role">{currentUser.role}</div>
          </div>
        </div>
        <button
          type="button"
          className="hq-sidebar-signout"
          onClick={signOut}
          aria-label="Sign out of SookLabs HQ"
        >
          <svg
            className="hq-sidebar-signout-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
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
