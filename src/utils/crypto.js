/** @returns {number} uniform in [0, 1) */
export function cryptoRandomFloat() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/** @param {number} min @param {number} max @returns {number} */
export function cryptoRandomFloatRange(min, max) {
  return min + cryptoRandomFloat() * (max - min);
}

/** @param {number} range @returns {number} */
export function cryptoRandomSignedRange(range) {
  return cryptoRandomFloat() * range * 2 - range;
}

/**
 * @template T
 * @param {readonly T[]} array
 * @returns {T}
 */
export function cryptoRandomArrayElement(array) {
  return array[Math.floor(cryptoRandomFloat() * array.length)];
}
