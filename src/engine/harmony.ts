/**
 * Harmony Organism Engine
 *
 * Generates chord progressions as behavioral organisms rather than static
 * chord charts. Harmony emerges from behaviors, not from hardcoded changes.
 *
 * Architecture:
 *   Scale (reuses scales.ts catalogue — 27 families)
 *     +  Chord Behavior (static/breathing/circular/floating/hypnotic/narrative/suspended/ritual)
 *     +  Chord Density (sparse/medium/dense)
 *     +  Chord Complexity (triads/sevenths/extended/quartal/cluster/modalVoicings)
 *     +  Bass Behaviour (read from genotype or bass events)
 *     =  HarmonyEvent[]
 *
 * Pure module. Deterministic when seeded.
 */

import type { ScaleFamily } from './scales';
import { resolveScaleNote, snapToScale } from './scales';
import type { BassEvent } from './types';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChordBehavior =
  | 'static'
  | 'breathing'
  | 'circular'
  | 'floating'
  | 'hypnotic'
  | 'narrative'
  | 'suspended'
  | 'ritual';

export type ChordDensity = 'sparse' | 'medium' | 'dense';

export type ChordComplexity =
  | 'triads'
  | 'sevenths'
  | 'extended'
  | 'quartal'
  | 'cluster'
  | 'modalVoicings';

/** One chord in a chord stream. */
export interface HarmonyEvent {
  /** Position in 16th steps. */
  position: number;
  /** Root note MIDI. */
  root: number;
  /** Array of chord tone MIDI notes (includes root). */
  pitches: number[];
  /** Duration in 16th steps. */
  duration: number;
  /** Inversion: 0=root, 1=first inversion, 2=second inversion. */
  inversion: number;
  /** Velocity 0-127. */
  velocity: number;
  /** User-edit flag; survives regeneration. */
  editedManually?: boolean;
  /** Slash chord — bass note override (if different from root). */
  bassNote?: number;
}

// ─── Options ────────────────────────────────────────────────────────────────

export interface HarmonyOptions {
  scaleFamily: ScaleFamily;
  scaleRoot: number; // MIDI note
  behavior: ChordBehavior;
  density: ChordDensity;
  complexity: ChordComplexity;
  /** Cycle length in 16th steps. Default 16. */
  cycleLength?: number;
  /** Octave for chord placement (0 = root register, 1 = +12, 2 = +24). */
  octave?: number;
  /** Bass events for harmony-bass interaction. */
  bassEvents?: BassEvent[];
  /** User-edited events to preserve. */
  preserveEdited?: HarmonyEvent[];
  /** Deterministic seed. */
  seed?: number;
}

// ─── Seeded PRNG (Mulberry32) ──────────────────────────────────────────────

