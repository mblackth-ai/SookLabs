/**
 * Motion path for GlyphSparkOverlay — animation geometry only.
 * Tuned to candidate A (lib/brand/wave-reference.png); not used to render the logo.
 */

export const SPARK_VIEWBOX = "0 0 256 200";

/** Symmetric Catmull-Rom centerline traced from wave-reference.png */
export const SPARK_MOTION_PATH =
  "M 20 99.2 L 52 99.2" +
  " C 53.0 99.1, 57.0 101.6, 60.0 98.3" +
  " C 63.0 95.0, 73.0 75.6, 76.0 72.5" +
  " C 79.0 69.4, 81.0 66.9, 84.0 73.8" +
  " C 87.0 80.7, 96.0 131.1, 100.0 127.9" +
  " C 104.0 124.7, 112.5 58.3, 116.0 48.0" +
  " C 119.5 37.7, 125.0 45.4, 128.0 45.4" +
  " C 131.0 45.4, 137.5 36.3, 140.0 48.0" +
  " C 142.5 59.7, 145.0 135.6, 148.0 138.8" +
  " C 151.0 142.0, 161.0 81.6, 164.0 73.3" +
  " C 167.0 65.0, 169.0 69.0, 172.0 72.1" +
  " C 175.0 75.2, 184.0 94.9, 188.0 98.3" +
  " C 192.0 101.7, 202.0 99.4, 204.0 99.6" +
  " L 236 99.2";

/** Matches visible stroke weight in candidate A glyph */
export const SPARK_STROKE_WIDTH = 17;
