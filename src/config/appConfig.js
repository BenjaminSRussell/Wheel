/**
 * Centralized application configuration.
 * All runtime constants are defined here for easy customization and maintenance.
 */

/**
 * @typedef {Object} WheelSegment
 * @property {string} label - Display name of the segment
 * @property {number} color - Hex color value (e.g., 0xff6600)
 */

/**
 * Wheel segments configuration
 * @type {WheelSegment[]}
 */
const WHEEL_SEGMENTS = [
  { label: "Haunted House", color: 0x1a0a00 },
  { label: "Pumpkin Patch", color: 0xff6600 },
  { label: "Witch's Brew", color: 0x4b0082 },
  { label: "Ghost Town", color: 0xcccccc },
  { label: "Blood Moon", color: 0x8b0000 },
  { label: "Candy Corn", color: 0xffa500 },
  { label: "Black Cat", color: 0x0a0a0a },
  { label: "Graveyard", color: 0x2f4f2f },
];

/**
 * Visual appearance configuration for the wheel
 * @type {Object}
 * @property {number} innerRadius - Inner radius of wheel segments (typically 0 for solid wheel)
 * @property {number} outerRadius - Outer radius of wheel segments (must be > innerRadius)
 * @property {number} pointerLength - Length of the pointer indicator
 * @property {number} pointerWidth - Width of the pointer indicator
 * @property {number} pointerColor - Hex color of the pointer
 * @property {Object} pointerPosition - 3D position of the pointer
 */
const WHEEL_APPEARANCE = {
  innerRadius: 0.0,
  outerRadius: 3.6,
  pointerLength: 1.0,
  pointerWidth: 0.4,
  pointerColor: 0xff4500,
  pointerPosition: { x: 0, y: 4.0, z: 0.5 },
};

/**
 * LED lighting configuration
 * @type {Object}
 * @property {number} ledCount - Number of LED lights around the rim (must be > 0)
 * @property {number} ledRadius - Distance of LEDs from center
 * @property {number} ledSize - Size of each LED light
 * @property {number[]} ledColors - Array of hex colors for LED lights
 */
const LED_CONFIG = {
  ledCount: 16,
  ledRadius: 3.7,
  ledSize: 0.08,
  ledColors: [0xff6600, 0xff4500, 0xff8c00, 0xffa500],
};

/**
 * Physics simulation configuration for wheel spinning
 * @type {Object}
 * @property {number} friction - Per-frame velocity decay (0-1, where 0.96 = 4% loss per frame)
 * @property {number} initialVelocityMin - Minimum starting velocity (rad/sec)
 * @property {number} initialVelocityMax - Maximum starting velocity (rad/sec)
 * @property {number} maxVelocityMin - Minimum peak velocity (rad/sec)
 * @property {number} maxVelocityMax - Maximum peak velocity (rad/sec)
 * @property {number} accelerationRate - Acceleration during spin-up phase (rad/sec²)
 * @property {number} minVelocityThreshold - Velocity below which wheel stops
 * @property {number} positionThreshold - Position change threshold for stop detection
 * @property {number} minTurns - Minimum complete rotations (2π radians each)
 * @property {number} maxTurns - Maximum complete rotations
 */
export const PHYSICS_CONFIG = {
  friction: 0.96,
  initialVelocityMin: 2,
  initialVelocityMax: 5,
  maxVelocityMin: 15,
  maxVelocityMax: 25,
  accelerationRate: 0.1,
  minVelocityThreshold: 0.01,
  positionThreshold: 0.001,
  minTurns: 3,
  maxTurns: 6,
};

/**
 * Confetti particle system configuration
 * @type {Object}
 * @property {number} particleCount - Total number of confetti particles
 * @property {number} streamDuration - Duration of confetti stream (milliseconds)
 * @property {number} burstInterval - Time between particle bursts (milliseconds)
 * @property {number[]} colors - Array of hex colors for particles
 * @property {number} particleSize - Size of each confetti piece
 */
