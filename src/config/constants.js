/**
 * Application constants and configuration
 */

// Wheel configuration
export const WHEEL_CONFIG = {
  segments: [
    { label: 'Vampire', color: 0x8B0000 },
    { label: 'Witch', color: 0x4B0082 },
    { label: 'Ghost', color: 0x708090 },
    { label: 'Zombie', color: 0x556B2F },
    { label: 'Pumpkin', color: 0xFF8C00 },
    { label: 'Skeleton', color: 0xF5F5DC },
    { label: 'Frankenstein', color: 0x228B22 },
    { label: 'Werewolf', color: 0x2F4F4F },
  ],
  innerRadius: 0.0,
  outerRadius: 3.6,
  ledCount: 16,
  ledRadius: 3.7,
  ledSize: 0.08,
  ledColors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
  pointerLength: 1.0,
  pointerWidth: 0.4,
  pointerColor: 0xFF4500,
  pointerPosition: { x: 0, y: 4.0, z: 0.5 },
};

// Physics configuration
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

// Confetti configuration
export const CONFETTI_CONFIG = {
  particleCount: 30,
  streamDuration: 10000,
  burstInterval: 200,
  colors: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x5f27cd, 0xff4757, 0x2ed573, 0x1e90ff, 0xffa502],
  particleSize: 0.02,
  initialPosition: {
    xRange: 15,
    yMin: 20,
    yMax: 25,
    zRange: 10,
  },
  velocity: {
    xRange: 0.0002,
    zRange: 0.0001,
    yMin: -0.0008,
    yMax: -0.0012,
  },
  rotation: {
    range: 0.005,
  },
  physics: {
    gravity: 0.00008,
    airResistance: 0.9998,
    windEffect: 0.00002,
    turbulence: 0.00005,
    maxLife: 25,
    mouseInteraction: {
      radius: 2.0,
      strength: 0.0008,
    },
  },
  bounds: {
    yMin: -30,
  },
};
