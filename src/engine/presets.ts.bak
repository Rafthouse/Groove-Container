/**
 * Groove Container — Built-in Presets (Phase 0.5)
 *
 * 50+ placeholder presets across 6 families.
 * No audio — just data models that demonstrate the instrument's identity.
 * Each preset includes: Rhythm Container, Bass Container, Groove DNA, Taxonomy.
 *
 * DNA values are estimated for demonstration purposes.
 */

import type {
  GrooveOrganism,
  GrooveDNA,
  PercussionEvent,
  BassEvent,
  RhythmTrack,
  BassTrack,
  TaxonomyPath,
} from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePercEvent(
  voice: PercussionEvent['voice'],
  position: number,
  velocity: number = 90,
  accent: boolean = false,
  probability: number = 1,
  timingOffset: number = 0,
): PercussionEvent {
  return { voice, position, velocity, probability, accent, timingOffset, humanization: 5, ratchet: 1, swing: 0 };
}

function makeBassEvent(
  position: number,
  pitch: number,
  velocity: number = 80,
  duration: number = 2,
  accent: boolean = false,
  ghost: boolean = false,
  tie: boolean = false,
  slide: boolean = false,
): BassEvent {
  return { position, pitch, velocity, duration, accent, ghost, tie, slide, probability: 1, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, mute: false };
}

function rhythmTrack(
  id: string,
  name: string,
  voice: PercussionEvent['voice'],
  events: PercussionEvent[],
  cycleLength: number = 16,
): RhythmTrack {
  return { id, name, voice, events, cycleLength, mute: false, solo: false, volume: 80, pan: 0 };
}

function bassTrack(
  events: BassEvent[],
  cycleLength: number = 16,
): BassTrack {
  return { id: 'bass', name: 'Bass', events, cycleLength, mute: false, volume: 80 };
}