export const CONFETTI_CONFIG = {
  particleCount: 50,
  streamDuration: 10000,
  burstInterval: 200,
  colors: [0xff6600, 0x8b0000, 0x4b0082, 0x000000, 0xffa500, 0x663399],
  particleSize: 0.1,
  initialPosition: {
    xRange: 8,
    yMin: 8,
    yMax: 12,
    zRange: 5,
  },
  velocity: {
    xRange: 0.002,
    zRange: 0.001,
    yMin: -0.008,
    yMax: -0.012,
  },
  rotation: {
    range: 0.05,
  },
  physics: {
    gravity: 0.0008,
    airResistance: 0.998,
    windEffect: 0.0002,
    turbulence: 0.0005,
    maxLife: 15,
    mouseInteraction: {
      radius: 2.0,
      strength: 0.0008,
    },
  },
  bounds: {
    yMin: -10,
  },
};

const ANIMATION_CONFIG = {
  frameDelta: 0.016,
  resizeDebounceMs: 100,
  ledPulseSpeed: 3.0,
  ledIntensityBase: 0.8,
};

export const UI_CONFIG = {
  title: "Decision Wheel",
  buttonText: "SPIN THE WHEEL!",
  buttonDisabledText: "SPINNING...",
  buttonCooldown: 2000,
};

export const SCENE_CONFIG = {
  backgroundColor: 0x0a0a0a,
  ambientLightIntensity: 0.6,
  directionalLightIntensity: 0.8,
  cameraPosition: { x: 0, y: -1, z: 12 }, // Slightly offset for perspective
  cameraFov: 50,
  cameraLookAt: { x: 0, y: 0, z: 0 }, // Tilt camera to look at wheel center
  wheelDepth: 0.3, // Depth extrusion for 3D effect
};

export const WHEEL_CONFIG = {
  segments: WHEEL_SEGMENTS,
  ...WHEEL_APPEARANCE,
  ...LED_CONFIG,
};

export const APP_CONFIG = {
  wheel: WHEEL_CONFIG,
  physics: PHYSICS_CONFIG,
  confetti: CONFETTI_CONFIG,
  ui: UI_CONFIG,
  scene: SCENE_CONFIG,
  animation: ANIMATION_CONFIG,
};

/**
 * Validates the application configuration
 * Throws an error if configuration is invalid
 */
export function validateConfig() {
  if (WHEEL_SEGMENTS.length === 0) {
    throw new Error('Configuration error: Must have at least one wheel segment');
  }

  for (const segment of WHEEL_SEGMENTS) {
    if (!segment.label || typeof segment.label !== 'string') {
      throw new Error('Configuration error: All segments must have a valid label');
    }
    if (typeof segment.color !== 'number') {
      throw new Error(`Configuration error: Segment "${segment.label}" has invalid color`);
    }
  }

  if (WHEEL_APPEARANCE.outerRadius <= WHEEL_APPEARANCE.innerRadius) {
    throw new Error('Configuration error: outerRadius must be greater than innerRadius');
  }

  if (WHEEL_APPEARANCE.outerRadius <= 0) {
    throw new Error('Configuration error: outerRadius must be positive');
  }

  if (LED_CONFIG.ledCount <= 0) {
    throw new Error('Configuration error: ledCount must be positive');
  }

  if (LED_CONFIG.ledColors.length === 0) {
    throw new Error('Configuration error: Must have at least one LED color');
  }

  if (PHYSICS_CONFIG.friction < 0 || PHYSICS_CONFIG.friction > 1) {
    throw new Error('Configuration error: friction must be between 0 and 1');
  }

  if (PHYSICS_CONFIG.minTurns < 0 || PHYSICS_CONFIG.maxTurns < PHYSICS_CONFIG.minTurns) {
    throw new Error('Configuration error: Invalid turn range (minTurns must be positive, maxTurns >= minTurns)');
  }

  if (CONFETTI_CONFIG.particleCount <= 0) {
    throw new Error('Configuration error: particleCount must be positive');
  }
}

validateConfig();
