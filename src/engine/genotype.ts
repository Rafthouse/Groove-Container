/**
 * Groove Genotype — Intent Specification
 *
 * Genotype ≠ DNA.
 * Genotype is WHAT YOU WANT (intent).
 * DNA is WHAT YOU GOT (empirical analytics from actual events).
 *
 * Flow:
 *   Genotype (intent)
 *     ↓
 *   Generator (generateFromGenotype)
 *     ↓
 *   Organism (concrete events, tracks, BPM...)
 *     ↓
 *   DNA Analysis (computed from events — density, syncopation, etc.)
 *     ↓
 *   Inference (inferGenotype) — "how would I describe what I'm hearing?"
 *
 * The generator produces a valid GrooveOrganism. The same genotype with
 * different seeds produces different organisms with similar character.
 */

import type {
  GrooveOrganism, RhythmTrack, BassTrack,
  PercussionEvent, BassEvent, PercussionVoice,
} from './types';
import { computeDNA } from './dna';
import type { ScaleFamily } from './scales';
import type { PhraseBehavior, HarmonicGravity, IntervalPreference } from './phrase';

// ─── Genotype Enum Types ─────────────────────────────────────────────────────

export type RhythmDensity  = 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
export type AccentStrategy = 'flat' | 'rotating' | 'euclidean' | 'fragmented';
export type TimingFeel     = 'rigid' | 'tight' | 'loose' | 'swung' | 'heavy';
export type EntryTiming    = 'on' | 'early' | 'late' | 'ghost' | 'adaptive';
export type Motion         = 'static' | 'walking' | 'rolling' | 'pendulum' | 'chaotic';
export type NoteLength     = 'micro' | 'staccato' | 'short' | 'medium' | 'long' | 'sustained' | 'drone';
export type Register       = 'sub-harmonic' | 'low' | 'mid' | 'high';
export type KickSnareRel   = 'ignore' | 'bounce' | 'follow' | 'anticipate';
export type KickHatRel     = 'independent' | 'weak' | 'medium' | 'strong' | 'locked';
export type SilenceStrategy = 'continuous' | 'breathing' | 'punctuated' | 'fragmented' | 'absent';
export type MutationStrength = 'conservative' | 'moderate' | 'aggressive' | 'chaotic';
export type PolymeterType  = 'fixed' | 'extended' | 'rotating' | 'polymetric';

// Re-exported so the rest of the app can import bass genes from one place.
export type { ScaleFamily, PhraseBehavior, HarmonicGravity, IntervalPreference };

// ─── Genotype Interface ─────────────────────────────────────────────────────

export interface GrooveGenotype {
  rhythmDensity: RhythmDensity;
  accentStrategy: AccentStrategy;
  timingFeel: TimingFeel;
  entryTiming: EntryTiming;
  motion: Motion;
  noteLength: NoteLength;
  register: Register;
  kickSnare: KickSnareRel;
  kickHat: KickHatRel;
  silence: SilenceStrategy;
  mutationStrength: MutationStrength;
  polymeter: PolymeterType;

  // ── Modal bass genes (Modal Bass Engine) ───────────────────
  scaleFamily: ScaleFamily;
  phraseBehavior: PhraseBehavior;
  harmonicGravity: HarmonicGravity;
  intervalPreference: IntervalPreference;
}

// ─── Default Genotype ───────────────────────────────────────────────────────

export const DEFAULT_GENOTYPE: GrooveGenotype = {
  rhythmDensity: 'medium',
  accentStrategy: 'euclidean',
  timingFeel: 'tight',
  entryTiming: 'on',
  motion: 'walking',
  noteLength: 'short',
  register: 'mid',
  kickSnare: 'bounce',
  kickHat: 'medium',
  silence: 'breathing',
  mutationStrength: 'moderate',
  polymeter: 'fixed',

  // Modal bass defaults
  scaleFamily: 'aeolian',
  phraseBehavior: 'walking',
  harmonicGravity: 'medium',
  intervalPreference: 'mixed',
};

// ─── Genotype Display Labels ────────────────────────────────────────────────

