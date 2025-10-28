import { describe, it, expect, beforeEach } from '@jest/globals';

import { SpinController } from '../SpinController.js';
import { PHYSICS_CONFIG } from '../../config/appConfig.js';

describe('SpinController', () => {
  let controller;

  beforeEach(() => {
    controller = new SpinController();
  });

  describe('constructor', () => {
    it('initializes with default values', () => {
      expect(controller.isSpinning).toBe(false);
      expect(controller.angularVelocity).toBe(0);
      expect(controller.currentAngle).toBe(0);
    });

    it('clamps friction to valid range', () => {
      const lowFriction = new SpinController({ friction: -1 });
      expect(lowFriction.friction).toBe(0);

      const highFriction = new SpinController({ friction: 2 });
      expect(highFriction.friction).toBe(1);
    });

    it('handles invalid initial angle', () => {
      const controllerInvalid = new SpinController({ initialAngle: NaN });
      expect(controllerInvalid.currentAngle).toBe(0);
    });
  });

  describe('startSpin', () => {
    it('returns false if already spinning', () => {
      controller.isSpinning = true;
      expect(controller.startSpin()).toBe(false);
    });

    it('returns true on successful spin', () => {
      expect(controller.startSpin()).toBe(true);
    });

    it('sets isSpinning to true', () => {
      controller.startSpin();
      expect(controller.isSpinning).toBe(true);
    });

    it('calls onComplete callback when provided', (done) => {
      controller.startSpin(() => {
        done();
      });
    });

    it('sets initial velocity within expected range', () => {
      controller.startSpin();
      expect(controller.angularVelocity).toBeGreaterThanOrEqual(
        PHYSICS_CONFIG.initialVelocityMin,
      );
      expect(controller.angularVelocity).toBeLessThanOrEqual(
        PHYSICS_CONFIG.initialVelocityMax,
      );
    });
  });

  describe('update', () => {
    it('returns current angle when not spinning', () => {
      expect(controller.update()).toBe(0);
    });

    it('accelerates during acceleration phase', () => {
      controller.startSpin();
      const initialVelocity = controller.angularVelocity;
      controller.update();
      expect(controller.angularVelocity).toBeGreaterThan(initialVelocity);
    });

    it('decelerates after reaching max velocity', () => {
      controller.startSpin();
      while (controller._accelerationPhase) {
        controller.update();
      }
      const maxVelocity = controller.angularVelocity;
      controller.update();
      expect(controller.angularVelocity).toBeLessThan(maxVelocity);
    });

    it('eventually stops spinning', () => {
      controller.startSpin();
      let iterations = 0;
      while (controller.isSpinning && iterations < 10000) {
        controller.update();
        iterations++;
      }
      expect(controller.isSpinning).toBe(false);
    });
  });
});

