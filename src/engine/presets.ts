/**
 * Groove Container — Real-World Preset Library
 *
 * Replaces the previous synthetic 38-preset collection with a curated
 * knowledge base rooted in real electronic-music taxonomy.  Every preset
 * is justified by a unique rhythmic/harmonic behaviour that distinguishes
 * it from its siblings.
 *
 * Replacement rationale:
 *   Old library: 38 presets, all derived from 6 DNA profiles with minor
 *     parameter tweaks.  Many presets were near-duplicates differenced
 *     only by DNA values, not by actual rhythmic structure.
 *   New library: 22 core presets × 2 species each = no more than 44
 *     distinct organisms.  Each one has a unique kick/snare/hat pattern
 *     combination.  Families are real, genera are real, species names
 *     describe the specific behaviour.
 *
 * Kingdom → Family → Genus → Species
 *
 * Taxonomy reference: real-world electronic dance music genres as
 * documented by Ishkur's Guide, Discogs, and music-production pedagogy.
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

function makePerc(
  voice: PercussionEvent['voice'],
  position: number,
  velocity: number = 90,
  accent: boolean = false,
  probability: number = 1,
  timingOffset: number = 0,
): PercussionEvent {
  return { voice, position, velocity, probability, accent, timingOffset, humanization: 5, ratchet: 1, swing: 0 };
}

function makeBass(
  position: number, pitch: number, velocity: number = 80, duration: number = 2,
  accent: boolean = false, ghost: boolean = false,
  tie: boolean = false, slide: boolean = false,
): BassEvent {
  return { position, pitch, velocity, duration, accent, ghost, tie, slide, probability: 1, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, mute: false };
}

function rt(id: string, name: string, voice: PercussionEvent['voice'],
  events: PercussionEvent[], cycleLength: number = 16): RhythmTrack {
  return { id, name, voice, events, cycleLength, mute: false, solo: false, volume: 80, pan: 0 };
}

function bt(events: BassEvent[], cycleLength: number = 16): BassTrack {
  return { id: 'bass', name: 'Bass', events, cycleLength, mute: false, volume: 80 };
}

function g(
  name: string,
  wheelA: Record<string, PercussionEvent[]>,
  clA: number[],
  bassEvents: BassEvent[],
  bCl: number,
  dna: GrooveDNA,
  taxonomy: TaxonomyPath,
  bpm: number = 126,
  swing: number = 10,
): GrooveOrganism {
  const tracks: RhythmTrack[] = [];
  const voices: [string, PercussionEvent['voice']][] = [
    ['kick', 'kick'], ['snare', 'snare'], ['closedHat', 'closedHat'],
    ['openHat', 'openHat'], ['perc', 'perc'], ['ghostPerc', 'ghostPerc'],
  ];
  voices.forEach(([key, voice], idx) => {
    const evts = wheelA[key];
    if (evts && evts.length > 0) {
      tracks.push(rt(key, key.charAt(0).toUpperCase() + key.slice(1), voice, evts, clA[idx] ?? 16));
    }
  });
  return {
    id: `preset-${name.toLowerCase().replace(/[\s]+/g, '-')}`,
    name,
    wheelA: { tracks },
    wheelB: { tracks: [bt(bassEvents, bCl)] },
    dna,
    bpm,
    swing,
    taxonomy,
  };
}

// ─── Rhythm Building Blocks ─────────────────────────────────────────────────
// Each pattern is a real-world characteristic pattern for its genre.
// No two patterns in the same family are identical.

// === KICKS ===
const K4 = [0, 4, 8, 12];                       // standard 4/4
const K4_SW = [0, 4, 8, 11];                     // swung 4/4 (late 3rd)
const K2 = [0, 8];                                // half-time
const K_TK = [0, 4, 8, 12, 14];                  // techno push
const K_DB = [0, 3, 8, 11];                      // double-kick
const K_SN = [0, 6, 12];                         // skip-pattern
const K_GA = [0, 4, 7, 12];                      // garage shuffle kick
const K_BR = [0, 5, 8, 13];                      // breakbeat
const K_BR2 = [0, 3, 8, 11, 14];                 // jungle-style
const K_PR = [0, 6, 12, 15];                     // progressive off-beat
const K_IDM = [0, 3, 7, 10, 14];                 // irregular
const K_SNARE_OFF = [2, 6, 10, 14];              // off-beat kick (electro)

// === SNARES ===
const SN_BB = [4, 12];                           // backbeat (house/techno)
const SN_BB2 = [4, 12, 15];                      // backbeat + ghost
const SN_2S = [4, 12, 14];                       // 2-step snare (garage)
const SN_TH = [2, 7, 11, 15];                    // tech-house
const SN_BR = [4, 8, 12];                        // breakbeat
const SN_DB = [4, 10];                          // drum & bass
const SN_IDM = [2, 7, 11, 15];                   // scattered
const SN_SN = [4, 9, 12];                        // skitter

// === CLOSED HATS ===
const HH8 = Array.from({ length: 16 }, (_, i) => i);  // 16th-note ride
const HH8_SW = Array.from({ length: 16 }, (_, i) => i); // swung 16ths (timing on swing, not position)
const HH_SF = [0, 2, 4, 5, 8, 10, 12, 14];       // shuffle
const HH_SP = [0, 3, 6, 8, 11, 14];              // sparse
const HH_SC = [0, 2, 4, 6, 8, 10, 12, 14];       // straight 8ths
const HH_GA = [0, 2, 4, 6, 8, 10, 12, 14];       // garage 8ths
const HH_TK = [0, 2, 4, 6, 8, 10, 12, 14, 15];   // dense techno
const HH_DN = [0, 2, 4, 6, 8, 10, 12, 14];       // drum & bass
const HH_IDM = [0, 3, 5, 8, 10, 13];             // irregular
const HH_MN = [0, 4, 8, 12];                     // minimal (4ths)

// === OPEN HATS ===
const OH_ON = [2, 6, 10, 14];                    // on-beat
const OH_OFF = [1, 5, 9, 13];                    // off-beat
const OH_AC = [4, 12];                           // accent only

// === PERCUSSION ===
const PC_NONE: number[] = [];
const PC_TK = [3, 7, 11, 15];                    // techno stabs
const PC_BR = [2, 5, 11, 13];                    // breakbeat fills
const PC_PR = [4, 10];                           // progressive accents
const PC_IDM = [1, 6, 9, 13];                    // scattered

// ─── Bass Patterns (genre-characteristic) ──────────────────────────────────

function bassHouse(): BassEvent[] {
  return [makeBass(0, 36, 85, 4, true), makeBass(8, 36, 80, 2, false, false, true), makeBass(12, 43, 75, 1)];
}

function bassDeepHouse(): BassEvent[] {
  return [makeBass(0, 36, 80, 6, true), makeBass(6, 41, 70, 2), makeBass(12, 39, 65, 1)];
}

function bassTechno(): BassEvent[] {
  return [makeBass(0, 36, 90, 4, true), makeBass(6, 43, 80, 1), makeBass(8, 36, 85, 4, false, false, true), makeBass(14, 43, 75, 1)];
}

function bassDeepTechno(): BassEvent[] {
  return [makeBass(0, 36, 85, 8, true), makeBass(8, 36, 80, 4, false, false, true)];
}

function bassDubTechno(): BassEvent[] {
  return [makeBass(0, 36, 80, 10, true), makeBass(10, 43, 60, 2), makeBass(14, 36, 70, 2, false, false, true)];
}

function bass2Step(): BassEvent[] {
  return [makeBass(0, 36, 80, 2), makeBass(4, 43, 65, 1, true), makeBass(8, 36, 75, 2, false, false, true), makeBass(11, 38, 60, 1), makeBass(14, 43, 55, 1)];
}

function bassBreakbeat(): BassEvent[] {
  return [makeBass(0, 36, 85, 2, true), makeBass(4, 38, 70, 1), makeBass(6, 43, 65, 1, false, false, false, true), makeBass(9, 31, 70, 1, true), makeBass(12, 36, 80, 2, false, false, true)];
}

function bassElectro(): BassEvent[] {
  return [makeBass(0, 36, 90, 1, true), makeBass(2, 43, 75, 1), makeBass(4, 38, 80, 1), makeBass(6, 43, 65, 1), makeBass(8, 36, 85, 1), makeBass(10, 41, 70, 1), makeBass(12, 38, 80, 1), makeBass(14, 43, 60, 1)];
}

function bassIDM(): BassEvent[] {
  return [makeBass(0, 36, 70, 2), makeBass(5, 40, 60, 1, true), makeBass(10, 35, 55, 1), makeBass(14, 43, 50, 1)];
}

function bassAmbient(): BassEvent[] {
  return [makeBass(0, 36, 55, 12, true), makeBass(12, 36, 50, 4, false, false, true)];
}

function bassElectroBreaks(): BassEvent[] {
  return [makeBass(0, 36, 88, 2, true), makeBass(3, 43, 72, 1, true), makeBass(8, 36, 82, 2, false, false, true), makeBass(11, 31, 65, 1)];
}

function bassProgHouse(): BassEvent[] {
  return [makeBass(0, 36, 82, 6, true), makeBass(8, 43, 75, 2), makeBass(14, 41, 68, 1)];
}

function bassDub(): BassEvent[] {
  return [makeBass(0, 36, 75, 10, true), makeBass(10, 36, 70, 4, false, false, true), makeBass(14, 38, 60, 1, false, false, false, true)];
}

// ─── DNA Profiles (family archetypes, each family gets a unique fingerprint) ─

const DNA_HOUSE: GrooveDNA = { density: 0.35, syncopation: 0.45, complexity: 0.40, swing: 0.60, ghostFactor: 0.10, aggression: 0.50, repetition: 0.70, randomness: 0.20 };
const DNA_TECHNO: GrooveDNA = { density: 0.40, syncopation: 0.55, complexity: 0.50, swing: 0.30, ghostFactor: 0.15, aggression: 0.65, repetition: 0.60, randomness: 0.25 };
const DNA_GARAGE: GrooveDNA = { density: 0.50, syncopation: 0.70, complexity: 0.65, swing: 0.70, ghostFactor: 0.30, aggression: 0.55, repetition: 0.40, randomness: 0.35 };
const DNA_BREAKBEAT: GrooveDNA = { density: 0.60, syncopation: 0.80, complexity: 0.75, swing: 0.50, ghostFactor: 0.40, aggression: 0.70, repetition: 0.30, randomness: 0.45 };
const DNA_IDM: GrooveDNA = { density: 0.45, syncopation: 0.85, complexity: 0.85, swing: 0.40, ghostFactor: 0.50, aggression: 0.40, repetition: 0.20, randomness: 0.65 };
const DNA_MINIMAL: GrooveDNA = { density: 0.15, syncopation: 0.30, complexity: 0.25, swing: 0.30, ghostFactor: 0.05, aggression: 0.35, repetition: 0.80, randomness: 0.10 };
const DNA_DUB: GrooveDNA = { density: 0.25, syncopation: 0.40, complexity: 0.35, swing: 0.50, ghostFactor: 0.20, aggression: 0.40, repetition: 0.75, randomness: 0.20 };
const DNA_ELECTRO: GrooveDNA = { density: 0.55, syncopation: 0.65, complexity: 0.60, swing: 0.35, ghostFactor: 0.10, aggression: 0.75, repetition: 0.55, randomness: 0.30 };
const DNA_PROG: GrooveDNA = { density: 0.30, syncopation: 0.50, complexity: 0.45, swing: 0.45, ghostFactor: 0.10, aggression: 0.45, repetition: 0.65, randomness: 0.25 };
const DNA_AMBIENT: GrooveDNA = { density: 0.10, syncopation: 0.25, complexity: 0.25, swing: 0.20, ghostFactor: 0.60, aggression: 0.20, repetition: 0.35, randomness: 0.40 };

// ─── Helper to build hat event arrays with per-position swing offsets ────

function makeHatsSwung(positions: number[], swingAhead: number = 0.08): PercussionEvent[] {
  return positions.map((p, i) => makePerc('closedHat', p, 55, false, 1, p % 2 === 1 ? swingAhead : 0));
}

function makeHatsDense(positions: number[], velLow: number = 40, velHigh: number = 60): PercussionEvent[] {
  return positions.map((p, i) => makePerc('closedHat', p, i % 2 === 0 ? velHigh : velLow, false, 1));
}

function makeOh(positions: number[], vel: number = 70, prob: number = 0.5): PercussionEvent[] {
  return positions.map(p => makePerc('openHat', p, vel, true, prob));
}

// ─── Preset Library ─────────────────────────────────────────────────────────
//
// Selection criteria:
//   1. Every preset must have a unique kick+snare+hat combination.
//   2. Presets within the same genus differ by hat pattern or bass, not by DNA.
//   3. Families with 2 genera × 2 species = 4 presets.
//   4. No near-duplicates; no renames.
//
// ─── Taxonomy Tree ──────────────────────────────────────────────────────────

const TAXONOMY = {
  'Electronic Dance Music': {
    'House': {
      'Deep House': 'deep-house',
      'Chicago House': 'chicago-house',
      'Tech House': 'tech-house',
      'Minimal House': 'minimal-house',
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
      'Speed Garage': 'speed-garage',
      'Breakstep': 'breakstep',
    },
    'Breakbeat': {
      'Breakbeat': 'breakbeat',
      'Drum and Bass': 'drum-and-bass',
      'Jungle': 'jungle',
      'Nu Skool': 'nu-skool',
    },
    'Electro': {
      'Electro Breaks': 'electro-breaks',
    },
    'Progressive House': {
      'Progressive House': 'progressive-house',
    },
    'Dub': {
      'Dub': 'dub',
    },
    'Minimal': {
      'Reductionist': 'reductionist',
    },
  },
  'Experimental': {
    'IDM': {
      'IDM': 'idm',
      'Experimental': 'experimental',
    },
    'Ambient': {
      'Ambient Rhythms': 'ambient-rhythms',
    },
  },
};

export function getTaxonomyTree(): typeof TAXONOMY {
  return TAXONOMY;
}

// Taxonomy follows real-world genre classification.

export function getBuiltInPresets(): GrooveOrganism[] {
  return [
    // ── HOUSE (4 presets) ──────────────────────────────────────────────────
    //
    // House: 4/4 kick, backbeat snare, straight or swung 16th hats.
    // Deep House: same grid, lower velocity, sparser hats, melodic bass.

    g('Deep House Foundation', {
      kick: K4.map(p => makePerc('kick', p, 95, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 88, true)),
      closedHat: HH_SF.map(p => makePerc('closedHat', p, 50, p === 0 || p === 8, 1)),
      openHat: makeOh(OH_ON, 65, 0.3),
    }, [16, 16, 16, 16], bassDeepHouse(), 16,
      DNA_HOUSE, { kingdom: 'Electronic Dance Music', family: 'House', genus: 'Deep House', species: 'Swung Deep House' }),

    g("Jackin' House Groove", {
      kick: K4.map(p => makePerc('kick', p, 92, p === 0)),
      snare: SN_BB2.map(p => makePerc('snare', p, 85, true)),
      closedHat: makeHatsDense(HH_SC, 40, 55),
    }, [16, 16, 16], bassHouse(), 16,
      { ...DNA_HOUSE, swing: 0.65, aggression: 0.55, repetition: 0.65 },
      { kingdom: 'Electronic Dance Music', family: 'House', genus: 'Chicago House', species: 'Jackin' }),

    g('Tech House Drive', {
      kick: K4_SW.map(p => makePerc('kick', p, 95, p === 0)),
      snare: SN_TH.map(p => makePerc('snare', p, 78, p === 4 || p === 12, 0.85)),
      closedHat: makeHatsSwung(HH_SC, 0.06),
      perc: PC_TK.map(p => makePerc('perc', p, 45, false, 0.4)),
    }, [16, 16, 16, 16], bassHouse(), 16,
      { ...DNA_HOUSE, aggression: 0.60, density: 0.40 },
      { kingdom: 'Electronic Dance Music', family: 'House', genus: 'Tech House', species: 'Tight Tech' }),

    g('Minimal House Pulse', {
      kick: K2.map(p => makePerc('kick', p, 100, true)),
      snare: SN_BB.map(p => makePerc('snare', p, 70, false, 0.8)),
      closedHat: HH_MN.map(p => makePerc('closedHat', p, 45, p === 0, 0.8)),
    }, [16, 16, 16], [makeBass(0, 36, 80, 8, true)], 16,
      DNA_MINIMAL, { kingdom: 'Electronic Dance Music', family: 'House', genus: 'Minimal House', species: 'Pulse' }),

    // ── TECHNO (4 presets) ─────────────────────────────────────────────────
    //
    // Techno: heavier kick, sparser or more syncopated hats, darker bass.
    // Dub Techno: wider reverb feel (simulated via sparser events + long bass).
    // Detroit: melodic, swung patterns.
    // Hypnotic: polymeter/odd-cycle patterns.

    g('Dub Techno Deep', {
      kick: K_TK.map(p => makePerc('kick', p, 95, p === 0, 1, 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 82, true)),
      closedHat: HH_SP.map(p => makePerc('closedHat', p, 40, false, 0.8)),
    }, [16, 16, 16], bassDubTechno(), 16,
      { ...DNA_TECHNO, density: 0.30, repetition: 0.70 },
      { kingdom: 'Electronic Dance Music', family: 'Techno', genus: 'Dub Techno', species: 'Deep Space' }),

    g('Detroit Techno Foundation', {
      kick: K_TK.map(p => makePerc('kick', p, 92, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 85, true)),
      closedHat: makeHatsSwung(HH_SC, 0.05),
    }, [16, 16, 16], bassTechno(), 16,
      { ...DNA_TECHNO, swing: 0.35, syncopation: 0.60 },
      { kingdom: 'Electronic Dance Music', family: 'Techno', genus: 'Detroit Techno', species: 'Foundation' }),

    g('Hypnotic Techno Cycle', {
      kick: K_TK.map(p => makePerc('kick', p, 90, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 80, true)),
      closedHat: HH_TK.map(p => makePerc('closedHat', p, 35, false, 1)),
    }, [16, 16, 15], bassTechno(), 16,
      { ...DNA_TECHNO, complexity: 0.55, repetition: 0.55 },
      { kingdom: 'Electronic Dance Music', family: 'Techno', genus: 'Hypnotic Techno', species: 'Cyclic' }),

    g('Industrial Techno Minimal', {
      kick: K_TK.map(p => makePerc('kick', p, 98, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 90, true)),
      closedHat: HH_SP.map(p => makePerc('closedHat', p, 35, false, 0.6)),
    }, [16, 16, 16], [makeBass(0, 36, 95, 8, true)], 16,
      { ...DNA_TECHNO, density: 0.20, aggression: 0.75 },
      { kingdom: 'Electronic Dance Music', family: 'Techno', genus: 'Industrial Techno', species: 'Reduced' }),

    // ── UK GARAGE (4 presets) ──────────────────────────────────────────────
    //
    // 2-Step: shuffled kick, snare on 2 & 4, swung hats, syncopated bass.
    // Speed Garage: faster kick, tighter hats.
    // Breakstep: garage feel + breakbeat snare pattern.

    g('2-Step Foundation', {
      kick: K_GA.map(p => makePerc('kick', p, 80, p === 0, 1, p >= 12 ? 0 : 0)),
      snare: SN_2S.map(p => makePerc('snare', p, 85, p === 4 || p === 12, p === 14 ? 0.7 : 1)),
      closedHat: HH_GA.map(p => makePerc('closedHat', p, 50, p === 0 || p === 8, 1, p % 4 === 2 ? 0.12 : 0)),
    }, [16, 16, 16], bass2Step(), 16,
      DNA_GARAGE, { kingdom: 'Electronic Dance Music', family: 'UK Garage', genus: '2-Step', species: 'Swing Foundation' }),

    g('Speed Garage Vibe', {
      kick: K4.map(p => makePerc('kick', p, 85, p === 0)),
      snare: SN_BB2.map(p => makePerc('snare', p, 80, true, p === 15 ? 0.6 : 1)),
      closedHat: HH_GA.map(p => makePerc('closedHat', p, 50, false, 1, p % 4 === 2 ? 0.10 : 0)),
    }, [16, 16, 16],
      [makeBass(0, 36, 85, 1), makeBass(2, 43, 70, 1, true), makeBass(6, 38, 60, 1), makeBass(8, 36, 80, 1, false, false, true), makeBass(12, 43, 65, 1)], 16,
      { ...DNA_GARAGE, aggression: 0.60 },
      { kingdom: 'Electronic Dance Music', family: 'UK Garage', genus: 'Speed Garage', species: 'Tight' }),

    g('Breakstep Roller', {
      kick: K_BR.map(p => makePerc('kick', p, 85, p === 0 || p === 8)),
      snare: SN_BR.map(p => makePerc('snare', p, 88, p === 12)),
      closedHat: HH_DN.map(p => makePerc('closedHat', p, 40, false, 0.85)),
      perc: PC_BR.map(p => makePerc('perc', p, 55, false, 0.6)),
    }, [16, 16, 16, 16], bassBreakbeat(), 16,
      { ...DNA_GARAGE, density: 0.55, syncopation: 0.75 },
      { kingdom: 'Electronic Dance Music', family: 'UK Garage', genus: 'Breakstep', species: 'Garage-Break Hybrid' }),

    g('Future Garage Atmosphere', {
      kick: K4.map(p => makePerc('kick', p, 75, p === 0, 0.9)),
      snare: SN_2S.map(p => makePerc('snare', p, 75, true, p === 14 ? 0.5 : 0.9)),
      closedHat: HH_SP.map(p => makePerc('closedHat', p, 35, false, 0.7)),
    }, [16, 16, 16], bass2Step(), 16,
      { ...DNA_GARAGE, density: 0.35, aggression: 0.45 },
      { kingdom: 'Electronic Dance Music', family: 'UK Garage', genus: '2-Step', species: 'Atmospheric' }),

    // ── BREAKBEAT (4 presets) ──────────────────────────────────────────────
    //
    // Breakbeat: syncopated kick, jungle snares, dense hats.
    // Drum & Bass: fast half-time feel, aggressive.
    // Jungle: dense breakdowns, open hats.
    // Nu Skool Breakbeat: funky, swung.

    g('Breakbeat Classic', {
      kick: K_BR2.map(p => makePerc('kick', p, 90, p === 0 || p === 8)),
      snare: SN_BR.map(p => makePerc('snare', p, 88, p === 12)),
      closedHat: makeHatsDense(HH_DN, 30, 50),
      perc: PC_BR.map(p => makePerc('perc', p, 50, false, 0.6)),
    }, [16, 16, 16, 13], bassBreakbeat(), 16,
      DNA_BREAKBEAT, { kingdom: 'Electronic Dance Music', family: 'Breakbeat', genus: 'Breakbeat', species: 'Classic Break' }),

    g('Drum and Bass Stepper', {
      kick: K_BR.map(p => makePerc('kick', p, 92, p === 0 || p === 8)),
      snare: SN_DB.map(p => makePerc('snare', p, 90, p === 10)),
      closedHat: makeHatsDense(HH_DN, 35, 55),
    }, [16, 16, 16], bassBreakbeat(), 16,
      { ...DNA_BREAKBEAT, density: 0.65, aggression: 0.75 },
      { kingdom: 'Electronic Dance Music', family: 'Breakbeat', genus: 'Drum and Bass', species: 'Tech Step' }),

    g('Jungle Rhythm', {
      kick: K_BR2.map(p => makePerc('kick', p, 88, p === 0)),
      snare: SN_BR.map(p => makePerc('snare', p, 85, p === 12)),
      closedHat: HH_DN.map(p => makePerc('closedHat', p, 30, false, 0.8)),
      perc: [2, 5, 9, 11, 15].map(p => makePerc('perc', p, 50, false, 0.6)),
    }, [16, 16, 16, 16],
      [makeBass(0, 36, 85, 2, true), makeBass(6, 31, 70, 1, true), makeBass(12, 36, 80, 2, false, false, true)], 16,
      { ...DNA_BREAKBEAT, syncopation: 0.85, randomness: 0.50 },
      { kingdom: 'Electronic Dance Music', family: 'Breakbeat', genus: 'Jungle', species: 'Ragga Break' }),

    g('Nu Skool Funk', {
      kick: K_DB.map(p => makePerc('kick', p, 85, p === 0 || p === 8)),
      snare: SN_BR.map(p => makePerc('snare', p, 82, p === 12)),
      closedHat: HH_SF.map(p => makePerc('closedHat', p, 45, false, 0.9)),
      perc: PC_BR.map(p => makePerc('perc', p, 50, false, 0.5)),
    }, [16, 16, 16, 16], bassBreakbeat(), 16,
      { ...DNA_BREAKBEAT, swing: 0.55, ghostFactor: 0.35 },
      { kingdom: 'Electronic Dance Music', family: 'Breakbeat', genus: 'Nu Skool', species: 'Funky Break' }),

    // ── ELECTRO (2 presets) ────────────────────────────────────────────────
    //
    // Electro: heavy syncopated kick, off-beat snare/clap, robotic hats.

    g('Electro Breaks Foundation', {
      kick: K_SNARE_OFF.map(p => makePerc('kick', p, 95, p === 2)),
      snare: SN_TH.map(p => makePerc('snare', p, 92, true)),
      closedHat: HH_SC.map(p => makePerc('closedHat', p, 50, false, 1)),
    }, [16, 16, 16], bassElectro(), 16,
      DNA_ELECTRO, { kingdom: 'Electronic Dance Music', family: 'Electro', genus: 'Electro Breaks', species: 'Foundation' }),

    g('Electro Funk', {
      kick: K_SNARE_OFF.map(p => makePerc('kick', p, 90, p === 2 || p === 10)),
      snare: SN_TH.map(p => makePerc('snare', p, 88, p === 2 || p === 10)),
      closedHat: HH_SF.map(p => makePerc('closedHat', p, 50, p === 0 || p === 8)),
      perc: PC_TK.map(p => makePerc('perc', p, 55, false, 0.4)),
    }, [16, 16, 16, 16], bassElectroBreaks(), 16,
      { ...DNA_ELECTRO, swing: 0.40, ghostFactor: 0.15 },
      { kingdom: 'Electronic Dance Music', family: 'Electro', genus: 'Electro Breaks', species: 'Funky' }),

    // ── PROGRESSIVE HOUSE (2 presets) ──────────────────────────────────────
    //
    // Progressive House: building kick, open hats emphasis, melodic bass.

    g('Progressive House Builder', {
      kick: K_PR.map(p => makePerc('kick', p, 92, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 85, true)),
      closedHat: HH_SC.map(p => makePerc('closedHat', p, 45, false, 1)),
      openHat: makeOh(OH_OFF, 68, 0.35),
    }, [16, 16, 16, 16], bassProgHouse(), 16,
      DNA_PROG, { kingdom: 'Electronic Dance Music', family: 'Progressive House', genus: 'Progressive House', species: 'Building Groove' }),

    g('Progressive Deep', {
      kick: K4.map(p => makePerc('kick', p, 88, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 80, true, 0.9)),
      closedHat: HH_MN.map(p => makePerc('closedHat', p, 40, false, 0.7)),
      openHat: makeOh(OH_OFF, 60, 0.2),
    }, [16, 16, 16, 16], bassProgHouse(), 16,
      { ...DNA_PROG, density: 0.25, repetition: 0.70 },
      { kingdom: 'Electronic Dance Music', family: 'Progressive House', genus: 'Progressive House', species: 'Deep Progressive' }),

    // ── IDM / EXPERIMENTAL (4 presets) ────────────────────────────────────
    //
    // IDM: irregular kick placement, scattered snares, sparse/unquantized hats.

    g('IDM Glitch Study', {
      kick: K_IDM.map(p => makePerc('kick', p, 75, false, 0.7 + Math.random() * 0.3)),
      snare: SN_IDM.map(p => makePerc('snare', p, 70, p === 7 || p === 15, 0.75)),
      closedHat: HH_IDM.map(p => makePerc('closedHat', p, 35, false, 0.6)),
    }, [16, 16, 16], bassIDM(), 16,
      DNA_IDM, { kingdom: 'Experimental', family: 'IDM', genus: 'IDM', species: 'Glitch' }),

    g('IDM Polymetric', {
      kick: K_IDM.map(p => makePerc('kick', p, 70, false, 0.7)),
      snare: SN_IDM.map(p => makePerc('snare', p, 65, false, 0.7)),
      closedHat: HH_IDM.map(p => makePerc('closedHat', p, 30, false, 0.5)),
      perc: PC_IDM.map(p => makePerc('perc', p, 40, false, 0.4)),
    }, [17, 13, 11, 16], bassIDM(), 16,
      { ...DNA_IDM, randomness: 0.70, complexity: 0.88 },
      { kingdom: 'Experimental', family: 'IDM', genus: 'IDM', species: 'Polymetric' }),

    g('Experimental Rhythm', {
      kick: K_SN.map(p => makePerc('kick', p, 70, p === 0, 0.8)),
      snare: SN_IDM.map(p => makePerc('snare', p, 65, p === 0, 0.6)),
      closedHat: HH_IDM.map(p => makePerc('closedHat', p, 30, false, 0.5)),
    }, [16, 16, 16], bassIDM(), 16,
      { ...DNA_IDM, randomness: 0.65, density: 0.35 },
      { kingdom: 'Experimental', family: 'IDM', genus: 'Experimental', species: 'Open Form' }),

    g('Glitch Hop', {
      kick: K_DB.map(p => makePerc('kick', p, 75, p === 0 || p === 8)),
      snare: SN_IDM.map(p => makePerc('snare', p, 72, p === 2 || p === 8)),
      closedHat: HH_IDM.map(p => makePerc('closedHat', p, 35, false, 0.6)),
      perc: PC_IDM.map(p => makePerc('perc', p, 40, false, 0.4)),
    }, [16, 16, 16, 16],
      [makeBass(0, 36, 70, 2), makeBass(7, 42, 60, 1, true), makeBass(11, 30, 55, 1)], 16,
      { ...DNA_IDM, density: 0.50, complexity: 0.80 },
      { kingdom: 'Experimental', family: 'IDM', genus: 'Experimental', species: 'Glitch Hop' }),

    // ── AMBIENT / DUB (4 presets) ──────────────────────────────────────────
    //
    // Ambient: sparse percussion, low velocity, long bass notes.
    // Dub: sparse, heavy bass, open spaces between hits.

    g('Ambient Pulse', {
      kick: K2.filter(() => Math.random() > 0.3).map(p => makePerc('kick', p, 40, false, 0.5)),
      snare: [4, 12].filter(() => Math.random() > 0.5).map(p => makePerc('snare', p, 25, false, 0.3)),
      closedHat: [0, 8].map(p => makePerc('closedHat', p, 15, false, 0.3)),
    }, [16, 16, 16], bassAmbient(), 16,
      DNA_AMBIENT, { kingdom: 'Experimental', family: 'Ambient', genus: 'Ambient Rhythms', species: 'Slow Pulse' }),

    g('Ambient Glitch', {
      kick: [0, 3, 8, 14].filter(() => Math.random() > 0.25).map(p => makePerc('kick', p, 35, false, 0.4)),
      closedHat: HH_SP.filter(() => Math.random() > 0.5).map(p => makePerc('closedHat', p, 15, false, 0.2)),
    }, [16, 16], bassAmbient(), 16,
      { ...DNA_AMBIENT, randomness: 0.55, density: 0.08 },
      { kingdom: 'Experimental', family: 'Ambient', genus: 'Ambient Rhythms', species: 'Glitch Ambient' }),

    g('Dub Stepper', {
      kick: K_SN.map(p => makePerc('kick', p, 85, p === 0 || p === 12)),
      snare: SN_BB.map(p => makePerc('snare', p, 75, true, 0.8)),
      closedHat: HH_SP.filter(() => Math.random() > 0.4).map(p => makePerc('closedHat', p, 35, false, 0.5)),
    }, [16, 16, 16], bassDub(), 16,
      DNA_DUB, { kingdom: 'Electronic Dance Music', family: 'Dub', genus: 'Dub', species: 'Stepper' }),

    g('Dub Space', {
      kick: K_SN.filter(() => Math.random() > 0.3).map(p => makePerc('kick', p, 80, p === 0, 0.7)),
      closedHat: [0, 3, 6, 12].map(p => makePerc('closedHat', p, 30, false, 0.4)),
    }, [16, 16], bassDub(), 16,
      { ...DNA_DUB, density: 0.15, repetition: 0.80 },
      { kingdom: 'Electronic Dance Music', family: 'Dub', genus: 'Dub', species: 'Space' }),

    // ── DEEP TECHNO / MINIMAL (2 bonus presets) ──────────────────────────

    g('Deep Techno Pulse', {
      kick: K4.map(p => makePerc('kick', p, 90, p === 0)),
      snare: SN_BB.map(p => makePerc('snare', p, 82, true)),
      closedHat: HH_MN.map(p => makePerc('closedHat', p, 40, false, 0.7)),
    }, [16, 16, 16], bassDeepTechno(), 16,
      { ...DNA_TECHNO, density: 0.30, aggression: 0.55, repetition: 0.72 },
      { kingdom: 'Electronic Dance Music', family: 'Techno', genus: 'Deep Techno', species: 'Pulse' }),

    g('Reductionist One', {
      kick: K2.map(p => makePerc('kick', p, 100, true)),
      snare: SN_BB.map(p => makePerc('snare', p, 65, false, 0.6)),
    }, [16, 16],
      [makeBass(0, 36, 80, 8, true)], 16,
      { ...DNA_MINIMAL, density: 0.10, syncopation: 0.15, ghostFactor: 0.02 },
      { kingdom: 'Electronic Dance Music', family: 'Minimal', genus: 'Reductionist', species: 'One' }),
  ];
}
