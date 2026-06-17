# Groove Container — Implementation Roadmap

## Mission

NOT a better Euclidean sequencer.
A new class of groove-generation instrument.

## Current Phase: v0.5 — Product-Defining UI (PRIORITY)

**BEFORE** any audio engine, MIDI, or persistence.

| Feature | Status | Why Priority |
|---------|--------|-------------|
| Dual Wheel UI (A + B) | ✅ Complete | Core identity — two linked wheels visible at once |
| Groove DNA Visualization | ✅ Complete | Shows groove is analyzable, not magical |
| Taxonomy Browser | ✅ Complete | Biology-inspired, supports 1000+ presets |
| Preset Architecture | ✅ Complete | Rich data model with 6 families, 50+ presets |
| Mutation Engine UI | ✅ Complete | Interactive preserve/mutate controls |
| Polymeter Visualization | 🔄 Built in types, UI pending | Per-voice cycle length + convergence display |
| 1999 Groovebox Theme | ✅ Complete | Hardware aesthetic, physical button feel |

## v0.6 — Audio Playback (next)

- Tone.js single-clock scheduler
- Sample-based percussion (6 voices)
- Synthesized bass
- Per-event scheduling with probability/velocity/accent

## v0.7 — Export + Polish

- MIDI export (port SMF serializer)
- Preset export/import
- Performance optimization
