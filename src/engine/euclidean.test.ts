import { describe, it, expect } from 'vitest';
import { euclid } from './euclidean';

describe('euclid', () => {
  it('produces correct number of onsets for E(4, 16)', () => {
    const result = euclid(4, 16);
    expect(result).toHaveLength(4);
    result.forEach((on) => {
      expect(on.position).toBeGreaterThanOrEqual(0);
      expect(on.position).toBeLessThan(16);
      expect(on.index).toBeGreaterThanOrEqual(0);
    });
  });

  it('returns empty array for 0 hits', () => {
    expect(euclid(0, 16)).toEqual([]);
  });

  it('returns all steps for hits >= steps', () => {
    const result = euclid(16, 16);
    expect(result).toHaveLength(16);
    expect(result[0].position).toBe(0);
    expect(result[15].position).toBe(15);
  });

  it('handles E(3, 8) — tresillo', () => {
    const result = euclid(3, 8);
    expect(result).toHaveLength(3);
    // Tresillo is E(3,8): positions should be [0, 3, 6] or similar even spacing
    const positions = result.map((r) => r.position);
    expect(positions).toContain(0);
    // The first onset should be at position 0 (canonical rotation)
    expect(result[0].position).toBe(0);
  });

  it('handles E(5, 16) — son clave', () => {
    const result = euclid(5, 16);
    expect(result).toHaveLength(5);
    const positions = result.map((r) => r.position);
    expect(positions).toContain(0);
  });

  it('throws for non-positive steps', () => {
    expect(() => euclid(1, 0)).toThrow();
    expect(() => euclid(1, -1)).toThrow();
  });

  it('throws for negative hits', () => {
    expect(() => euclid(-1, 16)).toThrow();
  });

  it('has sequential onset indices', () => {
    const result = euclid(7, 16);
    result.forEach((on, i) => {
      expect(on.index).toBe(i);
    });
  });

  it('handles prime coprime pairs like E(5, 13)', () => {
    const result = euclid(5, 13);
    expect(result).toHaveLength(5);
    const positions = result.map((r) => r.position);
    expect(positions).toContain(0);
  });
});
