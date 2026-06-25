import React from "react";

export interface OverlineProps {
  children: React.ReactNode;
  /** Show a leading glowing dot. @default false */
  dot?: boolean;
  /** @default "muted" */
  tone?: "muted" | "accent" | "primary";
}

/** Mono uppercase eyebrow label — the signature section/overline motif. */
export function Overline(props: OverlineProps): React.ReactElement;
