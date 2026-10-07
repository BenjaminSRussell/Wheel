import { angleForSegmentIndex, pickWeightedIndex } from '../src/utils/weighted.js';

// Mirrors Wheel.getCurrentSegment(): the segment whose arc straddles 0 after rotation.
function segmentUnderPointer(angle, count) {
  const twoPi = 2 * Math.PI;
  const arc = twoPi / count;
  for (let i = 0; i < count; i += 1) {
    const s = (((i * arc + angle) % twoPi) + twoPi) % twoPi;
    const e = ((((i + 1) * arc + angle) % twoPi) + twoPi) % twoPi;
    if (s > e) return i;
  }
  return -1;
}

test('weight 3 segment is ~3x more likely over 1000 spins', () => {
  const counts = [0, 0];
  for (let i = 0; i < 1000; i += 1) counts[pickWeightedIndex([3, 1])] += 1;
  const ratio = counts[0] / counts[1];
  expect(ratio).toBeGreaterThan(2.2);
  expect(ratio).toBeLessThan(4.2);
});

test('zero weights fall back to uniform and stay in range', () => {
  for (let i = 0; i < 50; i += 1) {
    const idx = pickWeightedIndex([0, 0, 0]);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(3);
  }
});

test('zero-weight segment is never picked', () => {
  for (let i = 0; i < 200; i += 1) expect(pickWeightedIndex([1, 0, 1])).not.toBe(1);
});

test('angleForSegmentIndex lands the chosen segment under the pointer', () => {
  for (const count of [2, 5, 8, 12]) {
    for (let idx = 0; idx < count; idx += 1) {
      for (let k = 0; k < 10; k += 1) {
        expect(segmentUnderPointer(angleForSegmentIndex(idx, count), count)).toBe(idx);
      }
    }
  }
});
