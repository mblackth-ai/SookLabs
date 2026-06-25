import * as React from "react";

/**
 * Primary action control. Cyan-fill primary, matte-glass secondary,
 * quiet ghost, and a calm danger variant.
 *
 * @startingPoint section="Core" subtitle="Buttons — primary, secondary, ghost, danger" viewport="700x140"
 */
export interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual weight. */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Control height. */
  size?: "sm" | "md" | "lg";
  /** Icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to container width. */
  fullWidth?: boolean;
  /** Show a spinner and block interaction. */
  loading?: boolean;
  disabled?: boolean;
  /** Render as an anchor when set. */
  href?: string;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): React.JSX.Element;
