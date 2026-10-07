export const TWO_PI = 2 * Math.PI;

/** @param {number} angle @returns {number} */
export function normalizeAngleRad(angle) {
  while (angle < 0) angle += TWO_PI;
  while (angle >= TWO_PI) angle -= TWO_PI;
  return angle;
}

/** @param {number} degrees @returns {number} */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/** @param {number} radians @returns {number} */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}
