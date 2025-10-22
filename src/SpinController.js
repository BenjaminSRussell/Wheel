const TWO_PI = Math.PI * 2;
const RAND_BUFFER = new Uint32Array(1);

/**
 * Controls spinning behaviour for the cartoon wheel.
 */
export class SpinController {
    /**
     * @param {object} [config]
     * @param {number} [config.initialAngle=0] - Starting angle in radians.
     * @param {number} [config.friction=0.96] - Per-frame friction multiplier.
     */
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

        this._rafId = null;
        this._crypto = this._resolveCrypto();
        this._boundTick = this._tick.bind(this);
    }

    /**
     * Starts a new spin if one is not already in progress.
     * @param {(finalAngle: number) => void} [onComplete]
     * @returns {boolean} True when the spin starts, false if another spin is active.
     */
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

        const extraTurns = 3 + Math.floor(this._cryptoRandomFloat() * 3); // 3–5 additional turns.
        this._totalRotationNeeded = deltaToTarget + extraTurns * TWO_PI;
        this._targetAngleAbsolute = this.currentAngle + this._totalRotationNeeded;

        this._rotationAccumulated = 0;
        this._finalAngleDeg = finalAngleDeg;
        this.angularVelocity = initialVelocity;
        this.isSpinning = true;
        this._onComplete = typeof onComplete === 'function' ? onComplete : null;

        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this._rafId = requestAnimationFrame(this._boundTick);
        return true;
    }

    /**
     * Updates the current angle using the configured friction model.
     * @returns {number} The latest wheel angle in radians.
     */
    update() {
        if (!this.isSpinning) {
            return this.currentAngle;
        }

        this.currentAngle += this.angularVelocity;
        this._rotationAccumulated += this.angularVelocity;

        this.angularVelocity *= this.friction;

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
        return 10 + this._cryptoRandomFloat() * 10;
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
