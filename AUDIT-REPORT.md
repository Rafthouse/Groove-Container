# Groove Container — Architectural Audit Report

## Source Project: Euclidean Groove Spielzeug (Euclidean Spielzeug)
## Target Project: Groove Container

*Generated: 2026-06-17*

---

## 1. Executive Summary

Euclidean Spielzeug is a **mature, pedagogically-focused Euclidean rhythm generator** with a pure pipeline architecture. It excels at demonstrating how groove emerges from transformations of boolean pulse patterns. However, it is fundamentally limited by:

- **Binary event model** — every event is ON/OFF with optional scalar decoration
- **Fixed 4-track design** with rigid VoiceId type
- **Euclidean-centric distribution** as the sole rhythm generation strategy
- **Event model as an afterthought** — velocity, pitch, microtiming are bolted-on modules, not foundational

Groove Container requires a **complete re-architecture** of the event model, track system, and generation paradigm. The audit below classifies every module from the source into one of: **KEEP** (reuse with minimal change), **REFACTOR** (reuse after redesign), **REPLACE** (rebuild from scratch), **REMOVE** (discard entirely).

---

## 2. Module-by-Module Audit

### 2.1 Core Engine Modules

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `engine/types.ts` | **REMOVE** | Only exports `Pattern = boolean[]`. Entirely replaced by rich `GrooveEvent` model. |
| `engine/euclidean.ts` | **KEEP** (as Distribution Strategy) | Bjorklund algorithm is mathematically correct and well-tested. Import as one of many rhythm generators, not the default. |
| `engine/rotate.ts` | **KEEP** | Generic cyclic array rotation. Pure, generic, reusable. |
| `engine/phase.ts` | **REFACTOR** | Phase offset concept is valuable, but operates on `Pattern`. Needs to work with event arrays. |
| `engine/pulse.ts` | **REMOVE** | Generates empty `boolean[]`. No value in new model — Groove Events are the fundamental unit. |
| `engine/metrics.ts` | **REMOVE** | Only exports `onsetCount` and `density` for `Pattern`. Groove DNA metrics are fundamentally different (syncopation, complexity, aggression, etc.). |
| `engine/pitch.ts` | **REFACTOR** | `PitchSpec`, `resolvePitchSpec`, note parsing, scale intervals are all reusable. The `PitchSequence` → `Track` binding is wrong for Groove Container; pitch lives per-event, not per-track-cycle. |

### 2.2 Track System

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `engine/track.ts` | **REPLACE** | Entire `Track` interface is tied to 4 fixed VoiceIds, Euclidean params (steps/hits/rotation), and decorated boolean patterns. Groove Container has Wheel A (6 perc voices) + Wheel B (bass), each with per-event rich data. |
| `Track` interface | **REPLACE** | Replaced by `RhythmWheelTrack[]` (6 perc) and `BassWheelTrack` (1 bass) |
| `VoiceId` type | **REPLACE** | Fixed 4-voice union (`kick|snare|hat|bass`) → dynamic per-event voice/type |
| `TrackPattern` | **REPLACE** | Decorated boolean pattern → `GrooveEvent[]` sequence |
| `PatternSlot` / `PATTERN_SLOT_COUNT` | **REPLACE** | 22 static pattern slots reminiscent of hardware grooveboxes, but the slot concept tied to Euclidean params. Groove Container has a different slot/pattern mechanism. |
| `audibleTracks()` | **KEEP** (pattern) | Solo/mute logic is correct. Re-apply to new track types. |
| `snapshotPattern()` / `switchTrackPattern()` | **REPLACE** | Deeply coupled to old track model. Phase preservation logic is worth extracting. |

### 2.3 Preset System

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `engine/preset.ts` | **REFACTOR** (concept) | Two-tier (factory/user) pattern is good. "Preset = multi-track snapshot" is correct. But the data model (`GrooveSnapshot` with `Track[]`) and category list are for the old app. Needs new domain model. |
| `engine/presetCore.ts` | **KEEP** (adapter pattern) | IDB CRUD abstraction is solid. The adapter pattern (pure CRUD → storage adapter) is worth preserving. |
| `engine/presetStorage.ts` | **KEEP** (as-is with new schema) | IndexedDB layer is well-isolated. Just wire new serialization. |
| `engine/presetExport.ts` | **REFACTOR** | Export logic is tied to old preset format. Worth preserving the concept of JSON export/import. |

