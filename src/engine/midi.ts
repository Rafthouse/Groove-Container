/**
 * MIDI Export for Groove Container
 *
 * Converts a GrooveOrganism to a Standard MIDI File (Format 1) with:
 *  - Track 0: conductor (tempo)
 *  - One MTrk per percussion voice (kick, snare, closedHat, openHat, perc, ghostPerc)
 *  - One MTrk for the bass track
 *
 * Key decisions:
 *   - We export the "theoretical" resolution of events (probability=1) so the
 *     user can see the full grid in their DAW.
 *   - Ratchet events are individual note-ons.
 *   - Polymeter is rendered by repeating each track's pattern to the LCM of all
 *     cycle lengths.
 *   - No external dependencies — pure arithmetic.
 */

import type { GrooveOrganism, RhythmTrack, BassTrack, HarmonyEvent } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

const TICKS_PER_QUARTER = 480; // standard resolution
const TICKS_PER_16TH = TICKS_PER_QUARTER / 4; // 120
const STEPS_PER_BAR = 16;
const DRUM_CHANNEL = 9; // GM percussion = channel 10, 0-based

/** General MIDI percussion map. */
const GM_DRUM_MAP: Record<string, number> = {
  kick: 36,      // Bass Drum 1
  snare: 38,     // Acoustic Snare
  closedHat: 42, // Closed Hi-Hat
  openHat: 46,   // Open Hi-Hat
  perc: 68,      // Low Bongo
  ghostPerc: 70, // Maracas (approximate)
  bass: 36,      // never used (bass is pitched)
};

// ─── Types (intermediate representation) ──────────────────────────────────────

export interface MidiNoteEvent {
  startTick: number;
  durationTicks: number;
  channel: number;
  note: number;
  velocity: number;
}

export interface MidiTrackData {
  name: string;
  channel: number;
  notes: MidiNoteEvent[];
}

