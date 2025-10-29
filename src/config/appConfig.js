/**
 * Centralized application configuration.
 * All runtime constants are defined here for easy customization and maintenance.
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
  ledColors: [0xff6600, 0xff4500, 0xff8c00, 0xffa500],
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
