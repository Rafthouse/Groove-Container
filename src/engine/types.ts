/**
 * Groove Container — Core Domain Types
 *
 * The fundamental departure from Euclidean Spielzeug:
 * Events are NOT boolean — they are rich structured objects with behavioral
 * properties. A groove is NOT a pattern — it is a GrooveOrganism.
 */

// ─── Fundamental Event Types ────────────────────────────────────────────────

/** Percussion voice slots for Wheel A (Rhythm Container). */
export type PercussionVoice =
  | 'kick'
  | 'snare'
  | 'closedHat'
  | 'openHat'
  | 'perc'
  | 'ghostPerc';

/**
 * Base event properties shared by all groove events.
 * Every event is first-class — there are no "silent steps" in the event model.
 * If a position has no event, it simply doesn't exist in the event array.
 */
export interface GrooveEvent {
  /** Grid position in 16th-note steps (0-based). */
  position: number;
  /** Dynamic level 0-100. 0 = silent (rest). */
  velocity: number;
  /** Probability 0-1 of this event firing on each cycle. */
  probability: number;
  /** Hard accent flag — marks the event as structurally important. */
  accent: boolean;
  /** Timing offset in fractions of a 16th-note (microtiming). Negative=early, positive=late. */
  timingOffset: number;
  /** Humanization jitter 0-100. Applied as random timing variation. */
  humanization: number;
  /** Ratchet count: 1 = single hit, 2-8 = sub-divide into N equal hits. */
  ratchet: number;
  /** Per-event swing override (0-100). Overrides global swing when > 0. */
  swing: number;
}

/** Wheel A event — percussion with voice assignment. */
export interface PercussionEvent extends GrooveEvent {
  voice: PercussionVoice;
}

/** Wheel B event — bass with pitch and articulation properties. */
export interface BassEvent extends GrooveEvent {
  /** MIDI note number 0-127. */
  pitch: number;
  /** Note duration in 16th-note steps. */
  duration: number;
  /** Legato tie to next note (no re-trigger). */
  tie: boolean;
  /** Portamento/glide to next note. */
  slide: boolean;
  /** Ghost note — played at reduced velocity with shortened duration. */
  ghost: boolean;
  /** Explicit rest — the position has a duration but no attack. */
  mute: boolean;
  /**
   * User-edited flag.  When true, regeneration skips this position so manual
   * edits (pitch / velocity / length / accent / tie / slide) survive the
   * next "Generate Bass".  Cleared only when the user requests an explicit
   * "Force regenerate".
   */
  editedManually?: boolean;
}

// ─── Wheel Types ────────────────────────────────────────────────────────────

/** A single percussion track on Wheel A. */
export interface RhythmTrack {
  id: string;
  name: string;
  voice: PercussionVoice;
  events: PercussionEvent[];
  /** Independent cycle length for polymeter support. */
  cycleLength: number;
  mute: boolean;
  solo: boolean;
  volume: number; // 0-100
  pan: number; // -100..+100
}

/** Wheel A — Rhythm Container (up to 6 percussion tracks). */
export interface WheelA {
  tracks: RhythmTrack[];
}

/** A single bass track on Wheel B. */
export interface BassTrack {
  id: string;
  name: string;
  events: BassEvent[];
  /** Independent cycle length for polymeter support. */
  cycleLength: number;
  mute: boolean;
  volume: number; // 0-100
}

/** Wheel B — Bass Container (1 track). */
export interface WheelB {
  tracks: BassTrack[];
}

// ─── Wheel C — Harmony Container ────────────────────────────────────────────

/** A single harmony event in a chord stream. */
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

/** Wheel C — Harmony Container (1 harmony stream). */
export interface WheelC {
  events: HarmonyEvent[];
  /** Scale family used for generation. */
  scaleFamily: string;
  /** Behavior used for generation. */
  behavior: string;
  /** Chord density used for generation. */
  density: string;
  /** Complexity used for generation. */
  complexity: string;
}

// ─── Groove DNA / Metacognition ──────────────────────────────────────────────

/**
 * Groove DNA — eight independent axes that describe a groove's character.
 * These are NOT cached; they are computed on demand. Mutation preserves
 * selected axes by keeping their values constant.
 */
export interface GrooveDNA {
  /** 0-1: How dense is the event set (events per step). */
  density: number;
  /** 0-1: How much syncopation (off-beat emphasis). */
  syncopation: number;
  /** 0-1: Rhythmic complexity (variety of inter-onset intervals). */
  complexity: number;
  /** 0-1: Swing feel (perceived shuffle). */
  swing: number;
  /** 0-1: Ghost note density (ratio of ghost/accented events). */
  ghostFactor: number;
  /** 0-1: Perceived aggression (velocity distribution skew + accent density). */
  aggression: number;
  /** 0-1: Pattern repetition / predictability. */
  repetition: number;
  /** 0-1: Randomness / entropy in event placement. */
  randomness: number;
}

// ─── Taxonomy ────────────────────────────────────────────────────────────────

/**
 * Biology-inspired classification for groove presets.
 *
 * Kingdom → Family → Genus → Species
 *
 * Example:
 *   Kingdom: "Electronic Music"
 *   Family:  "Techno"
 *   Genus:   "Dub Techno"
 *   Species: "Deep Dub Techno"
 */
export interface TaxonomyPath {
  kingdom: string;
  family: string;
  genus: string;
  species: string;
}

// ─── Top-Level Groove Organism ──────────────────────────────────────────────

/**
 * A GrooveOrganism is the top-level container.
 * NOT a "pattern" or "preset" — an organism has behavioral properties,
 * two biologically-linked wheels, and a DNA profile.
 */
export interface GrooveOrganism {
  id: string;
  name: string;
  wheelA: WheelA;
  wheelB: WheelB;
  /** Wheel C — Harmony Container. Optional; may be absent in rhythm-only organisms. */
  wheelC?: WheelC;
  dna: GrooveDNA;
  bpm: number;
  swing: number; // global swing 0-100
  taxonomy: TaxonomyPath;
}

// ─── Preset System ──────────────────────────────────────────────────────────

export type PresetKind = 'factory' | 'user';

export interface Preset {
  id: string;
  kind: PresetKind;
  name: string;
  description: string;
  tags: string[];
  groove: GrooveOrganism;
  version: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface PresetData {
  name: string;
  description: string;
  tags: string[];
  groove: GrooveOrganism;
}

// ─── Sequencing / Polymeter ──────────────────────────────────────────────────

/** Per-track cycle state during playback. */
export interface CycleState {
  trackId: string;
  cycleLength: number;
  currentPosition: number; // monotonic global step counter
  localStep: number; // currentPosition % cycleLength
}

/** The resolved output of a single cycle: which events fire at this step. */
export interface ResolvedEvent {
  event: GrooveEvent;
  scheduledTime: number; // absolute time in seconds
  velocity: number; // final velocity after probability gate
}
