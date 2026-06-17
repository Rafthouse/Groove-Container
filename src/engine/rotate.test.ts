import { describe, it, expect } from 'vitest';
import { rotate } from './rotate';

describe('rotate', () => {
  it('does not change an empty array', () => {
    expect(rotate([], 3)).toEqual([]);
  });

  it('does not rotate by 0', () => {
    expect(rotate([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });

  it('rotates left by positive amount', () => {
    expect(rotate([1, 2, 3, 4], 2)).toEqual([3, 4, 1, 2]);
  });

  it('rotates right by negative amount', () => {
    expect(rotate([1, 2, 3, 4], -1)).toEqual([4, 1, 2, 3]);
  });

  it('wraps around for amounts > length', () => {
    expect(rotate([1, 2, 3], 5)).toEqual([3, 1, 2]);
  });

  it('throws for non-integer amounts', () => {
    expect(() => rotate([1], 1.5)).toThrow();
  });
});
