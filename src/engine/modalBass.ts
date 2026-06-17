/**
 * Modal bass generator.
 *
 * Combines:
 *   - a musical scale (church mode / pentatonic / Japanese / world / experimental)
 *   - a phrase contour (walking / rolling / pendulum / drone+movement / call-response / circular / spiral / minimal / hypnotic)
 *   - harmonic gravity (pull toward tonic on resolution beats)
 *   - interval preference (stepwise / mixed / leaping)
 *   - repetition policy (minimal / moderate / hypnotic)
 *   - rhythm context (anchors at kick positions, optional snare-syncopation)
 *
 * to produce a BassEvent[] over a fixed cycle.  Optionally preserves
 * user-edited events (those marked with editedManually=true).
 *
 * Pure module. Deterministic when seeded.
 */

import type { BassEvent, RhythmTrack } from './types';
import { resolveScaleNote, type ScaleFamily, type MidiNote } from './scales';
import {
  generatePhrase,
  type PhraseBehavior,
  type PhraseLength,
  type HarmonicGravity,
  type IntervalPreference,
  type RepetitionLevel,
  type PhraseStep,
} from './phrase';

export interface ModalBassOptions {
  scaleFamily: ScaleFamily;
  /** Root MIDI note (e.g. 36 = C2). Phrase degrees are resolved relative to this. */
  scaleRoot: MidiNote;

  /** Phrase contour. */
  behavior: PhraseBehavior;
  length: PhraseLength;

  gravity: HarmonicGravity;
  interval: IntervalPreference;
  repetition: RepetitionLevel;

  /** Optional rhythm context — kicks become anchors, snares become accent hints. */
  rhythmTracks?: RhythmTrack[];

  /** Cycle length in 16th steps; phrase wraps to this many positions. Defaults to `length`. */
  cycleLength?: number;

  /** Default note duration in 16th steps when phrase doesn't dictate one. */
  defaultDuration?: number;

  /** Allowed register, MIDI bounds (defaults to a wide bass range). */
  minNote?: MidiNote;
  maxNote?: MidiNote;

  /**
   * User-edited events to preserve.  Any position present here is left alone;
   * the generator skips it.
   */
  preserveEdited?: BassEvent[];

  /** Deterministic seed. */
  seed?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function clampNote(n: MidiNote, lo: MidiNote, hi: MidiNote): MidiNote {
  if (n < lo) return lo + ((n - lo) % 12 + 12) % 12; // fold up
  if (n > hi) return hi - ((hi - n) % 12 + 12) % 12; // fold down
  return n;
}

function anchorPositions(rhythmTracks: RhythmTrack[] | undefined, voice: string): number[] {
  if (!rhythmTracks) return [];
  return rhythmTracks
    .filter(t => t.voice === voice)
    .flatMap(t => t.events.map(e => e.position));
}

function buildBassEvent(
  step: PhraseStep,
  opts: ModalBassOptions,
): BassEvent {
  const note = resolveScaleNote(step.degree, opts.scaleFamily, opts.scaleRoot, 0);
  const lo = opts.minNote ?? 28; // E1
  const hi = opts.maxNote ?? 60; // C4
  const clamped = clampNote(note, lo, hi);
  return {
    position: step.position,
    velocity: Math.max(1, Math.min(127, step.velocity)),
    probability: 1,
    accent: step.accent,
    timingOffset: 0,
    humanization: step.accent ? 4 : 9,
    ratchet: 1,
    swing: 0,
    pitch: clamped,
    duration: opts.defaultDuration ?? 2,
    tie: !!step.tie,
    slide: !!step.slide,
    ghost: !!step.ghost,
    mute: false,
  };
}

// ─── Public entry point ──────────────────────────────────────────────

export function generateModalBass(opts: ModalBassOptions): BassEvent[] {
  const cycle = opts.cycleLength ?? opts.length;
  const anchors = anchorPositions(opts.rhythmTracks, 'kick');
  const snareAnchors = anchorPositions(opts.rhythmTracks, 'snare');

  const phrase = generatePhrase({
    behavior: opts.behavior,
    length: opts.length,
    scale: opts.scaleFamily,
    gravity: opts.gravity,
    interval: opts.interval,
    repetition: opts.repetition,
    anchors,
    seed: opts.seed,
  });

  // Build events; if phrase length doesn't match cycle, wrap modulo cycle.
  const eventsByPos = new Map<number, BassEvent>();

  for (const step of phrase) {
    const pos = step.position % cycle;
    const ev = buildBassEvent({ ...step, position: pos }, opts);
    // If a snare accent lands here, syncopate slightly by lifting velocity.
    if (snareAnchors.includes(pos)) {
      ev.accent = true;
      ev.velocity = Math.min(127, ev.velocity + 10);
    }
    // Avoid clashing onsets within the same cycle — last-write-wins,
    // but prefer higher-velocity / accented variants.
    const existing = eventsByPos.get(pos);
    if (!existing || ev.velocity > existing.velocity) eventsByPos.set(pos, ev);
  }

  // Merge user-edited events, which take priority and are never overwritten.
  const preserved = (opts.preserveEdited ?? []).filter(e => e.editedManually);
  for (const e of preserved) {
    eventsByPos.set(e.position % cycle, e);
  }

  // Phrase generators rarely place a note past `length`; for very long
  // cycleLengths (e.g. polymeter Bass 11) tile the phrase to fill the cycle.
  if (cycle > opts.length) {
    const baseEvents = [...eventsByPos.values()].filter(e => !e.editedManually);
    let tilePos = opts.length;
    while (tilePos < cycle) {
      for (const src of baseEvents) {
        const newPos = (src.position + tilePos) % cycle;
        if (eventsByPos.has(newPos)) continue; // don't overwrite earlier ticks
        eventsByPos.set(newPos, { ...src, position: newPos });
      }
      tilePos += opts.length;
    }
  }

  // Force at least one downbeat — phrases always start at 0.  If user
  // edits removed it, that's fine; otherwise guarantee something there.
  if (!eventsByPos.has(0) && phrase.length > 0) {
    const first = phrase.find(p => p.position === 0) ?? phrase[0];
    eventsByPos.set(0, buildBassEvent({ ...first, position: 0 }, opts));
  }

  return [...eventsByPos.values()].sort((a, b) => a.position - b.position);
}

// ─── Convenience: register → MIDI range ──────────────────────────────

export type Register = 'sub-harmonic' | 'low' | 'mid' | 'high';

export function registerToRange(reg: Register): { min: MidiNote; max: MidiNote; root: MidiNote } {
  switch (reg) {
    case 'sub-harmonic': return { min: 24, max: 44, root: 28 }; // E1..A2, root E1
    case 'low':          return { min: 28, max: 50, root: 36 }; // E1..D3, root C2
    case 'mid':          return { min: 36, max: 60, root: 48 }; // C2..C4, root C3
    case 'high':         return { min: 48, max: 72, root: 60 }; // C3..C5, root C4
  }
}