export const GENOTYPE_LABELS: Record<keyof GrooveGenotype, string> = {
  rhythmDensity: 'Density',
  accentStrategy: 'Accents',
  timingFeel: 'Timing',
  entryTiming: 'Entry',
  motion: 'Motion',
  noteLength: 'Note',
  register: 'Register',
  kickSnare: 'Kick↔Snare',
  kickHat: 'Kick↔Hat',
  silence: 'Silence',
  mutationStrength: 'Mutation',
  polymeter: 'Polymeter',
  scaleFamily: 'Bass Scale',
  phraseBehavior: 'Bass Phrase',
  harmonicGravity: 'Harm. Gravity',
  intervalPreference: 'Bass Intervals',
};

export const GENOTYPE_OPTIONS: Record<keyof GrooveGenotype, readonly string[]> = {
  rhythmDensity: ['low', 'medium-low', 'medium', 'medium-high', 'high'],
  accentStrategy: ['flat', 'rotating', 'euclidean', 'fragmented'],
  timingFeel: ['rigid', 'tight', 'loose', 'swung', 'heavy'],
  entryTiming: ['on', 'early', 'late', 'ghost', 'adaptive'],
  motion: ['static', 'walking', 'rolling', 'pendulum', 'chaotic'],
  noteLength: ['micro', 'staccato', 'short', 'medium', 'long', 'sustained', 'drone'],
  register: ['sub-harmonic', 'low', 'mid', 'high'],
  kickSnare: ['ignore', 'bounce', 'follow', 'anticipate'],
  kickHat: ['independent', 'weak', 'medium', 'strong', 'locked'],
  silence: ['continuous', 'breathing', 'punctuated', 'fragmented', 'absent'],
  mutationStrength: ['conservative', 'moderate', 'aggressive', 'chaotic'],
  polymeter: ['fixed', 'extended', 'rotating', 'polymetric'],
  scaleFamily: [
    'ionian','dorian','phrygian','lydian','mixolydian','aeolian','locrian',
    'majorPentatonic','minorPentatonic',
    'inSen','hirajoshi','kumoi','iwato','akebono',
    'harmonicMinor','melodicMinor','doubleHarmonic','hungarianMinor','ukrainianDorian',
    'persian','arabicHijaz','arabicMaqamRast','balkanPhrygianDominant','balkanGypsy',
    'wholeTone','octatonic','chromaticConstrained',
  ],
  phraseBehavior: ['walking','rolling','pendulum','droneMovement','callResponse','circular','spiral','minimal','hypnotic'],
  harmonicGravity: ['weak','medium','strong'],
  intervalPreference: ['stepwise','mixed','leaping'],
};

// ─── Helper: range ──────────────────────────────────────────────────────────

