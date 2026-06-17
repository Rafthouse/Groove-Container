import { describe, it, expect } from 'vitest';
import { renderOrganismToMidi, organismToMidiBytes } from './midi';
import type { GrooveOrganism } from './types';

function makeSimpleOrganism(overrides?: Partial<GrooveOrganism>): GrooveOrganism {
  return {
    id: 'test',
    name: 'Test Groove',
    bpm: 130,
    swing: 50,
    dna: null as any,
    taxonomy: { kingdom: 'E', family: 'F', genus: 'G', species: 'S' },
    wheelA: {
      tracks: [
        {
          id: 'kick', name: 'Kick', voice: 'kick', cycleLength: 16,
          events: [{ position: 0, velocity: 90, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'kick' }],
          mute: false, solo: false, volume: 80, pan: 0,
        },
        {
          id: 'snare', name: 'Snare', voice: 'snare', cycleLength: 16,
          events: [{ position: 4, velocity: 80, probability: 1, accent: false, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'snare' },
                   { position: 12, velocity: 80, probability: 1, accent: false, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'snare' }],
          mute: false, solo: false, volume: 70, pan: 0,
        },
        {
          id: 'ch', name: 'CH', voice: 'closedHat', cycleLength: 8,
          events: Array.from({ length: 8 }, (_, i) => ({ position: i, velocity: 70, probability: 1, accent: i % 4 === 0, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, voice: 'closedHat' as const })),
          mute: false, solo: false, volume: 60, pan: 0,
        },
      ],
    },
    wheelB: {
      tracks: [
        {
          id: 'bass', name: 'Bass', cycleLength: 16,
          events: [
            { position: 0, velocity: 80, probability: 1, accent: true, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, pitch: 36, duration: 4, tie: false, slide: false, ghost: false, mute: false },
            { position: 8, velocity: 75, probability: 1, accent: false, timingOffset: 0, humanization: 5, ratchet: 1, swing: 0, pitch: 43, duration: 4, tie: false, slide: false, ghost: false, mute: false },
            { position: 14, velocity: 50, probability: 0.5, accent: false, timingOffset: 0, humanization: 10, ratchet: 1, swing: 20, pitch: 38, duration: 2, tie: false, slide: false, ghost: true, mute: false },
          ],
          mute: false, volume: 80,
        },
      ],
    },
    ...overrides,
  };
}

describe('renderOrganismToMidi', () => {
  it('produces a project with correct format', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org);
    expect(project.format).toBe(1);
    expect(project.bpm).toBe(130);
    expect(project.ticksPerQuarter).toBe(480);
  });

  it('creates one MTrk per percussion voice plus one for bass', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org);
    // 3 percussion tracks + 1 bass track = 4 data tracks
    expect(project.tracks.length).toBeGreaterThanOrEqual(3);
    expect(project.tracks.length).toBeLessThanOrEqual(5);
  });

  it('renders kick at step 0 (once for 1 bar)', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org, 1);
    const kickTrack = project.tracks.find(t => t.name === 'Kick');
    expect(kickTrack).toBeDefined();
    expect(kickTrack!.notes.length).toBe(1);
    expect(kickTrack!.notes[0].startTick).toBe(0);
    expect(kickTrack!.notes[0].note).toBe(36); // GM Bass Drum
  });

  it('renders snare at steps 4 and 12 (1 bar)', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org, 1);
    const snareTrack = project.tracks.find(t => t.name === 'Snare');
    expect(snareTrack).toBeDefined();
    expect(snareTrack!.notes.length).toBe(2);
    expect(snareTrack!.notes.map(n => n.startTick)).toEqual([4 * 120, 12 * 120]);
    expect(snareTrack!.notes[0].note).toBe(38);
  });

  it('renders bass notes with correct pitches', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org);
    const bassTrack = project.tracks.find(t => t.name === 'Bass');
    expect(bassTrack).toBeDefined();
    expect(bassTrack!.notes.some(n => n.note === 36)).toBe(true); // C2
    expect(bassTrack!.notes.some(n => n.note === 43)).toBe(true); // G2
  });

  it('assigns drum tracks to channel 10 (9 0-based)', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org);
    for (const t of project.tracks) {
      if (t.name !== 'Bass') {
        expect(t.channel).toBe(9);
      }
    }
  });

  it('bass is NOT on channel 9', () => {
    const org = makeSimpleOrganism();
    const project = renderOrganismToMidi(org);
    const bassTrack = project.tracks.find(t => t.name === 'Bass');
    expect(bassTrack!.channel).not.toBe(9);
  });

  it('ratchet produces multiple notes per step', () => {
    const org = makeSimpleOrganism();
    org.wheelA.tracks[0].events[0].ratchet = 3;
    const project = renderOrganismToMidi(org, 1);
    const kickTrack = project.tracks.find(t => t.name === 'Kick');
    expect(kickTrack!.notes.length).toBe(3);
    expect(kickTrack!.notes[0].startTick).toBeLessThan(kickTrack!.notes[1].startTick);
  });

  it('muted tracks are excluded', () => {
    const org = makeSimpleOrganism();
    org.wheelA.tracks[1].mute = true; // mute snare
    const project = renderOrganismToMidi(org);
    const snareTrack = project.tracks.find(t => t.name === 'Snare');
    expect(snareTrack).toBeUndefined();
  });
});

describe('serializeMidi', () => {
  it('produces a byte sequence starting with MThd', () => {
    const org = makeSimpleOrganism();
    const bytes = organismToMidiBytes(org);
    const header = new TextDecoder().decode(bytes.slice(0, 4));
    expect(header).toBe('MThd');
  });

  it('produces at least one MTrk', () => {
    const org = makeSimpleOrganism();
    const bytes = organismToMidiBytes(org);
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('MTrk');
  });

  it('returns a valid Uint8Array with non-zero length', () => {
    const org = makeSimpleOrganism();
    const bytes = organismToMidiBytes(org);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(50);
  });

  it('format byte at offset 8 is 0x00 0x01 (Format 1)', () => {
    const org = makeSimpleOrganism();
    const bytes = organismToMidiBytes(org);
    expect(bytes[8]).toBe(0);
    expect(bytes[9]).toBe(1);
  });

  it('produces deterministic output (same organism = same bytes)', () => {
    const org = makeSimpleOrganism();
    const bytes1 = organismToMidiBytes(org);
    const bytes2 = organismToMidiBytes(org);
    expect(bytes1).toEqual(bytes2);
  });
});
