import { describe, it, expect } from '@jest/globals';

import { TWO_PI, normalizeAngleRad, degToRad, radToDeg } from '../math.js';

describe('math utilities', () => {
  describe('TWO_PI', () => {
    it('equals 2 * Math.PI', () => {
      expect(TWO_PI).toBe(2 * Math.PI);
    });
  });

  describe('normalizeAngleRad', () => {
    it('normalizes negative angles', () => {
      expect(normalizeAngleRad(-Math.PI)).toBe(Math.PI);
    });

    it('normalizes angles >= 2π', () => {
      expect(normalizeAngleRad(TWO_PI)).toBe(0);
      expect(normalizeAngleRad(TWO_PI * 2)).toBe(0);
    });

    it('leaves angles in range unchanged', () => {
      expect(normalizeAngleRad(Math.PI)).toBe(Math.PI);
      expect(normalizeAngleRad(Math.PI / 2)).toBe(Math.PI / 2);
    });

    it('handles very large angles', () => {
      expect(normalizeAngleRad(TWO_PI * 10)).toBeCloseTo(0, 10);
    });
  });

  describe('degToRad', () => {
    it('converts degrees to radians', () => {
      expect(degToRad(0)).toBe(0);
      expect(degToRad(90)).toBe(Math.PI / 2);
      expect(degToRad(180)).toBe(Math.PI);
      expect(degToRad(360)).toBe(TWO_PI);
    });

    it('handles negative angles', () => {
      expect(degToRad(-90)).toBe(-Math.PI / 2);
    });
  });

  describe('radToDeg', () => {
    it('converts radians to degrees', () => {
      expect(radToDeg(0)).toBe(0);
      expect(radToDeg(Math.PI / 2)).toBe(90);
      expect(radToDeg(Math.PI)).toBe(180);
      expect(radToDeg(TWO_PI)).toBe(360);
    });

    it('handles negative angles', () => {
      expect(radToDeg(-Math.PI / 2)).toBe(-90);
    });
  });

  describe('conversion consistency', () => {
    it('radToDeg and degToRad are inverses', () => {
      const degrees = 45;
      expect(radToDeg(degToRad(degrees))).toBeCloseTo(degrees, 10);

      const radians = Math.PI / 4;
      expect(degToRad(radToDeg(radians))).toBeCloseTo(radians, 10);
    });
  });
});

