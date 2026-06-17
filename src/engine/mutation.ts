/**
 * Groove Mutation Engine.
 *
 * Creates new GrooveOrganisms from existing ones by selectively randomizing
 * event dimensions while preserving selected structural axes.
 *
 * Mutation differs from random generation: it starts from an existing organism
 * and perturbs specific dimensions. This is how a producer evolves a groove
 * without losing its character.
 */

import type {
  GrooveOrganism,
  GrooveDNA,
  PercussionEvent,
  BassEvent,
  HarmonyEvent,
  RhythmTrack,
  WheelA,
  BassTrack,
  WheelB,
  WheelC,
} from './types';
import { computeDNA } from './dna';

// ─── Mutation Presets ───────────────────────────────────────────────────────

export interface MutationConfig {
  /** Preserve the overall style (keep density, syncopation, complexity constant). */
  preserveStyle: boolean;
  /** Don't touch Wheel B events. */
  preserveBass: boolean;
  /** Don't touch Wheel A events. */
  preserveRhythm: boolean;
  /** Keep complexity within a narrow band of original. */
  preserveComplexity: boolean;
  /** Keep accent positions stable. */
  preserveAccents: boolean;
  /** How much to mutate: 0.0 = none, 1.0 = full range. */
  strength: number;
}

const DEFAULT_MUTATION: MutationConfig = {
  preserveStyle: false,
  preserveBass: false,
  preserveRhythm: false,
  preserveComplexity: false,
  preserveAccents: false,
  strength: 0.3,
};

// ─── Random Helpers ─────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function maybe(fn: () => void, probability: number): void {
  if (Math.random() < probability) fn();
}

// ─── Event Mutation ─────────────────────────────────────────────────────────

function mutatePercussionEvent(
  event: PercussionEvent,
  strength: number,
  preserveAccents: boolean,
): PercussionEvent {
  const s = strength;
  const e = { ...event };

  maybe(() => { e.velocity = clamp(randInt(20, 100), 0, 100); }, s * 0.5);
  maybe(() => { e.probability = rand(0.2, 1); }, s * 0.3);
  maybe(() => { e.timingOffset = rand(-0.5, 0.5); }, s * 0.2);
  maybe(() => { e.humanization = randInt(0, 80); }, s * 0.2);
  maybe(() => { e.ratchet = randInt(1, 4); }, s * 0.15);
  maybe(() => { e.swing = randInt(0, 80); }, s * 0.2);

  if (!preserveAccents) {
    maybe(() => { e.accent = !e.accent; }, s * 0.2);
  }

  // Small chance to shift position (rhythm mutation)
  maybe(() => {
    const shift = randInt(-2, 2);
    e.position = Math.max(0, e.position + shift);
  }, s * 0.1);

  return e;
}

