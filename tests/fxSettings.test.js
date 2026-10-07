import {
  FX_SETTINGS_KEY,
  defaultFxSettings,
  loadFxSettings,
  playResultCue,
  saveFxSettings,
  shouldPulseLeds,
  shouldSpawnConfetti,
} from '../src/utils/fxSettings.js';

function memStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) };
}

test('reduced motion disables audio by default', () => {
  expect(defaultFxSettings(true).audio).toBe(false);
  expect(defaultFxSettings(false).audio).toBe(true);
  expect(loadFxSettings(memStorage(), true).audio).toBe(false);
});

test('user can still explicitly enable audio under reduced motion', () => {
  const s = memStorage();
  saveFxSettings({ ...defaultFxSettings(true), audio: true }, s);
  expect(loadFxSettings(s, true).audio).toBe(true);
});

test('confetti toggle disables confetti spawn', () => {
  const settings = { ...defaultFxSettings(false), confetti: false };
  expect(shouldSpawnConfetti(settings, false)).toBe(false);
  expect(shouldSpawnConfetti(defaultFxSettings(false), false)).toBe(true);
});

test('reduced motion (OS or forced) disables confetti and LED pulse', () => {
  const base = defaultFxSettings(false);
  expect(shouldSpawnConfetti(base, true)).toBe(false);
  expect(shouldPulseLeds(base, true)).toBe(false);
  const forced = { ...base, forceReducedMotion: true };
  expect(shouldSpawnConfetti(forced, false)).toBe(false);
  expect(shouldPulseLeds(forced, false)).toBe(false);
  expect(shouldPulseLeds({ ...base, ledPulse: false }, false)).toBe(false);
});

test('corrupt storage falls back to defaults', () => {
  const s = memStorage();
  s.setItem(FX_SETTINGS_KEY, '{not json');
  expect(loadFxSettings(s, false)).toEqual(defaultFxSettings(false));
});

test('playResultCue is a no-op when audio off or unsupported', () => {
  expect(playResultCue({ audio: false }, function Fake() {})).toBe(false);
  expect(playResultCue({ audio: true }, undefined)).toBe(false);
});
