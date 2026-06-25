import React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "style"> {
  /** Field label rendered above the input. */
  label?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message — turns the field red and replaces the hint. */
  error?: string;
  /** Leading icon node (Lucide/SVG). */
  iconLeft?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Text field with calm focus glow, optional label, icon, hint, and error state. */
export function Input(props: InputProps): React.ReactElement;
