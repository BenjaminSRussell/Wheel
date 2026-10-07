import { PHYSICS_CONFIG } from '../../config/appConfig.js';
import { SpinController } from '../SpinController.js';

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
      const controllerInvalid = new SpinController({
        initialAngle: Number.NaN,
      });
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

    it('calls onComplete callback when provided', () => {
      // Drive frames synchronously: rAF timing in jsdom made this flaky.
      let calls = 0;
      controller.startSpin(() => {
        calls += 1;
      });
      for (let i = 0; i < 100_000 && controller.isSpinning; i += 1) controller.update();
      expect(calls).toBe(1);
    });

    it('lands on the weighted segment when weights are set', () => {
      controller.setSegmentWeights([0, 1, 0, 0]);
      let landed;
      controller.startSpin((deg) => {
        landed = deg;
      });
      expect(controller.lastTargetIndex).toBe(1);
      for (let i = 0; i < 100_000 && controller.isSpinning; i += 1) controller.update();
      const rad = (landed * Math.PI) / 180;
      const arc = (2 * Math.PI) / 4;
      // Segment 1 straddles 0 after rotation: rotation in (-(2*arc), -arc] mod 2π.
      const norm = ((-rad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      expect(norm).toBeGreaterThan(arc);
      expect(norm).toBeLessThan(2 * arc);
    });

    it('sets initial velocity within expected range', () => {
      controller.startSpin();
      expect(controller.angularVelocity).toBeGreaterThanOrEqual(PHYSICS_CONFIG.initialVelocityMin);
      expect(controller.angularVelocity).toBeLessThanOrEqual(PHYSICS_CONFIG.initialVelocityMax);
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
