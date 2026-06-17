/**
 * Musical scale catalogue for the modal bass engine.
 *
 * Each family is stored as ascending semitone intervals from the root,
 * mod 12.  resolveScaleNote(degree, scale, root, octaveOffset) returns
 * a concrete MIDI note: degrees wrap automatically across octaves, and
 * negative degrees descend below the root.
 *
 * Pure module. No React, no Tone.js.
 */

/** Local alias — Groove Container stores pitch as a raw MIDI number. */
export type MidiNote = number;

// ─── Scale catalogue ──────────────────────────────────────────────────

export type ScaleFamily =
  // Church modes
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  // Pentatonic
  | 'majorPentatonic'
  | 'minorPentatonic'
  // Japanese
  | 'inSen'
  | 'hirajoshi'
  | 'kumoi'
  | 'iwato'
  | 'akebono'
  // Folk / world
  | 'harmonicMinor'
  | 'melodicMinor'
  | 'doubleHarmonic'
  | 'hungarianMinor'
  | 'ukrainianDorian'
  | 'persian'
  | 'arabicHijaz'
  | 'arabicMaqamRast'
  | 'balkanPhrygianDominant'
  | 'balkanGypsy'
  // Experimental
  | 'wholeTone'
  | 'octatonic'
  | 'chromaticConstrained';

/** Ascending intervals from the root in semitones, all values 0..11. */
export const SCALE_INTERVALS: Record<ScaleFamily, readonly number[]> = {
  // Church modes
  ionian:     [0, 2, 4, 5, 7, 9, 11],
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  phrygian:   [0, 1, 3, 5, 7, 8, 10],
  lydian:     [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian:    [0, 2, 3, 5, 7, 8, 10],
  locrian:    [0, 1, 3, 5, 6, 8, 10],

  // Pentatonic
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],

  // Japanese (rough Western reductions — many regional variants exist)
  inSen:      [0, 1, 5, 7, 10],
  hirajoshi:  [0, 2, 3, 7, 8],
  kumoi:      [0, 2, 3, 7, 9],
  iwato:      [0, 1, 5, 6, 10],
  akebono:    [0, 2, 3, 7, 8],

  // Folk and world
  harmonicMinor:           [0, 2, 3, 5, 7, 8, 11],
  melodicMinor:            [0, 2, 3, 5, 7, 9, 11],
  doubleHarmonic:          [0, 1, 4, 5, 7, 8, 11],
  hungarianMinor:          [0, 2, 3, 6, 7, 8, 11],
  ukrainianDorian:         [0, 2, 3, 6, 7, 9, 10],
  persian:                 [0, 1, 4, 5, 6, 8, 11],
  arabicHijaz:             [0, 1, 4, 5, 7, 8, 10],
  arabicMaqamRast:         [0, 2, 4, 5, 7, 9, 10],
  balkanPhrygianDominant:  [0, 1, 4, 5, 7, 8, 10],
  balkanGypsy:             [0, 2, 3, 6, 7, 8, 11],

  // Experimental
  wholeTone:            [0, 2, 4, 6, 8, 10],
  octatonic:            [0, 2, 3, 5, 6, 8, 9, 11],
  chromaticConstrained: [0, 1, 2, 3, 4, 5, 7], // bottom hexachord + dominant — keeps modal flavour
} as const;

/** Display labels for UI selects. */
export const SCALE_LABELS: Record<ScaleFamily, string> = {
  ionian: 'Ionian (Major)',
  dorian: 'Dorian',
  phrygian: 'Phrygian',
  lydian: 'Lydian',
  mixolydian: 'Mixolydian',
  aeolian: 'Aeolian (Minor)',
  locrian: 'Locrian',
  majorPentatonic: 'Major Pentatonic',
  minorPentatonic: 'Minor Pentatonic',
  inSen: 'In Sen',
  hirajoshi: 'Hirajoshi',
  kumoi: 'Kumoi',
  iwato: 'Iwato',
  akebono: 'Akebono',
  harmonicMinor: 'Harmonic Minor',
  melodicMinor: 'Melodic Minor',
  doubleHarmonic: 'Double Harmonic',
  hungarianMinor: 'Hungarian Minor',
  ukrainianDorian: 'Ukrainian Dorian',
  persian: 'Persian',
  arabicHijaz: 'Arabic Hijaz',
  arabicMaqamRast: 'Arabic Maqam Rast',
  balkanPhrygianDominant: 'Balkan Phrygian Dominant',
  balkanGypsy: 'Balkan Gypsy',
  wholeTone: 'Whole Tone',
  octatonic: 'Octatonic',
  chromaticConstrained: 'Chromatic Constrained',
};

