/**
 * Groove Container Audio Engine
 *
 * Single-clock Tone.js-based playback with synthesised percussion (6 voices)
 * and monophonic bass synth. No external samples required — everything is
 * generated at runtime via Web Audio.
 *
 * Architecture:
 *   AudioEngine (orchestrator)
 *   ├── Tone.Clock @ 16th-note resolution
 *   ├── PercussionSynth (6 membrane/synth voices → panner → master)
 *   └── BassSynth (MonoSynth → panner → master)
 *
 * Polymeter: each track tracks its own (globalStep % cycleLength) position.
 * Probability gate: each event fires only if Math.random() < event.probability.
 */

import * as Tone from 'tone';
import type { GrooveOrganism, RhythmTrack, BassTrack, BassEvent, PercussionEvent } from './types';

// ─── Synth Presets ───────────────────────────────────────────────────────────

type SynthVoice = 'kick' | 'snare' | 'closedHat' | 'openHat' | 'perc' | 'ghostPerc';

interface VoiceConfig {
  type: 'membrane' | 'synth' | 'noise';
  gain: number;
  params: Record<string, any>;
}

const VOICE_CONFIGS: Record<SynthVoice, VoiceConfig> = {
  kick: {
    type: 'membrane',
    gain: 1.0,
    params: {
      pitchDecay: 0.02,
      octaves: 5,
      oscillator: { type: 'sine' as const },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    },
  },
  snare: {
    type: 'noise',
    gain: 0.8,
    params: {
      noise: { type: 'white' as const, playbackRate: 3 },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    },
  },
  closedHat: {
    type: 'noise',
    gain: 0.5,
    params: {
      noise: { type: 'white' as const, playbackRate: 5 },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
    },
  },
  openHat: {
    type: 'noise',
    gain: 0.4,
    params: {
      noise: { type: 'white' as const, playbackRate: 4 },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    },
  },
  perc: {
    type: 'synth',
    gain: 0.6,
    params: {
      oscillator: { type: 'triangle' as const },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    },
  },
  ghostPerc: {
    type: 'synth',
    gain: 0.3,
    params: {
      oscillator: { type: 'square' as const },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.04 },
    },
  },
};

// ─── AudioEngine ─────────────────────────────────────────────────────────────

export enum AudioState {
  Stopped = 'stopped',
  Starting = 'starting',
  Playing = 'playing',
  Stopping = 'stopping',
}

export interface PlaybackPosition {
  /** Monotonically increasing global 16th-note step. */
  globalStep: number;
  /** Base absolute time of the current tick. */
  tickTime: number;
}

export class AudioEngine {
  private clock: Tone.Clock | null = null;
  private _state: AudioState = AudioState.Stopped;
  private _globalStep = 0;
  private _bpm = 130;
  private _swing = 0;

  // Audio nodes
  private masterGain: Tone.Gain;
  private readonly chans: Map<string, { gain: Tone.Gain; panner: Tone.Panner }> = new Map();
  private readonly synths: Map<string, Tone.MembraneSynth | Tone.Synth | Tone.NoiseSynth> = new Map();

  // Organism reference
  private _organism: GrooveOrganism | null = null;

  // Callbacks
  public onStep?: (step: number, bpm: number) => void;
  public onStateChange?: (state: AudioState) => void;

  constructor() {
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.masterGain.gain.value = 0.7;
  }

  get state(): AudioState { return this._state; }
  get globalStep(): number { return this._globalStep; }
  get bpm(): number { return this._bpm; }

  // ── Voice Management ──────────────────────────────────────────────

  private ensureVoice(trackId: string, voice: SynthVoice) {
    if (this.chans.has(trackId)) return;
    const config = VOICE_CONFIGS[voice] ?? VOICE_CONFIGS.perc;
    const panner = new Tone.Panner(0).connect(this.masterGain);
    const gain = new Tone.Gain(config.gain).connect(panner);
    this.chans.set(trackId, { gain, panner });

    let synth: Tone.MembraneSynth | Tone.Synth | Tone.NoiseSynth;
    switch (config.type) {
      case 'membrane':
        synth = new Tone.MembraneSynth(config.params);
        break;
      case 'noise':
        synth = new Tone.NoiseSynth(config.params);
        break;
      default:
        synth = new Tone.Synth(config.params);
    }
    synth.connect(gain);
    this.synths.set(trackId, synth);
  }

  // ── Load Organism ─────────────────────────────────────────────────

  load(organism: GrooveOrganism) {
    this._organism = organism;
    this._bpm = organism.bpm;
    this._swing = organism.swing;

    // Ensure all voices have synths
    for (const track of organism.wheelA.tracks) {
      this.ensureVoice(track.id, track.voice as SynthVoice);
    }
    // Bass track — will use triggerBass separately
    // Also ensure bass has a channel entry for mute control
    for (const track of organism.wheelB.tracks) {
      if (!this.chans.has(track.id)) {
        this.ensureBassSynth();
        const panner = new Tone.Panner(0).connect(this.masterGain);
        const gain = new Tone.Gain(track.volume / 100).connect(panner);
        this.chans.set(track.id, { gain, panner });
        if (this.bassSynth) {
          this.bassSynth.disconnect();
          this.bassSynth.connect(gain);
        }
      }
    }
  }

