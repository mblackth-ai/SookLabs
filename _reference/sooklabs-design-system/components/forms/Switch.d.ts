import React from "react";

export interface SwitchProps {
  /** On/off state. */
  checked?: boolean;
  /** Called with the next boolean value. */
  onChange?: (next: boolean) => void;
  /** Optional trailing label. */
  label?: string;
  disabled?: boolean;
}

/** Quiet toggle — inset track when off, accent fill with soft glow when on. */
export function Switch(props: SwitchProps): React.ReactElement;
