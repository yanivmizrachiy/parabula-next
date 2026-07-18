import { describe, expect, it } from 'vitest';
import {
  areEquivalentRatios,
  fractionOfWhole,
  proportionalValue,
  simplifyRatio,
  solvePositiveRatioProduct,
  splitByRatio,
  splitWholeItems,
} from '@/lib/ratioMath';

describe('ratio mathematics', () => {
  it('simplifies and compares ratios exactly', () => {
    expect(simplifyRatio(12, 18)).toEqual([2, 3]);
    expect(areEquivalentRatios([7, 3], [21, 9])).toBe(true);
    expect(areEquivalentRatios([7, 3], [9, 21])).toBe(false);
  });

  it('splits whole objects only when every share is integral', () => {
    expect(splitWholeItems(54, [4, 5])).toEqual([24, 30]);
    expect(splitWholeItems(63, [2, 1])).toEqual([42, 21]);
    expect(() => splitWholeItems(15, [10, 3])).toThrow(/whole items/);
  });

  it('supports continuous quantities without pretending they are whole objects', () => {
    expect(splitByRatio(560, [3, 5])).toEqual([210, 350]);
    expect(proportionalValue(35, 7, 2)).toBe(10);
  });

  it('solves positive ratio-product problems', () => {
    expect(solvePositiveRatioProduct(4, 9, 144)).toEqual([8, 18]);
  });

  it('converts part-to-whole relationships to reduced fractions', () => {
    expect(fractionOfWhole(12, 30)).toEqual([2, 5]);
    expect(() => fractionOfWhole(11, 6)).toThrow(/part/);
  });
});
