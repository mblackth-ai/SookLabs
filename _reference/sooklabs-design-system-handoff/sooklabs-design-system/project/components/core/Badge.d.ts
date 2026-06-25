import * as React from "react";

/**
 * Compact mono status pill for states like Connected, Assigned, Exposed.
 * Tinted-glass fills keep signals calm, never loud.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "cyan" | "success" | "warning" | "danger" | "violet" | "blue";
  /** Show a leading glowing status dot. */
  dot?: boolean;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): React.JSX.Element;
