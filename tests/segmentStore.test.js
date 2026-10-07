import {
  MIN_SEGMENTS,
  deserializeSegments,
  exportPreset,
  importPreset,
  serializeSegments,
} from '../src/utils/segmentStore.js';

const sample = [
  { label: 'A', color: 0xff0000 },
  { label: 'B', color: 0x00ff00 },
];

test('serialize round-trip', () => {
  const raw = serializeSegments(sample);
  expect(deserializeSegments(raw)).toEqual(sample);
  expect(importPreset(exportPreset(sample))).toEqual(sample);
});

test('rejects fewer than min segments', () => {
  expect(() =>
    deserializeSegments(JSON.stringify({ version: 1, segments: [{ label: 'x', color: 1 }] })),
  ).toThrow(String(MIN_SEGMENTS));
});

test('segments accept optional non-negative weight', () => {
  const raw = serializeSegments([
    { label: 'A', color: 1, weight: 3 },
    { label: 'B', color: 2 },
  ]);
  expect(deserializeSegments(raw)[0].weight).toBe(3);
  expect(() =>
    deserializeSegments(
      serializeSegments([
        { label: 'A', color: 1, weight: -1 },
        { label: 'B', color: 2 },
      ]),
    ),
  ).toThrow();
});