  updateBpm(bpm: number) {
    this._bpm = bpm;
    if (this.clock) {
      this.clock.frequency.value = this.bpmToHz(bpm);
    }
  }

  updateSwing(swing: number) {
    this._swing = swing;
  }

  // ── Playback Control ──────────────────────────────────────────────

  async start() {
    if (this._state === AudioState.Playing) return;
    this._state = AudioState.Starting;
    this.onStateChange?.(AudioState.Starting);

    await Tone.start();
    await Tone.getTransport().start();

    this._globalStep = 0;
    const hz = this.bpmToHz(this._bpm);

    this.clock = new Tone.Clock((time) => {
      this.tick(time);
    }, hz);

    // Slightly ahead lookahead via transport
    this.clock.start(0);
    this._state = AudioState.Playing;
    this.onStateChange?.(AudioState.Playing);
  }

  stop() {
    if (this._state === AudioState.Stopped) return;
    this._state = AudioState.Stopping;
    this.onStateChange?.(AudioState.Stopping);

    this.clock?.stop(0);
    this.clock?.dispose();
    this.clock = null;

    // Release all synths
    for (const s of this.synths.values()) {
      try { s.triggerRelease(Tone.now()); } catch {}
    }

    this._state = AudioState.Stopped;
    this._globalStep = 0;
    this.onStateChange?.(AudioState.Stopped);
  }

  dispose() {
    this.stop();
    for (const s of this.synths.values()) s.dispose();
    this.synths.clear();
    this.chans.clear();
    this.masterGain.dispose();
  }

  setMasterVolume(v: number) {
    this.masterGain.gain.value = Tone.gainToDb(v);
  }

  // ── Per-voice mute ───────────────────────────────────────────────

  muteVoice(trackId: string, muted: boolean) {
    const chan = this.chans.get(trackId);
    if (chan) {
      const baseGain = (VOICE_CONFIGS[trackId as SynthVoice]?.gain ?? 0.7);
      chan.gain.gain.value = muted ? 0 : baseGain;
    }
  }

  /** Set per-track volume (0-100) live. */
  setVoiceVolume(trackId: string, volume: number) {
    const chan = this.chans.get(trackId);
    if (chan) {
      chan.gain.gain.value = (volume / 100) * (VOICE_CONFIGS[trackId as SynthVoice]?.gain ?? 0.7);
    }
  }

  // ── Tick Handler ─────────────────────────────────────────────────

  private tick(time: number) {
    const org = this._organism;
    if (!org) return;

    // Fire percussion
    this.firePercussion(time, org.wheelA.tracks);
    // Fire bass
    this.fireBass(time, org.wheelB.tracks);

    this._globalStep++;
    this.onStep?.(this._globalStep, this._bpm);
  }

  // ── Trigger Percussion ───────────────────────────────────────────

  private firePercussion(time: number, tracks: RhythmTrack[]) {
    for (const track of tracks) {
      if (track.mute) continue;
      const localStep = this._globalStep % track.cycleLength;
      const events = track.events.filter(e => e.position === localStep);
      if (events.length === 0) continue;

      const synth = this.synths.get(track.id);
      if (!synth) continue;

      for (const event of events) {
        // Probability gate
        if (Math.random() > event.probability) continue;

        const swingTime = this.swingOffset(time, event.swing || this._swing, event.position);
        const humanTime = this.humanizeTime(swingTime, event.humanization);
        const finalTime = humanTime + (event.timingOffset ?? 0) * this.stepDuration();

        switch (track.voice) {
          case 'kick':
            (synth as Tone.MembraneSynth).triggerAttackRelease('C2', '16n', finalTime, event.velocity / 100);
            break;
          case 'snare':
            (synth as Tone.NoiseSynth).triggerAttackRelease('16n', finalTime, event.velocity / 100);
            break;
          case 'closedHat':
            (synth as Tone.NoiseSynth).triggerAttackRelease('32n', finalTime, event.velocity / 100);
            break;
          case 'openHat':
            (synth as Tone.NoiseSynth).triggerAttackRelease('8n', finalTime, event.velocity / 100);
            break;
          case 'perc': {
            const freq = 300 + (event.accent ? 200 : 0);
            (synth as Tone.Synth).triggerAttackRelease(freq, '32n', finalTime, event.velocity / 100);
            break;
          }
          case 'ghostPerc': {
            (synth as Tone.Synth).triggerAttackRelease(800, '64n', finalTime, (event.velocity / 100) * 0.6);
            break;
          }
        }

        // Ratchet: if ratchet > 1, subdivide and fire extra hits
        if (event.ratchet > 1) {
          const subStep = this.stepDuration() / event.ratchet;
          for (let r = 1; r < event.ratchet; r++) {
            const ratchetTime = finalTime + r * subStep * 0.5; // half-subdivision for natural feel
            switch (track.voice) {
              case 'kick':
                (synth as Tone.MembraneSynth).triggerAttackRelease('C3', '64n', ratchetTime, event.velocity / 100 * 0.7);
                break;
              default:
                (synth as Tone.Synth).triggerAttackRelease(500 + r * 100, '64n', ratchetTime, event.velocity / 100 * 0.5);
            }
          }
        }
      }
    }
  }

