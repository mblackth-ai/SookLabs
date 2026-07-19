"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { icons } from "@/lib/hq/icons";
import { nav, currentUser } from "@/lib/hq/mock-data";
import { isHqNavActive } from "@/lib/hq/paths";

const GLYPH = "/assets/sooklabs/sooklabs-glyph.png";

function NavRow({ row, active, onNavigate }) {
  const nested = row.kind === "subitem";
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
    </Link>
  );
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
        {nav.map((row, idx) => {
          if (row.kind === "section") {
            return (
              <div key={"sec-" + row.label} className="hq-sidebar-section-label">
                {row.label}
              </div>
            );
          }
          if (row.kind === "divider") {
            return <div key={"div-" + idx} className="hq-sidebar-divider" />;
          }
          if (row.kind === "item" || row.kind === "subitem") {
            return (
              <NavRow
                key={row.id}
                row={row}
                active={isActive(row.href)}
                onNavigate={onMobileClose}
              />
            );
          }
          return null;
        })}
      </nav>

      <div className="hq-sidebar-footer">
        <Avatar name={currentUser.name} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="hq-sidebar-user-name">{currentUser.name}</div>
          <div className="hq-sidebar-user-role">{currentUser.role}</div>
        </div>
        <button type="button" className="hq-sidebar-signout" onClick={signOut} title="Sign out">
          Sign out
        </button>
      </div>
    </aside>
  );
}
