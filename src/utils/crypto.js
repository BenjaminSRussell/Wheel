export function cryptoRandomFloat() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

export function cryptoRandomFloatRange(min, max) {
  return min + cryptoRandomFloat() * (max - min);
}

export function cryptoRandomSignedRange(range) {
  return cryptoRandomFloat() * range * 2 - range;
}

export function cryptoRandomArrayElement(array) {
  return array[Math.floor(cryptoRandomFloat() * array.length)];
}
