# Groove Container — Implementation Roadmap

## v0.1 — Foundation (Domain Model + Project Setup)

### Task 0.1: Project Scaffold
- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Tone.js dependency
- [ ] Configure vitest
- [ ] Set up GitHub Pages deploy workflow (copied from Spielzeug)
- [ ] Create project README with philosophy

### Task 0.2: Core Domain Types
Location: `src/engine/types.ts`

```typescript
// The fundamental event — NOT a boolean, a structured groove primitive

interface GrooveEvent {
  position: number;          // step index in its cycle
  velocity: number;          // 0-100
  probability: number;       // 0-1 (chance of firing)
  accent: boolean;
  timingOffset: number;      // microtiming offset in 16th-note fractions
  humanization: number;      // 0-100 random timing jitter
  ratchet: number;           // 1-8 sub-divisions at this position
  swing: number;             // per-event swing override
}

interface PercussionEvent extends GrooveEvent {
  voice: PercussionVoice;
}

type PercussionVoice = 'kick' | 'snare' | 'closedHat' | 'openHat' | 'perc' | 'ghostPerc';

interface BassEvent extends GrooveEvent {
  pitch: number;             // MIDI note 0-127
  duration: number;          // note length in 16th-steps
  tie: boolean;              // legato tie to next note
  slide: boolean;            // portamento/glide to next note
  ghost: boolean;            // ghost note (low velocity, short duration)
  mute: boolean;             // explicit rest/silence at this position
}
```

### Task 0.3: Wheel Types
```typescript
interface WheelA {
  tracks: RhythmTrack[];     // 6 percussion tracks
  cycleLength: number;       // global cycle length (steps)
}

interface RhythmTrack {
  id: string;
  name: string;
  voice: PercussionVoice;
  events: PercussionEvent[];
  cycleLength: number;       // independent cycle (polymeter support)
  mute: boolean;
  solo: boolean;
  volume: number;
  pan: number;
}

interface WheelB {
  tracks: BassTrack[];       // 1 bass track
  cycleLength: number;
}

interface BassTrack {
  id: string;
  name: string;
  events: BassEvent[];
  cycleLength: number;
  mute: boolean;
  volume: number;
}
```

### Task 0.4: Groove DNA Types
```typescript
interface GrooveDNA {
  density: number;           // 0-1
  syncopation: number;       // 0-1
  complexity: number;        // 0-1
  swing: number;             // 0-1
  ghostFactor: number;       // 0-1
  aggression: number;        // 0-1
  repetition: number;        // 0-1
  randomness: number;        // 0-1
}

interface GrooveOrganism {
  id: string;
  name: string;
  wheelA: WheelA;
  wheelB: WheelB;
  dna: GrooveDNA;
  bpm: number;
  swing: number;
  taxonomy: TaxonomyPath;
}
```

### Task 0.5: Taxonomy Types
```typescript
interface TaxonomyPath {
  kingdom: string;           // e.g. "Electronic Music"
  family: string;            // e.g. "Techno"
  genus: string;             // e.g. "Dub Techno"
  species: string;           // e.g. "Deep Dub Techno"
}
```

---

## v0.2 — Pure Engine

### Task 1.1: Event Pipeline
Implement the pure transform pipeline:
```
Events → Distribution → Swing → Microtiming → Humanization → Ratchet → ScheduledEvents
```

### Task 1.2: Distribution Strategies
- [ ] Port `euclid()` as `generateEuclidean(hits, steps): GrooveEvent[]`
- [ ] `generateUniform(hits, steps)` — evenly spaced
- [ ] `generateRandom(eventCount, steps, density)` — probabilistic
- [ ] Strategy pattern: `type DistributionStrategy = (params) => GrooveEvent[]`

### Task 1.3: DNA Analysis Engine
- [ ] Implement DNA computation from events + cycle
- [ ] `computeDNA(wheelA, wheelB): GrooveDNA`
- [ ] Each metric is a pure function of the event set

