/**
 * Bass-Rhythm Linkage Engine.
 *
 * The core innovation of Groove Container: bass does NOT exist independently.
 * Bass events are generated FROM rhythm events according to biologically-inspired
 * rules. This is what makes a groove an ORGANISM rather than a collection of
 * independent tracks.
 *
 * Rules:
 *   Kick event → strong bass event (root note)
 *   Ghost kick → bass grace note
 *   Snare accent → syncopated bass behavior (off-beat accent note)
 *   Hat density → increased bass subdivision
 *   Percussion accent → bass fill trigger
 */

import type { BassEvent, PercussionEvent, PercussionVoice, RhythmTrack } from './types';

// ─── Bass Note Selection ─────────────────────────────────────────────────────

export interface BassNoteMap {
  root: number;        // MIDI note (e.g. 36 = C2)
  fifth: number;       // 7 semitones above root
  octave: number;      // 12 semitones above root
  offBeat: number;     // For syncopated events
  ghost: number;       // For ghost notes
}

const DEFAULT_NOTE_MAP: BassNoteMap = {
  root: 36,     // C2
  fifth: 43,    // G2
  octave: 48,   // C3
  offBeat: 38,  // D2
  ghost: 28,    // E1
};

// ─── Linkage Rules ───────────────────────────────────────────────────────────

export interface LinkageConfig {
  /** Bass note mapping. */
  noteMap: BassNoteMap;
  /** Kick → strong bass: probability 0-1. */
  kickToBassProbability: number;
  /** Ghost kick → grace note: probability 0-1. */
  ghostKickToGraceProbability: number;
  /** Snare accent → syncopated bass: probability 0-1. */
  snareAccentToSyncopation: number;
  /** Hat density sensitivity: 0-1. Higher = more subdivision from fewer hats. */
  hatDensitySensitivity: number;
  /** Percussion accent → bass fill: probability 0-1. */
  percAccentToFill: number;
}

const DEFAULT_LINKAGE: LinkageConfig = {
  noteMap: DEFAULT_NOTE_MAP,
  kickToBassProbability: 0.85,
  ghostKickToGraceProbability: 0.4,
  snareAccentToSyncopation: 0.6,
  hatDensitySensitivity: 0.5,
  percAccentToFill: 0.3,
};

// ─── Bass Event Generation ───────────────────────────────────────────────────

/**
 * Generate a BassTrack from Wheel A percussion events.
 * This is the core "bass emerges from rhythm" function.
 */
export function generateBassFromRhythm(
  tracks: RhythmTrack[],
  cycleLength: number,
  config: Partial<LinkageConfig> = {},
): BassEvent[] {
  const cfg: LinkageConfig = { ...DEFAULT_LINKAGE, ...config };

  // Organize percussion events by voice
  const kickEvents = eventsForVoice(tracks, 'kick');
  const snareEvents = eventsForVoice(tracks, 'snare');
  const hatEvents = [...eventsForVoice(tracks, 'closedHat'), ...eventsForVoice(tracks, 'openHat')];
  const percEvents = eventsForVoice(tracks, 'perc');

  const bassEvents: BassEvent[] = [];

  // Rule 1: Kick → strong bass event
  for (const kick of kickEvents) {
    if (Math.random() < cfg.kickToBassProbability) {
      // Ghost kicks → grace note
      if (isGhostKick(kick, kickEvents)) {
        if (Math.random() < cfg.ghostKickToGraceProbability) {
          bassEvents.push(createGraceNote(kick.position, cfg.noteMap));
        }
      } else {
        bassEvents.push(createBassEvent(
          kick.position,
          cfg.noteMap.root,
          pickDuration(1, 4),
          kick.accent,
          false,
        ));
      }
    }
  }

  // Rule 2: Snare accent → syncopated bass
  for (const snare of snareEvents) {
    if (snare.accent && Math.random() < cfg.snareAccentToSyncopation) {
      // Place the syncopated note slightly after the snare
      const syncPos = (snare.position + 1) % cycleLength;
      bassEvents.push(createBassEvent(
        syncPos,
        cfg.noteMap.offBeat,
        1,
        true,
        false,
      ));
    }
  }

  // Rule 3: Hat density → increased bass subdivision
  const hatDensity = hatEvents.length / Math.max(1, cycleLength);
  if (hatDensity > 0.4 * cfg.hatDensitySensitivity) {
    // Add ghost bass notes on hat positions (every other hat)
    for (let i = 0; i < hatEvents.length; i += 3) {
      const hat = hatEvents[i];
      bassEvents.push(createGhostNote(hat.position, cfg.noteMap));
    }
  }

  // Rule 4: Percussion accent → bass fill
  for (const perc of percEvents) {
    if (perc.accent && Math.random() < cfg.percAccentToFill) {
      // Quick fill: short rising note sequence
      for (let j = 0; j < 2; j++) {
        const fillPos = (perc.position + j * 2) % cycleLength;
        bassEvents.push(createBassEvent(
          fillPos,
          cfg.noteMap.root + j * 2,
          1,
          false,
          false,
        ));
      }
    }
  }

  // Sort by position, merge duplicates (keep the one with higher velocity)
  return mergeDuplicatePositions(bassEvents.sort((a, b) => a.position - b.position));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function eventsForVoice(
  tracks: RhythmTrack[],
  voice: PercussionVoice,
): PercussionEvent[] {
  return tracks
    .filter((t) => t.voice === voice)
    .flatMap((t) => t.events);
}

function isGhostKick(event: PercussionEvent, allKicks: PercussionEvent[]): boolean {
  // A "ghost kick" is a kick with low velocity (< 40) or low probability (< 0.3)
  return event.velocity < 40 || event.probability < 0.3;
}

function createBassEvent(
  position: number,
  pitch: number,
  duration: number,
  accent: boolean,
  tie: boolean,
): BassEvent {
  return {
    position,
    velocity: accent ? 90 : 70,
    probability: 1,
    accent,
    timingOffset: 0,
    humanization: accent ? 5 : 10,
    ratchet: 1,
    swing: 0,
    pitch,
    duration,
    tie,
    slide: false,
    ghost: false,
    mute: false,
  };
}

function createGraceNote(
  position: number,
  noteMap: BassNoteMap,
): BassEvent {
  return {
    position,
    velocity: 30,
    probability: 0.6,
    accent: false,
    timingOffset: -0.25, // slightly early (grace note feel)
    humanization: 15,
    ratchet: 1,
    swing: 0,
    pitch: noteMap.ghost,
    duration: 1,
    tie: false,
    slide: false,
    ghost: true,
    mute: false,
  };
}

function pickDuration(min: number, max: number): number {
  const durations = [1, 2, 4, 8];
  return durations[Math.floor(Math.random() * durations.length)];
}

function mergeDuplicatePositions(events: BassEvent[]): BassEvent[] {
  const seen = new Map<number, BassEvent>();
  for (const e of events) {
    const existing = seen.get(e.position);
    if (!existing || e.velocity > existing.velocity) {
      seen.set(e.position, e);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.position - b.position);
}
