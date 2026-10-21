import Link from "next/link";
import { clientSections } from "@/lib/hq/clients";

/** In-page tabs for one client: Overview, Retainer (if any), Content & Social, Briefing. */
export function ClientSectionTabs({ client, active }) {
  return (
    <nav aria-label={`${client.short} sections`} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
      {clientSections(client).map((s) => {
        const on = s.key === active;
        return (
          <Link
            key={s.key}
            href={s.href}
            aria-current={on ? "page" : undefined}
            style={{
              fontSize: "var(--text-sm)",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${on ? "var(--text-accent)" : "var(--border-subtle)"}`,
              color: on ? "var(--text-accent)" : "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
