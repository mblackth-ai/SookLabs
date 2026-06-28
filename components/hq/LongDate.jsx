"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// Renders a long date on the client only (via useSyncExternalStore) to avoid
// SSR/client timezone hydration mismatch without setting state in an effect.
export function LongDate({ prefix = "", suffix = "" }) {
  const text = useSyncExternalStore(
    emptySubscribe,
    () => {
      const formatted = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return `${prefix}${formatted}${suffix}`;
    },
    () => ""
  );

  return <span suppressHydrationWarning>{text}</span>;
}
