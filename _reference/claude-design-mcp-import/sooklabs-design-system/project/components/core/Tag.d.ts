import * as React from "react";

/**
 * Channel / category / filter chip. Larger and softer than Badge —
 * use for things like channels (LINE, WhatsApp), filters, and topics.
 */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Selected/filter-on state (cyan). */
  active?: boolean;
  /** Apply hover affordance. */
  interactive?: boolean;
  /** Leading icon node. */
  icon?: React.ReactNode;
  /** Render a removable × and call this on click. */
  onRemove?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export function Tag(props: TagProps): React.JSX.Element;
