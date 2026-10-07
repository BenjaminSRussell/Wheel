/** Persist editable segments + spin history (#23). */

export const STORAGE_KEY = "wheel.segments.v1";
export const HISTORY_KEY = "wheel.spinHistory.v1";
export const MIN_SEGMENTS = 2;
export const MAX_HISTORY = 50;

export function serializeSegments(segments) {
  return JSON.stringify({ version: 1, segments });
}

export function deserializeSegments(raw, _fallback) {
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.segments)) {
    throw new Error("invalid segments payload");
  }
  if (parsed.segments.length < MIN_SEGMENTS) {
    throw new Error(`need at least ${MIN_SEGMENTS} segments`);
  }
  for (const s of parsed.segments) {
    if (!s || typeof s.label !== "string" || typeof s.color !== "number") {
      throw new Error("segment requires label:string and color:number");
    }
  }
  return parsed.segments;
}

export function loadSegments(fallback, storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem?.(STORAGE_KEY);
    if (!raw) return [...fallback];
    return deserializeSegments(raw, fallback);
  } catch {
    return [...fallback];
  }
}

export function saveSegments(segments, storage = globalThis.localStorage) {
  if (segments.length < MIN_SEGMENTS) {
    throw new Error(`need at least ${MIN_SEGMENTS} segments`);
  }
  storage.setItem(STORAGE_KEY, serializeSegments(segments));
}

export function exportPreset(segments) {
  return serializeSegments(segments);
}

export function importPreset(raw) {
  return deserializeSegments(raw);
}

export function pushSpinHistory(label, storage = globalThis.localStorage) {
  let hist = [];
  try {
    hist = JSON.parse(storage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(hist)) hist = [];
  } catch {
    hist = [];
  }
  hist.unshift({ label, at: new Date().toISOString() });
  hist = hist.slice(0, MAX_HISTORY);
  storage.setItem(HISTORY_KEY, JSON.stringify(hist));
  return hist;
}

export function loadSpinHistory(storage = globalThis.localStorage) {
  try {
    const hist = JSON.parse(storage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(hist) ? hist : [];
  } catch {
    return [];
  }
}
