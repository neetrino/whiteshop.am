/** Pixel depth of receipt “teeth” into the panel (clip-path). */
export const RECEIPT_ZIG_DEPTH_PX = 10;

/** Number of tip/valley pairs along the bottom edge (higher = finer zigzag). */
export const RECEIPT_ZIG_TOOTH_PAIRS = 22;

/**
 * CSS `clip-path: polygon(...)` for a flat top and zigzag bottom (torn receipt).
 */
export function buildReceiptBottomClipPath(): string {
  const d = RECEIPT_ZIG_DEPTH_PX;
  const segments = RECEIPT_ZIG_TOOTH_PAIRS * 2;
  const dx = 100 / segments;
  const pts = ['0% 0%', '100% 0%', `100% calc(100% - ${d}px)`];
  let useTip = true;
  for (let i = 1; i < segments; i++) {
    const x = 100 - i * dx;
    pts.push(`${x}% ${useTip ? '100%' : `calc(100% - ${d}px)`}`);
    useTip = !useTip;
  }
  pts.push(`0% calc(100% - ${d}px)`);
  return `polygon(${pts.join(',')})`;
}