### 2.4 MIDI System

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `engine/midi.ts` | **REFACTOR** | `serializeMidi()` (Standard MIDI File binary serializer) is **extremely valuable** and should be kept intact. `renderMidi()` is tied to old Track/TrackPattern model — needs new event-based rendering. |
| MIDI serializer (SMF Format 1) | **KEEP** | The binary VLQ/chunk encoding is correct and tested. |
| MIDI note rendering | **REPLACE** | New event model means new rendering path. |
| `midiOut.ts` | **REFACTOR** | Web MIDI API wrapper is useful. Needs to handle per-event messages. |

### 2.5 Mixer / FX System

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `mixer/fxTypes.ts` | **REFACTOR** | Effect types (EQ, Compressor, Delay, etc.) and FxSlot model are reusable. Need to decouple from old channel model. |
| `mixer/fxEngine.ts` | **KEEP** | `buildFxChain()` and FX node construction is pure engineering. |
| `mixer/FxRackPanel.tsx` | **REFACTOR** | UI concept is reusable, but wiring is tied to old channel model. |
| `mixer/MixerPanel.tsx` | **REFACTOR** | Panel component structure is reusable. |
| `mixer/MixerChannel.tsx` | **REPLACE** | Tightly coupled to old Track/TrackPattern. |
| `mixer/ChannelFader.tsx` | **KEEP** | Fader UI component. |
| `mixer/mixerState.ts` | **REPLACE** | State management tied to old mixer model. |

### 2.6 UI Components

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `components/Sequencer.tsx` | **REFACTOR** | The circular SVG sequencer (polygon + onset circles) is a **signature UI element**. Remove Euclidean-rest geometry, make it generic for any event set. |
| `components/Knob.tsx` | **KEEP** | Universal rotary knob with drag/scroll/double-click/edit. Excellent component; reuse directly. |
| `components/TrackCard.tsx` | **REPLACE** | Entirely tied to old 4-track Euclidean UI. |
| `components/VelocityLane.tsx` | **REFACTOR** (concept) | Per-onset velocity editing concept is good. Per-event velocity replaces this. |
| `components/PitchLane.tsx` | **REPLACE** | Onset-indexed pitch cycle. Groove Container has per-event pitch. |
| `components/GhostLane.tsx` | **REFACTOR** (concept) | Probabilistic ghost notes concept is valuable. |
| `components/RumbleLane.tsx` | **REFACTOR** (concept) | Event-based rumble concept valuable. |
| `components/DuckingLane.tsx` | **REFACTOR** | Sidechain ducking concept. |
| `components/MixerView.tsx` | **REFACTOR** | Mixer panel layout. |
| `components/MixerChannelStrip.tsx` | **REFACTOR** | Channel strip layout. |
| `components/PresetBrowser.tsx` | **REFACTOR** | Browser UI pattern. |
| `components/PresetEditor.tsx` | **REFACTOR** | Editor UI pattern. |
| `components/DrumKitSelect.tsx` | **REPLACE** | Kit-select concept → Groove Container's sample engine. |
| `components/Icons.tsx` | **KEEP** | SVG icon library. |
| `components/Oscilloscope.tsx` | **KEEP** | Visualization component. |

### 2.7 Audio System

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `audio.ts` | **REPLACE** | Entirely tied to old Track model, Tone.js scheduling, sample triggers. New scheduling model for Groove Events needed. |
| Tone.js scheduling | **REFACTOR** | The single-clock model (one Tone.Transport, global step counter) is architecturally sound. Preserve this pattern. |
| Sample trigger (`triggerSample`) | **KEEP** (concept) | One-shot sample triggering. |
| Bass synth (MonoSynth) | **KEEP** (concept) | Synthesized bass is a key element. |

### 2.8 Support Systems

| Module | Classification | Rationale |
|--------|---------------|-----------|
| `drumKits.ts` | **REFACTOR** | Sample kit manifest. Needs to support more voices (perc, ghost). |
| `download.ts` | **KEEP** | Universal blob download utility. |
| `engine/oscilloscope.ts` | **KEEP** | Data feed for oscilloscope. |
| `engine/playback.ts` | **REFACTOR** | The **single-clock resolver** (divider, isActive, adjustedTick, localStep, computePhaseOffsetForChange) is an **architectural gem**. The forward/reverse/pendulum mode concept with phase preservation is one of the most reusable pieces. Adapt to new event model. |

---

## 3. Dead Code Identification

