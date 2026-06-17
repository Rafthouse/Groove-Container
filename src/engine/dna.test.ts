import { describe, it, expect } from 'vitest';
import type { PercussionEvent, BassEvent } from './types';
import {
  computeDensity,
  computeSyncopation,
  computeComplexity,
  computeAggression,
  computeRepetition,
  computeRandomness,
  computeDNA,
} from './dna';

describe('DNA analysis', () => {
  describe('computeDensity', () => {
    it('returns 0 for empty events', () => {
      expect(computeDensity([], 16)).toBe(0);
    });

    it('returns correct density', () => {
      const events = [
        { position: 0 },
        { position: 4 },
        { position: 8 },
        { position: 12 },
      ];
      expect(computeDensity(events, 16)).toBeCloseTo(0.25);
    });

    it('returns 1 for full grid', () => {
      const events = Array.from({ length: 16 }, (_, i) => ({ position: i }));
      expect(computeDensity(events, 16)).toBeCloseTo(1);
    });
  });

  describe('computeSyncopation', () => {
    it('returns 0 for on-beat only', () => {
      const events = [
        { position: 0 },
        { position: 4 },
        { position: 8 },
        { position: 12 },
      ];
      expect(computeSyncopation(events, 16)).toBeCloseTo(0);
    });

    it('returns 1 for full off-beat', () => {
      const events = [
        { position: 2 },
        { position: 6 },
        { position: 10 },
        { position: 14 },
      ];
      expect(computeSyncopation(events, 16)).toBeCloseTo(1);
    });

    it('returns 0.5 for half off-beat', () => {
      const events = [
        { position: 0 },
        { position: 2 },
        { position: 4 },
        { position: 6 },
      ];
      expect(computeSyncopation(events, 16)).toBeCloseTo(0.5);
    });

    it('returns 0 for empty events', () => {
      expect(computeSyncopation([], 16)).toBe(0);
    });
  });

  describe('computeAggression', () => {
    it('returns 0 for empty events', () => {
      expect(computeAggression([])).toBe(0);
    });

    it('is higher with accented events', () => {
      const soft = [
        { velocity: 30, accent: false, timingOffset: 0, humanization: 0, ratchet: 1, swing: 0, probability: 0.5 },
        { velocity: 40, accent: false, timingOffset: 0, humanization: 0, ratchet: 1, swing: 0, probability: 0.5 },
      ];
      const loud = [
        { velocity: 90, accent: true, timingOffset: 0, humanization: 0, ratchet: 1, swing: 0, probability: 1 },
        { velocity: 100, accent: true, timingOffset: 0, humanization: 0, ratchet: 1, swing: 0, probability: 1 },
      ];
      expect(computeAggression(loud)).toBeGreaterThan(computeAggression(soft));
    });
  });

  describe('computeRepetition', () => {
    it('returns 0.5 for insufficient data (< 3 events)', () => {
      expect(computeRepetition([{ position: 0 }, { position: 4 }], 16)).toBeCloseTo(0.5);
    });

    it('is higher for regular patterns', () => {
      const regular = [
        { position: 0 },
        { position: 4 },
        { position: 8 },
        { position: 12 },
      ];
      const irregular = [
        { position: 0 },
        { position: 3 },
        { position: 8 },
        { position: 14 },
      ];
      expect(computeRepetition(regular, 16)).toBeGreaterThan(computeRepetition(irregular, 16));
    });
  });

  describe('computeDNA — full integration', () => {
    it('produces consistent results for a 4-on-the-floor pattern', () => {
      const percEvents: PercussionEvent[] = [
        { position: 0, velocity: 100, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'kick' },
        { position: 4, velocity: 100, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'kick' },
        { position: 8, velocity: 100, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'kick' },
        { position: 12, velocity: 100, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'kick' },
        { position: 4, velocity: 90, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'snare' },
        { position: 12, velocity: 90, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'snare' },
      ];
      const bassEvents: BassEvent[] = [
        { position: 0, velocity: 85, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, pitch: 36, duration: 4, tie: false, slide: false, ghost: false, mute: false },
        { position: 8, velocity: 80, probability: 1, accent: false, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, pitch: 36, duration: 4, tie: false, slide: false, ghost: false, mute: false },
      ];
      const dna = computeDNA(percEvents, bassEvents, 16);

      expect(dna.density).toBeGreaterThan(0);
      expect(dna.syncopation).toBeGreaterThanOrEqual(0);
      expect(dna.complexity).toBeGreaterThanOrEqual(0);
      expect(dna.swing).toBeGreaterThanOrEqual(0);
      expect(dna.ghostFactor).toBeGreaterThanOrEqual(0);
      expect(dna.aggression).toBeGreaterThan(0.3); // high velocity + many accents
      expect(dna.repetition).toBeGreaterThanOrEqual(0);
      expect(dna.randomness).toBeGreaterThanOrEqual(0);

      // All values should be in [0, 1]
      Object.values(dna).forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    });
  });
});
