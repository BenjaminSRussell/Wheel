/** Shared types for JSDoc-checked modules (#25). */

/** A wheel segment. `color` is a 0xRRGGBB number; `weight` defaults to 1 (#24). */
export interface Segment {
  label: string;
  color: number;
  weight?: number;
}

export interface FxSettings {
  confetti: boolean;
  ledPulse: boolean;
  forceReducedMotion: boolean;
  audio: boolean;
}

/** Minimal Storage surface used by the persistence helpers (localStorage-compatible). */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface SpinHistoryEntry {
  label: string;
  at: string;
}

export interface ContrastWarning {
  label: string;
  ratio: number;
  [key: string]: unknown;
}
