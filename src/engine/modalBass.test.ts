import { describe, it, expect } from 'vitest';
import { generateModalBass, registerToRange } from './modalBass';
import { SCALE_INTERVALS } from './scales';
import type { BassEvent, RhythmTrack } from './types';

const KICK_4_ON_FLOOR: RhythmTrack = {
  id: 'kick', name: 'Kick', voice: 'kick', cycleLength: 16,
  events: [0, 4, 8, 12].map(position => ({
    position, velocity: 110, probability: 1, accent: true,
    timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'kick',
  })),
  mute: false, solo: false, volume: 80, pan: 0,
};

describe('generateModalBass — basic contract', () => {
  it('produces a non-empty BassEvent[]', () => {
    const bass = generateModalBass({
      scaleFamily: 'aeolian', scaleRoot: 36,
      behavior: 'walking', length: 16,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR],
      seed: 1,
    });
    expect(bass.length).toBeGreaterThan(0);
  });

  it('all positions are inside [0, cycle)', () => {
    const cycle = 16;
    const bass = generateModalBass({
      scaleFamily: 'dorian', scaleRoot: 36,
      behavior: 'walking', length: 16, cycleLength: cycle,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 7,
    });
    for (const e of bass) {
      expect(e.position).toBeGreaterThanOrEqual(0);
      expect(e.position).toBeLessThan(cycle);
    }
  });

  it('every pitch lands inside the register MIDI range', () => {
    const range = registerToRange('low');
    const bass = generateModalBass({
      scaleFamily: 'minorPentatonic', scaleRoot: range.root,
      behavior: 'rolling', length: 16,
      gravity: 'strong', interval: 'stepwise', repetition: 'minimal',
      minNote: range.min, maxNote: range.max,
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 1,
    });
    for (const e of bass) {
      expect(e.pitch).toBeGreaterThanOrEqual(range.min);
      expect(e.pitch).toBeLessThanOrEqual(range.max);
    }
  });

  it('every generated note is in-scale relative to scaleRoot', () => {
    const root = 36;
    const family = 'aeolian';
    const allowed = new Set(SCALE_INTERVALS[family]);
    const bass = generateModalBass({
      scaleFamily: family, scaleRoot: root,
      behavior: 'walking', length: 16,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 99,
    });
    for (const e of bass) {
      const pc = ((e.pitch - root) % 12 + 12) % 12;
      expect(allowed.has(pc)).toBe(true);
    }
  });

  it('always emits a downbeat at position 0', () => {
    const bass = generateModalBass({
      scaleFamily: 'aeolian', scaleRoot: 36,
      behavior: 'walking', length: 16,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 42,
    });
    expect(bass.some(e => e.position === 0)).toBe(true);
  });

  it('preserveEdited keeps user-tuned notes untouched', () => {
    const editedNote: BassEvent = {
      position: 4, velocity: 7, probability: 1, accent: false,
      timingOffset: 0, humanization: 0, ratchet: 1, swing: 0,
      pitch: 99, duration: 4,
      tie: false, slide: false, ghost: false, mute: false,
      editedManually: true,
    };
    const bass = generateModalBass({
      scaleFamily: 'aeolian', scaleRoot: 36,
      behavior: 'walking', length: 16,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 1,
      preserveEdited: [editedNote],
    });
    const atFour = bass.find(e => e.position === 4);
    expect(atFour).toBeDefined();
    expect(atFour!.pitch).toBe(99);
    expect(atFour!.velocity).toBe(7);
  });

  it('non-edited notes (editedManually=false) are not preserved', () => {
    const stale: BassEvent = {
      position: 4, velocity: 1, probability: 1, accent: false,
      timingOffset: 0, humanization: 0, ratchet: 1, swing: 0,
      pitch: 200, duration: 4,
      tie: false, slide: false, ghost: false, mute: false,
      editedManually: false,
    };
    const bass = generateModalBass({
      scaleFamily: 'aeolian', scaleRoot: 36,
      behavior: 'walking', length: 16,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 1,
      preserveEdited: [stale],
    });
    const atFour = bass.find(e => e.position === 4);
    // The stale note has a wildly out-of-range pitch and a 1-velocity tag,
    // so if it leaked through we'd see them in the output.
    expect(atFour?.pitch === 200 && atFour?.velocity === 1).toBe(false);
  });

  it('determinism — same seed + same opts ⇒ same events', () => {
    const opts = {
      scaleFamily: 'dorian' as const, scaleRoot: 36,
      behavior: 'rolling' as const, length: 16 as const,
      gravity: 'medium' as const, interval: 'mixed' as const,
      repetition: 'minimal' as const,
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 314,
    };
    const a = generateModalBass(opts);
    const b = generateModalBass(opts);
    expect(a).toEqual(b);
  });

  it('cycle length larger than phrase length tiles correctly', () => {
    const cycle = 32;
    const bass = generateModalBass({
      scaleFamily: 'aeolian', scaleRoot: 36,
      behavior: 'walking', length: 16, cycleLength: cycle,
      gravity: 'medium', interval: 'mixed', repetition: 'minimal',
      rhythmTracks: [KICK_4_ON_FLOOR], seed: 1,
    });
    const positions = bass.map(e => e.position);
    expect(Math.max(...positions)).toBeLessThan(cycle);
    // The 16..32 region should also have content (the phrase was tiled).
    expect(bass.some(e => e.position >= 16)).toBe(true);
  });
});

describe('registerToRange', () => {
  it('returns plausible ranges for each register', () => {
    expect(registerToRange('sub-harmonic').root).toBe(28);
    expect(registerToRange('low').root).toBe(36);
    expect(registerToRange('mid').root).toBe(48);
    expect(registerToRange('high').root).toBe(60);
  });

  it('each register has min <= root <= max', () => {
    for (const reg of ['sub-harmonic', 'low', 'mid', 'high'] as const) {
      const r = registerToRange(reg);
      expect(r.min).toBeLessThanOrEqual(r.root);
      expect(r.root).toBeLessThanOrEqual(r.max);
    }
  });
});