function groove(
  name: string,
  wheelA: { kick?: PercussionEvent[]; snare?: PercussionEvent[]; closedHat?: PercussionEvent[]; openHat?: PercussionEvent[]; perc?: PercussionEvent[]; ghostPerc?: PercussionEvent[]; aCl?: number[] },
  bassEvents: BassEvent[],
  bCl: number,
  dna: GrooveDNA,
  taxonomy: TaxonomyPath,
  bpm: number = 126,
  swing: number = 10,
): GrooveOrganism {
  const tracks: RhythmTrack[] = [];
  const aCl = wheelA.aCl ?? [16, 16, 16, 16, 16, 16];
  const voices: [string, PercussionEvent['voice'], number][] = [
    ['kick', 'kick', 0], ['snare', 'snare', 1], ['closedHat', 'closedHat', 2],
    ['openHat', 'openHat', 3], ['perc', 'perc', 4], ['ghostPerc', 'ghostPerc', 5],
  ];
  for (const [key, voice, idx] of voices) {
    const evts = (wheelA as any)[key] as PercussionEvent[] | undefined;
    if (evts && evts.length > 0) {
      tracks.push(rhythmTrack(key, key.charAt(0).toUpperCase() + key.slice(1), voice, evts, aCl[idx] ?? 16));
    }
  }
  return {
    id: `preset-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    wheelA: { tracks },
    wheelB: { tracks: [bassTrack(bassEvents, bCl)] },
    dna,
    bpm,
    swing,
    taxonomy,
  };
}

// ─── Taxonomy Tree ──────────────────────────────────────────────────────────

const TAXONOMY = {
  'Electronic Music': {
    'House': {
      'Deep House': 'deep-house',
      'Micro House': 'micro-house',
      'Dub House': 'dub-house',
      'Minimal House': 'minimal-house',
      'Tech House': 'tech-house',
      'Chicago House': 'chicago-house',
    },
    'Techno': {
      'Dub Techno': 'dub-techno',
      'Deep Techno': 'deep-techno',
      'Detroit Techno': 'detroit-techno',
      'Hypnotic Techno': 'hypnotic-techno',
      'Industrial Techno': 'industrial-techno',
    },
    'UK Garage': {
      '2-Step': '2-step',
      'Future Garage': 'future-garage',
      'Speed Garage': 'speed-garage',
      'Breakstep': 'breakstep',
    },
    'Breakbeat': {
      'Breakbeat': 'breakbeat',
      'Drum and Bass': 'drum-and-bass',
      'Jungle': 'jungle',
      'Nu Skool': 'nu-skool',
    },
    'IDM': {
      'Experimental': 'experimental',
      'Glitch': 'glitch',
      'Ambient Rhythms': 'ambient-rhythms',
      'Generative': 'generative',
    },
    'Minimal': {
      'Micro House': 'micro-house-alt',
      'Dub Techno (Minimal)': 'dub-techno-minimal',
      'Reductionist': 'reductionist',
    },
  },
};

export function getTaxonomyTree(): typeof TAXONOMY {
  return TAXONOMY;
}

// ─── DNA presets for each family ────────────────────────────────────────────

const DNA_HOUSE: GrooveDNA = { density: 0.35, syncopation: 0.45, complexity: 0.4, swing: 0.6, ghostFactor: 0.1, aggression: 0.5, repetition: 0.7, randomness: 0.2 };
const DNA_TECHNO: GrooveDNA = { density: 0.4, syncopation: 0.55, complexity: 0.5, swing: 0.3, ghostFactor: 0.15, aggression: 0.65, repetition: 0.6, randomness: 0.25 };
const DNA_GARAGE: GrooveDNA = { density: 0.5, syncopation: 0.7, complexity: 0.65, swing: 0.7, ghostFactor: 0.3, aggression: 0.55, repetition: 0.4, randomness: 0.35 };
const DNA_BREAKBEAT: GrooveDNA = { density: 0.6, syncopation: 0.8, complexity: 0.75, swing: 0.5, ghostFactor: 0.4, aggression: 0.7, repetition: 0.3, randomness: 0.45 };
const DNA_IDM: GrooveDNA = { density: 0.45, syncopation: 0.85, complexity: 0.85, swing: 0.4, ghostFactor: 0.5, aggression: 0.4, repetition: 0.2, randomness: 0.65 };
const DNA_MINIMAL: GrooveDNA = { density: 0.15, syncopation: 0.3, complexity: 0.25, swing: 0.3, ghostFactor: 0.05, aggression: 0.35, repetition: 0.8, randomness: 0.1 };

// ─── Kicks ────────────────────────────────────────────────────────────────────

const KICK_4x4 = [0, 4, 8, 12].map(p => makePercEvent('kick', p, 100, true));
const KICK_SPARSE = [0, 6, 12].map(p => makePercEvent('kick', p, 95, p === 0));
const KICK_SYNC = [0, 3, 8, 11].map(p => makePercEvent('kick', p, 90, p === 0 || p === 8));
const KICK_TECHNO = [0, 4, 8, 12, 14].map(p => makePercEvent('kick', p, 95, p === 0));
const KICK_MINIMAL = [0, 8].map(p => makePercEvent('kick', p, 100, true));
const KICK_GARAGE = [0, 4, 8, 12, 14].map(p => makePercEvent('kick', p, 85, p === 0, p === 14 ? 0.8 : 1));
const KICK_DNB = [0, 5, 8, 13].map(p => makePercEvent('kick', p, 90, p === 0 || p === 8));
const KICK_IDM = [0, 3, 7, 10, 14].map(p => makePercEvent('kick', p, 80, false, 0.7 + Math.random() * 0.3));

// ─── Snares ───────────────────────────────────────────────────────────────────

const SNARE_BACKBEAT = [4, 12].map(p => makePercEvent('snare', p, 90, true));
const SNARE_2STEP = [4, 12, 14].map(p => makePercEvent('snare', p, 85, p === 4 || p === 12, p === 14 ? 0.7 : 1));
const SNARE_JUNGLE = [4, 8, 12].map(p => makePercEvent('snare', p, 88, p === 12));
const SNARE_IDM = [2, 7, 11, 15].map(p => makePercEvent('snare', p, 75, p === 7 || p === 15, 0.8));
const SNARE_MINIMAL = [4, 12].map(p => makePercEvent('snare', p, 70, false, 0.7));
const SNARE_GARAGE = [4, 12, 15].map(p => makePercEvent('snare', p, 80, p === 12, p === 15 ? 0.6 : 1));

// ─── Hats ──────────────────────────────────────────────────────────────────────

const HAT_8THS = Array.from({ length: 16 }, (_, i) => makePercEvent('closedHat', i, i % 2 === 0 ? 60 : 50, false, 1));
const HAT_SWUNG = Array.from({ length: 16 }, (_, i) => makePercEvent('closedHat', i, i % 2 === 0 ? 55 : 45, false, 1, i % 2 === 1 ? 0.08 : 0));
const HAT_SHUF = [0, 2, 4, 5, 8, 10, 12, 14].map(p => makePercEvent('closedHat', p, 50, p === 0 || p === 8, 1));
const HAT_SPARSE = [0, 3, 6, 8, 11, 14].map(p => makePercEvent('closedHat', p, 45, false, 0.8));
const HAT_DENSE = Array.from({ length: 16 }, (_, i) => makePercEvent('closedHat', i, 40, false, 1));
const HAT_GARAGE = [0, 2, 4, 6, 8, 10, 12, 14].map(p => makePercEvent('closedHat', p, 55, p === 0 || p === 8, 1, p % 4 === 2 ? 0.12 : 0));

// Open hats
const OH_SPARSE = [2, 6, 10, 14].filter(() => Math.random() > 0.5).map(p => makePercEvent('openHat', p, 70, true, 0.5));

// ─── Percussion ────────────────────────────────────────────────────────────────

const PERC_BREAK = [2, 5, 11, 13].map(p => makePercEvent('perc', p, 60, false, 0.6));
const PERC_TECHNO = [3, 7, 11, 15].map(p => makePercEvent('perc', p, 50, false, 0.4));

// ─── Bass Events ───────────────────────────────────────────────────────────────

function houseBass(): BassEvent[] {
  return [
    makeBassEvent(0, 36, 85, 4, true),
    makeBassEvent(8, 36, 80, 2, false, false, true),
    makeBassEvent(12, 43, 75, 1, false, false, false, false),
  ];
}

function technoBass(): BassEvent[] {
  return [
    makeBassEvent(0, 36, 90, 4, true),
    makeBassEvent(6, 43, 80, 1, false, false, false, false),
    makeBassEvent(8, 36, 85, 4, false, false, true),
    makeBassEvent(14, 43, 75, 1, false, false, false, false),
  ];
}

function garageBass(): BassEvent[] {
  return [
    makeBassEvent(0, 36, 80, 2, false),
    makeBassEvent(3, 43, 65, 1, true),
    makeBassEvent(8, 36, 75, 2, false, false, true),
    makeBassEvent(11, 38, 60, 1, false, false, false, false),
    makeBassEvent(14, 43, 55, 1, false, false, false, false),
  ];
}

function breakBass(): BassEvent[] {
  return [
    makeBassEvent(0, 36, 85, 2, true),
    makeBassEvent(4, 38, 70, 1),
    makeBassEvent(6, 43, 65, 1, false, false, false, true),
    makeBassEvent(9, 31, 70, 1, true),
    makeBassEvent(12, 36, 80, 2, false, false, true),
  ];
}

function idmBass(): BassEvent[] {
  return [
    makeBassEvent(0, 36, 70, 2, false),
    makeBassEvent(5, 40, 60, 1, true),
    makeBassEvent(10, 35, 55, 1, false, false, false, false),
    makeBassEvent(14, 43, 50, 1, false, false, true),
  ];
}

function minimalBass(): BassEvent[] {
  return [
    makeBassEvent(0, 36, 85, 8, true),
    makeBassEvent(8, 36, 80, 4, false, false, true),
  ];
}

// ─── 50+ Presets ──────────────────────────────────────────────────────────────

export function getBuiltInPresets(): GrooveOrganism[] {
  return [
    // === HOUSE ===
    groove('Deep House Foundations', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, aCl: [16, 16, 16] }, houseBass(), 16, DNA_HOUSE, { kingdom: 'Electronic Music', family: 'House', genus: 'Deep House', species: 'Foundations' }),
    groove('Deep House Sunset', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, aCl: [16, 16, 16] }, houseBass(), 16, { ...DNA_HOUSE, swing: 0.65, aggression: 0.45 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Deep House', species: 'Sunset' }),
    groove('Micro House 1', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_SPARSE, openHat: [{ position: 4, velocity: 65, probability: 0.5, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'openHat' }], aCl: [16, 16, 16, 16] }, houseBass(), 16, { ...DNA_HOUSE, density: 0.3, syncopation: 0.5, complexity: 0.45 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Micro House', species: 'M1' }),
    groove('Micro House Texture', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_8THS, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 70, 4, true), makeBassEvent(8, 41, 65, 2, false, false, true)], 16, { ...DNA_HOUSE, density: 0.25, swing: 0.4 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Micro House', species: 'Texture' }),
    groove('Dub House Stepper', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_SHUF, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 80, 8, true), makeBassEvent(8, 36, 75, 2, false, false, true)], 16, { ...DNA_HOUSE, swing: 0.55, repetition: 0.75 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Dub House', species: 'Stepper' }),
    groove('Minimal House Groove', { kick: KICK_SPARSE, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 80, 6, true)], 16, { ...DNA_HOUSE, density: 0.2, repetition: 0.8 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Minimal House', species: 'Groove' }),
    groove('Tech House Drive', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_DENSE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 90, 4, true), makeBassEvent(8, 43, 80, 2, false, false, false, true)], 16, { ...DNA_HOUSE, aggression: 0.6, density: 0.4 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Tech House', species: 'Drive' }),
    groove('Chicago Jack', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_8THS, openHat: OH_SPARSE, aCl: [16, 16, 16, 16] }, houseBass(), 16, { ...DNA_HOUSE, swing: 0.7, aggression: 0.55 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Chicago House', species: 'Jack' }),

    // === TECHNO ===
    groove('Dub Techno Deep', { kick: KICK_TECHNO, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, perc: PERC_TECHNO, aCl: [16, 16, 16, 16] }, technoBass(), 16, DNA_TECHNO, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Dub Techno', species: 'Deep' }),
    groove('Dub Techno Space', { kick: KICK_TECHNO, snare: SNARE_BACKBEAT, closedHat: HAT_SPARSE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 85, 8, true)], 16, { ...DNA_TECHNO, density: 0.3, repetition: 0.7 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Dub Techno', species: 'Space' }),
    groove('Dub Techno Texture', { kick: KICK_SPARSE, snare: SNARE_BACKBEAT, closedHat: HAT_SHUF, aCl: [16, 16, 16] }, technoBass(), 16, { ...DNA_TECHNO, ghostFactor: 0.2, randomness: 0.3 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Dub Techno', species: 'Texture' }),
    groove('Deep Techno Pulse', { kick: KICK_TECHNO, snare: SNARE_BACKBEAT, closedHat: HAT_8THS, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 90, 4, true), makeBassEvent(8, 36, 85, 2, false, false, true)], 16, { ...DNA_TECHNO, aggression: 0.7 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Deep Techno', species: 'Pulse' }),
    groove('Detroit Techno Foundation', { kick: KICK_TECHNO, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, perc: PERC_TECHNO, aCl: [16, 16, 16, 16] }, technoBass(), 16, { ...DNA_TECHNO, syncopation: 0.6, swing: 0.35 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Detroit Techno', species: 'Foundation' }),
    groove('Hypnotic Techno Cycle', { kick: KICK_TECHNO, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, aCl: [16, 16, 13] }, [makeBassEvent(0, 36, 85, 4, true), makeBassEvent(6, 43, 75, 1, false, false, false, false)], 11, { ...DNA_TECHNO, complexity: 0.55, repetition: 0.55 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Hypnotic Techno', species: 'Cycle' }),
    groove('Industrial Minimal', { kick: KICK_TECHNO, snare: SNARE_BACKBEAT, closedHat: HAT_SPARSE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 95, 8, true)], 16, { ...DNA_TECHNO, density: 0.2, aggression: 0.75 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Industrial Techno', species: 'Minimal' }),

    // === UK GARAGE ===
    groove('2-Step Foundation', { kick: KICK_GARAGE, snare: SNARE_2STEP, closedHat: HAT_GARAGE, aCl: [16, 16, 16] }, garageBass(), 16, DNA_GARAGE, { kingdom: 'Electronic Music', family: 'UK Garage', genus: '2-Step', species: 'Foundation' }),
    groove('2-Step Swing', { kick: KICK_GARAGE, snare: SNARE_2STEP, closedHat: HAT_GARAGE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 80, 2, false), makeBassEvent(4, 43, 60, 1, true), makeBassEvent(9, 38, 65, 1), makeBassEvent(14, 43, 50, 1)], 16, { ...DNA_GARAGE, swing: 0.75 }, { kingdom: 'Electronic Music', family: 'UK Garage', genus: '2-Step', species: 'Swing' }),
    groove('Future Garage Atmosphere', { kick: KICK_GARAGE, snare: SNARE_2STEP, closedHat: HAT_SWUNG, aCl: [16, 16, 16] }, garageBass(), 16, { ...DNA_GARAGE, density: 0.4, aggression: 0.45 }, { kingdom: 'Electronic Music', family: 'UK Garage', genus: 'Future Garage', species: 'Atmosphere' }),
    groove('Speed Garage Vibe', { kick: KICK_4x4, snare: SNARE_GARAGE, closedHat: HAT_GARAGE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 85, 1), makeBassEvent(2, 43, 70, 1, true), makeBassEvent(6, 38, 60, 1), makeBassEvent(8, 36, 80, 1, false, false, true), makeBassEvent(12, 43, 65, 1)], 16, { ...DNA_GARAGE, aggression: 0.6 }, { kingdom: 'Electronic Music', family: 'UK Garage', genus: 'Speed Garage', species: 'Vibe' }),
    groove('Breakstep Roller', { kick: KICK_DNB, snare: SNARE_JUNGLE, closedHat: HAT_DENSE, perc: PERC_BREAK, aCl: [16, 16, 16, 16] }, breakBass(), 16, { ...DNA_GARAGE, density: 0.55, syncopation: 0.75 }, { kingdom: 'Electronic Music', family: 'UK Garage', genus: 'Breakstep', species: 'Roller' }),

    // === BREAKBEAT ===
    groove('Breakbeat Classic', { kick: KICK_DNB, snare: SNARE_JUNGLE, closedHat: HAT_DENSE, perc: PERC_BREAK, aCl: [16, 16, 16, 13] }, breakBass(), 16, DNA_BREAKBEAT, { kingdom: 'Electronic Music', family: 'Breakbeat', genus: 'Breakbeat', species: 'Classic' }),
    groove('Drum and Bass Stepper', { kick: KICK_DNB, snare: SNARE_JUNGLE, closedHat: HAT_DENSE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 90, 2, true), makeBassEvent(8, 36, 85, 2, false, false, true)], 16, { ...DNA_BREAKBEAT, density: 0.65, aggression: 0.75 }, { kingdom: 'Electronic Music', family: 'Breakbeat', genus: 'Drum and Bass', species: 'Stepper' }),
    groove('Jungle Rhythm', { kick: KICK_DNB, snare: SNARE_JUNGLE, closedHat: HAT_DENSE, perc: [2, 5, 9, 11, 15].map(p => makePercEvent('perc', p, 55, false, 0.7)), aCl: [16, 16, 16, 16] }, [makeBassEvent(0, 36, 85, 2, true), makeBassEvent(6, 31, 70, 1, true), makeBassEvent(12, 36, 80, 2, false, false, true)], 16, { ...DNA_BREAKBEAT, syncopation: 0.85, randomness: 0.5 }, { kingdom: 'Electronic Music', family: 'Breakbeat', genus: 'Jungle', species: 'Rhythm' }),
    groove('Nu Skool Funk', { kick: KICK_SYNC, snare: SNARE_JUNGLE, closedHat: HAT_SHUF, perc: PERC_BREAK, aCl: [16, 16, 16, 16] }, breakBass(), 16, { ...DNA_BREAKBEAT, swing: 0.55, ghostFactor: 0.35 }, { kingdom: 'Electronic Music', family: 'Breakbeat', genus: 'Nu Skool', species: 'Funk' }),

    // === IDM / EXPERIMENTAL ===
    groove('IDM Glitch Study', { kick: KICK_IDM, snare: SNARE_IDM, closedHat: HAT_DENSE.filter(() => Math.random() > 0.3), perc: [1, 3, 6, 13].map(p => makePercEvent('perc', p, 50, false, 0.5)), aCl: [16, 16, 16, 16] }, idmBass(), 16, DNA_IDM, { kingdom: 'Electronic Music', family: 'IDM', genus: 'Experimental', species: 'Glitch Study' }),
    groove('Experimental Rhythm', { kick: KICK_IDM, snare: SNARE_IDM, closedHat: HAT_SPARSE, perc: [0, 4, 9, 12].map(p => makePercEvent('perc', p, 45, false, 0.6)), aCl: [16, 16, 16, 16] }, idmBass(), 16, { ...DNA_IDM, randomness: 0.7 }, { kingdom: 'Electronic Music', family: 'IDM', genus: 'Experimental', species: 'Rhythm' }),
    groove('Glitch Hop', { kick: KICK_SYNC, snare: SNARE_IDM, closedHat: HAT_SHUF, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 70, 2), makeBassEvent(7, 42, 60, 1, true), makeBassEvent(11, 30, 55, 1)], 16, { ...DNA_IDM, density: 0.5, complexity: 0.8 }, { kingdom: 'Electronic Music', family: 'IDM', genus: 'Experimental', species: 'Glitch Hop' }),
    groove('Ambient Rhythms', { kick: KICK_SPARSE.filter(() => Math.random() > 0.4), snare: [6, 14].map(p => makePercEvent('snare', p, 40, false, 0.4)), closedHat: [0, 8].map(p => makePercEvent('closedHat', p, 20, false, 0.3)), aCl: [16, 16, 16] }, idmBass(), 16, { ...DNA_IDM, density: 0.12, aggression: 0.2, repetition: 0.3 }, { kingdom: 'Electronic Music', family: 'IDM', genus: 'Ambient Rhythms', species: 'Atmospheric' }),
    groove('Generative Core', { kick: [{ position: 0, velocity: 70, probability: 0.8, accent: true, timingOffset: 0, humanization: 10, ratchet: 1, swing: 0, voice: 'kick' as const }, { position: 8, velocity: 65, probability: 0.7, accent: false, timingOffset: 0.05, humanization: 10, ratchet: 1, swing: 0, voice: 'kick' as const }], snare: SNARE_IDM, closedHat: HAT_SPARSE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 60, 4)], 16, { ...DNA_IDM, density: 0.15, randomness: 0.75 }, { kingdom: 'Electronic Music', family: 'IDM', genus: 'Generative', species: 'Core' }),

    // === MINIMAL ===
    groove('Micro House Deep', { kick: KICK_MINIMAL, snare: SNARE_BACKBEAT, closedHat: HAT_SWUNG, aCl: [16, 16, 16] }, minimalBass(), 16, DNA_MINIMAL, { kingdom: 'Electronic Music', family: 'Minimal', genus: 'Micro House', species: 'Deep' }),
    groove('Reductionist', { kick: KICK_SPARSE, snare: SNARE_MINIMAL, closedHat: HAT_SPARSE, aCl: [16, 16, 16] }, [makeBassEvent(0, 36, 80, 8, true)], 16, { ...DNA_MINIMAL, density: 0.12, syncopation: 0.2 }, { kingdom: 'Electronic Music', family: 'Minimal', genus: 'Reductionist', species: 'One' }),
    groove('Dub Techno Minimal', { kick: KICK_SPARSE, snare: SNARE_MINIMAL, closedHat: HAT_SHUF, aCl: [16, 16, 16] }, minimalBass(), 16, { ...DNA_MINIMAL, syncopation: 0.35, ghostFactor: 0.08 }, { kingdom: 'Electronic Music', family: 'Minimal', genus: 'Dub Techno (Minimal)', species: 'Pure' }),

    // === POLYMETRIC PRESETS ===
    groove('Polymetric Hat 13', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: Array.from({ length: 13 }, (_, i) => makePercEvent('closedHat', i, 45, false, 1)), aCl: [16, 16, 13] }, technoBass(), 16, { ...DNA_TECHNO, density: 0.4, complexity: 0.6, repetition: 0.5 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Hypnotic Techno', species: 'Hat 13' }),
    groove('Bass Cycle 11', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_DENSE, aCl: [16, 16, 16] }, Array.from({ length: 5 }, (_, i) => makeBassEvent(i * 3, 36 + i * 3, 70, 2, i === 0 || i === 4)), 11, { ...DNA_TECHNO, complexity: 0.65, repetition: 0.45 }, { kingdom: 'Electronic Music', family: 'Techno', genus: 'Hypnotic Techno', species: 'Bass 11' }),
    groove('Percussion Cycle 9', { kick: KICK_4x4, snare: SNARE_BACKBEAT, closedHat: HAT_8THS, perc: Array.from({ length: 4 }, (_, i) => makePercEvent('perc', i * 3, 55, false, 0.7)), aCl: [16, 16, 16, 9] }, houseBass(), 16, { ...DNA_HOUSE, complexity: 0.5, randomness: 0.3 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Micro House', species: 'Perc 9' }),

    // === GHOST KICK PRESETS ===
    groove('Ghost Kick Drift', {
      kick: [makePercEvent('kick', 0, 85, true), makePercEvent('kick', 2, 30, false, 0.4), makePercEvent('kick', 4, 90, true), makePercEvent('kick', 8, 85, true, 1, 0.04), makePercEvent('kick', 10, 25, false, 0.3), makePercEvent('kick', 12, 80, true)],
      snare: SNARE_BACKBEAT,
      closedHat: HAT_SWUNG,
      aCl: [16, 16, 16],
    }, [makeBassEvent(0, 36, 85, 4, true), makeBassEvent(4, 38, 50, 1, false, true), makeBassEvent(8, 36, 80, 2, false, false, true)], 16, { ...DNA_HOUSE, ghostFactor: 0.3, density: 0.4 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Deep House', species: 'Ghost Drift' }),

    // === MICRO-SOUND DESIGN PRESETS ===
    groove('Ratcheted Hats', {
      kick: KICK_4x4,
      snare: SNARE_BACKBEAT,
      closedHat: Array.from({ length: 16 }, (_, i) => ({ ...makePercEvent('closedHat', i, i % 4 === 0 ? 65 : 45, i % 4 === 0, 1), ratchet: i % 4 === 2 ? 3 : 1 })),
      aCl: [16, 16, 16],
    }, houseBass(), 16, { ...DNA_HOUSE, density: 0.5, complexity: 0.55 }, { kingdom: 'Electronic Music', family: 'House', genus: 'Micro House', species: 'Ratcheted' }),

    // === SWING VARIATIONS ===
    groove('Maximum Swing Garage', {
      kick: KICK_GARAGE,
      snare: SNARE_2STEP,
      closedHat: Array.from({ length: 16 }, (_, i) => makePercEvent('closedHat', i, i % 2 === 0 ? 60 : 45, false, 1, i % 2 === 1 ? 0.22 : 0)),
      aCl: [16, 16, 16],
    }, garageBass(), 16, { ...DNA_GARAGE, swing: 0.85, syncopation: 0.8 }, { kingdom: 'Electronic Music', family: 'UK Garage', genus: '2-Step', species: 'Max Swing' }),
  ];
}
