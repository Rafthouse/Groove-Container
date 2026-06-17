/**
 * Harmony Engine Tests
 *
 * Tests are pure — no DOM, no Tone.js, no React.
 * They verify mathematical/deterministic properties of the engine.
 */

import { describe, it, expect } from 'vitest';
import { generateHarmony, behaviourFromBass, HARMONY_BEHAVIOR_LABELS } from './harmony';
import type { HarmonyOptions, ChordBehavior } from './harmony';
import type { BassEvent } from './types';

const defaultOpts: HarmonyOptions = {
  scaleFamily: 'aeolian',
  scaleRoot: 48, // C3
  behavior: 'circular',
  density: 'medium',
  complexity: 'triads',
  cycleLength: 16,
  octave: 2,
  seed: 42,
};

describe('generateHarmony - basic contract', () => {
  it('produces at least one event', () => {
    const result = generateHarmony(defaultOpts);
    expect(result.length).toBeGreaterThan(0);
  });

  it('all events have positions within cycle', () => {
    const result = generateHarmony(defaultOpts);
    for (const ev of result) {
      expect(ev.position).toBeGreaterThanOrEqual(0);
      expect(ev.position).toBeLessThan(16);
    }
  });

  it('all events have a root and pitches, root is in pitch class', () => {
    const result = generateHarmony(defaultOpts);
    for (const ev of result) {
      expect(ev.root).toBeGreaterThan(0);
      expect(ev.pitches.length).toBeGreaterThanOrEqual(3);
      // Root pitch class must be present (may be shifted by inversion)
      const rootPC = (ev.root % 12 + 12) % 12;
      const hasRoot = ev.pitches.some(p => (p % 12 + 12) % 12 === rootPC);
      expect(hasRoot).toBe(true);
    }
  });

  it('triads have exactly 3 pitches', () => {
    const result = generateHarmony({ ...defaultOpts, complexity: 'triads' });
    for (const ev of result) {
      expect(ev.pitches.length).toBe(3);
    }
  });

  it('sevenths have 4 pitches', () => {
    const result = generateHarmony({ ...defaultOpts, complexity: 'sevenths' });
    for (const ev of result) {
      expect(ev.pitches.length).toBe(4);
    }
  });

  it('sparse density produces at most 2 events in 16 steps', () => {
    const result = generateHarmony({ ...defaultOpts, density: 'sparse', cycleLength: 16 });
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('dense density produces many events', () => {
    const result = generateHarmony({ ...defaultOpts, density: 'dense', cycleLength: 16 });
    expect(result.length).toBeGreaterThan(4);
  });

  it('static behaviour keeps root at degree 0', () => {
    const result = generateHarmony({ ...defaultOpts, behavior: 'static', density: 'dense' });
    const rootNotes = result.map(e => ((e.root - 48) % 12 + 12) % 12);
    // All roots should be the same pitch-class (degree 0 = C)
    for (const pc of rootNotes) {
      expect(pc).toBe(0);
    }
  });

  it('narrative behaviour has harmonic motion (not all same position)', () => {
    const result = generateHarmony({ ...defaultOpts, behavior: 'narrative', density: 'medium' });
    expect(result.length).toBeGreaterThanOrEqual(3);
    const positions = result.map(e => e.position);
    const uniquePos = new Set(positions).size;
    expect(uniquePos).toBeGreaterThan(1); // harmonic movement
  });

  it('suspended behaviour avoids strongly landing on root', () => {
    const result = generateHarmony({ ...defaultOpts, behavior: 'suspended', density: 'medium' });
    // At most one event can be tonic (allow downbeat anchor)
    const tonics = result.filter(e => ((e.root - 48) % 12 + 12) % 12 === 0).length;
    expect(tonics).toBeLessThanOrEqual(1);
  });
});

describe('behaviourFromBass', () => {
  it('returns null for empty events', () => {
    expect(behaviourFromBass([])).toBeNull();
  });

  it('returns static for drone bass (many root notes)', () => {
    const droneEvents: BassEvent[] = [];
    for (let i = 0; i < 8; i++) {
      droneEvents.push({
        position: i * 2, pitch: 36, duration: 4, velocity: 80, accent: i === 0,
        timingOffset: 0, humanization: 0, ratchet: 1, swing: 0, probability: 1,
        tie: false, slide: false, ghost: false, mute: false,
      });
    }
    expect(behaviourFromBass(droneEvents)).toBe('static');
  });

  it('returns circular for widely spread bass', () => {
    const spreadEvents: BassEvent[] = [0, 4, 8, 12, 3, 7, 11, 15].map(pos => ({
      position: pos, pitch: 36 + (pos % 7) * 2, duration: 2, velocity: 75,
      accent: pos % 4 === 0, timingOffset: 0, humanization: 5, ratchet: 1,
      swing: 0, probability: 1, tie: false, slide: false, ghost: false, mute: false,
    }));
    expect(behaviourFromBass(spreadEvents)).toBe('circular');
  });
});

describe('all behaviours are labelled', () => {
  const behaviours: ChordBehavior[] = ['static', 'breathing', 'circular', 'floating', 'hypnotic', 'narrative', 'suspended', 'ritual'];

  for (const b of behaviours) {
    it(`has a label for ${b}`, () => {
      expect(HARMONY_BEHAVIOR_LABELS[b]).toBeTruthy();
    });
  }
});
