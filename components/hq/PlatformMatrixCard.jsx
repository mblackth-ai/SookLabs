import { Card } from "./Card";
import { Badge } from "./Badge";
import { PLATFORM_MODE_LABELS } from "@/lib/hq/ops-shared";

const MODE_VARIANT = {
  auto: "success",
  draft: "warning",
  manual: "neutral",
  future_oauth: "accent",
};

export function PlatformMatrixCard({ platforms }) {
  if (!platforms?.length) return null;

  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <span className="hq-card-title">Platform matrix</span>
        <Badge variant="outline" size="sm">
          Honest status
        </Badge>
      </div>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "0 0 var(--space-3)", lineHeight: 1.5 }}>
        Honest modes only. Click-and-play drafts stay Manual / Draft Export — live OAuth is Future.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {platforms.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid var(--border-faint)",
            }}
          >
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{p.label}</div>
              {p.note && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 2 }}>{p.note}</div>
              )}
            </div>
            <Badge variant={MODE_VARIANT[p.mode] || "neutral"} size="sm">
              {PLATFORM_MODE_LABELS[p.mode] || p.mode}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
