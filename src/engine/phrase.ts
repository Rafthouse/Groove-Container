/**
 * Phrase contour generators for the modal bass engine.
 *
 * Each behavior returns a sequence of PhraseStep entries — abstract
 * scale-degree positions over `phraseLength` 16th steps.  A separate
 * stage (modalBass.ts) turns those degrees into concrete BassEvents
 * using a scale + root + register.
 *
 * Design constraint: phrase shape is decided in scale-degree space,
 * not MIDI-note space.  Tension/contour is about degree motion;
 * resolution is about returning to degree 0.  Notes are picked later.
 *
 * Pure module. Deterministic when given a seeded RNG.
 */

import type { ScaleFamily } from './scales';

// ─── Public types ─────────────────────────────────────────────────────

export type PhraseBehavior =
  | 'walking'
  | 'rolling'
  | 'pendulum'
  | 'droneMovement'
  | 'callResponse'
  | 'circular'
  | 'spiral'
  | 'minimal'
  | 'hypnotic';

export type HarmonicGravity = 'weak' | 'medium' | 'strong';
export type IntervalPreference = 'stepwise' | 'mixed' | 'leaping';
export type RepetitionLevel = 'minimal' | 'moderate' | 'hypnotic';
export type PhraseLength = 4 | 8 | 16 | 32;

/** A single position in a phrase, expressed as a scale degree. */
export interface PhraseStep {
  /** 16th-note position (0-based). */
  position: number;
  /** 0-based scale degree.  Negative = below root, wraps across octaves. */
  degree: number;
  /** Velocity hint in 0..127. Final velocity may be modulated downstream. */
  velocity: number;
  /** Accent flag — note is structurally important. */
  accent: boolean;
  /** Tie/slide hints for downstream BassEvent construction. */
  tie?: boolean;
  slide?: boolean;
  ghost?: boolean;
}

export interface PhraseOptions {
  behavior: PhraseBehavior;
  length: PhraseLength;
  /** Scale family — informs degree range (e.g. pentatonic = 5). */
  scale: ScaleFamily;
  /** Pull toward tonic (degree 0) on resolution beats. */
  gravity: HarmonicGravity;
  /** Stepwise / mixed / leaping. */
  interval: IntervalPreference;
  /** Repetition target — minimal=high variety, hypnotic=motif loop. */
  repetition: RepetitionLevel;
  /**
   * Anchor positions — usually where the kick lands in the rhythm.  The
   * phrase will favour placing notes on these steps when behaviour allows
   * (e.g. walking, rolling, drone movement). Empty array = no anchors.
   */
  anchors?: number[];
  /** Deterministic seed. */
  seed?: number;
}

// ─── Tiny seeded PRNG (Mulberry32) ────────────────────────────────────

