import { PHYSICS_CONFIG } from '../config/appConfig.js';
import { cryptoRandomFloat } from '../utils/crypto.js';
import { TWO_PI, normalizeAngleRad, degToRad, radToDeg } from '../utils/math.js';

export class SpinController {
  constructor({ initialAngle = 0, friction = PHYSICS_CONFIG.friction } = {}) {
    this.friction = Math.max(0, Math.min(1, friction));
    this.currentAngle = Number.isFinite(initialAngle) ? initialAngle : 0;
    this.angularVelocity = 0;

    this.isSpinning = false;
    this._rotationAccumulated = 0;
    this._totalRotationNeeded = 0;
    this._targetAngleAbsolute = initialAngle;
    this._finalAngleDeg = 0;
    this._onComplete = null;
    this._maxVelocity = 0;
    this._accelerationPhase = true;

    this._rafId = null;
    this._boundTick = this._tick.bind(this);
  }

  startSpin(onComplete) {
    if (this.isSpinning) {
      return false;
    }

    const finalAngleDeg = this._randomFinalAngleDeg();
    const finalAngleRad = degToRad(finalAngleDeg);
    const initialVelocity = this._randomInitialVelocity();

    const currentNormalized = normalizeAngleRad(this.currentAngle);
    let deltaToTarget = finalAngleRad - currentNormalized;
    while (deltaToTarget <= 0) {
      deltaToTarget += TWO_PI;
    }

    const { minTurns, maxTurns } = PHYSICS_CONFIG;
    const extraTurns = minTurns + Math.floor(cryptoRandomFloat() * (maxTurns - minTurns));
    this._totalRotationNeeded = deltaToTarget + extraTurns * TWO_PI;
    this._targetAngleAbsolute = this.currentAngle + this._totalRotationNeeded;

    this._rotationAccumulated = 0;
    this._finalAngleDeg = finalAngleDeg;
    this.angularVelocity = initialVelocity;
    this._maxVelocity =
      PHYSICS_CONFIG.maxVelocityMin +
      cryptoRandomFloat() * (PHYSICS_CONFIG.maxVelocityMax - PHYSICS_CONFIG.maxVelocityMin);
    this._accelerationPhase = true;
    this.isSpinning = true;
    this._onComplete = typeof onComplete === 'function' ? onComplete : null;

    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
    }
    this._rafId = requestAnimationFrame(this._boundTick);
    return true;
  }

  update() {
    if (!this.isSpinning) {
      return this.currentAngle;
    }

    if (this._accelerationPhase && this.angularVelocity < this._maxVelocity) {
      this.angularVelocity += PHYSICS_CONFIG.accelerationRate;
      if (this.angularVelocity >= this._maxVelocity) {
        this._accelerationPhase = false;
      }
    } else {
      this.angularVelocity *= this.friction;
    }

    this.currentAngle += this.angularVelocity;
    this._rotationAccumulated += this.angularVelocity;

    const remaining = this._totalRotationNeeded - this._rotationAccumulated;
    const velocityLow = Math.abs(this.angularVelocity) < PHYSICS_CONFIG.minVelocityThreshold;
    const closeEnough = remaining <= PHYSICS_CONFIG.positionThreshold;

    if ((remaining <= 0 && velocityLow) || (closeEnough && velocityLow)) {
      this.currentAngle = this._targetAngleAbsolute;
      this.angularVelocity = 0;
      this.isSpinning = false;
      this._rotationAccumulated = this._totalRotationNeeded;

      const finalAngleDeg = radToDeg(normalizeAngleRad(this.currentAngle));
      const callback = this._onComplete;
      this._onComplete = null;
      if (callback) {
        callback(finalAngleDeg);
      }
    }

    return this.currentAngle;
  }

  _tick() {
    this.update();
    if (this.isSpinning) {
      this._rafId = requestAnimationFrame(this._boundTick);
    } else {
      this._rafId = null;
    }
  }

  _randomFinalAngleDeg() {
    return cryptoRandomFloat() * 360;
  }

  _randomInitialVelocity() {
    return (
      PHYSICS_CONFIG.initialVelocityMin +
      cryptoRandomFloat() * (PHYSICS_CONFIG.initialVelocityMax - PHYSICS_CONFIG.initialVelocityMin)
    );
  }
}