function range(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ─── Cycle lengths per polymeter type ────────────────────────────────────────

function cycleLengthsForPolymeter(type: PolymeterType): number[] {
  switch (type) {
    case 'fixed':     return [16, 16, 16, 16, 16, 16];
    case 'extended':  return [16, 16, 32, 16, 8, 16];
    case 'rotating':  return [16, 15, 13, 11, 9, 7];
    case 'polymetric': return [16, 13, 7, 5, 11, 9];
  }
}

// ─── Event count from density ────────────────────────────────────────────────

function eventsPer16(density: RhythmDensity): [number, number] {
  switch (density) {
    case 'low':         return [2, 4];
    case 'medium-low':  return [4, 6];
    case 'medium':      return [6, 9];
    case 'medium-high': return [9, 12];
    case 'high':        return [12, 16];
  }
}

// ─── Swing range from timing feel ────────────────────────────────────────────

function swingFromFeel(feel: TimingFeel): number {
  switch (feel) {
    case 'rigid': return 0;
    case 'tight': return range(5, 15);
    case 'loose': return range(15, 30);
    case 'swung': return range(35, 65);
    case 'heavy': return range(50, 75);
  }
}

// ─── Generate positions for one voice ────────────────────────────────────────

function generatePositions(
  cycleLength: number,
  density: RhythmDensity,
  motion: Motion,
  silence: SilenceStrategy,
): number[] {
  const [minEv, maxEv] = eventsPer16(density);

  // Adjust target event count for cycle length
  const targetCount = Math.max(1, Math.round(
    range(minEv, maxEv) * (cycleLength / 16)
  ));

  let positions: number[];

  switch (motion) {
    case 'static': {
      // Even grid with some gaps
      const step = Math.max(1, Math.floor(cycleLength / targetCount));
      positions = Array.from({ length: targetCount }, (_, i) => (i * step) % cycleLength);
      // Add some jitter
      positions = positions.map(p => Math.max(0, Math.min(cycleLength - 1, p + Math.floor(range(-1, 1)))));
      break;
    }
    case 'walking': {
      // Walking bass line style — consecutive positions
      positions = [];
      let pos = 0;
      for (let i = 0; i < targetCount; i++) {
        positions.push(pos % cycleLength);
        pos += Math.floor(range(1, 4));
      }
      break;
    }
    case 'rolling': {
      // Dense clusters separated by gaps
      positions = [];
      let pos = 0;
      while (positions.length < targetCount) {
        const clusterSize = Math.floor(range(2, 5));
        for (let j = 0; j < clusterSize && positions.length < targetCount; j++) {
          positions.push((pos + j) % cycleLength);
        }
        pos += clusterSize + Math.floor(range(2, 6));
      }
      break;
    }
    case 'pendulum': {
      // Symmetrical: forwards then backwards
      const half = Math.ceil(targetCount / 2);
      const forward = Array.from({ length: half }, (_, i) => Math.floor(i * cycleLength / half));
      const backward = forward.slice(1, -1).reverse();
      positions = [...forward, ...backward];
      break;
    }
    case 'chaotic': {
      // Random positions, no pattern
      const set = new Set<number>();
      while (set.size < targetCount) {
        set.add(Math.floor(Math.random() * cycleLength));
      }
      positions = Array.from(set).sort((a, b) => a - b);
      break;
    }
    default: {
      positions = [];
    }
  }

  // Apply silence strategy — remove some positions or reduce density
  switch (silence) {
    case 'continuous':
      // No removal
      break;
    case 'breathing':
      // Remove 10-20% of positions
      positions = positions.filter(() => Math.random() > 0.15);
      break;
    case 'punctuated':
      // Keep clusters but remove isolated singles
      positions = positions.filter((p, i, arr) => {
        if (arr.length <= 2) return true;
        const hasPrev = i > 0 && arr[i - 1] === p - 1;
        const hasNext = i < arr.length - 1 && arr[i + 1] === p + 1;
        return hasPrev || hasNext || Math.random() > 0.5;
      });
      break;
    case 'fragmented':
      // Heavy removal — keep ~40%
      positions = positions.filter(() => Math.random() > 0.6);
      break;
    case 'absent':
      // Remove most, keep only accents
      positions = positions.filter((_, i) => i % 4 === 0);
      break;
  }

  if (positions.length === 0) positions = [0]; // always at least a downbeat
  return [...new Set(positions)].sort((a, b) => a - b);
}

// ─── Accent placement ───────────────────────────────────────────────────────

function placeAccents(
  positions: number[],
  strategy: AccentStrategy,
  _cycleLength: number,
): Set<number> {
  const accents = new Set<number>();
  if (positions.length === 0) return accents;
  if (strategy === 'flat') return accents;

  switch (strategy) {
    case 'rotating':
      // Every 4th step that has an event
      positions.forEach((p, i) => { if (i % 4 === 0) accents.add(p); });
      break;
    case 'euclidean': {
      // Accent on positions that match Bjorklund distribution of accents
      const totalEvents = positions.length;
      const numAccents = Math.max(1, Math.floor(totalEvents / 3));
      for (let i = 0; i < numAccents; i++) {
        const idx = Math.floor(i * totalEvents / numAccents);
        if (idx < positions.length) accents.add(positions[idx]);
      }
      break;
    }
    case 'fragmented':
      // Random clusters of 2-3 consecutive accents
      for (let i = 0; i < positions.length; i++) {
        if (Math.random() < 0.3) {
          accents.add(positions[i]);
          if (i + 1 < positions.length && Math.random() < 0.6) accents.add(positions[i + 1]);
        }
      }
      break;
  }

  // Always accent the downbeat if present
  if (positions.includes(0)) accents.add(0);
  return accents;
}

// ─── Entry timing adjustment ─────────────────────────────────────────────────

function applyEntryTiming(events: PercussionEvent[], timing: EntryTiming): void {
  for (const e of events) {
    switch (timing) {
      case 'on':    e.timingOffset = 0; break;
      case 'early': e.timingOffset = range(-0.3, -0.05); break;
      case 'late':  e.timingOffset = range(0.05, 0.3); break;
      case 'ghost': if (e.velocity < 50) e.humanization = range(20, 40); break;
      case 'adaptive': e.timingOffset = e.position % 4 === 0 ? 0 : range(-0.15, 0.15); break;
    }
  }
}

// ─── Note length from genotype ───────────────────────────────────────────────

function noteLengthToDuration(len: NoteLength): [min: number, max: number] {
  switch (len) {
    case 'micro':     return [1, 1];
    case 'staccato':  return [1, 2];
    case 'short':     return [2, 4];
    case 'medium':    return [4, 8];
    case 'long':      return [8, 12];
    case 'sustained': return [12, 16];
    case 'drone':     return [16, 32];
  }
}

// ─── Bass note register mapping ──────────────────────────────────────────────

function registerToMidiRange(reg: Register): [number, number] {
  switch (reg) {
    case 'sub-harmonic': return [24, 36];  // C1-C2
    case 'low':          return [36, 48];  // C2-C3
    case 'mid':          return [48, 60];  // C3-C4
    case 'high':         return [60, 72];  // C4-C5
  }
}

// ─── Generate Kick track ─────────────────────────────────────────────────────

function generateKickTrack(
  positions: number[],
  accents: Set<number>,
  cycleLength: number,
  timingFeel: TimingFeel,
): RhythmTrack {
  const events: PercussionEvent[] = positions.map(p => ({
    voice: 'kick' as PercussionVoice,
    position: p,
    velocity: Math.round(accents.has(p) ? range(80, 100) : range(50, 80)),
    probability: accents.has(p) ? 1 : range(0.85, 1),
    accent: accents.has(p),
    timingOffset: 0,
    humanization: timingFeel === 'heavy' ? range(5, 15) : range(0, 8),
    ratchet: accents.has(p) && Math.random() > 0.85 ? 2 : 1,
    swing: 0,
  }));
  return {
    id: 'kick-gen', name: 'Kick', voice: 'kick', cycleLength,
    events, mute: false, solo: false, volume: 80, pan: 0,
  };
}

// ─── Generate Snare track (with kick-snare relationship) ─────────────────────

function generateSnareTrack(
  kickPositions: number[],
  cycleLength: number,
  kickSnare: KickSnareRel,
  _timingFeel: TimingFeel,
): RhythmTrack {
  let positions: number[];

  switch (kickSnare) {
    case 'ignore':
      // Independent — positions on backbeats
      positions = [4, 12];
      break;
    case 'bounce':
      // 1 step after each kick
      positions = [...new Set(kickPositions.map(p => (p + 1) % cycleLength))];
      break;
    case 'follow':
      // Same positions as kick
      positions = [...kickPositions];
      break;
    case 'anticipate':
      // 1 step before each kick
      positions = [...new Set(kickPositions.map(p => (p - 1 + cycleLength) % cycleLength))];
      break;
  }

  // Ensure at least backbeat positions
  if (positions.length < 2) positions = [...positions, 4, 12];

  const events: PercussionEvent[] = positions.map(p => ({
    voice: 'snare' as PercussionVoice,
    position: p % cycleLength,
    velocity: Math.round(range(60, 85)),
    probability: range(0.9, 1),
    accent: p % 8 === 4, // accent on backbeat
    timingOffset: 0,
    humanization: range(0, 10),
    ratchet: 1,
    swing: 0,
  }));
  return {
    id: 'snare-gen', name: 'Snare', voice: 'snare', cycleLength,
    events, mute: false, solo: false, volume: 70, pan: 0,
  };
}

// ─── Generate Hat tracks (with kick-hat coupling) ────────────────────────────

function generateHatTracks(
  kickPositions: number[],
  cycleLength: number,
  kickHat: KickHatRel,
): RhythmTrack[] {
  const allPositions: number[] = [];

  switch (kickHat) {
    case 'independent':
      // Straight 8ths
      for (let i = 0; i < cycleLength; i += 2) allPositions.push(i);
      break;
    case 'weak':
      // 8ths with some gaps
      for (let i = 0; i < cycleLength; i += 2) { if (Math.random() > 0.25) allPositions.push(i); }
      break;
    case 'medium':
      // 16ths with slight variations
      for (let i = 0; i < cycleLength; i++) { if (Math.random() > 0.15) allPositions.push(i); }
      break;
    case 'strong':
      // Locked 16ths — every kick and between kicks
      for (let i = 0; i < cycleLength; i++) allPositions.push(i);
      break;
    case 'locked':
      // Double-time 32nds around kick positions
      for (const k of kickPositions) {
        allPositions.push(k);
        if (k + 1 < cycleLength) allPositions.push(k + 1);
      }
      break;
  }

  // Split into closed and open hats
  const closed = allPositions.filter((_, i) => i % 8 !== 0);
  const open = allPositions.filter((_, i) => i % 8 === 0);

  const tracks: RhythmTrack[] = [];

  if (closed.length > 0) {
    tracks.push({
      id: 'ch-gen', name: 'Closed Hat', voice: 'closedHat', cycleLength,
      events: closed.map(p => ({
        voice: 'closedHat' as PercussionVoice, position: p,
        velocity: Math.round(range(40, 65)), probability: range(0.8, 1),
        accent: false, timingOffset: 0, humanization: range(0, 5), ratchet: 1, swing: 0,
      })),
      mute: false, solo: false, volume: 60, pan: 0,
    });
  }

  if (open.length > 0) {
    tracks.push({
      id: 'oh-gen', name: 'Open Hat', voice: 'openHat', cycleLength,
      events: open.map(p => ({
        voice: 'openHat' as PercussionVoice, position: p,
        velocity: Math.round(range(50, 75)), probability: range(0.7, 0.95),
        accent: false, timingOffset: 0, humanization: range(0, 8), ratchet: 1, swing: 0,
      })),
      mute: false, solo: false, volume: 50, pan: 0,
    });
  }

  return tracks;
}

// ─── Generate Perc track ─────────────────────────────────────────────────────

function generatePercTrack(
  cycleLength: number,
  density: RhythmDensity,
  silence: SilenceStrategy,
): RhythmTrack {
  const pos = generatePositions(cycleLength, density, 'chaotic', silence)
    .filter(() => Math.random() > 0.5); // even sparser
  return {
    id: 'perc-gen', name: 'Perc', voice: 'perc', cycleLength,
    events: pos.map(p => ({
      voice: 'perc' as PercussionVoice, position: p,
      velocity: Math.round(range(40, 70)), probability: range(0.6, 0.9),
      accent: false, timingOffset: 0, humanization: range(5, 15), ratchet: 1, swing: 0,
    })),
    mute: false, solo: false, volume: 50, pan: 0,
  };
}

// ─── Generate Bass track ─────────────────────────────────────────────────────

function generateBassTrack(
  kickPositions: number[],
  cycleLength: number,
  register: Register,
  noteLen: NoteLength,
  _timingFeel: TimingFeel,
): BassTrack {
  const [minNote, maxNote] = registerToMidiRange(register);
  const [minDur, maxDur] = noteLengthToDuration(noteLen);

  // Bass follows kick but with variations
  const events: BassEvent[] = [];

  for (const kp of kickPositions) {
    const pitch = Math.round(range(minNote, maxNote));
    events.push({
      position: kp,
      pitch: Math.round(pitch),
      velocity: Math.round(range(65, 90)),
      duration: Math.round(range(minDur, maxDur)),
      probability: range(0.85, 1),
      accent: kp === 0,
      timingOffset: 0,
      humanization: range(0, 10),
      ratchet: 1,
      swing: 0,
      tie: false,
      slide: false,
      ghost: false,
      mute: false,
    });
  }

  return {
    id: 'bass-gen', name: 'Bass', cycleLength,
    events, mute: false, volume: 80,
  };
}

// ─── Main Generator ──────────────────────────────────────────────────────────

let genIdCounter = Date.now();
function nextId(): string {
  return `gen-${(++genIdCounter).toString(36)}`;
}

/**
 * Generate a complete GrooveOrganism from a Genotype.
 * The same genotype with different seeds produces different results.
 * DNA is computed from the generated events.
 */
export function generateFromGenotype(
  genotype: Partial<GrooveGenotype> = {},
  name: string = 'Generated Groove',
  seed?: number,
): GrooveOrganism {
  // Use a simple seed based approach if provided
  if (seed !== undefined) {
    let s = seed;
    const origRandom = Math.random;
    Math.random = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    const result = generateFromGenotypeImpl(genotype, name);
    Math.random = origRandom;
    return result;
  }

  return generateFromGenotypeImpl(genotype, name);
}

function generateFromGenotypeImpl(
  genotype: Partial<GrooveGenotype>,
  name: string,
): GrooveOrganism {
  const g: GrooveGenotype = { ...DEFAULT_GENOTYPE, ...genotype };
  const cycleLengths = cycleLengthsForPolymeter(g.polymeter);
  const cl = (idx: number) => cycleLengths[idx % cycleLengths.length];

  // Generate kick positions (the foundation) using first cycle length
  const kickCL = cl(0);
  const kickPositions = generatePositions(kickCL, g.rhythmDensity, g.motion, g.silence);
  const kickAccents = placeAccents(kickPositions, g.accentStrategy, kickCL);
  const kickTrack = generateKickTrack(kickPositions, kickAccents, kickCL, g.timingFeel);

  // Apply entry timing to kick
  applyEntryTiming(kickTrack.events, g.entryTiming);

  // Generate snare with its own cycle length
  const snareTrack = generateSnareTrack(kickPositions, cl(1), g.kickSnare, g.timingFeel);

  // Generate hats with own cycle lengths
  const hatTracks = generateHatTracks(kickPositions, cl(2), g.kickHat);

  // Generate percussion
  const percTrack = generatePercTrack(cl(3), g.rhythmDensity, g.silence);

  // Assemble Wheel A (keep first 6 voices)
  const tracks: RhythmTrack[] = [kickTrack, snareTrack, ...hatTracks, percTrack].slice(0, 6);

  // Ensure 6 tracks even if some are empty
  while (tracks.length < 6) {
    tracks.push({
      id: `empty-${tracks.length}`, name: 'Ghost', voice: 'ghostPerc',
      cycleLength: cl(tracks.length), events: [], mute: false, solo: false, volume: 30, pan: 0,
    });
  }

  // Generate bass with its own cycle length
  const bassCL = cl(5);
  const bassTrack = generateBassTrack(kickPositions, bassCL, g.register, g.noteLength, g.timingFeel);

  const organism: GrooveOrganism = {
    id: nextId(),
    name,
    bpm: Math.round(range(120, 140)),
    swing: Math.round(swingFromFeel(g.timingFeel)),
    wheelA: { tracks },
    wheelB: { tracks: [bassTrack] },
    taxonomy: {
      kingdom: 'Generated',
      family: 'Genotype',
      genus: g.motion.charAt(0).toUpperCase() + g.motion.slice(1),
      species: name,
    },
    dna: null as any, // will be computed below
  };

  // Compute DNA from generated events
  const allPerc = tracks.flatMap(t => t.events);
  const allBass = [bassTrack].flatMap(t => t.events);
  const maxCL = Math.max(...tracks.map(t => t.cycleLength), bassCL);
  organism.dna = computeDNA(allPerc, allBass, maxCL);

  return organism;
}

// ─── Genotype Inference ─────────────────────────────────────────────────────

/**
 * Infer a Genotype from an existing GrooveOrganism.
 * This is an approximation — we analyse the organism's events and DNA
 * and guess what genotype would produce something similar.
 */
export function inferGenotype(organism: GrooveOrganism): GrooveGenotype {
  const d = organism.dna;
  const percTracks = organism.wheelA.tracks;
  const bassEvents = organism.wheelB.tracks.flatMap(t => t.events);

  // Rhythm density from DNA
  const rhythmDensity: RhythmDensity =
    d.density < 0.2 ? 'low' :
    d.density < 0.35 ? 'medium-low' :
    d.density < 0.55 ? 'medium' :
    d.density < 0.75 ? 'medium-high' : 'high';

  // Timing feel from swing axis + global swing
  const timingFeel: TimingFeel =
    d.swing < 0.1 && organism.swing < 10 ? 'rigid' :
    d.swing < 0.25 ? 'tight' :
    d.swing < 0.45 ? 'loose' :
    d.swing < 0.65 ? 'swung' : 'heavy';

  // Motion from complexity + repetition
  const motion: Motion =
    d.repetition > 0.8 ? 'static' :
    d.complexity < 0.3 && d.repetition > 0.5 ? 'walking' :
    d.complexity < 0.6 && d.repetition > 0.3 ? 'rolling' :
    d.randomness < 0.4 ? 'pendulum' : 'chaotic';

  // Silence from event count / density
  const silence: SilenceStrategy =
    d.density > 0.7 ? 'continuous' :
    d.density > 0.5 ? 'breathing' :
    d.density > 0.3 ? 'punctuated' :
    d.aggression > 0.6 ? 'fragmented' : 'absent';

  // Accent strategy from aggression + ghostFactor
  const accentStrategy: AccentStrategy =
    d.aggression < 0.15 ? 'flat' :
    d.ghostFactor > 0.5 ? 'fragmented' :
    d.aggression < 0.4 ? 'rotating' :
    d.complexity > 0.5 ? 'euclidean' : 'fragmented';

  // Entry timing from timing offsets in events
  const earlyCount = percTracks.filter(t => t.events.some(e => e.timingOffset < -0.05)).length;
  const entryTiming: EntryTiming =
    earlyCount > 2 ? 'early' : 'on';

  // Register from bass pitch range
  const bassPitches = bassEvents.map(e => e.pitch);
  const avgPitch = bassPitches.length > 0
    ? bassPitches.reduce((a, b) => a + b, 0) / bassPitches.length
    : 48;
  const register: Register =
    avgPitch < 30 ? 'sub-harmonic' :
    avgPitch < 42 ? 'low' :
    avgPitch < 54 ? 'mid' : 'high';

  // Note length from average bass duration
  const avgDur = bassEvents.length > 0
    ? bassEvents.reduce((a, e) => a + e.duration, 0) / bassEvents.length
    : 4;
  const noteLength: NoteLength =
    avgDur < 1.5 ? 'micro' :
    avgDur < 2.5 ? 'staccato' :
    avgDur < 4.5 ? 'short' :
    avgDur < 8.5 ? 'medium' :
    avgDur < 12.5 ? 'long' :
    avgDur < 18 ? 'sustained' : 'drone';

  // Kick-snare: check positions
  const kickPositions = new Set(percTracks.filter(t => t.voice === 'kick').flatMap(t => t.events.map(e => e.position)));
  const snarePositions = new Set(percTracks.filter(t => t.voice === 'snare').flatMap(t => t.events.map(e => e.position)));
  let overlapCount = 0, bounceCount = 0, anticipateCount = 0;
  for (const kp of kickPositions) {
    if (snarePositions.has(kp)) overlapCount++;
    if (snarePositions.has((kp + 1) % (kickPositions.size * 4))) bounceCount++;
    if (snarePositions.has((kp - 1 + (kickPositions.size * 4)) % (kickPositions.size * 4))) anticipateCount++;
  }
  const kickSnare: KickSnareRel =
    overlapCount > kickPositions.size * 0.5 ? 'follow' :
    bounceCount > kickPositions.size * 0.3 ? 'bounce' :
    anticipateCount > kickPositions.size * 0.3 ? 'anticipate' : 'ignore';

  // Kick-hat: use DNA ghostFactor
  const kickHat: KickHatRel =
    d.ghostFactor < 0.1 ? 'independent' :
    d.ghostFactor < 0.3 ? 'weak' :
    d.ghostFactor < 0.5 ? 'medium' :
    d.ghostFactor < 0.7 ? 'strong' : 'locked';

  // Polymeter: check variance in cycle lengths
  const cls = percTracks.map(t => t.cycleLength);
  const unique = new Set(cls);
  const polymeter: PolymeterType =
    unique.size === 1 ? 'fixed' :
    unique.size <= 3 ? 'extended' :
    Math.max(...cls) - Math.min(...cls) > 10 ? 'rotating' : 'polymetric';

  // Mutation strength: from DNA randomness
  const mutationStrength: MutationStrength =
    d.randomness < 0.2 ? 'conservative' :
    d.randomness < 0.4 ? 'moderate' :
    d.randomness < 0.6 ? 'aggressive' : 'chaotic';

  // ── Modal bass — infer from existing bass events ───────────────
  // Pick the most common pitch class to guess scale root; choose a scale
  // family by interval distribution.  Fall back to aeolian if no bass.
  let scaleFamily: ScaleFamily = 'aeolian';
  if (bassEvents.length >= 2) {
    const pcs = bassEvents.map(e => ((e.pitch % 12) + 12) % 12);
    const histo = new Array(12).fill(0);
    for (const pc of pcs) histo[pc]++;
    const root = histo.indexOf(Math.max(...histo));
    const relPcs = new Set(pcs.map(p => (p - root + 12) % 12));
    // Score a few scales by overlap with observed pitch classes.
    const candidates: ScaleFamily[] = ['aeolian', 'dorian', 'phrygian', 'minorPentatonic', 'hirajoshi', 'wholeTone'];
    let bestScale: ScaleFamily = 'aeolian';
    let bestScore = -1;
    const intervals: Record<ScaleFamily, number[]> = {
      ionian: [0,2,4,5,7,9,11], dorian: [0,2,3,5,7,9,10], phrygian: [0,1,3,5,7,8,10],
      lydian: [0,2,4,6,7,9,11], mixolydian: [0,2,4,5,7,9,10], aeolian: [0,2,3,5,7,8,10],
      locrian: [0,1,3,5,6,8,10],
      majorPentatonic: [0,2,4,7,9], minorPentatonic: [0,3,5,7,10],
      inSen: [0,1,5,7,10], hirajoshi: [0,2,3,7,8], kumoi: [0,2,3,7,9], iwato: [0,1,5,6,10], akebono: [0,2,3,7,8],
      harmonicMinor: [0,2,3,5,7,8,11], melodicMinor: [0,2,3,5,7,9,11], doubleHarmonic: [0,1,4,5,7,8,11],
      hungarianMinor: [0,2,3,6,7,8,11], ukrainianDorian: [0,2,3,6,7,9,10], persian: [0,1,4,5,6,8,11],
      arabicHijaz: [0,1,4,5,7,8,10], arabicMaqamRast: [0,2,4,5,7,9,10],
      balkanPhrygianDominant: [0,1,4,5,7,8,10], balkanGypsy: [0,2,3,6,7,8,11],
      wholeTone: [0,2,4,6,8,10], octatonic: [0,2,3,5,6,8,9,11], chromaticConstrained: [0,1,2,3,4,5,7],
    };
    for (const c of candidates) {
      const set = new Set(intervals[c]);
      let s = 0;
      for (const pc of relPcs) if (set.has(pc)) s++;
      if (s > bestScore) { bestScore = s; bestScale = c; }
    }
    scaleFamily = bestScale;
  }

  // Phrase behaviour from existing motion + DNA repetition.
  const phraseBehavior: PhraseBehavior =
    motion === 'walking'   ? 'walking' :
    motion === 'rolling'   ? 'rolling' :
    motion === 'pendulum'  ? 'pendulum' :
    motion === 'chaotic'   ? 'spiral' :
    d.repetition > 0.7     ? 'hypnotic' :
    d.density < 0.25       ? 'minimal' :
                             'walking';

  const harmonicGravity: HarmonicGravity =
    d.repetition > 0.6 ? 'strong' :
    d.repetition > 0.35 ? 'medium' :
                          'weak';

  // Average interval size (semitones) between consecutive bass notes.
  let avgJump = 0;
  if (bassEvents.length >= 2) {
    const sorted = [...bassEvents].sort((a, b) => a.position - b.position);
    let n = 0, sum = 0;
    for (let i = 1; i < sorted.length; i++) {
      sum += Math.abs(sorted[i].pitch - sorted[i - 1].pitch);
      n++;
    }
    avgJump = n > 0 ? sum / n : 0;
  }
  const intervalPreference: IntervalPreference =
    avgJump < 2.5 ? 'stepwise' :
    avgJump < 5   ? 'mixed'    :
                    'leaping';

  return {
    rhythmDensity, accentStrategy, timingFeel, entryTiming,
    motion, noteLength, register, kickSnare, kickHat,
    silence, mutationStrength, polymeter,
    scaleFamily, phraseBehavior, harmonicGravity, intervalPreference,
  };
}
