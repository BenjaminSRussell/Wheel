import { WHEEL_CONFIG } from '../../config/appConfig.js';
import {
  auditSegmentContrast,
  bestTextColor,
  contrastRatio,
  relativeLuminance,
  toCssHex,
  WCAG_AA_NORMAL,
} from '../contrast.js';

describe('contrast utilities', () => {
  it('computes luminance extremes', () => {
    expect(relativeLuminance(0x000000)).toBe(0);
    expect(relativeLuminance(0xffffff)).toBeCloseTo(1, 5);
  });

  it('black on white is 21:1 and symmetric', () => {
    expect(contrastRatio(0x000000, 0xffffff)).toBeCloseTo(21, 5);
    expect(contrastRatio(0xffffff, 0x000000)).toBeCloseTo(21, 5);
  });

  it('picks dark text on light backgrounds and light text on dark', () => {
    expect(bestTextColor(0xcccccc)).toBe(0x000000);
    expect(bestTextColor(0x0a0a0a)).toBe(0xffffff);
  });

  it('formats css hex', () => {
    expect(toCssHex(0xff6600)).toBe('#ff6600');
    expect(toCssHex(0x0a0a0a)).toBe('#0a0a0a');
  });

  it('flags a mid-grey segment that fails AA with either text color', () => {
    const warnings = auditSegmentContrast([{ label: 'Mid', color: 0x777777 }], 7);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].message).toContain('Mid');
  });

  it('default palette passes WCAG AA with auto text color', () => {
    expect(auditSegmentContrast(WHEEL_CONFIG.segments, WCAG_AA_NORMAL)).toEqual([]);
  });
});
