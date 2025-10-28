/**
 * Centralized application configuration.
 * All runtime constants are defined here for easy customization and maintenance.
 */

const WHEEL_SEGMENTS = [
  { label: 'Get Drunk', color: 0x8b0000 },
  { label: 'Dance Party', color: 0x4b0082 },
  { label: 'Pizza Night', color: 0x708090 },
  { label: 'Movie Marathon', color: 0x556b2f },
  { label: 'Beach Day', color: 0xff8c00 },
  { label: 'Game Night', color: 0xf5f5dc },
  { label: 'Adventure Time', color: 0x228b22 },
  { label: 'Sleep In', color: 0x2f4f4f },
];

const WHEEL_APPEARANCE = {
  innerRadius: 0.0,
  outerRadius: 3.6,
  pointerLength: 1.0,
  pointerWidth: 0.4,
  pointerColor: 0xff4500,
  pointerPosition: { x: 0, y: 4.0, z: 0.5 },
};

const LED_CONFIG = {
  ledCount: 16,
  ledRadius: 3.7,
  ledSize: 0.08,
  ledColors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
};

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

export const CONFETTI_CONFIG = {
  particleCount: 50,
  streamDuration: 10000,
  burstInterval: 200,
  colors: [
    0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x5f27cd, 0xff4757,
    0x2ed573, 0x1e90ff, 0xffa502,
  ],
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
  title: 'Decision Wheel',
  buttonText: 'SPIN THE WHEEL!',
  buttonDisabledText: 'SPINNING...',
  buttonCooldown: 2000,
};

export const SCENE_CONFIG = {
  backgroundColor: 0x0a0a0a,
  ambientLightIntensity: 0.6,
  directionalLightIntensity: 0.8,
  cameraPosition: { x: 0, y: 0, z: 12 },
  cameraFov: 50,
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
