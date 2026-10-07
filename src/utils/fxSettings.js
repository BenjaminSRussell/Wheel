/** Persisted FX / audio toggles (#24, #27). */

/** @typedef {import('../types/wheel').FxSettings} FxSettings */
/** @typedef {import('../types/wheel').StorageLike} StorageLike */

export const FX_SETTINGS_KEY = 'wheel.fxSettings.v1';

export function systemPrefersReducedMotion(mm = globalThis.matchMedia) {
  try {
    return typeof mm === 'function' && mm('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Defaults: confetti + LED pulse on, forced reduced motion off.
 * Audio defaults ON unless the OS asks for reduced motion — then it defaults
 * OFF, but an explicit user choice (stored) always wins.
 */
/** @param {boolean} [prefersReducedMotion] @returns {FxSettings} */
export function defaultFxSettings(prefersReducedMotion = false) {
  return {
    confetti: true,
    ledPulse: true,
    forceReducedMotion: false,
    audio: !prefersReducedMotion,
  };
}

/**
 * @param {StorageLike | undefined} [storage]
 * @param {boolean} [prefersReducedMotion]
 * @returns {FxSettings}
 */
export function loadFxSettings(
  storage = globalThis.localStorage,
  prefersReducedMotion = systemPrefersReducedMotion(),
) {
  const defaults = defaultFxSettings(prefersReducedMotion);
  try {
    const raw = storage?.getItem?.(FX_SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    const out = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const k = /** @type {keyof FxSettings} */ (key);
      if (typeof parsed?.[k] === 'boolean') out[k] = parsed[k];
    }
    return out;
  } catch {
    return defaults;
  }
}

/** @param {FxSettings} settings @param {StorageLike} [storage] */
export function saveFxSettings(settings, storage = globalThis.localStorage) {
  storage.setItem(FX_SETTINGS_KEY, JSON.stringify(settings));
}

/** Effective motion state: OS preference OR the user's force toggle. */
/** @param {Partial<FxSettings> | null | undefined} settings @param {boolean} [prefersReducedMotion] @returns {boolean} */
export function motionReduced(settings, prefersReducedMotion = systemPrefersReducedMotion()) {
  return Boolean(prefersReducedMotion || settings?.forceReducedMotion);
}

/** @param {Partial<FxSettings> | null | undefined} settings @param {boolean} [prefersReducedMotion] @returns {boolean} */
export function shouldSpawnConfetti(settings, prefersReducedMotion = systemPrefersReducedMotion()) {
  return Boolean(settings?.confetti) && !motionReduced(settings, prefersReducedMotion);
}

/** @param {Partial<FxSettings> | null | undefined} settings @param {boolean} [prefersReducedMotion] @returns {boolean} */
export function shouldPulseLeds(settings, prefersReducedMotion = systemPrefersReducedMotion()) {
  return Boolean(settings?.ledPulse) && !motionReduced(settings, prefersReducedMotion);
}

/** Short result chime via Web Audio; no-op when audio is off or unsupported. */
/**
 * @param {Partial<FxSettings> | null | undefined} settings
 * @param {any} [AudioCtx] AudioContext constructor (injectable for tests)
 * @returns {boolean}
 */
export function playResultCue(settings, AudioCtx = globalThis.AudioContext) {
  if (!settings?.audio || typeof AudioCtx !== 'function') return false;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    osc.addEventListener('ended', () => ctx.close?.());
    return true;
  } catch {
    return false;
  }
}
