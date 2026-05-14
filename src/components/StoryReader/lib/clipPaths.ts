/**
 * Pure clip-path generators — CSS path() with quadratic Bézier curves.
 *
 * All coordinates are in pixels relative to element top-left.
 * Callers supply (t, W, H, startY).
 *
 * t      = 0 → full page visible  |  t = 1 → page fully folded away
 * startY = Y position (px) where the finger first touched the edge.
 *          0 = top edge, H = bottom edge (classic corner flip).
 *
 * ─────────────────────────────────────────────────────────────────
 * FOLD LINE MODEL
 * ─────────────────────────────────────────────────────────────────
 * Two endpoints spread outward from the origin (W, startY):
 *
 *   A  — slides UP the right edge:  (W,  startY·(1−t))
 *   B  — slides LEFT along the bottom:  ((1−t)·W,  H)
 *
 * At t=0  →  A=(W,startY), B=(W,H): both on the right/bottom edge,
 *            fold invisible, full page shown.
 * At t=1  →  A=(W,0),      B=(0,H): diagonal spanning the whole page,
 *            page completely gone.
 *
 * Bézier control point bows TOWARD the bottom-right corner (W,H)
 * giving the organic paper-stiffness curve.
 *
 * Backward fold is the mirror: origin (0,startY), A slides up the
 * left edge, B slides right along the bottom.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Bow amplitude — peaks around t≈0.65 (paper stiffness feel).
 * Using sin so it rises quickly and eases back toward t=1.
 */
function bow(t: number, W: number, H: number): number {
  return Math.sin(t * Math.PI * 0.85) * Math.min(W, H) * 0.13;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORWARD  (next page — fold originates from right edge at startY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clip for the CURRENT page layer.
 * Visible polygon: top-left → top-right → A → ⌒Bézier⌒ → B → bottom-left → close
 */
export function forwardPageClip(t: number, W: number, H: number, startY: number): string {
  const ay = startY * (1 - t);   // A: right edge fold point (slides from startY → 0)
  const bx = (1 - t) * W;        // B: bottom edge fold point (slides from W → 0)
  const b  = bow(t, W, H);

  // Control point: midpoint of AB, pushed toward corner (W, H)
  const cx = (W + bx) / 2 + b;
  const cy = (ay  + H) / 2 + b;

  return `path('M 0 0 L ${W} 0 L ${W} ${ay} Q ${cx} ${cy} ${bx} ${H} L 0 ${H} Z')`;
}

/**
 * Clip for the FLAP layer — the curling triangle that exposes.
 * Triangle: A → ⌒Bézier⌒ → B → bottom-right corner (W,H) → close
 */
export function forwardFlapClip(t: number, W: number, H: number, startY: number): string {
  const ay = startY * (1 - t);
  const bx = (1 - t) * W;
  const b  = bow(t, W, H);

  const cx = (W + bx) / 2 + b;
  const cy = (ay  + H) / 2 + b;

  return `path('M ${W} ${ay} Q ${cx} ${cy} ${bx} ${H} L ${W} ${H} Z')`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD  (prev page — fold originates from left edge at startY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clip for the CURRENT page layer — mirror of forward.
 * Visible polygon:
 *   left-fold-point → top-left → top-right → bottom-right → B → ⌒Bézier⌒ → close
 */
export function backwardPageClip(t: number, W: number, H: number, startY: number): string {
  const ay = startY * (1 - t);   // A: left edge fold point (slides from startY → 0)
  const bx = t * W;               // B: bottom edge fold point (slides from 0 → W)
  const b  = bow(t, W, H);

  // Control point: midpoint of AB, pushed toward corner (0, H)
  const cx = (0 + bx) / 2 - b;
  const cy = (ay  + H) / 2 + b;

  return `path('M 0 ${ay} L 0 0 L ${W} 0 L ${W} ${H} L ${bx} ${H} Q ${cx} ${cy} 0 ${ay} Z')`;
}

/**
 * Clip for the FLAP layer — backward curl triangle.
 * Triangle: left-fold-point A → ⌒Bézier⌒ → B → bottom-left corner (0,H) → close
 */
export function backwardFlapClip(t: number, W: number, H: number, startY: number): string {
  const ay = startY * (1 - t);
  const bx = t * W;
  const b  = bow(t, W, H);

  const cx = (0 + bx) / 2 - b;
  const cy = (ay  + H) / 2 + b;

  return `path('M 0 ${ay} Q ${cx} ${cy} ${bx} ${H} L 0 ${H} Z')`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified helpers
// ─────────────────────────────────────────────────────────────────────────────

export type FoldDirection = 'next' | 'prev';

export function pageClip(dir: FoldDirection, t: number, W: number, H: number, startY: number): string {
  return dir === 'next'
    ? forwardPageClip(t, W, H, startY)
    : backwardPageClip(t, W, H, startY);
}

export function flapClip(dir: FoldDirection, t: number, W: number, H: number, startY: number): string {
  return dir === 'next'
    ? forwardFlapClip(t, W, H, startY)
    : backwardFlapClip(t, W, H, startY);
}