1. **`engine/pulse.ts`** — single-function module only called in test files. The concept of "empty grid" is not meaningful for event-based model.
2. **`engine/metrics.ts`** — minimal (only `onsetCount` + `density`). Replaced by Groove DNA analysis.
3. **`engine/types.ts`** — single type `Pattern = boolean[]`. Gone entirely.
4. **`engine/index.ts`** — barrel export. Removed with the old engine.
5. **`DrumKitSelect.tsx`** / **`velocityLaneState.ts`** / **`pitchLaneState.ts`** — legacy state slices for old UI modules.
6. **Various `.test.ts` files** — test against old model. Will be rewritten for Groove Container.

---

## 4. Architectural Bottlenecks (to avoid in GC)

1. **Boolean event model** — every per-event feature (velocity, accent, microtiming) requires a parallel array or optional module, creating a sprawling type. GC's rich event object eliminates this.
2. **4-track fixed VoiceId** — adding more voices requires type changes, UI changes, audio pipeline changes. GC uses dynamic voice assignment per wheel.
3. **Euclidean as the only generator** — `trackPattern()` calls `euclid()` directly. Substituting a different generator (clave, random, Markov) requires rewriting the entire track. GC makes generation a pluggable strategy.
4. **Onset-indexed parallel arrays** — `manualMute` being onset-indexed while `pulses` is step-indexed creates confusing dual indexing. GC events have a single position.

---

## 5. What to Preserve (the gems)

| Concept | Why valuable |
|---------|-------------|
| **Pure pipeline** | Pulse → Distribution → Rotation → Accent → Phase → Microtiming → Groove. Keep the principle of pure transform stages. |
| **Single-clock scheduling** | One global step counter, per-track interpretation. Poly-rhythmic by construction. |
| **Playback modes** | forward/reverse/pendulum with phase preservation. |
| **Phase offset preservation** | `computePhaseOffsetForChange` for seamless mode/speed changes. |
| **Standard MIDI File serializer** | `serializeMidi()` — correct VLQ, meta events, Format 1. |
| **Preset two-tier architecture** | Factory presets (read-only) + User presets (IDB). |
| **Knob UI component** | Gorgeous rotary knob with drag, scroll, double-click reset, inline editing. |
| **Oscilloscope** | Real-time waveform visualization. |
| **FX engine architecture** | Insert chain, enable/disable per slot. |
| **One-shot sample triggering** | Per-sample gain frozen at trigger time. |

---

## 6. Migration Strategy

### Phase 0 — Domain Model (this sprint)
- Define `GrooveEvent` type with all required fields
- Define `RhythmWheel` + `BassWheel` types
- Define `GrooveDNA` metadata structure
- Define Taxonomy types (Kingdom → Family → Genus → Species)
- Set up Vite + React + TypeScript project structure

### Phase 1 — Core Engine
- Implement event-based pure pipeline
- Port Euclidean as one Distribution strategy
- Implement mutation engine
- Implement DNA analysis
- Implement polymeter (per-voice cycle length)

### Phase 2 — Dual Wheel UI
- Wheel A (6 perc voices) with event editors
- Wheel B (bass) with pitch/velocity editors
- Knob components for per-event parameters
- Sequencer ring visualization (adapted)

### Phase 3 — Audio Engine
- Tone.js single-clock scheduler
- Sample-based drum engine (6 voices)
- Bass synthesizer
- Per-event scheduling

### Phase 4 — Groove Intelligence
- DNA computation from events
- Mutation UI + mutation engine
- Bass-rhythm linkage system
- Groove morphing

### Phase 5 — Preset Library + Taxonomy
- Two-tier preset system
- Biology-inspired taxonomy
- 1000+ preset target
- Taxonomy browser

### Phase 6 — Export + Polish
- MIDI export (reuse SMF serializer)
- Preset export/import
- Wheel sync visualization
- Performance optimization

---

## 7. Conclusion

The Euclidean Spielzeug project is a **beautiful, mature implementation** of a focused pedagogical tool. For Groove Container, we should:

- **KEEP** ~20% of the code (algorithms, utilities, proven patterns)
- **REFACTOR** ~30% (concepts that need re-architecture)
- **REPLACE** ~40% (everything tied to the boolean event model and fixed track system)
- **REMOVE** ~10% (dead code, now-irrelevant abstractions)

The fundamental paradigm shift is: **from `Pattern = boolean[]` to `GrooveEvent = { rich event object }`**. Everything flows from this change.
