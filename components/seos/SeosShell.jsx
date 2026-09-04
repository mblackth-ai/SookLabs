"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/hq/Badge";
import { seosPath } from "@/lib/seos/paths";

const NAV = [
  { href: "/command-center", label: "Command Center", match: "/command-center" },
];

export function SeosShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch(seosPath("/api/logout"), { method: "POST" });
    router.push(seosPath("/login"));
    router.refresh();
  }

  return (
    <div className="hq-dash">
      <aside className="hq-sidebar" style={{ width: 240 }}>
        <div className="hq-sidebar-brand" style={{ padding: "20px 16px 12px" }}>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
            SookLabs Expansion OS
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
            MVP 1 · Simple Mode
          </div>
          <Badge variant="warning" size="sm" style={{ marginTop: 10 }}>
            Manual / Draft Export
          </Badge>
        </div>
        <nav className="hq-sidebar-nav" style={{ padding: "8px 8px 24px" }}>
          {NAV.map((item) => {
            const href = seosPath(item.href);
            const active = pathname.includes(item.match);
            return (
              <Link
                key={item.href}
                href={href}
                className={`hq-navlink${active ? " hq-navlink--active" : ""}`}
                style={{ display: "block", padding: "8px 12px", borderRadius: 8, marginBottom: 4 }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid var(--border-faint)" }}>
          <button
            type="button"
            onClick={signOut}
            className="hq-navlink"
            style={{
              width: "100%",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 12px",
              color: "var(--text-secondary)",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="hq-dash-main">{children}</div>
    </div>
  );
}
