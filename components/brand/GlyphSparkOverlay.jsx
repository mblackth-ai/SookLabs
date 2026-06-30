"use client";

import { useId } from "react";
import {
  SPARK_MOTION_PATH,
  SPARK_STROKE_WIDTH,
  SPARK_VIEWBOX,
} from "@/lib/brand/spark-path";
import "./glyph-spark.css";

export function GlyphSparkOverlay({ size = 92, animate = true, className }) {
  const uid = useId().replace(/:/g, "");
  const gradId = `glyphSparkBeam-${uid}`;
  const motionId = `glyphSparkMotion-${uid}`;

  if (!animate) return null;

  return (
    <div
      className={["glyph-spark-overlay", className].filter(Boolean).join(" ")}
      aria-hidden
      style={{ "--glyph-spark-stroke": SPARK_STROKE_WIDTH }}
    >
      <svg
        viewBox={SPARK_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(116,233,241,0)" />
            <stop offset="35%" stopColor="rgba(191,246,251,0.55)" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="rgba(191,246,251,0.55)" />
            <stop offset="100%" stopColor="rgba(43,210,224,0)" />
          </linearGradient>
        </defs>

        <path id={motionId} d={SPARK_MOTION_PATH} fill="none" stroke="none" />

        <path
          className="glyph-spark-beam"
          d={SPARK_MOTION_PATH}
          pathLength={520}
          style={{ stroke: `url(#${gradId})` }}
        />

        <circle className="glyph-spark-dot" r={4.5}>
          <animateMotion
            dur="2.8s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.42 0 0.58 1"
          >
            <mpath href={`#${motionId}`} />
          </animateMotion>
        </circle>
      </svg>
    </div>
  );
}
