const TWO_PI = Math.PI * 2;
const RAND_BUFFER = new Uint32Array(1);

// Controls wheel spinning behavior
export class SpinController {
  constructor({ initialAngle = 0, friction = 0.96 } = {}) {
    this.friction = friction;
    this.currentAngle = initialAngle;
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
    this._crypto = this._resolveCrypto();
    this._boundTick = this._tick.bind(this);
  }

  // Start spin with callback on completion
  startSpin(onComplete) {
    if (this.isSpinning) {
      return false;
    }

    const finalAngleDeg = this._randomFinalAngleDeg();
    const finalAngleRad = this._degToRad(finalAngleDeg);
    const initialVelocity = this._randomInitialVelocity();

    const currentNormalized = this._normalizeAngleRad(this.currentAngle);
    let deltaToTarget = finalAngleRad - currentNormalized;
    while (deltaToTarget <= 0) {
      deltaToTarget += TWO_PI;
    }

    const extraTurns = 3 + Math.floor(this._cryptoRandomFloat() * 3);
    this._totalRotationNeeded = deltaToTarget + extraTurns * TWO_PI;
    this._targetAngleAbsolute = this.currentAngle + this._totalRotationNeeded;

    this._rotationAccumulated = 0;
    this._finalAngleDeg = finalAngleDeg;
    this.angularVelocity = initialVelocity;
    this._maxVelocity = 15 + this._cryptoRandomFloat() * 10;
    this._accelerationPhase = true;
    this.isSpinning = true;
    this._onComplete = typeof onComplete === 'function' ? onComplete : null;

    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._rafId = requestAnimationFrame(this._boundTick);
    return true;
  }

  // Update angle with physics
  update() {
    if (!this.isSpinning) {
      return this.currentAngle;
    }

    if (this._accelerationPhase && this.angularVelocity < this._maxVelocity) {
      this.angularVelocity += 0.1;
      if (this.angularVelocity >= this._maxVelocity) {
        this._accelerationPhase = false;
      }
    } else {
      this.angularVelocity *= this.friction;
    }

    this.currentAngle += this.angularVelocity;
    this._rotationAccumulated += this.angularVelocity;

    const remaining = this._totalRotationNeeded - this._rotationAccumulated;
    const velocityLow = Math.abs(this.angularVelocity) < 0.01;
    const closeEnough = remaining <= 0.001;

    if ((remaining <= 0 && velocityLow) || (closeEnough && velocityLow)) {
      this.currentAngle = this._targetAngleAbsolute;
      this.angularVelocity = 0;
      this.isSpinning = false;
      this._rotationAccumulated = this._totalRotationNeeded;

      const finalAngleDeg = this._radToDeg(this._normalizeAngleRad(this.currentAngle));
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
    return this._cryptoRandomFloat() * 360;
  }

  _randomInitialVelocity() {
    return 2 + this._cryptoRandomFloat() * 3; // Start slower
  }

  _cryptoRandomFloat() {
    this._crypto.getRandomValues(RAND_BUFFER);
    return RAND_BUFFER[0] / 4294967296;
  }

  _resolveCrypto() {
    const cryptoObj = globalThis.crypto || globalThis.msCrypto;
    if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
      throw new Error('crypto.getRandomValues() is required for SpinController.');
    }
    return cryptoObj;
  }

  _normalizeAngleRad(angle) {
    return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
  }

  _degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  _radToDeg(radians) {
    return (radians * 180) / Math.PI;
  }
}
