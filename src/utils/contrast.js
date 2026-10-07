/**
 * WCAG 2.x contrast helpers for wheel segment labels (#28).
 * Colors are 0xRRGGBB integers, matching appConfig / THREE.Color input.
 */

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;

const WHITE = 0xffffff;
const BLACK = 0x000000;

function channel(c8) {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color) {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Black or white, whichever reads better on `background`. */
export function bestTextColor(background) {
  return contrastRatio(background, WHITE) >= contrastRatio(background, BLACK) ? WHITE : BLACK;
}

export function toCssHex(color) {
  return `#${(color & 0xffffff).toString(16).padStart(6, '0')}`;
}

/**
 * Audit segments: each label is drawn in bestTextColor(segment.color).
 * Returns one warning per segment whose label contrast is below `minRatio`.
 */
export function auditSegmentContrast(segments, minRatio = WCAG_AA_NORMAL) {
  const warnings = [];
  for (const segment of segments) {
    const text = bestTextColor(segment.color);
    const ratio = contrastRatio(segment.color, text);
    if (ratio < minRatio) {
      warnings.push({
        label: segment.label,
        color: toCssHex(segment.color),
        ratio: Math.round(ratio * 100) / 100,
        message: `Segment "${segment.label}" (${toCssHex(segment.color)}) label contrast ${ratio.toFixed(
          2,
        )}:1 is below WCAG AA ${minRatio}:1`,
      });
    }
  }
  return warnings;
}
