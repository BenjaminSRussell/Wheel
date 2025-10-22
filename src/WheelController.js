import RAPIER from '@dimforge/rapier3d-compat';

/**
 * WheelController - Handles physics-based spinning with Rapier
 * Uses cryptographically secure random values and angular damping for realistic deceleration
 */
export class WheelController {
    constructor(wheel) {
        this.wheel = wheel;
        this.isSpinning = false;
        this.world = null;
        this.wheelBody = null;
        this.onSlowdown = null;
        this.onComplete = null;
        this.slowdownTriggered = false;
        this.targetAngle = 0;
        this.initialVelocity = 0;

        this._initPhysics();
    }

    /**
     * Initialize Rapier physics world and wheel body
     * @private
     */
    async _initPhysics() {
        await RAPIER.init();

        // Create physics world (no gravity needed for 2D spin)
        this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });

        // Create rigid body for the wheel
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setAngularDamping(0.8) // High damping for smooth slowdown
            .setCanSleep(false);

        this.wheelBody = this.world.createRigidBody(bodyDesc);

        console.log('Rapier physics initialized');
    }

    /**
     * Start a new spin with cryptographically random target
     * @param {Object} options
     * @param {number} options.duration - Total spin duration in seconds
     * @param {Function} options.onSlowdown - Callback when wheel starts slowing
     * @param {Function} options.onComplete - Callback when spin completes
     */
    spin({ duration, onSlowdown, onComplete }) {
        if (this.isSpinning || !this.wheelBody) return;

        this.isSpinning = true;
        this.onSlowdown = onSlowdown;
        this.onComplete = onComplete;
        this.slowdownTriggered = false;

        // Use crypto.getRandomValues for secure randomness
        const randomArray = new Uint32Array(2);
        window.crypto.getRandomValues(randomArray);

        // Generate random target angle (5-10 full rotations plus random final position)
        const fullSpins = 5 + (randomArray[0] / 0xFFFFFFFF) * 5;
        const randomFinalAngle = (randomArray[1] / 0xFFFFFFFF) * Math.PI * 2;
        this.targetAngle = (fullSpins * Math.PI * 2) + randomFinalAngle;

        // Calculate initial angular velocity based on target and duration
        // Using simplified physics: we want to reach targetAngle with damping
        // Higher initial velocity for longer spins
        this.initialVelocity = (this.targetAngle / duration) * 1.5;

        // Set the angular velocity on the Z-axis
        this.wheelBody.setAngvel({ x: 0, y: 0, z: this.initialVelocity }, true);

        this.startTime = performance.now();
        this.duration = duration * 1000;

        console.log(`Spin started: target=${this.targetAngle.toFixed(2)}rad, velocity=${this.initialVelocity.toFixed(2)}rad/s`);
    }

    /**
     * Update physics simulation
     * @param {number} currentTime - Current time from performance.now()
     */
    update(currentTime) {
        if (!this.world || !this.wheelBody) return;

        // Step physics simulation (60Hz timestep for smooth simulation)
        this.world.timestep = 1/60;
        this.world.step();

        if (!this.isSpinning) return;

        // Get current rotation from physics body
        const rotation = this.wheelBody.rotation();
        const currentAngle = this._quaternionToEulerZ(rotation);

        // Update visual wheel rotation
        this.wheel.updateRotation(currentAngle);

        // Get current angular velocity
        const angvel = this.wheelBody.angvel();
        const currentVelocity = Math.abs(angvel.z);

        // Calculate progress
        const elapsed = currentTime - this.startTime;
        const progress = elapsed / this.duration;

        // Trigger slowdown effect at 75% progress
        if (progress > 0.75 && !this.slowdownTriggered) {
            this.slowdownTriggered = true;
            this.onSlowdown?.();
        }

        // Check if wheel has nearly stopped (velocity threshold)
        if (currentVelocity < 0.05 && progress > 0.5) {
            this._stopSpin(currentAngle);
        }

        // Failsafe: stop after duration even if still moving
        if (progress >= 1) {
            this._stopSpin(currentAngle);
        }
    }

    /**
     * Stop the spin and trigger completion callback
     * @private
     */
    _stopSpin(finalAngle) {
        if (!this.isSpinning) return;

        this.isSpinning = false;

        // Stop the wheel completely
        this.wheelBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

        console.log(`Spin complete: final angle=${finalAngle.toFixed(2)}rad`);
        this.onComplete?.(finalAngle);
    }

    /**
     * Convert quaternion to Euler Z rotation
     * @private
     */
    _quaternionToEulerZ(q) {
        // For rotation around Z-axis only
        const sinr_cosp = 2 * (q.w * q.z + q.x * q.y);
        const cosr_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        return Math.atan2(sinr_cosp, cosr_cosp);
    }

    /**
     * Reset wheel to zero rotation
     */
    reset() {
        if (this.wheelBody) {
            this.wheelBody.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true);
            this.wheelBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        this.wheel.updateRotation(0);
        this.isSpinning = false;
    }
}
