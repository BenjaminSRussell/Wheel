/**
 * Easing functions for smooth animations
 * All functions take a normalized time value t ∈ [0, 1] and return eased value
 */

/**
 * Ease out cubic: fast start, slow end
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

/**
 * Ease in cubic: slow start, fast end
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value
 */
export function easeInCubic(t) {
  return t ** 3;
}

/**
 * Ease in-out cubic: slow start and end, fast middle
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value
 */
export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t ** 3
    : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Ease out quad: fast start, gradual slowdown
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutQuad(t) {
  return 1 - (1 - t) ** 2;
}

/**
 * Ease out back: overshoots then settles
 * Perfect for bouncy wheel stop effect
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value (may exceed 1.0 temporarily for overshoot)
 */
export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

/**
 * Ease in back: anticipation before movement
 * Good for wheel start
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value (may go below 0 temporarily for anticipation)
 */
export function easeInBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t ** 3 - c1 * t ** 2;
}

/**
 * Ease out elastic: spring-like bounce at end
 * @param {number} t - Normalized time (0 to 1)
 * @returns {number} Eased value
 */
export function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
