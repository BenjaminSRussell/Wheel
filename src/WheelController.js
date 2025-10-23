import RAPIER from '@dimforge/rapier3d-compat';

// WheelController - Handles physics-based spinning with Rapier
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

    async _initPhysics() {
        await RAPIER.init();

        this.world = new RAPIER.World({ x: 0, y: 0, z: 0 });

        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setAngularDamping(0.8)
            .setCanSleep(false);

        this.wheelBody = this.world.createRigidBody(bodyDesc);

        console.log('Rapier physics initialized');
    }

    spin({ duration, onSlowdown, onComplete }) {
        if (this.isSpinning || !this.wheelBody) return;

        this.isSpinning = true;
        this.onSlowdown = onSlowdown;
        this.onComplete = onComplete;
        this.slowdownTriggered = false;

        const randomArray = new Uint32Array(2);
        window.crypto.getRandomValues(randomArray);

        const fullSpins = 5 + (randomArray[0] / 0xFFFFFFFF) * 5;
        const randomFinalAngle = (randomArray[1] / 0xFFFFFFFF) * Math.PI * 2;
        this.targetAngle = (fullSpins * Math.PI * 2) + randomFinalAngle;

        this.initialVelocity = (this.targetAngle / duration) * 1.5;

        this.wheelBody.setAngvel({ x: 0, y: 0, z: this.initialVelocity }, true);

        this.startTime = performance.now();
        this.duration = duration * 1000;

        console.log(`Spin started: target=${this.targetAngle.toFixed(2)}rad, velocity=${this.initialVelocity.toFixed(2)}rad/s`);
    }

    update(currentTime) {
        if (!this.world || !this.wheelBody) return;

        this.world.timestep = 1/60;
        this.world.step();

        if (!this.isSpinning) return;

        const rotation = this.wheelBody.rotation();
        const currentAngle = this._quaternionToEulerZ(rotation);

        this.wheel.updateRotation(currentAngle);

        const angvel = this.wheelBody.angvel();
        const currentVelocity = Math.abs(angvel.z);

        const elapsed = currentTime - this.startTime;
        const progress = elapsed / this.duration;

        if (progress > 0.75 && !this.slowdownTriggered) {
            this.slowdownTriggered = true;
            this.onSlowdown?.();
        }

        if (currentVelocity < 0.05 && progress > 0.5) {
            this._stopSpin(currentAngle);
        }

        if (progress >= 1) {
            this._stopSpin(currentAngle);
        }
    }

    _stopSpin(finalAngle) {
        if (!this.isSpinning) return;

        this.isSpinning = false;

        this.wheelBody.setAngvel({ x: 0, y: 0, z: 0 }, true);

        console.log(`Spin complete: final angle=${finalAngle.toFixed(2)}rad`);
        this.onComplete?.(finalAngle);
    }

    _quaternionToEulerZ(q) {
        const sinr_cosp = 2 * (q.w * q.z + q.x * q.y);
        const cosr_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
        return Math.atan2(sinr_cosp, cosr_cosp);
    }

    reset() {
        if (this.wheelBody) {
            this.wheelBody.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true);
            this.wheelBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
        }
        this.wheel.updateRotation(0);
        this.isSpinning = false;
    }
}
