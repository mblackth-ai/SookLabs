"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { icons } from "@/lib/hq/icons";
import { nav, currentUser } from "@/lib/hq/mock-data";

function SectionLabel({ children }) {
  return (
    <div
      style={{
        padding: "16px 10px 4px",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: "var(--text-tertiary)",
      }}
    >
      {children}
    </div>
  );
}

function NavRow({ row, active }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={row.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        marginBottom: 1,
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
        textDecoration: "none",
        background: active ? "var(--accent-muted)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        border: "1px solid",
        borderColor: active ? "var(--border-accent)" : "transparent",
        transition: "background 80ms var(--ease-default), border-color 80ms var(--ease-default)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          width: 18,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: active ? "var(--text-accent)" : "var(--text-tertiary)",
        }}
        dangerouslySetInnerHTML={{ __html: icons[row.icon] || "" }}
      />
      <span
        style={{
          flex: 1,
          fontSize: "var(--text-sm)",
          fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
          color: active ? "var(--text-primary)" : "var(--text-secondary)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "-0.01em",
        }}
      >
        {row.label}
      </span>
      {row.badge != null && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            background: active ? "var(--accent)" : "var(--bg-float)",
            color: active ? "#080808" : "var(--text-tertiary)",
            padding: "1px 6px",
            borderRadius: "var(--radius-full)",
            flexShrink: 0,
          }}
        >
          {row.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) => (href === "/hq" ? pathname === "/hq" : pathname === href || pathname.startsWith(href + "/"));

  async function signOut() {
    await fetch("/hq/api/logout", { method: "POST" });
    router.push("/hq/login");
    router.refresh();
  }

  return (
    <div
      style={{
        width: "var(--sidebar-width)",
        flexShrink: 0,
        height: "100vh",
        background: "var(--bg-base)",
        borderRight: "1px solid var(--border-faint)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 16px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hq/sooklabs-mark.svg" width="28" height="22" alt="SookLabs" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          SookLabs
        </span>
        <Badge variant="accent" size="sm" style={{ marginLeft: "auto" }}>
          HQ
        </Badge>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
        {nav.map((row, idx) => {
          if (row.kind === "section") return <SectionLabel key={"sec-" + row.label}>{row.label}</SectionLabel>;
          if (row.kind === "divider")
            return <div key={"div-" + idx} style={{ height: 1, background: "var(--border-faint)", margin: "4px 0" }} />;
          return <NavRow key={row.id} row={row} active={isActive(row.href)} />;
        })}
      </div>

      <div
        style={{
          padding: "12px 12px",
          borderTop: "1px solid var(--border-faint)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Avatar name={currentUser.name} size="sm" status="online" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentUser.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{currentUser.role}</div>
        </div>
        <button
          onClick={signOut}
          title="Sign out"
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            background: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "4px 8px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
