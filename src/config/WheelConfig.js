export const WHEEL_CONFIG = {
  // Wheel Physical Dimensions (units = meters for Three.js)
  radius: 4.5,              // Total wheel radius
  depth: 0.15,              // Slight 3D depth for shadow casting
  centerHoleRadius: 0.6,    // Center hub cutout
  
  // Segment Configuration (DYNAMIC - user can modify)
  segments: [
    {
      id: 'outer',
      labels: ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6', 'Prize 7', 'Prize 8'],
      colors: [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8, 0xF7DC6F, 0xBB8FCE, 0x85C1E2],
      innerRadius: 2.5,
      outerRadius: 4.5
    },
    {
      id: 'inner',
      labels: ['X1', 'X2', 'X3', 'X4'],
      colors: [0xE74C3C, 0x3498DB, 0x2ECC71, 0xF39C12],
      innerRadius: 0.6,
      outerRadius: 2.5
    }
  ],
  
  // Rim/Border Configuration
  rim: {
    width: 0.15,
    color: 0xFFD700,        // Gold
    metalness: 0.9,
    roughness: 0.1,
    emissiveIntensity: 0.3
  },
  
  // LED Light Configuration (around rim)
  leds: {
    count: 48,
    radius: 4.65,           // Slightly outside rim
    size: 0.08,
    colors: [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF],
    pulseSpeed: 3.0,        // Hz
    emissiveIntensity: 2.5
  },
  
  // Pointer/Arrow Configuration
  pointer: {
    length: 1.2,
    width: 0.4,
    color: 0xFF0000,
    position: { x: 0, y: 5.2, z: 0.5 },
    emissiveIntensity: 0.8
  },
  
  // Material Properties
  materials: {
    segments: {
      roughness: 0.3,
      metalness: 0.1,
      emissiveIntensity: 0.2
    }
  },
  
  // Lighting Configuration
  lighting: {
    ambient: {
      color: 0xFFFFFF,
      intensity: 0.4
    },
    directional: {
      color: 0xFFFFFF,
      intensity: 1.2,
      position: { x: 5, y: 5, z: 10 }
    },
    spotlight: {
      color: 0xFFFFFF,
      intensity: 2.0,
      position: { x: 0, y: 0, z: 10 },
      angle: Math.PI / 6,
      penumbra: 0.3
    }
  },
  
  // Bloom Post-Processing
  bloom: {
    strength: 1.5,
    radius: 0.5,
    threshold: 0.3
  }
};