export interface MidiProject {
  format: 1;
  ticksPerQuarter: number;
  bpm: number;
  tracks: MidiTrackData[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map 0-100 velocity to MIDI 1-127. */
function toMidiVel(v: number): number {
  return Math.max(1, Math.min(127, Math.round((v / 100) * 127)));
}

/** Compute tick position for a 16th-note step. */
function stepToTick(step: number, ticksPer16th = TICKS_PER_16TH): number {
  return step * ticksPer16th;
}

/** Compute duration in ticks from a duration in 16th-note steps. */
function durToTicks(durationSteps: number): number {
  return Math.max(1, durationSteps) * TICKS_PER_16TH;
}

/** LCM of all track cycle lengths. */
function computeTotalSteps(tracksA: RhythmTrack[], tracksB: BassTrack[], harmEvents?: HarmonyEvent[]): number {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const lcm = (a: number, b: number) => a * b / gcd(a, b);
  let t = 16;
  for (const tr of tracksA) t = lcm(t, tr.cycleLength);
  for (const tr of tracksB) t = lcm(t, tr.cycleLength);
  if (harmEvents && harmEvents.length > 0) {
    const harmCl = Math.max(...harmEvents.map(e => e.position)) + 1;
    t = lcm(t, harmCl);
  }
  return t;
}

// ─── Render one percussion track ─────────────────────────────────────────────

function renderPercussionTrack(
  track: RhythmTrack,
  totalSteps: number,
  channel: number,
): MidiTrackData {
  const notes: MidiNoteEvent[] = [];
  const gmNote = GM_DRUM_MAP[track.voice] ?? 42;

  for (let step = 0; step < totalSteps; step++) {
    const localStep = step % track.cycleLength;
    const event = track.events.find(e => e.position === localStep);
    if (!event) continue;

    if (event.ratchet <= 1) {
      notes.push({
        startTick: stepToTick(step),
        durationTicks: TICKS_PER_16TH,
        channel,
        note: gmNote,
        velocity: toMidiVel(event.velocity * (event.accent ? 1.2 : 1)),
      });
    } else {
      // Ratchet: subdivide the step
      const subTicks = TICKS_PER_16TH / event.ratchet;
      for (let r = 0; r < event.ratchet; r++) {
        notes.push({
          startTick: stepToTick(step) + Math.round(r * subTicks),
          durationTicks: Math.max(1, Math.round(subTicks * 0.8)),
          channel,
          note: gmNote,
          velocity: toMidiVel(event.velocity * (1 - r * 0.15)),
        });
      }
    }
  }

  return { name: track.name, channel, notes };
}

// ─── Render bass track ───────────────────────────────────────────────────────

function renderBassTrack(
  track: BassTrack,
  totalSteps: number,
  channel: number,
): MidiTrackData {
  const notes: MidiNoteEvent[] = [];

  for (let step = 0; step < totalSteps; step++) {
    const localStep = step % track.cycleLength;
    const event = track.events.find(e => e.position === localStep);
    if (!event || event.mute) continue;

    if (event.ratchet <= 1) {
      const vel = event.ghost
        ? toMidiVel(event.velocity * 0.4)
        : toMidiVel(event.velocity * (event.accent ? 1.15 : 1));

      if (event.tie) {
        // Tie: extend previous note
        const prev = notes[notes.length - 1];
        if (prev) {
          prev.durationTicks += durToTicks(event.duration);
        }
      } else if (event.slide) {
        // Slide: note-on at position, note-off at position + duration
        notes.push({
          startTick: stepToTick(step),
          durationTicks: durToTicks(event.duration),
          channel,
          note: event.pitch,
          velocity: vel,
        });
        // Also write a pitch bend to make it more expressive
        // (pitch bend is per-channel, not per-note; we skip it for simplicity)
      } else {
        notes.push({
          startTick: stepToTick(step),
          durationTicks: durToTicks(event.duration),
          channel,
          note: event.pitch,
          velocity: vel,
        });
      }
    } else {
      // Ratchet: subdivide
      const subTicks = TICKS_PER_16TH / event.ratchet;
      for (let r = 0; r < event.ratchet; r++) {
        const noteOffset = r * 3; // rising pitch for ratchet
        notes.push({
          startTick: stepToTick(step) + Math.round(r * subTicks),
          durationTicks: Math.max(1, Math.round(subTicks * 0.7)),
          channel,
          note: event.pitch + noteOffset,
          velocity: toMidiVel(event.velocity * (1 - r * 0.2)),
        });
      }
    }
  }

  return { name: track.name, channel, notes };
}

// ─── Render harmony track ──────────────────────────────────────────────

function renderHarmonyTrack(
  events: HarmonyEvent[],
  totalSteps: number,
  channel: number,
): MidiTrackData {
  const notes: MidiNoteEvent[] = [];
  if (!events || events.length === 0) return { name: 'Harmony', channel, notes };
  const cycleLength = Math.max(...events.map(e => e.position)) + 1;

  for (let step = 0; step < totalSteps; step++) {
    const localStep = step % cycleLength;
    const ev = events.find(e => e.position === localStep);
    if (!ev) continue;

    for (let p = 0; p < ev.pitches.length; p++) {
      notes.push({
        startTick: stepToTick(step),
        durationTicks: durToTicks(ev.duration || 4),
        channel,
        note: ev.pitches[p],
        velocity: toMidiVel((ev as any).velocity ?? 80),
      });
    }
  }

  return { name: 'Harmony', channel, notes };
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Render an entire GrooveOrganism to a MidiProject.
 * Renders LCM(cycleLengths) steps so all polymeter patterns complete.
 */
export function renderOrganismToMidi(
  organism: GrooveOrganism,
  bars: number = 4,
): MidiProject {
  const totalSteps = Math.max(
    bars * STEPS_PER_BAR,
    computeTotalSteps(organism.wheelA.tracks, organism.wheelB.tracks, organism.wheelC?.events),
  );

  const midiTracks: MidiTrackData[] = [];

  // Percussion voices (each on drum channel 10)
  for (const track of organism.wheelA.tracks) {
    if (track.mute) continue;
    const data = renderPercussionTrack(track, totalSteps, DRUM_CHANNEL);
    if (data.notes.length > 0) {
      midiTracks.push(data);
    }
  }

  // Bass track (melodic channel)
  let bassChannel = 0;
  for (const track of organism.wheelB.tracks) {
    if (track.mute) continue;
    const data = renderBassTrack(track, totalSteps, bassChannel);
    if (data.notes.length > 0) {
      midiTracks.push(data);
    }
  }

  // Harmony track (channel 2)
  if (organism.wheelC?.events && organism.wheelC.events.length > 0) {
    const data = renderHarmonyTrack(organism.wheelC.events, totalSteps, 2);
    if (data.notes.length > 0) {
      midiTracks.push(data);
    }
  }

  return {
    format: 1,
    ticksPerQuarter: TICKS_PER_QUARTER,
    bpm: organism.bpm,
    tracks: midiTracks,
  };
}

// ─── Serializer (Standard MIDI File, Format 1) ───────────────────────────────

/** Variable-length quantity (big-endian, 7 bits/byte, high bit = continue). */
function vlq(value: number): number[] {
  let v = value < 0 ? 0 : Math.floor(value);
  const out = [v & 0x7f];
  v = Math.floor(v / 128);
  while (v > 0) {
    out.unshift((v & 0x7f) | 0x80);
    v = Math.floor(v / 128);
  }
  return out;
}

const u16 = (n: number): number[] => [(n >> 8) & 0xff, n & 0xff];
const u32 = (n: number): number[] => [
  (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff,
];
const ascii = (s: string): number[] => Array.from(s, c => c.charCodeAt(0) & 0xff);

interface RawEvent {
  tick: number;
  order: number;
  data: number[];
}

function chunk(name: string, body: number[]): number[] {
  return [...ascii(name), ...u32(body.length), ...body];
}

function metaTrackName(name: string): number[] {
  const bytes = ascii(name);
  return [0xff, 0x03, ...vlq(bytes.length), ...bytes];
}

const END_OF_TRACK = [0xff, 0x2f, 0x00];

function buildTrackChunk(events: RawEvent[]): number[] {
  const sorted = [...events].sort((a, b) => a.tick - b.tick || a.order - b.order);
  const body: number[] = [];
  let prevTick = 0;
  for (const ev of sorted) {
    body.push(...vlq(ev.tick - prevTick), ...ev.data);
    prevTick = ev.tick;
  }
  body.push(...vlq(0), ...END_OF_TRACK);
  return chunk('MTrk', body);
}

function buildConductorChunk(bpm: number): number[] {
  const mpq = Math.round(60000000 / bpm);
  const events: RawEvent[] = [
    { tick: 0, order: 0, data: metaTrackName('Groove Container') },
    { tick: 0, order: 1, data: [0xff, 0x51, 0x03, (mpq >> 16) & 0xff, (mpq >> 8) & 0xff, mpq & 0xff] },
  ];
  return buildTrackChunk(events);
}

function buildNoteTrackChunk(track: MidiTrackData): number[] {
  const events: RawEvent[] = [
    { tick: 0, order: -1, data: metaTrackName(track.name) },
  ];
  for (const n of track.notes) {
    events.push({ tick: n.startTick, order: 1, data: [0x90 | n.channel, n.note, n.velocity] });
    events.push({ tick: n.startTick + n.durationTicks, order: 0, data: [0x80 | n.channel, n.note, 0] });
  }
  return buildTrackChunk(events);
}

/**
 * Serialize a MidiProject to a Standard MIDI File (Format 1) byte stream.
 * Deterministic: identical projects yield byte-identical output.
 */
export function serializeMidi(project: MidiProject): Uint8Array {
  const ntrks = project.tracks.length + 1; // + conductor track 0
  const header = chunk('MThd', [
    ...u16(1),     // format 1
    ...u16(ntrks),
    ...u16(project.ticksPerQuarter),
  ]);

  const bytes: number[] = [...header, ...buildConductorChunk(project.bpm)];
  for (const t of project.tracks) bytes.push(...buildNoteTrackChunk(t));
  return Uint8Array.from(bytes);
}

// ─── Convenience: full pipeline + download ────────────────────────────────────

/**
 * Full pipeline: organism → MidiProject → Uint8Array.
 * Use this for one-shot exports.
 */
export function organismToMidiBytes(organism: GrooveOrganism, bars: number = 4): Uint8Array {
  const project = renderOrganismToMidi(organism, bars);
  return serializeMidi(project);
}

/**
 * Trigger a browser download of a MIDI file from a GrooveOrganism.
 */
export function downloadMidi(organism: GrooveOrganism, bars: number = 4, filename?: string): void {
  const bytes = organismToMidiBytes(organism, bars);
  const blob = new Blob([bytes as BlobPart], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `${organism.name.replace(/\s+/g, '-')}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Individual Stems ────────────────────────────────────────────────────────

/**
 * Export each voice of a GrooveOrganism as individual MIDI files.
 * Downloads multiple files — one per track with events.
 */
export function downloadMidiStems(organism: GrooveOrganism): void {
  const baseName = organism.name.replace(/\s+/g, '-');
  const project = renderOrganismToMidi(organism, 4);
  for (const track of project.tracks) {
    const stemProject: MidiProject = {
      format: 1,
      ticksPerQuarter: project.ticksPerQuarter,
      bpm: project.bpm,
      tracks: [track],
    };
    const bytes = serializeMidi(stemProject);
    const blob = new Blob([bytes as BlobPart], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}-${track.name.replace(/\s+/g, '-').toLowerCase()}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