  // ── Trigger Bass ─────────────────────────────────────────────────

  /**
   * We create a dedicated bass synth on first use rather than using
   * a per-track synth, since bass is always monophonic.
   */
  private bassSynth: Tone.MonoSynth | null = null;
  private bassGain: Tone.Gain | null = null;
  private bassPanner: Tone.Panner | null = null;

  private ensureBassSynth() {
    if (this.bassSynth) return;
    this.bassPanner = new Tone.Panner(0).connect(this.masterGain);
    this.bassGain = new Tone.Gain(0.8).connect(this.bassPanner);
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'square' },
      filter: { Q: 6, frequency: 400, type: 'lowpass' },
      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.2,
        release: 0.5,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
        baseFrequency: 80,
        octaves: 4,
      },
    }).connect(this.bassGain);
  }

  private fireBass(time: number, tracks: BassTrack[]) {
    let hasBass = false;
    for (const track of tracks) {
      const localStep = this._globalStep % track.cycleLength;
      const events = track.events.filter(e => e.position === localStep);
      if (events.length === 0) continue;
      hasBass = true;

      for (const event of events) {
        if (event.mute) continue;
        if (Math.random() > event.probability) continue;
        this.ensureBassSynth();
        const bs = this.bassSynth!;

        const swingTime = this.swingOffset(time, event.swing || this._swing, event.position);
        const finalTime = this.humanizeTime(swingTime, event.humanization) + (event.timingOffset ?? 0) * this.stepDuration();
        const freq = Tone.Frequency(event.pitch, 'midi').toFrequency();

        if (event.tie || event.slide) {
          // Legato / slide: just change the frequency without re-triggering
          bs.frequency.setValueAtTime(freq, finalTime);
        } else if (event.ghost) {
          // Ghost: short, quiet note
          bs.triggerAttackRelease(freq, '32n', finalTime, 0.3);
        } else {
          const durNotes = event.duration >= 8 ? '2n' : event.duration >= 4 ? '4n' : event.duration >= 2 ? '8n' : '16n';
          const vel = event.accent ? Math.min(event.velocity / 100 + 0.15, 1) : event.velocity / 100;
          bs.triggerAttackRelease(freq, durNotes, finalTime, vel);
          
          if (event.slide) {
            // Add portamento to next bass event (scheduled ahead)
            const slideTime = finalTime + this.stepDuration() * event.duration * 0.8;
            bs.frequency.linearRampToValueAtTime(freq, slideTime);
          }
        }

        // Ratchet support for bass
        if (event.ratchet > 1) {
          const subStep = this.stepDuration() / event.ratchet;
          for (let r = 1; r < event.ratchet; r++) {
            const ratchetFreq = Tone.Frequency(event.pitch + r * 2, 'midi').toFrequency();
            bs.triggerAttackRelease(ratchetFreq, '64n', finalTime + r * subStep * 0.3, 0.4);
          }
        }
      }
    }

    // If no bass event at this step, release held notes
    if (!hasBass && this.bassSynth) {
      try { this.bassSynth.triggerRelease(); } catch {}
    }
  }

  // ── Timing Helpers ───────────────────────────────────────────────

  private bpmToHz(bpm: number): number {
    // 16th notes = bpm / 15 (since 1 quarter = 2 eighth = 4 sixteenth)
    return bpm / 15;
  }

  private stepDuration(): number {
    return 60 / this._bpm / 4; // duration of one 16th note in seconds
  }

  private swingOffset(time: number, swing: number, step: number): number {
    if (swing <= 0) return time;
    // Apply swing on every other 16th note (odd positions = off-beat 8th)
    const isOffBeat = step % 2 === 1;
    if (!isOffBeat) return time;
    const swingAmount = (swing / 100) * this.stepDuration() * 0.5;
    return time + swingAmount;
  }

  private humanizeTime(time: number, amount: number): number {
    if (amount <= 0) return time;
    // Amount 0-100 maps to 0-15ms jitter
    const jitter = (Math.random() - 0.5) * 2 * (amount / 100) * 0.015;
    return time + jitter;
  }
}

// ─── Singleton export ────────────────────────────────────────────────────────

export const audioEngine = new AudioEngine();
export default audioEngine;
