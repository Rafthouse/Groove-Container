import { describe, it, expect } from 'vitest';
import { generatePhrase, type PhraseBehavior, type PhraseLength } from './phrase';

const BEHAVIORS: PhraseBehavior[] = [
  'walking', 'rolling', 'pendulum', 'droneMovement',
  'callResponse', 'circular', 'spiral', 'minimal', 'hypnotic',
];

describe('generatePhrase — basic contract', () => {
  it('returns events with positions strictly inside [0, length)', () => {
    for (const behavior of BEHAVIORS) {
      const steps = generatePhrase({
        behavior, length: 16, scale: 'aeolian',
        gravity: 'medium', interval: 'mixed', repetition: 'minimal', seed: 42,
      });
      for (const s of steps) {
        expect(s.position).toBeGreaterThanOrEqual(0);
        expect(s.position).toBeLessThan(16);
      }
    }
  });

  it('produces at least one step for every behavior', () => {
    for (const behavior of BEHAVIORS) {
      const steps = generatePhrase({
        behavior, length: 16, scale: 'aeolian',
        gravity: 'medium', interval: 'mixed', repetition: 'minimal', seed: 7,
      });
      expect(steps.length).toBeGreaterThan(0);
    }
  });

  it('emits a downbeat (position 0) for every behavior', () => {
    for (const behavior of BEHAVIORS) {
      const steps = generatePhrase({
        behavior, length: 16, scale: 'aeolian',
        gravity: 'medium', interval: 'mixed', repetition: 'minimal', seed: 7,
      });
      expect(steps.some(s => s.position === 0)).toBe(true);
    }
  });

  it('every velocity is in MIDI range 1..127', () => {
    for (const behavior of BEHAVIORS) {
      const steps = generatePhrase({
        behavior, length: 16, scale: 'aeolian',
        gravity: 'medium', interval: 'mixed', repetition: 'minimal', seed: 1,
      });
      for (const s of steps) {
        expect(s.velocity).toBeGreaterThanOrEqual(1);
        expect(s.velocity).toBeLessThanOrEqual(127);
      }
    }
  });

  it('deterministic — same seed yields the same phrase', () => {
    const opts = {
      behavior: 'walking' as PhraseBehavior, length: 16 as PhraseLength,
      scale: 'aeolian' as const, gravity: 'medium' as const,
      interval: 'mixed' as const, repetition: 'minimal' as const, seed: 123,
    };
    const a = generatePhrase(opts);
    const b = generatePhrase(opts);
    expect(a).toEqual(b);
  });

  it('different seeds yield different phrases (probabilistically)', () => {
    const base = {
      behavior: 'walking' as PhraseBehavior, length: 16 as PhraseLength,
      scale: 'aeolian' as const, gravity: 'medium' as const,
      interval: 'mixed' as const, repetition: 'minimal' as const,
    };
    const a = generatePhrase({ ...base, seed: 1 });
    const b = generatePhrase({ ...base, seed: 99999 });
    // At least one position should differ in degree.
    const sameLen = a.length === b.length;
    const allSame = sameLen && a.every((s, i) => s.degree === b[i].degree);
    expect(allSame).toBe(false);
  });
});

describe('repetition policy', () => {
  it('hypnotic repeats the first quarter throughout the phrase', () => {
    const steps = generatePhrase({
      behavior: 'walking', length: 16, scale: 'aeolian',
      gravity: 'weak', interval: 'mixed', repetition: 'hypnotic', seed: 11,
    });
    const motif = Math.max(2, Math.floor(steps.length / 4));
    for (let i = motif; i < steps.length; i++) {
      expect(steps[i].degree).toBe(steps[i % motif].degree);
    }
  });

  it('moderate copies first-half degrees into the second half', () => {
    const steps = generatePhrase({
      behavior: 'walking', length: 16, scale: 'aeolian',
      gravity: 'weak', interval: 'mixed', repetition: 'moderate', seed: 11,
    });
    const half = Math.floor(steps.length / 2);
    for (let i = half; i < steps.length; i++) {
      expect(steps[i].degree).toBe(steps[i - half].degree);
    }
  });
});

describe('hypnotic vs minimal variety', () => {
  it('hypnotic produces fewer unique degrees than minimal', () => {
    const hypnotic = generatePhrase({
      behavior: 'walking', length: 16, scale: 'aeolian',
      gravity: 'weak', interval: 'mixed', repetition: 'hypnotic', seed: 9,
    });
    const minimal = generatePhrase({
      behavior: 'walking', length: 16, scale: 'aeolian',
      gravity: 'weak', interval: 'mixed', repetition: 'minimal', seed: 9,
    });
    const uHyp = new Set(hypnotic.map(s => s.degree));
    const uMin = new Set(minimal.map(s => s.degree));
    expect(uHyp.size).toBeLessThanOrEqual(uMin.size);
  });
});

describe('anchor positions', () => {
  it('lift velocity at kick anchor positions', () => {
    const anchors = [0, 8];
    const steps = generatePhrase({
      behavior: 'walking', length: 16, scale: 'aeolian',
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      anchors, seed: 1,
    });
    const atAnchors = steps.filter(s => anchors.includes(s.position));
    for (const s of atAnchors) {
      expect(s.accent).toBe(true);
    }
  });
});