function mutateBassEvent(
  event: BassEvent,
  strength: number,
  preserveAccents: boolean,
): BassEvent {
  const s = strength;
  const e = { ...event };

  maybe(() => { e.pitch = clamp(randInt(24, 72), 0, 127); }, s * 0.4);
  maybe(() => { e.velocity = clamp(randInt(30, 100), 0, 100); }, s * 0.5);
  maybe(() => { e.duration = randInt(1, 8); }, s * 0.3);
  maybe(() => { e.probability = rand(0.3, 1); }, s * 0.3);
  maybe(() => { e.timingOffset = rand(-0.3, 0.3); }, s * 0.2);
  maybe(() => { e.humanization = randInt(0, 60); }, s * 0.2);
  maybe(() => { e.timingOffset = rand(-0.3, 0.3); }, s * 0.15);
  maybe(() => { e.ratchet = randInt(1, 3); }, s * 0.1);
  maybe(() => { e.swing = randInt(0, 60); }, s * 0.15);

  if (!preserveAccents) {
    maybe(() => { e.accent = !e.accent; }, s * 0.2);
  }

  // Ghost note toggle (subtle mutation)
  maybe(() => { e.ghost = !e.ghost; }, s * 0.15);

  // Tie/slide toggle
  maybe(() => { e.tie = !e.tie; }, s * 0.1);
  maybe(() => { e.slide = Math.random() > 0.5; }, s * 0.1);

  return e;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

// ─── Track-Level Mutation ───────────────────────────────────────────────────

function mutateRhythmTrack(
  track: RhythmTrack,
  config: MutationConfig,
): RhythmTrack {
  const mutated: RhythmTrack = {
    ...track,
    events: track.events.map((e) =>
      mutatePercussionEvent(e, config.strength, config.preserveAccents ?? false),
    ),
  };

  // Small chance to mutate cycle length
  maybe(() => {
    const delta = randInt(-4, 4);
    mutated.cycleLength = Math.max(4, mutated.cycleLength + delta);
  }, config.strength * 0.1);

  return mutated;
}

function mutateBassTrack(
  track: BassTrack,
  config: MutationConfig,
): BassTrack {
  const mutated: BassTrack = {
    ...track,
    events: track.events.map((e) =>
      mutateBassEvent(e, config.strength, config.preserveAccents ?? false),
    ),
  };

  maybe(() => {
    const delta = randInt(-4, 4);
    mutated.cycleLength = Math.max(4, mutated.cycleLength + delta);
  }, config.strength * 0.1);

  return mutated;
}

// ─── Organism-Level Mutation ─────────────────────────────────────────────────

/**
 * Mutate a GrooveOrganism, returning a NEW organism (immutable).
 * The original is never modified.
 *
 * Mutation respects the four preserve flags:
 *   preserveStyle → recompute DNA after mutation, re-scale to match original
 *   preserveBass → skip Wheel B entirely
 *   preserveRhythm → skip Wheel A entirely
 *   preserveComplexity → keep # of events + cycle lengths within bounds
 *   preserveAccents → don't flip accent flags
 */
export function mutateOrganism(
  organism: GrooveOrganism,
  config: Partial<MutationConfig> = {},
): GrooveOrganism {
  const cfg: MutationConfig = { ...DEFAULT_MUTATION, ...config };

  let wheelA: WheelA = { tracks: [...organism.wheelA.tracks] };
  let wheelB: WheelB = { tracks: [...organism.wheelB.tracks] };
  let wheelC: WheelC | undefined = organism.wheelC
    ? { ...organism.wheelC, events: [...organism.wheelC.events] }
    : undefined;

  // Mutate Wheel A unless preserved
  if (!cfg.preserveRhythm) {
    wheelA = {
      tracks: wheelA.tracks.map((t) => mutateRhythmTrack(t, cfg)),
    };
  }

  // Mutate Wheel B unless preserved
  if (!cfg.preserveBass) {
    wheelB = {
      tracks: wheelB.tracks.map((t) => mutateBassTrack(t, cfg)),
    };
  }

  // Mutate Wheel C (harmony) if present — randomize inversions and velocities
  if (wheelC) {
    wheelC = {
      ...wheelC,
      events: wheelC.events.map((ev) => {
        if (Math.random() > cfg.strength * 0.5) return ev;
        return {
          ...ev,
          inversion: Math.floor(Math.random() * 3),
          velocity: Math.max(20, Math.min(110, (ev.velocity || 80) + Math.floor((Math.random() - 0.5) * 40))),
        };
      }),
    };
  }

  // Recompute DNA
  const allPerc: PercussionEvent[] = wheelA.tracks.flatMap((t) => t.events);
  const allBass: BassEvent[] = wheelB.tracks.flatMap((t) => t.events);
  const maxCycleLength = Math.max(
    ...wheelA.tracks.map((t) => t.cycleLength),
    ...wheelB.tracks.map((t) => t.cycleLength),
  );
  const newDNA = computeDNA(allPerc, allBass, maxCycleLength);

  // If preserveStyle, keep the original DNA values
  const finalDNA: GrooveDNA = cfg.preserveStyle
    ? { ...organism.dna }
    : newDNA;

  // If preserveComplexity, restore event count to match original
  if (cfg.preserveComplexity) {
    // Count events per track and trim/pad to match original
    wheelA.tracks.forEach((t, i) => {
      const originalCount = organism.wheelA.tracks[i]?.events.length ?? t.events.length;
      if (t.events.length > originalCount) {
        t.events = t.events.slice(0, originalCount);
      }
    });
  }

  return {
    ...organism,
    wheelA,
    wheelB,
    wheelC,
    dna: finalDNA,
  };
}