/** Convenience grouping for grouped UI dropdowns. */
export const SCALE_GROUPS: { label: string; families: ScaleFamily[] }[] = [
  { label: 'Church Modes',  families: ['ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian'] },
  { label: 'Pentatonic',    families: ['majorPentatonic','minorPentatonic'] },
  { label: 'Japanese',      families: ['inSen','hirajoshi','kumoi','iwato','akebono'] },
  { label: 'World / Folk',  families: ['harmonicMinor','melodicMinor','doubleHarmonic','hungarianMinor','ukrainianDorian','persian','arabicHijaz','arabicMaqamRast','balkanPhrygianDominant','balkanGypsy'] },
  { label: 'Experimental',  families: ['wholeTone','octatonic','chromaticConstrained'] },
];

/** Default fallback if a preset has no scale set. */
export const DEFAULT_SCALE: ScaleFamily = 'aeolian';

// ─── Scale resolution ─────────────────────────────────────────────────

/**
 * Resolve a scale degree to a concrete MIDI note.
 *
 * - `degree` is 0-based.  Degree 0 = root.  Degrees wrap across octaves:
 *   e.g. in a 7-note scale, degree 7 is the root one octave up.
 * - Negative degrees descend below the root.
 * - `octaveOffset` shifts the whole result by N octaves (12 semitones each).
 *
 * Always returns a value in [0, 127], clamped at the boundaries.
 */
export function resolveScaleNote(
  degree: number,
  scale: ScaleFamily,
  root: MidiNote,
  octaveOffset: number = 0,
): MidiNote {
  const intervals = SCALE_INTERVALS[scale];
  const size = intervals.length;
  // JS % yields negative remainders for negative input; this normalises.
  const wrapped = ((degree % size) + size) % size;
  const fullOctaves = Math.floor(degree / size);
  const interval = intervals[wrapped];
  const note = root + interval + 12 * (fullOctaves + octaveOffset);
  return Math.max(0, Math.min(127, Math.round(note)));
}

/**
 * Return the available scale degrees within a MIDI range (inclusive).
 * Useful when a phrase generator wants to constrain choices to playable
 * notes for a particular bass register.
 */
export function scaleNotesInRange(
  scale: ScaleFamily,
  root: MidiNote,
  minNote: MidiNote,
  maxNote: MidiNote,
): MidiNote[] {
  const out: MidiNote[] = [];
  const intervals = SCALE_INTERVALS[scale];
  const size = intervals.length;
  // Find the earliest degree that lands above minNote, then walk up.
  // Start from a low enough degree that we won't miss the bottom.
  const lo = Math.max(0, minNote);
  const hi = Math.min(127, maxNote);
  // Sweep degrees from -size*6 (six octaves below root) to size*6 above.
  for (let d = -size * 6; d <= size * 6; d++) {
    const n = resolveScaleNote(d, scale, root, 0);
    if (n >= lo && n <= hi) out.push(n);
  }
  // Dedupe — wrap point can produce identical notes.
  return [...new Set(out)].sort((a, b) => a - b);
}

/** Snap an arbitrary MIDI note to the nearest in-scale note. */
export function snapToScale(
  note: MidiNote,
  scale: ScaleFamily,
  root: MidiNote,
): MidiNote {
  const intervals = SCALE_INTERVALS[scale];
  const semis = ((note - root) % 12 + 12) % 12;
  // find closest interval
  let best = intervals[0];
  let bestDist = Math.abs(semis - best);
  for (const iv of intervals) {
    const d = Math.abs(semis - iv);
    if (d < bestDist) { best = iv; bestDist = d; }
  }
  const octave = Math.floor((note - root) / 12);
  return Math.max(0, Math.min(127, root + best + octave * 12));
}

/** Number of degrees in a given scale (= unique notes per octave). */
export function scaleSize(scale: ScaleFamily): number {
  return SCALE_INTERVALS[scale].length;
}
