import React from "react";

export interface StatTileProps {
  /** The metric value (string or number) — rendered in mono. */
  value: React.ReactNode;
  /** Mono uppercase label above the value. */
  label?: string;
  /** Delta / change string (e.g. "+12%"). */
  delta?: string;
  /** Tone of the delta. @default "success" */
  deltaTone?: "success" | "warning" | "danger" | "info" | "neutral";
  /** Caption line below the value. */
  caption?: string;
  /** @default "left" */
  align?: "left" | "center";
}

/**
 * Calm metric cell for dashboards, snapshots, and proof-of-work strips.
 * @startingPoint section="Data" subtitle="Metric tile with delta + caption" viewport="700x180"
 */
export function StatTile(props: StatTileProps): React.ReactElement;
