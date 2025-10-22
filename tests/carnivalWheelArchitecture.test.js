import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { SpinController } from '../src/SpinController.js';

// Preserve existing globals to restore between tests.
const originalRAF = globalThis.requestAnimationFrame;
const originalCancelRAF = globalThis.cancelAnimationFrame;

/** @type {Array<Function>} */
let scheduledFrames = [];

beforeEach(() => {
    scheduledFrames = [];
    globalThis.requestAnimationFrame = (cb) => {
        scheduledFrames.push(cb);
        return scheduledFrames.length; // simple handle
    };
    globalThis.cancelAnimationFrame = (id) => {
        const index = id - 1;
        if (scheduledFrames[index]) {
            scheduledFrames[index] = () => {};
        }
    };
});

afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCancelRAF;
    scheduledFrames = [];
});

function drainAnimationFrames(limit = 2000) {
    let iterations = 0;
    while (scheduledFrames.length && iterations < limit) {
        const next = scheduledFrames.shift();
        if (typeof next === 'function') {
            next(performance.now());
        }
        iterations++;
    }
}

test('SpinController prevents concurrent spins', () => {
    const controller = new SpinController();
    const first = controller.startSpin();
    const second = controller.startSpin();

    assert.equal(first, true, 'First spin should start');
    assert.equal(second, false, 'Second spin should be rejected while spinning');
});

test('SpinController eventually stops and reports final angle', () => {
    const controller = new SpinController();
    let reportedAngle = null;

    const started = controller.startSpin((angle) => {
        reportedAngle = angle;
    });
    assert.equal(started, true, 'Spin should start successfully');

    let safety = 0;
    while (controller.isSpinning && safety < 5000) {
        drainAnimationFrames();
        controller.update();
        safety++;
    }

    assert.equal(controller.isSpinning, false, 'Spin should complete within safety iterations');
    assert.notEqual(reportedAngle, null, 'Completion callback should provide final angle');
    assert.ok(reportedAngle >= 0 && reportedAngle < 360, 'Final angle should be normalized between 0 and 360');
});

test('SpinController reduces angular velocity each update', () => {
    const controller = new SpinController({ initialAngle: 0 });
    controller.angularVelocity = 15;
    controller.isSpinning = true;
    controller._totalRotationNeeded = Infinity;

    const before = controller.angularVelocity;
    controller.update();
    const after = controller.angularVelocity;

    assert.ok(after < before, 'Friction should reduce angular velocity');
});

// Architecture placeholders grounded in the immersive 3D Carnival Wheel specification.
test('WheelController integrates Rapier angular damping', { todo: true });
test('VisualEffects module triggers bloom and particle bursts on spin events', { todo: true });
test('AudioManager cross-fades carnival tracks on spin start and stop', { todo: true });
test('FullscreenLauncher requests fullscreen with user gesture', { todo: true });
