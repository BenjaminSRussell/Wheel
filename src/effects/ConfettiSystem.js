import * as THREE from 'three';

import { CONFETTI_CONFIG } from '../config/appConfig.js';
import {
  cryptoRandomFloat,
  cryptoRandomFloatRange,
  cryptoRandomSignedRange,
  cryptoRandomArrayElement,
} from '../utils/crypto.js';

export class ConfettiSystem {
  constructor(scene) {
    this.scene = scene;
    this.confettiPieces = [];
    this.colors = CONFETTI_CONFIG.colors;
    this.isActive = false;
    this.startTime = 0;
    this.lastBurstTime = 0;
    this.mousePosition = { x: 0, y: 0, z: 0 };
    this.camera = null;

    this._setupMouseTracking();
  }

  setCamera(camera) {
    this.camera = camera;
  }

  _setupMouseTracking() {
    const canvas = document.querySelector('#c');
    if (canvas) {
      canvas.addEventListener('mousemove', (event) => {
        if (this.camera) {
          const mouse = new THREE.Vector2();
          mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, this.camera);

          const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
          const intersection = new THREE.Vector3();
          raycaster.ray.intersectPlane(plane, intersection);

          this.mousePosition = intersection;
        }
      });
    }
  }

  /**
   * Creates a confetti burst
   * @param {number[]} [customColors] - Optional array of hex colors to use for confetti. If not provided, uses default colors.
   */
  createConfetti(customColors = null) {
    this.clearConfetti();
    // Use custom colors if provided, otherwise fall back to default config colors
    this.activeColors = customColors && customColors.length > 0 ? customColors : this.colors;
    this.startTime = performance.now();
    this.lastBurstTime = performance.now();
    this.isActive = true;

    this._createBurst();
  }

  _createBurst() {
    for (let i = 0; i < CONFETTI_CONFIG.particleCount; i++) {
      const geometry = new THREE.BoxGeometry(
        CONFETTI_CONFIG.particleSize,
        CONFETTI_CONFIG.particleSize,
        CONFETTI_CONFIG.particleSize,
      );
      const baseColor = cryptoRandomArrayElement(this.activeColors || this.colors);
      const emissiveColor = new THREE.Color(cryptoRandomArrayElement(this.activeColors || this.colors));
      emissiveColor.multiplyScalar(0.2);
      const material = new THREE.MeshLambertMaterial({
        color: baseColor,
        emissive: emissiveColor,
        transparent: true,
        opacity: 1,
      });

      const confetti = new THREE.Mesh(geometry, material);
      confetti.position.set(
        cryptoRandomSignedRange(CONFETTI_CONFIG.initialPosition.xRange),
        CONFETTI_CONFIG.initialPosition.yMin +
          cryptoRandomFloatRange(
            0,
            CONFETTI_CONFIG.initialPosition.yMax - CONFETTI_CONFIG.initialPosition.yMin,
          ),
        cryptoRandomSignedRange(CONFETTI_CONFIG.initialPosition.zRange),
      );

      const baseMass = 0.3 + cryptoRandomFloatRange(0, 0.7);
      const baseDrag = 0.9995 + cryptoRandomFloatRange(0, 0.0003);
      const baseGravity = CONFETTI_CONFIG.physics.gravity * (0.5 + cryptoRandomFloatRange(0, 1));
      const baseWind = CONFETTI_CONFIG.physics.windEffect * (0.2 + cryptoRandomFloatRange(0, 1.6));
      const baseTurbulence =
        CONFETTI_CONFIG.physics.turbulence * (0.1 + cryptoRandomFloatRange(0, 1.8));

      confetti.userData = {
        velocity: {
          x:
            cryptoRandomSignedRange(CONFETTI_CONFIG.velocity.xRange) *
            (0.5 + cryptoRandomFloatRange(0, 1)),
          y:
            cryptoRandomFloatRange(CONFETTI_CONFIG.velocity.yMin, CONFETTI_CONFIG.velocity.yMax) *
            (0.3 + cryptoRandomFloatRange(0, 1.4)),
          z:
            cryptoRandomSignedRange(CONFETTI_CONFIG.velocity.zRange) *
            (0.5 + cryptoRandomFloatRange(0, 1)),
        },
        rotation: {
          x:
            cryptoRandomSignedRange(CONFETTI_CONFIG.rotation.range) *
            (0.2 + cryptoRandomFloatRange(0, 1.6)),
          y:
            cryptoRandomSignedRange(CONFETTI_CONFIG.rotation.range) *
            (0.2 + cryptoRandomFloatRange(0, 1.6)),
          z:
            cryptoRandomSignedRange(CONFETTI_CONFIG.rotation.range) *
            (0.2 + cryptoRandomFloatRange(0, 1.6)),
        },
        gravity: baseGravity,
        airResistance: baseDrag,
        windEffect: baseWind,
        turbulence: baseTurbulence,
        life: 1,
        maxLife: CONFETTI_CONFIG.physics.maxLife * (0.7 + cryptoRandomFloatRange(0, 0.6)),
        birthTime: performance.now(),
        mass: baseMass,
        drag: baseDrag,
        floatFrequency: 0.1 + cryptoRandomFloatRange(0, 0.3),
        floatAmplitude: 0.0001 + cryptoRandomFloatRange(0, 0.0002),
        driftDirection: cryptoRandomFloat() * Math.PI * 2,
        driftSpeed: 0.00005 + cryptoRandomFloatRange(0, 0.0001),
        windSensitivity: 0.5 + cryptoRandomFloatRange(0, 1),
        turbulenceSensitivity: 0.3 + cryptoRandomFloatRange(0, 1.4),
      };

      this.scene.add(confetti);
      this.confettiPieces.push(confetti);
    }
  }

  clearConfetti() {
    this.confettiPieces.forEach((confetti) => this.scene.remove(confetti));
    this.confettiPieces = [];
    this.isActive = false;
  }

  _applyMouseInteraction(confetti, userData) {
    const dx = confetti.position.x - this.mousePosition.x;
    const dy = confetti.position.y - this.mousePosition.y;
    const dz = confetti.position.z - this.mousePosition.z;
    const distance = Math.hypot(dx, dy, dz);

    if (distance < CONFETTI_CONFIG.physics.mouseInteraction.radius) {
      const force =
        CONFETTI_CONFIG.physics.mouseInteraction.strength *
        (1 - distance / CONFETTI_CONFIG.physics.mouseInteraction.radius);
      const angle = Math.atan2(dy, dx);

      userData.velocity.x += Math.cos(angle) * force;
      userData.velocity.y += Math.sin(angle) * force;

      userData.velocity.y += force * 0.5;
    }
  }

  update() {
    if (!this.isActive) return;

    const currentTime = performance.now();
    const elapsedSeconds = (currentTime - this.startTime) / 1000;

    if (elapsedSeconds < CONFETTI_CONFIG.streamDuration / 1000) {
      const timeSinceLastBurst = currentTime - this.lastBurstTime;
      if (timeSinceLastBurst >= CONFETTI_CONFIG.burstInterval) {
        this._createBurst();
        this.lastBurstTime = currentTime;
      }
    }

    this.confettiPieces = this.confettiPieces.filter((confetti) => {
      const userData = confetti.userData;
      const particleAge = (currentTime - userData.birthTime) / 1000;

      this._applyMouseInteraction(confetti, userData);

      userData.velocity.y -= userData.gravity * userData.mass;

      userData.velocity.x *= userData.drag;
      userData.velocity.y *= userData.drag;
      userData.velocity.z *= userData.drag;

      const floatX = Math.sin(particleAge * userData.floatFrequency) * userData.floatAmplitude;
      const floatZ =
        Math.cos(particleAge * userData.floatFrequency * 1.3) * userData.floatAmplitude * 0.7;
      userData.velocity.x += floatX;
      userData.velocity.z += floatZ;

      const driftX = Math.cos(userData.driftDirection + particleAge * 0.1) * userData.driftSpeed;
      const driftZ = Math.sin(userData.driftDirection + particleAge * 0.1) * userData.driftSpeed;
      userData.velocity.x += driftX;
      userData.velocity.z += driftZ;

      const windX =
        (Math.sin(particleAge * 0.2) * userData.windEffect +
          Math.sin(particleAge * 0.5) * userData.windEffect * 0.3 +
          Math.sin(particleAge * 0.8) * userData.windEffect * 0.1) *
        userData.windSensitivity;
      const windZ =
        (Math.cos(particleAge * 0.3) * userData.windEffect +
          Math.cos(particleAge * 0.6) * userData.windEffect * 0.2 +
          Math.cos(particleAge * 0.9) * userData.windEffect * 0.1) *
        userData.windSensitivity;

      userData.velocity.x += windX;
      userData.velocity.z += windZ;

      const turbulenceIntensity =
        userData.turbulence *
        userData.turbulenceSensitivity *
        (0.3 + Math.sin(particleAge * 1.5) * 0.4);
      userData.velocity.x += (cryptoRandomFloat() - 0.5) * turbulenceIntensity;
      userData.velocity.y += (cryptoRandomFloat() - 0.5) * turbulenceIntensity * 0.3;
      userData.velocity.z += (cryptoRandomFloat() - 0.5) * turbulenceIntensity;

      confetti.position.x += userData.velocity.x;
      confetti.position.y += userData.velocity.y;
      confetti.position.z += userData.velocity.z;

      const rotationVariation = 0.3 + Math.sin(particleAge * userData.floatFrequency) * 0.4;
      confetti.rotation.x += userData.rotation.x * rotationVariation;
      confetti.rotation.y +=
        userData.rotation.y * (0.5 + Math.cos(particleAge * userData.floatFrequency * 0.7) * 0.3);
      confetti.rotation.z +=
        userData.rotation.z * (0.7 + Math.sin(particleAge * userData.floatFrequency * 1.2) * 0.3);

      const lifeRatio = 1 - particleAge / userData.maxLife;
      confetti.material.opacity = Math.max(0, lifeRatio);

      const isAlive = confetti.position.y >= CONFETTI_CONFIG.bounds.yMin && lifeRatio > 0;
      if (!isAlive) {
        this.scene.remove(confetti);
      }

      return isAlive;
    });

    if (
      elapsedSeconds >= CONFETTI_CONFIG.streamDuration / 1000 &&
      this.confettiPieces.length === 0
    ) {
      this.isActive = false;
    }
  }
}
