import { describe, it, expect } from 'vitest';
import {
  resolveScaleNote, scaleNotesInRange, snapToScale, scaleSize,
  SCALE_INTERVALS, SCALE_LABELS,
} from './scales';

describe('SCALE_INTERVALS catalogue', () => {
  it('every family starts at 0 (root)', () => {
    for (const family of Object.keys(SCALE_INTERVALS)) {
      const ivs = SCALE_INTERVALS[family as keyof typeof SCALE_INTERVALS];
      expect(ivs[0]).toBe(0);
    }
  });

  it('every family is strictly ascending and within one octave', () => {
    for (const family of Object.keys(SCALE_INTERVALS)) {
      const ivs = SCALE_INTERVALS[family as keyof typeof SCALE_INTERVALS];
      for (let i = 1; i < ivs.length; i++) {
        expect(ivs[i]).toBeGreaterThan(ivs[i - 1]);
      }
      expect(Math.max(...ivs)).toBeLessThan(12);
    }
  });

  it('has a UI label for every family', () => {
    for (const family of Object.keys(SCALE_INTERVALS)) {
      expect(SCALE_LABELS[family as keyof typeof SCALE_LABELS]).toBeTruthy();
    }
  });

  it('major (ionian) and minor (aeolian) match textbook intervals', () => {
    expect(SCALE_INTERVALS.ionian).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(SCALE_INTERVALS.aeolian).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it('whole-tone is 6 notes spaced by 2 semitones', () => {
    const wt = SCALE_INTERVALS.wholeTone;
    expect(wt).toEqual([0, 2, 4, 6, 8, 10]);
    expect(scaleSize('wholeTone')).toBe(6);
  });
});

describe('resolveScaleNote', () => {
  it('degree 0 returns root', () => {
    expect(resolveScaleNote(0, 'ionian', 60)).toBe(60); // C4
  });

  it('degree 1 in ionian is one whole step above root', () => {
    expect(resolveScaleNote(1, 'ionian', 60)).toBe(62);
  });

  it('wraps to the next octave at degree = scale size', () => {
    expect(resolveScaleNote(7, 'ionian', 60)).toBe(72); // 60 + 12
  });

  it('negative degree descends below root', () => {
    // Degree -1 in ionian = leading tone of the octave below
    expect(resolveScaleNote(-1, 'ionian', 60)).toBe(59); // B3
  });

  it('octaveOffset shifts by 12 semitones', () => {
    expect(resolveScaleNote(0, 'ionian', 60, 1)).toBe(72);
    expect(resolveScaleNote(0, 'ionian', 60, -1)).toBe(48);
  });

  it('clamps to MIDI 0..127', () => {
    expect(resolveScaleNote(0, 'ionian', 0, -1)).toBe(0);
    expect(resolveScaleNote(0, 'ionian', 127, 1)).toBe(127);
  });

  it('pentatonic skips degrees the church modes have', () => {
    // Minor pentatonic from C: C Eb F G Bb
    expect(resolveScaleNote(0, 'minorPentatonic', 60)).toBe(60); // C
    expect(resolveScaleNote(1, 'minorPentatonic', 60)).toBe(63); // Eb
    expect(resolveScaleNote(2, 'minorPentatonic', 60)).toBe(65); // F
    expect(resolveScaleNote(3, 'minorPentatonic', 60)).toBe(67); // G
    expect(resolveScaleNote(4, 'minorPentatonic', 60)).toBe(70); // Bb
    expect(resolveScaleNote(5, 'minorPentatonic', 60)).toBe(72); // C an octave up
  });
});

describe('scaleNotesInRange', () => {
  it('returns only notes inside the requested range', () => {
    const notes = scaleNotesInRange('ionian', 60, 60, 72);
    expect(notes[0]).toBeGreaterThanOrEqual(60);
    expect(notes[notes.length - 1]).toBeLessThanOrEqual(72);
  });

  it('is sorted and deduplicated', () => {
    const notes = scaleNotesInRange('ionian', 60, 48, 84);
    const sorted = [...notes].sort((a, b) => a - b);
    expect(notes).toEqual(sorted);
    expect(new Set(notes).size).toBe(notes.length);
  });
});

describe('snapToScale', () => {
  it('keeps in-scale notes unchanged', () => {
    expect(snapToScale(60, 'ionian', 60)).toBe(60);
    expect(snapToScale(62, 'ionian', 60)).toBe(62); // D
  });

  it('snaps off-scale notes to the nearest scale degree', () => {
    // C# is not in C major; nearest scale degree is C (60) or D (62).
    const snapped = snapToScale(61, 'ionian', 60);
    expect([60, 62]).toContain(snapped);
  });
});
