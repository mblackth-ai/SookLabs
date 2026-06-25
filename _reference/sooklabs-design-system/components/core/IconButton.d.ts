import * as React from "react";

/**
 * Square, icon-only control for toolbars and compact rows.
 * Pass a single icon node (e.g. a Lucide SVG) as children.
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "solid" | "accent";
  size?: "sm" | "md" | "lg";
  /** Accessible label (also the tooltip). */
  label: string;
  children?: React.ReactNode;
}

export function IconButton(props: IconButtonProps): React.JSX.Element;