### Task 1.4: Mutation Engine
- [ ] Implement mutate-on-axes:
  - preserve rhythm (only change velocity/accent/etc.)
  - preserve bass (don't touch Wheel B)
  - preserve rhythm (don't touch Wheel A)
  - preserve complexity (keep density/complexity constant)
  - preserve accents (keep accent positions)
- [ ] Each axis randomizes only the specified event dimensions

### Task 1.5: Bass-Rhythm Linkage
- [ ] Kick → bass event mapping (kick position generates/selects bass event)
- [ ] Ghost kick → grace note on bass
- [ ] Snare accent → syncopated bass behavior
- [ ] Hat density → increased bass subdivision
- [ ] Define linkage rules as pure functions

---

## v0.3 — Dual Wheel UI

### Task 2.1: Application Shell
- [ ] Main layout: two large wheel displays side by side
- [ ] Transport bar: Play/Stop, BPM, Swing
- [ ] Groove DNA display panel

### Task 2.2: Wheel A UI (Rhythm Container)
- [ ] 6 percussion tracks displayed as configurable lanes
- [ ] Per-event editing: velocity, probability, accent, timing offset, ratchet
- [ ] Per-track controls: cycle length, mute, solo, volume, pan
- [ ] Visual event grid/ring

### Task 2.3: Wheel B UI (Bass Container)
- [ ] Pitch lane with note names + piano roll visualization
- [ ] Per-event editing: pitch, velocity, duration, tie, slide, accent, ghost, mute
- [ ] Bass generation controls (linkage to Wheel A)

### Task 2.4: Knob Components
- [ ] Port the Spielzeug Knob component directly
- [ ] Knob racks for per-track parameters

### Task 2.5: Polymeter Display
- [ ] Per-voice cycle length indicator
- [ ] Visual phase relationship between voices
- [ ] Cycle-length meters

---

## v0.4 — Audio Engine

### Task 3.1: Tone.js Integration
- [ ] Single Tone.Transport clock
- [ ] Global step counter (same pattern as Spielzeug)
- [ ] Event-based scheduler: iterate events, not boolean patterns

### Task 3.2: Percussion Engine
- [ ] 6 sample slots (kick, snare, ch, oh, perc, ghost-perc)
- [ ] Sample kit loading (port drumKits.ts concept)
- [ ] Per-event: velocity → gain, probability → gate, timingOffset → schedule time

### Task 3.3: Bass Synthesizer
- [ ] Tone.MonoSynth (or more advanced polysynth)
- [ ] Per-event: pitch, velocity, duration
- [ ] Tie/slide implementation (note legato, portamento)
- [ ] Ghost note implementation (short, low-velocity)

### Task 3.4: Ratchet + Microtiming
- [ ] Ratchet: sub-divide event position into N equal parts
- [ ] Microtiming: schedule time = gridTime + offset

---

## v0.5 — Groove Intelligence

### Task 4.1: DNA Real-time Display
- [ ] Radar chart or bar display of 8 DNA axes
- [ ] Animated updates as events change

### Task 4.2: Mutation Panel
- [ ] "Mutate" button
- [ ] Axis toggles (style, bass, rhythm, complexity, accents)
- [ ] Mutation strength slider (0-100% of parameter range)
- [ ] Random seed control

### Task 4.3: Bass Generation Engine
- [ ] `generateBassFromRhythm(wheelA, rules): BassTrack`
- [ ] Configurable rule set (kick→root, snare→fifth, density→subdivision)

### Task 4.4: Groove Morphing
- [ ] Tween between two GrooveOrganisms
- [ ] Linear interpolation of all event parameters
- [ ] Optional: random walk mutation

---

## v0.6 — Preset + Taxonomy System

### Task 5.1: Taxonomy Browser
- [ ] Tree browser: Kingdom → Family → Genus → Species
- [ ] Search/filter
- [ ] Preview (load preset, don't auto-play)

### Task 5.2: Preset Engine
- [ ] `GrooveSnapshot` type (same concept as Spielzeug)
- [ ] Factory presets (embedded JSON)
- [ ] User presets (IndexedDB via ported adapter)
- [ ] 1000+ preset target:
  - House family: 150+
  - Techno family: 150+
  - UK Garage/Breakbeat: 100+
  - IDM/Experimental: 100+
  - Minimal/Dub: 100+
  - World rhythms: 100+
  - Generative/Stochastic: 100+
  - Polymetric: 100+

### Task 5.3: Preset Generation
- [ ] Algorithmic preset generator
- [ ] Given taxonomy + DNA target → generate event set
- [ ] Batch generator for mass preset creation

---

## v0.7 — Export + Polish

### Task 6.1: MIDI Export
- [ ] Port `serializeMidi()` from Spielzeug
- [ ] New `renderMidiFromEvents()` for Groove Container model
- [ ] Per-wheel export, combined export

### Task 6.2: Audio Export
- [ ] WAV rendering (offline Tone.js rendering)
- [ ] Stem export per-track

### Task 6.3: Preset Export/Import
- [ ] JSON export of current GrooveOrganism
- [ ] Import JSON to load preset

### Task 6.4: Visual Polish
- [ ] 1999 groovebox aesthetic (continuation of Satisfaction theme)
- [ ] Responsive layout
- [ ] Loading states
- [ ] Keyboard shortcuts

---

## Immediate Next Steps (Phase 0 — in progress)

1. ✅ Initialize Groove-Container repo (done)
2. ✅ Write AUDIT-REPORT.md (done)
3. ✅ Write ROADMAP.md (done)
4. ⬜ Set up Vite + React + TypeScript scaffold
5. ⬜ Implement core domain types
6. ⬜ Implement wheel types
7. ⬜ Implement GrooveDNA types
8. ⬜ Implement taxonomy types
9. ⬜ Write initial tests for domain model
10. ⬜ Implement basic GrooveOrganism serialization
