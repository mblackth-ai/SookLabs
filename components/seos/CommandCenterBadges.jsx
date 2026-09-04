import { Badge } from "@/components/hq/Badge";
import {
  CONNECTION_BADGE_LABELS,
  CONNECTION_METHOD_LABELS,
  resolveConnectionBadge,
} from "@/lib/seos/command-center-shared";

const BADGE_VARIANT = {
  inactive: "neutral",
  manual: "warning",
  draft_export: "accent",
  connected: "success",
};

export function ConnectionHonestyBadge({ connection }) {
  const resolved = resolveConnectionBadge(connection);
  return (
    <Badge variant={BADGE_VARIANT[resolved] || "neutral"} size="sm" caps>
      {CONNECTION_BADGE_LABELS[resolved] || resolved}
    </Badge>
  );
}

export function ConnectionMethodLabel({ method }) {
  return CONNECTION_METHOD_LABELS[method] || method || "Unknown";
}

export function formatTimestamp(value) {
  if (!value || value === "unknown") return "unknown";
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

export function WorkflowStatusBadge({ status }) {
  const variant = status === "running" ? "success" : status === "blocked" ? "error" : "neutral";
  const label = status === "running" ? "Running" : status === "blocked" ? "Blocked" : "Idle";
  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

export function PostStatusBadge({ status }) {
  const variant =
    status === "live" ? "success" : status === "failed" ? "error" : status === "scheduled" ? "accent" : "warning";
  return (
    <Badge variant={variant} size="sm">
      {status}
    </Badge>
  );
}
