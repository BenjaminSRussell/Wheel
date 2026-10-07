/** Weighted segment selection (#24). */
import { cryptoRandomFloat } from "./crypto.js";

export function normalizeWeights(weights) {
  return weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0));
}

/**
 * Pick an index with probability proportional to its weight.
 * Falls back to uniform when every weight is zero/invalid.
 */
export function pickWeightedIndex(weights, rand = cryptoRandomFloat) {
  const clean = normalizeWeights(weights);
  const total = clean.reduce((a, b) => a + b, 0);
  if (clean.length === 0) return -1;
  if (total <= 0)
    return Math.min(clean.length - 1, Math.floor(rand() * clean.length));
  let r = rand() * total;
  for (const [i, w] of clean.entries()) {
    if (r < w) return i;
    r -= w;
  }
  return clean.length - 1;
}

/**
 * Wheel rotation (radians, normalized to [0, 2π)) that leaves segment `index`
 * under the pointer. Wheel.getCurrentSegment() selects the segment whose arc
 * straddles angle 0 after rotation, so we rotate by -(start + f * arc).
 * `f` stays away from the edges so we never land on a boundary.
 */
export function angleForSegmentIndex(index, count, rand = cryptoRandomFloat) {
  const arc = (2 * Math.PI) / count;
  const f = 0.15 + rand() * 0.7;
  const raw = -(index * arc + f * arc);
  const twoPi = 2 * Math.PI;
  return ((raw % twoPi) + twoPi) % twoPi;
}
