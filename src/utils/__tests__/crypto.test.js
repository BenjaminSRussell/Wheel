import { describe, it, expect, beforeEach } from '@jest/globals';

import {
  cryptoRandomFloat,
  cryptoRandomFloatRange,
  cryptoRandomSignedRange,
  cryptoRandomArrayElement,
} from '../crypto.js';

describe('crypto utilities', () => {
  describe('cryptoRandomFloat', () => {
    it('returns a number between 0 and 1', () => {
      for (let i = 0; i < 100; i++) {
        const value = cryptoRandomFloat();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('returns a finite number', () => {
      const value = cryptoRandomFloat();
      expect(Number.isFinite(value)).toBe(true);
    });
  });

  describe('cryptoRandomFloatRange', () => {
    it('returns a number within the specified range', () => {
      const min = 5;
      const max = 10;
      for (let i = 0; i < 100; i++) {
        const value = cryptoRandomFloatRange(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
      }
    });

    it('handles equal min and max', () => {
      const value = cryptoRandomFloatRange(5, 5);
      expect(value).toBe(5);
    });

    it('handles negative ranges', () => {
      const value = cryptoRandomFloatRange(-10, -5);
      expect(value).toBeGreaterThanOrEqual(-10);
      expect(value).toBeLessThan(-5);
    });
  });

  describe('cryptoRandomSignedRange', () => {
    it('returns a number within symmetric range', () => {
      const range = 5;
      for (let i = 0; i < 100; i++) {
        const value = cryptoRandomSignedRange(range);
        expect(value).toBeGreaterThan(-range);
        expect(value).toBeLessThan(range);
      }
    });

    it('returns both positive and negative values', () => {
      let hasPositive = false;
      let hasNegative = false;

      for (let i = 0; i < 100; i++) {
        const value = cryptoRandomSignedRange(1);
        if (value > 0) hasPositive = true;
        if (value < 0) hasNegative = true;
      }

      expect(hasPositive).toBe(true);
      expect(hasNegative).toBe(true);
    });
  });

  describe('cryptoRandomArrayElement', () => {
    it('returns an element from the array', () => {
      const array = [1, 2, 3, 4, 5];
      const element = cryptoRandomArrayElement(array);
      expect(array).toContain(element);
    });

    it('handles single element arrays', () => {
      const array = [42];
      const element = cryptoRandomArrayElement(array);
      expect(element).toBe(42);
    });

    it('handles string arrays', () => {
      const array = ['a', 'b', 'c'];
      const element = cryptoRandomArrayElement(array);
      expect(typeof element).toBe('string');
      expect(array).toContain(element);
    });
  });
});

