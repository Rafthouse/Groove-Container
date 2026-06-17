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

// ─── Genotype-aware Linkage Config ─────────────────────────────────────────

// Inline genotype type references to avoid circular dependencies
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

/**
 * Get a LinkageConfig from groove genes.
 * Maps genotype to bass generation parameters:
 *   - kickSnare: affects whether bass follows, anticipates, or bounces off snare
 *   - kickHat: affects subdivision density from hats
 *   - register: sets bass note range
 *   - noteLength: sets bass note duration
 *   - timingFeel: affects probability of syncopation
 */
export function configFromGenotype(params: {
  kickSnare?: string;
  kickHat?: string;
  register?: string;
  noteLength?: string;
  timingFeel?: string;
}): Partial<LinkageConfig> {
  const config: Partial<LinkageConfig> = {};
  const nm: Partial<BassNoteMap> = {};

  // Register → note map
  switch (params.register) {
    case 'sub-harmonic': nm.root = 28; nm.fifth = 35; nm.octave = 40; nm.offBeat = 30; nm.ghost = 22; break;
    case 'low':          nm.root = 36; nm.fifth = 43; nm.octave = 48; nm.offBeat = 38; nm.ghost = 28; break;
    case 'mid':          nm.root = 48; nm.fifth = 55; nm.octave = 60; nm.offBeat = 50; nm.ghost = 40; break;
    case 'high':         nm.root = 60; nm.fifth = 67; nm.octave = 72; nm.offBeat = 62; nm.ghost = 52; break;
  }

  // Note length → duration distribution
  switch (params.noteLength) {
    case 'micro':     break; // 1-2 steps
    case 'staccato':  break; // 1-2 steps
    case 'short':     break; // 2-4 steps
    case 'medium':    break; // 4-8 steps
    case 'long':      break; // 8-12 steps
    case 'sustained': break; // 12-16 steps
    case 'drone':     break; // 16-32 steps
  }

  // Timing feel → syncopation probability
  switch (params.timingFeel) {
    case 'rigid': config.snareAccentToSyncopation = 0.2; break;
    case 'tight': config.snareAccentToSyncopation = 0.35; break;
    case 'loose': config.snareAccentToSyncopation = 0.5; break;
    case 'swung': config.snareAccentToSyncopation = 0.65; break;
    case 'heavy': config.snareAccentToSyncopation = 0.8; break;
  }

  // Kick-Hat coupling → hat density sensitivity
  switch (params.kickHat) {
    case 'independent': config.hatDensitySensitivity = 0.3; break;
    case 'weak':        config.hatDensitySensitivity = 0.4; break;
    case 'medium':      config.hatDensitySensitivity = 0.5; break;
    case 'strong':      config.hatDensitySensitivity = 0.7; break;
    case 'locked':      config.hatDensitySensitivity = 0.9; break;
  }

  // Kick-Snare → ghost probability + syncopation direction
  switch (params.kickSnare) {
    case 'ignore':    config.kickToBassProbability = 0.6; break;
    case 'bounce':    config.kickToBassProbability = 0.8; config.snareAccentToSyncopation = (config.snareAccentToSyncopation ?? 0.5) + 0.15; break;
    case 'follow':    config.kickToBassProbability = 0.95; break;
    case 'anticipate': config.kickToBassProbability = 0.7; break;
  }

  if (Object.values(nm).some(v => v !== undefined)) config.noteMap = { ...DEFAULT_NOTE_MAP, ...nm };
  return config;
}

/**
 * Generate bass from rhythm, with snare-kick relationship awareness.
 * If kickSnare = 'anticipate', bass can predict the snare.
 * If kickSnare = 'bounce', bass bounces off the snare.
 */
export function generateBassFromRhythmGenotype(
  tracks: RhythmTrack[],
  cycleLength: number,
  genotype: {
    kickSnare?: string;
    kickHat?: string;
    register?: string;
    noteLength?: string;
    timingFeel?: string;
  } = {},
): BassEvent[] {
  const cfg = configFromGenotype(genotype);
  const events = generateBassFromRhythm(tracks, cycleLength, cfg);

  // Additional rules based on kickSnare relationship
  if (genotype.kickSnare === 'anticipate') {
    const snareEvents = eventsForVoice(tracks, 'snare');
    for (const s of snareEvents) {
      // Bass anticipates snare: hit 1 step before each snare
      const antePos = (s.position - 1 + cycleLength) % cycleLength;
      if (!events.some(e => e.position === antePos)) {
        events.push(createBassEvent(antePos, cfg.noteMap?.offBeat ?? 38, 1, true, false));
      }
    }
  }

  if (genotype.kickSnare === 'bounce') {
    const kickEvents = eventsForVoice(tracks, 'kick');
    for (const k of kickEvents) {
      // Bass also hits 1 step after each kick (bounce)
      const bouncePos = (k.position + 1) % cycleLength;
      if (!events.some(e => e.position === bouncePos)) {
        events.push(createBassEvent(bouncePos, cfg.noteMap?.fifth ?? 43, 1, k.accent, false));
      }
    }
  }

  // Apply note length from genotype to all events
  if (genotype.noteLength) {
    const durations: Record<string, number> = {
      micro: 1, staccato: 1, short: 2, medium: 4, long: 8, sustained: 12, drone: 16,
    };
    const dur = durations[genotype.noteLength];
    for (const e of events) e.duration = dur;
  }

  return mergeDuplicatePositions(events.sort((a, b) => a.position - b.position));
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

function isGhostKick(event: PercussionEvent, _allKicks: PercussionEvent[]): boolean {
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

// Subtle ghost bass note triggered by hat density (Rule 3).
// Lower velocity than a grace note; sits in time, not before.
function createGhostNote(
  position: number,
  noteMap: BassNoteMap,
): BassEvent {
  return {
    position,
    velocity: 22,
    probability: 0.5,
    accent: false,
    timingOffset: 0,
    humanization: 8,
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

function pickDuration(_min: number, _max: number): number {
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
