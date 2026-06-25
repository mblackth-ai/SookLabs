import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Surface treatment. @default "solid" */
  appearance?: "glass" | "solid" | "raised" | "outline";
  /** Add a soft accent glow from the top edge. @default false */
  glow?: boolean;
  /** Enable hover lift (shadow + translate). @default false */
  hover?: boolean;
  /** Inner padding. @default "24px" */
  padding?: string;
  /** Corner radius. @default var(--radius-xl) */
  radius?: string;
}

/**
 * The signature matte-glass surface. Wrap content blocks, product mockups, list items.
 * @startingPoint section="Core" subtitle="Matte-glass card surface" viewport="700x240"
 */
export function Card(props: CardProps): React.ReactElement;