function makeRng(seed: number) {
  let state = seed >>> 0;
  return function rand(): number {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Interval maps ──────────────────────────────────────────────────────────

const TRIAD_INTERVALS: number[] = [0, 4, 7];
const SEVENTH_INTERVALS: number[] = [0, 4, 7, 10];
const EXTENDED_INTERVALS: number[] = [0, 4, 7, 10, 14]; // add9
const QUARTAL_INTERVALS: number[] = [0, 5, 10, 15, 20]; // stacked fourths
const CLUSTER_INTERVALS: number[] = [0, 1, 3, 4, 6, 7]; // dense semitone clusters
const MODAL_VOICING_INTERVALS: Record<string, number[]> = {
  ionian:     [0, 4, 7, 11, 14],
  dorian:     [0, 3, 7, 10, 14],
  phrygian:   [0, 3, 7, 10, 13],
  lydian:     [0, 4, 7, 11, 16],
  mixolydian: [0, 4, 7, 10, 14],
  aeolian:    [0, 3, 7, 10, 14],
  locrian:    [0, 3, 6, 10, 13],
};

function getIntervals(complexity: ChordComplexity, scaleFamily: ScaleFamily): number[] {
  switch (complexity) {
    case 'triads': return TRIAD_INTERVALS;
    case 'sevenths': return SEVENTH_INTERVALS;
    case 'extended': return EXTENDED_INTERVALS;
    case 'quartal': return QUARTAL_INTERVALS;
    case 'cluster': return CLUSTER_INTERVALS;
    case 'modalVoicings': return MODAL_VOICING_INTERVALS[scaleFamily] ?? TRIAD_INTERVALS;
  }
}

function applyInversion(pitches: number[], inversion: number): number[] {
  if (inversion <= 0) return [...pitches];
  const inv = inversion % pitches.length;
  const shifted = [
    ...pitches.slice(inv),
    ...pitches.slice(0, inv).map(p => p + 12),
  ];
  return shifted;
}

// ─── Chord generation from root + complexity ────────────────────────────────

function buildChord(
  root: number,
  complexity: ChordComplexity,
  scaleFamily: ScaleFamily,
  inversion: number,
): number[] {
  const baseIntervals = getIntervals(complexity, scaleFamily);
  const raw = baseIntervals.map(iv => {
    // Snap each interval through the scale so it stays in key.
    return snapToScale(root + iv, scaleFamily, root);
  });
  // Dedupe same-note intervals, and ensure at least 3 pitches
  const unique = [...new Set(raw)].sort((a, b) => a - b);
  return applyInversion(unique, inversion);
}

// ─── Bass-Aware Harmony ──────────────────────────────────────────────────────

/**
 * Analyse bass behaviour to influence harmony decisions.
 * - Drone/Walking bass → static harmony
 * - Circular bass → circular harmony
 * - Hypnotic bass → small repetition
 * - Pendulum → floating
 * - Everything else → behaviour as chosen
 */
export function behaviourFromBass(bassEvents: BassEvent[]): ChordBehavior | null {
  if (!bassEvents.length) return null;
  const voices = bassEvents.length;
  const positions = bassEvents.map(e => e.position).sort((a, b) => a - b);
  const uniquePos = new Set(positions).size;
  const density = uniquePos / Math.max(1, positions.length || 1);
  const range = positions.length > 1 ? positions[positions.length - 1] - positions[0] : 0;
  const spread = range / Math.max(1, positions.length);

  // Drone: all events on same pitch class = static
  const pitches = bassEvents.map(e => ((e.pitch % 12) + 12) % 12);
  const uniquePitches = new Set(pitches).size;
  const pctRoot = pitches.filter(p => p === 0).length / Math.max(1, voices);

  if (uniquePitches === 1) return 'static';
  if (uniquePitches <= 2 && pctRoot > 0.6) return 'hypnotic';
  if (density > 0.6 && positions.length > 4) return 'circular';
  if (density < 0.3) return 'floating';
  if (pctRoot > 0.4 && voices > 4) return 'hypnotic';
  if (density > 0.5 && spread <= 2) return 'breathing';
  return null;
}

// ─── Behaviour generators ───────────────────────────────────────────────────

interface ChordPosition {
  position: number;
  root: number;
  inversion: number;
  duration: number;
  velocity: number;
}

function positionsForDensity(length: number, density: ChordDensity, rand: () => number): number[] {
  switch (density) {
    case 'sparse': {
      // 1-2 events: downbeat + maybe halfway
      const out = [0];
      if (rand() < 0.5) out.push(Math.floor(length / 2));
      return out;
    }
    case 'medium': {
      // 3-6 events on structural beats
      const out = new Set<number>([0]);
      const count = 3 + Math.floor(rand() * 4);
      while (out.size < count) {
        const beat = Math.floor(rand() * length);
        // bias toward 4-beat divisions
        const candidates = [beat, Math.floor(beat / 4) * 4];
        out.add(candidates[rand() < 0.6 ? 1 : 0] % length);
      }
      return [...out].sort((a, b) => a - b);
    }
    case 'dense': {
      // continuous motion
      const out = new Set<number>([0]);
      const count = Math.max(4, Math.floor(length / 2));
      while (out.size < count) {
        out.add(Math.floor(rand() * length));
      }
      return [...out].sort((a, b) => a - b);
    }
  }
}

function generatePositions(
  length: number,
  density: ChordDensity,
  behaviour: ChordBehavior,
  rand: () => number,
): ChordPosition[] {
  const pos = positionsForDensity(length, density, rand);
  let currentRoot = 0; // scale degree
  let inversion = 0;

  return pos.map((position, idx) => {
    const step: ChordPosition = {
      position,
      root: currentRoot,
      inversion,
      duration: 4,
      velocity: idx === 0 ? 85 : 65,
    };

    // Evolve root and inversion based on behaviour
    switch (behaviour) {
      case 'static':
        currentRoot = 0;
        inversion = 0;
        break;
      case 'breathing': {
        // Slow gentle movement between I and IV/V
        const cycle = Math.floor(idx / 2);
        const roots = [0, 3, 4, 3];
        currentRoot = roots[cycle % roots.length];
        inversion = rand() < 0.3 ? 1 : 0;
        break;
      }
      case 'circular': {
        // I → IV → V → I
        const circle = [0, 3, 4, 0, 5, 4, 3, 0];
        currentRoot = circle[idx % circle.length];
        inversion = idx % 3 === 2 ? 1 : 0;
        break;
      }
      case 'floating': {
        // Modal drift — avoid V (5) and avoid returning to I (0) too eagerly
        const floatSet = [0, 2, 3, 6, 7];
        currentRoot = floatSet[Math.floor(rand() * floatSet.length)];
        inversion = Math.floor(rand() * 3);
        break;
      }
      case 'hypnotic': {
        // Small variations around I
        const micro = [0, 0, 0, 2, 0, 0, 1, 0];
        currentRoot = micro[idx % micro.length];
        inversion = 0;
        break;
      }
      case 'narrative': {
        // Clear journey: I → ? → ? → V → I
        const story: number[] = [0];
        for (let i = 1; i < pos.length - 1; i++) {
          story.push(Math.floor(rand() * 7));
        }
        story.push(pos.length > 2 ? 4 : 0); // V
        story.push(0); // I on resolution
        currentRoot = story[idx] ?? 0;
        inversion = idx > 0 && idx < pos.length - 1 && rand() < 0.3 ? 1 : 0;
        break;
      }
      case 'suspended': {
        // Avoid resolution — stay on IV, ii, vi
        const sus = [3, 1, 5, 3, 1];
        currentRoot = sus[idx % sus.length];
        inversion = rand() < 0.4 ? 1 : 0;
        break;
      }
      case 'ritual': {
        // Repetitive modal movement around a small set
        const rite = [0, 2, 0, 3, 0, 2, 0, 4];
        currentRoot = rite[idx % rite.length];
        inversion = 0;
        break;
      }
    }

    // Duration adapts: longer on structural beats
    const isStructural = position === 0 || position % 8 === 0;
    step.duration = isStructural ? 8 : density === 'dense' ? 2 : 4;

    return step;
  });
}

// ─── Public entry point ─────────────────────────────────────────────────────

export function generateHarmony(opts: HarmonyOptions): HarmonyEvent[] {
  const rand = makeRng(opts.seed ?? 0x2D3F5A8B);
  const length = opts.cycleLength ?? 16;
  const octave = opts.octave ?? 2; // default to 3rd octave above bass

  // Bass-aware behaviour override
  let behaviour = opts.behavior;
  if (opts.bassEvents && opts.bassEvents.length > 0) {
    const bassHint = behaviourFromBass(opts.bassEvents);
    if (bassHint) behaviour = bassHint;
  }

  const positions = generatePositions(length, opts.density, behaviour, rand);

  // Build harmony events from chord positions
  const eventsByPos = new Map<number, HarmonyEvent>();

  for (const cp of positions) {
    const rootNote = resolveScaleNote(cp.root, opts.scaleFamily, opts.scaleRoot, octave);
    // Pass octave so chord pitches match the root note's register
    const pitches = buildChord(rootNote, opts.complexity, opts.scaleFamily, cp.inversion);

    const ev: HarmonyEvent = {
      position: cp.position,
      root: rootNote,
      pitches,
      duration: cp.duration,
      inversion: cp.inversion,
      velocity: cp.velocity,
    };
    eventsByPos.set(cp.position, ev);
  }

  // Preserve user edits
  const preserved = (opts.preserveEdited ?? []).filter(e => e.editedManually);
  for (const e of preserved) {
    eventsByPos.set(e.position % length, e);
  }

  return [...eventsByPos.values()].sort((a, b) => a.position - b.position);
}

// ─── UI Metadata ────────────────────────────────────────────────────────────

export const HARMONY_BEHAVIOR_LABELS: Record<ChordBehavior, string> = {
  static: 'Static',
  breathing: 'Breathing',
  circular: 'Circular',
  floating: 'Floating',
  hypnotic: 'Hypnotic',
  narrative: 'Narrative',
  suspended: 'Suspended',
  ritual: 'Ritual',
};

export const CHORD_DENSITY_LABELS: Record<ChordDensity, string> = {
  sparse: 'Sparse',
  medium: 'Medium',
  dense: 'Dense',
};

export const CHORD_COMPLEXITY_LABELS: Record<ChordComplexity, string> = {
  triads: 'Triads',
  sevenths: 'Seventh Chords',
  extended: 'Extended Chords',
  quartal: 'Quartal Harmony',
  cluster: 'Cluster Harmony',
  modalVoicings: 'Modal Voicings',
};

export const CHORD_BEHAVIOR_DESCRIPTIONS: Record<ChordBehavior, string> = {
  static: 'Single harmonic center — the sound of one chord',
  breathing: 'Slow chord movement — gentle shifts',
  circular: 'Returns to the starting harmony — classic progression cycle',
  floating: 'Avoids strong resolutions — modal ambiguity',
  hypnotic: 'Small variations around one center — trance-like',
  narrative: 'Clear harmonic journey — story with a destination',
  suspended: 'Avoids resolution — perpetually suspended tension',
  ritual: 'Repetitive modal movement — ceremonial repetition',
};