function makeRng(seed: number) {
  let state = seed >>> 0;
  return function rand(): number {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pickWeighted = (rand: () => number, weights: number[]): number => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
};

// ─── Interval menu by preference ──────────────────────────────────────

/** Step-size weights, indexed by absolute degree-jump (1..7). */
function intervalWeights(pref: IntervalPreference): number[] {
  switch (pref) {
    case 'stepwise': return [0, 65, 22, 8, 3, 1, 1, 0];   // mostly ±1, some ±2
    case 'mixed':    return [0, 35, 25, 15, 12, 7, 4, 2];
    case 'leaping':  return [0, 12, 14, 18, 20, 18, 12, 6];
  }
}

function gravityProb(g: HarmonicGravity): number {
  switch (g) {
    case 'weak':   return 0.18;
    case 'medium': return 0.38;
    case 'strong': return 0.62;
  }
}

// ─── Common motion utility ────────────────────────────────────────────

/**
 * Pick a next degree from `current` using the interval preference,
 * with a soft gravitational pull toward `target` (usually 0 = root).
 */
function nextDegree(
  current: number,
  target: number,
  pref: IntervalPreference,
  gravity: HarmonicGravity,
  rand: () => number,
  range: number,
): number {
  const pull = gravityProb(gravity);
  if (rand() < pull) {
    // Step toward target by 1.
    if (current === target) return current; // already there — stay or move next time
    return current + Math.sign(target - current);
  }
  const w = intervalWeights(pref);
  const jump = pickWeighted(rand, w);
  const dir = rand() < 0.5 ? -1 : 1;
  let next = current + dir * jump;
  // Soft clamp to a register-friendly range.
  const span = Math.max(2, range);
  if (next > span) next = current - jump;
  if (next < -span) next = current + jump;
  return next;
}

// ─── Velocity / accent helpers ───────────────────────────────────────

function downbeatVelocity(position: number, length: number): number {
  // Stronger on bar starts / strong beats.
  if (position === 0) return 110;
  if (length >= 16 && position % 8 === 0) return 95;
  if (length >= 8 && position % 4 === 0) return 85;
  return 70;
}

function withAnchorAccent(steps: PhraseStep[], anchors: number[]): PhraseStep[] {
  if (!anchors.length) return steps;
  const set = new Set(anchors.map(a => a % (steps.length || 1)));
  for (const s of steps) {
    if (set.has(s.position)) {
      s.accent = true;
      s.velocity = Math.min(127, s.velocity + 18);
    }
  }
  return steps;
}

// ─── Repetition shaping ──────────────────────────────────────────────

/**
 * Apply repetition policy by collapsing parts of the phrase back onto
 * earlier material. Minimal = no collapse, hypnotic = aggressive loop
 * of the first quarter.
 */
function applyRepetition(steps: PhraseStep[], level: RepetitionLevel): PhraseStep[] {
  if (steps.length === 0) return steps;
  if (level === 'minimal') return steps;
  const n = steps.length;
  if (level === 'moderate') {
    // Repeat the first half pattern of degrees in the second half,
    // but keep distinct velocity/accent so the loop breathes.
    const half = Math.floor(n / 2);
    for (let i = half; i < n; i++) {
      const src = steps[i - half];
      steps[i] = {
        ...steps[i],
        degree: src.degree,
        tie: src.tie,
        slide: src.slide,
      };
    }
    return steps;
  }
  // hypnotic: repeat the first quarter four times if length allows
  const motif = Math.max(2, Math.floor(n / 4));
  for (let i = motif; i < n; i++) {
    const src = steps[i % motif];
    steps[i] = {
      ...steps[i],
      degree: src.degree,
      velocity: src.velocity,
      accent: src.accent,
      tie: src.tie,
      slide: src.slide,
    };
  }
  return steps;
}

// ─── Anchor expansion ────────────────────────────────────────────────

/**
 * Place phrase steps at requested positions.  Some behaviours (drone,
 * walking, hypnotic) explicitly want every grid position; others
 * (minimal, callResponse) want sparse placement.
 */
type Placement = 'dense' | 'sparse' | 'anchored';

function positionsFor(
  length: number,
  placement: Placement,
  anchors: number[],
  rand: () => number,
): number[] {
  if (placement === 'dense') {
    return Array.from({ length }, (_, i) => i);
  }
  if (placement === 'anchored') {
    const set = new Set<number>();
    for (const a of anchors) set.add(a % length);
    // also include the downbeat and the off-bar to keep something there
    set.add(0);
    if (length >= 8) set.add(Math.floor(length / 2));
    return [...set].sort((a, b) => a - b);
  }
  // sparse: 25–40% of grid positions on weighted beats
  const target = Math.max(2, Math.round(length * (0.25 + rand() * 0.15)));
  const out = new Set<number>([0]);
  while (out.size < target) {
    // Bias toward divisions of 4 (strong beats)
    const candidates = [
      Math.floor(rand() * length),
      (Math.floor(rand() * length / 4)) * 4,
    ];
    out.add(candidates[rand() < 0.6 ? 1 : 0] % length);
  }
  return [...out].sort((a, b) => a - b);
}

// ─── Behaviour generators ────────────────────────────────────────────

function genWalking(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  const range = 5;
  let degree = 0;
  return positions.map((position) => {
    const step: PhraseStep = {
      position,
      degree,
      velocity: downbeatVelocity(position, opts.length),
      accent: position === 0 || position % 4 === 0,
    };
    // Resolve toward root every full bar.
    const target = position % 8 === 7 ? 0 : 0;
    degree = nextDegree(degree, target, opts.interval, opts.gravity, rand, range);
    return step;
  });
}

function genRolling(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  // Arpeggiated motion through scale steps 0,2,4 (or close analogues).
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  const figure = [0, 2, 4, 2]; // tonic, third, fifth, third
  return positions.map((position, i) => {
    const baseDeg = figure[i % figure.length];
    const drift = (i % 8 === 4) ? 1 : 0; // every 4 figures lift a step
    const degree = opts.interval === 'leaping' ? baseDeg * 2 : baseDeg + drift;
    return {
      position,
      degree,
      velocity: downbeatVelocity(position, opts.length),
      accent: position % 4 === 0,
    };
  });
}

function genPendulum(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  const amp = opts.interval === 'leaping' ? 4 : opts.interval === 'mixed' ? 3 : 2;
  const phase = (2 * Math.PI) / Math.max(4, opts.length);
  return positions.map((position) => {
    const sin = Math.sin(position * phase);
    const degree = Math.round(sin * amp);
    return {
      position,
      degree,
      velocity: downbeatVelocity(position, opts.length),
      accent: Math.abs(sin) > 0.85,
    };
  });
}

function genDroneMovement(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  // Mostly tonic; bursts of movement at strong beats (and on anchors).
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  let direction = 1;
  return positions.map((position) => {
    const onMove = position % 4 === 0 || (opts.anchors ?? []).includes(position);
    let degree = 0;
    if (onMove && rand() < 0.4) {
      degree = direction * (opts.interval === 'leaping' ? 4 : 2);
      direction *= -1;
    }
    return {
      position,
      degree,
      velocity: degree === 0 ? 65 : downbeatVelocity(position, opts.length),
      accent: degree !== 0,
      tie: degree === 0 && position % 4 !== 0,
    };
  });
}

function genCallResponse(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  const positions = positionsFor(opts.length, 'sparse', opts.anchors ?? [], rand);
  const half = opts.length / 2;
  return positions.map((position) => {
    const inCall = position < half;
    const target = inCall ? 4 : 0; // rise during call, return during response
    const ratio = inCall ? position / half : (position - half) / half;
    const degree = Math.round(target * ratio);
    return {
      position,
      degree,
      velocity: downbeatVelocity(position, opts.length),
      accent: position === 0 || position === half,
    };
  });
}

function genCircular(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  // A short motif (3–5 degrees) repeats so the phrase 'comes back'.
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  const motif = opts.interval === 'leaping'
    ? [0, 4, -2, 2]
    : opts.interval === 'stepwise'
    ? [0, 1, 2, 1]
    : [0, 2, -1, 3];
  return positions.map((position, i) => ({
    position,
    degree: motif[i % motif.length],
    velocity: downbeatVelocity(position, opts.length),
    accent: i % motif.length === 0,
  }));
}

function genSpiral(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  // Slowly drifting up (or down) by half a degree each step.
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  const dir = rand() < 0.5 ? 1 : -1;
  return positions.map((position, i) => {
    const degree = dir * Math.floor(i / 2);
    return {
      position,
      degree,
      velocity: downbeatVelocity(position, opts.length),
      accent: position % 4 === 0,
    };
  });
}

function genMinimal(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  const positions = positionsFor(opts.length, 'sparse', opts.anchors ?? [], rand);
  const choices = opts.interval === 'leaping' ? [0, 4, 7] : [0, 2, -2];
  return positions.map((position, i) => ({
    position,
    degree: choices[i % choices.length],
    velocity: position === 0 ? 110 : 80,
    accent: position === 0,
    tie: i > 0 && rand() < 0.3,
  }));
}

function genHypnotic(opts: PhraseOptions, rand: () => number): PhraseStep[] {
  // Very repetitive — short cell repeats 2..4 times.
  const positions = positionsFor(opts.length, 'dense', opts.anchors ?? [], rand);
  const cell = opts.interval === 'leaping' ? [0, 5, 0, 5] : [0, -1, 0, 2];
  return positions.map((position, i) => ({
    position,
    degree: cell[i % cell.length],
    velocity: 78 + (position === 0 ? 16 : 0),
    accent: position % 4 === 0,
  }));
}

// ─── Public entry point ──────────────────────────────────────────────

export function generatePhrase(opts: PhraseOptions): PhraseStep[] {
  const rand = makeRng(opts.seed ?? 0x9E3779B9);
  let steps: PhraseStep[];

  switch (opts.behavior) {
    case 'walking':       steps = genWalking(opts, rand); break;
    case 'rolling':       steps = genRolling(opts, rand); break;
    case 'pendulum':      steps = genPendulum(opts, rand); break;
    case 'droneMovement': steps = genDroneMovement(opts, rand); break;
    case 'callResponse':  steps = genCallResponse(opts, rand); break;
    case 'circular':      steps = genCircular(opts, rand); break;
    case 'spiral':        steps = genSpiral(opts, rand); break;
    case 'minimal':       steps = genMinimal(opts, rand); break;
    case 'hypnotic':      steps = genHypnotic(opts, rand); break;
  }

  steps = withAnchorAccent(steps, opts.anchors ?? []);
  steps = applyRepetition(steps, opts.repetition);
  return steps;
}

// ─── UI metadata ──────────────────────────────────────────────────────

export const PHRASE_BEHAVIOR_LABELS: Record<PhraseBehavior, string> = {
  walking: 'Walking',
  rolling: 'Rolling',
  pendulum: 'Pendulum',
  droneMovement: 'Drone + Movement',
  callResponse: 'Call / Response',
  circular: 'Circular',
  spiral: 'Spiral',
  minimal: 'Minimal',
  hypnotic: 'Hypnotic',
};

export const GRAVITY_LABELS: Record<HarmonicGravity, string> = {
  weak: 'Weak',
  medium: 'Medium',
  strong: 'Strong',
};

export const INTERVAL_LABELS: Record<IntervalPreference, string> = {
  stepwise: 'Stepwise',
  mixed: 'Mixed',
  leaping: 'Leaping',
};

export const REPETITION_LABELS: Record<RepetitionLevel, string> = {
  minimal: 'Minimal',
  moderate: 'Moderate',
  hypnotic: 'Hypnotic',
};
