import * as THREE from 'three';

const RANDOM_BUFFER = new Uint32Array(1);

// 2D particle system for confetti effects
export class ConfettiSystem {
  constructor(scene) {
    this.scene = scene;
    this.confettiPieces = [];
    this.colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x5f27cd];
    this.isActive = false;
    this.startTime = 0;
    this._crypto = this._resolveCrypto();
  }

  createConfetti() {
    this.clearConfetti();

    for (let i = 0; i < 80; i++) {
      const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
      const baseColor = this._randomArrayElement(this.colors);
      const emissiveColor = new THREE.Color(this._randomArrayElement(this.colors));
      emissiveColor.multiplyScalar(0.3);
      const material = new THREE.MeshLambertMaterial({
        color: baseColor,
        emissive: emissiveColor,
        transparent: true,
        opacity: 1,
      });

      const confetti = new THREE.Mesh(geometry, material);
      confetti.position.set(
        this._randomSignedRange(20),
        10 + this._randomInRange(0, 2),
        this._randomInRange(-3, 3),
      );

      confetti.userData = {
        velocity: {
          x: this._randomSignedRange(0.02),
          y: 0,
          z: this._randomSignedRange(0.01),
        },
        rotation: {
          x: this._randomSignedRange(0.02),
          y: this._randomSignedRange(0.02),
          z: this._randomSignedRange(0.02),
        },
        gravity: 0.001,
        airResistance: 0.999,
        life: 1,
        maxLife: 5,
      };

      this.scene.add(confetti);
      this.confettiPieces.push(confetti);
    }

    this.isActive = true;
    this.startTime = performance.now();
  }

  clearConfetti() {
    this.confettiPieces.forEach((confetti) => this.scene.remove(confetti));
    this.confettiPieces = [];
    this.isActive = false;
  }

  update() {
    if (!this.isActive) return;

    const elapsedSeconds = (performance.now() - this.startTime) / 1000;
    if (elapsedSeconds >= 5) {
      this.clearConfetti();
      return;
    }

    this.confettiPieces = this.confettiPieces.filter((confetti) => {
      const userData = confetti.userData;

      userData.velocity.y -= userData.gravity;
      userData.velocity.x *= userData.airResistance;
      userData.velocity.z *= userData.airResistance;

      confetti.position.x += userData.velocity.x;
      confetti.position.y += userData.velocity.y;
      confetti.position.z += userData.velocity.z;

      confetti.rotation.x += userData.rotation.x;
      confetti.rotation.y += userData.rotation.y;
      confetti.rotation.z += userData.rotation.z;

      const lifeRatio = 1 - elapsedSeconds / userData.maxLife;
      confetti.material.opacity = Math.max(0, lifeRatio);

      const isAlive = confetti.position.y >= -12 && lifeRatio > 0;
      if (!isAlive) {
        this.scene.remove(confetti);
      }

      return isAlive;
    });
  }

  _randomFloat() {
    this._crypto.getRandomValues(RANDOM_BUFFER);
    return RANDOM_BUFFER[0] / 4294967296;
  }

  _randomInRange(min, max) {
    return min + this._randomFloat() * (max - min);
  }

  _randomSignedRange(range) {
    return (this._randomFloat() - 0.5) * 2 * range;
  }

  _randomArrayElement(array) {
    if (array.length === 0) {
      throw new Error('Cannot choose a random element from an empty array.');
    }
    const index = Math.floor(this._randomFloat() * array.length);
    return array[index];
  }

  _resolveCrypto() {
    const cryptoObj = globalThis.crypto || globalThis.msCrypto;
    if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
      throw new Error('crypto.getRandomValues() is required for ConfettiSystem.');
    }
    return cryptoObj;
  }
}
