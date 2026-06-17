/**
 * Groove DNA Analysis Engine.
 *
 * Computes the eight DNA axes from a set of events. Each metric is a pure
 * function of the event array and its cycle length. All metrics return 0-1.
 *
 * The purpose is NOT to produce a single "groove score" — it's to expose
 * the independent behavioral dimensions of a groove organism, so mutation
 * and comparison operations know what they're preserving or changing.
 */

import type { GrooveDNA, GrooveEvent, PercussionEvent, BassEvent } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function distinct(values: number[]): number {
  return new Set(values).size;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Inter-onset intervals: gaps between consecutive event positions. */
function interOnsetIntervals(events: { position: number }[], cycleLength: number): number[] {
  if (events.length < 2) return [];
  const sorted = [...events].sort((a, b) => a.position - b.position);
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    intervals.push(sorted[i].position - sorted[i - 1].position);
  }
  // Wrap around: distance from last event to first in the next cycle
  intervals.push(cycleLength - sorted[sorted.length - 1].position + sorted[0].position);
  return intervals;
}

// ─── Per-Axis Computation ────────────────────────────────────────────────────

/**
 * Density: ratio of event positions to total steps.
 * 0 = empty, 1 = full.
 */
export function computeDensity(
  events: { position: number }[],
  cycleLength: number,
): number {
  if (cycleLength <= 0 || events.length === 0) return 0;
  return clamp01(events.length / cycleLength);
}

/**
 * Syncopation: how many events land on off-beats (16th steps not on main beats).
 * Main beats: 0, 4, 8, 12 (in a 16-step 4/4 bar).
 * Off-beats: all others.
 * Returns 0 (no syncopation) to 1 (maximally syncopated).
 */
export function computeSyncopation(
  events: { position: number }[],
  cycleLength: number,
): number {
  if (events.length === 0 || cycleLength === 0) return 0;
  const positions = events.map((e) => e.position);
  // Normalize positions to the cycle
  const onBeatPositions = new Set<number>();
  for (let i = 0; i < cycleLength; i += 4) {
    onBeatPositions.add(i % cycleLength);
  }
  const offBeatCount = positions.filter((p) => !onBeatPositions.has(p)).length;
  return clamp01(offBeatCount / events.length);
}

/**
 * Complexity: variety of inter-onset intervals.
 * More distinct IOI patterns = higher complexity.
 * Normalized by cycle length.
 */
export function computeComplexity(
  events: { position: number }[],
  cycleLength: number,
): number {
  if (events.length < 2 || cycleLength <= 0) return 0;
  const iois = interOnsetIntervals(events, cycleLength);
  const distinctIois = distinct(iois);
  const maxDistinct = cycleLength; // theoretical max
  return clamp01(distinctIois / maxDistinct);
}

/**
 * Swing: derived from per-event swing values and timing offsets.
 * 0 = straight 8ths, 1 = heavily swung.
 */
export function computeSwing(events: GrooveEvent[]): number {
  if (events.length === 0) return 0;
  const swings = events.map((e) => e.swing);
  const offsets = events.map((e) => Math.abs(e.timingOffset));
  const avgSwing = mean(swings);
  const avgOffset = mean(offsets);
  // Combine both swing attributes: max at 1
  return clamp01(avgSwing / 100 * 0.6 + avgOffset * 0.4);
}

/**
 * Ghost factor: ratio of ghost/soft events to accented events.
 * Higher = more ghost notes. 0 = no ghosts, 1 = all ghosts.
 */
export function computeGhostFactor(
  bassEvents: BassEvent[],
): number {
  if (bassEvents.length === 0) return 0;
  const ghostCount = bassEvents.filter((e) => e.ghost).length;
  const accentedCount = bassEvents.filter((e) => e.accent).length;
  const total = bassEvents.length;
  // Normalize: max ghost factor occurs when ghostCount >> accentedCount
  // Formula: ghostCount / max(accentedCount, 1) * 0.5 + ghostCount / total * 0.5
  const ghostToAccent = accentedCount > 0
    ? ghostCount / accentedCount
    : ghostCount > 0 ? 1 : 0;
  const ghostRatio = ghostCount / total;
  return clamp01(ghostToAccent * 0.5 + ghostRatio * 0.5);
}

/**
 * Aggression: velocity distribution skew + accent density.
 * Higher velocity average + more accents = higher aggression.
 */
export function computeAggression(events: GrooveEvent[]): number {
  if (events.length === 0) return 0;
  const velocities = events.map((e) => e.velocity);
  const avgVel = mean(velocities) / 100;
  const accentRatio = events.filter((e) => e.accent).length / events.length;
  // Skew: if velocities skew high, increase aggression
  const sorted = [...velocities].sort((a, b) => a - b);
  const median = sorted.length > 0
    ? sorted[Math.floor(sorted.length / 2)] / 100
    : 0.5;
  const skew = avgVel - median > 0.1 ? 0.2 : 0;
  return clamp01(avgVel * 0.4 + accentRatio * 0.4 + skew);
}

/**
 * Repetition: how predictable the event sequence is.
 * 0 = completely random, 1 = perfectly repetitive.
 * Uses simple self-similarity: count of adjacent identical position intervals.
 */
export function computeRepetition(
  events: { position: number }[],
  cycleLength: number,
): number {
  if (events.length < 3 || cycleLength <= 0) return 0.5; // insufficient data
  const iois = interOnsetIntervals(events, cycleLength);
  let identicalAdjacent = 0;
  for (let i = 1; i < iois.length; i++) {
    if (iois[i] === iois[i - 1]) identicalAdjacent++;
  }
  const maxIdentical = iois.length - 1;
  return maxIdentical > 0
    ? clamp01(identicalAdjacent / maxIdentical)
    : 0.5;
}

/**
 * Randomness: entropy of event placement across the grid.
 * Uses the distribution of occupied vs unoccupied steps.
 * 0 = fully deterministic (uniform), 1 = maximum randomness.
 */
export function computeRandomness(
  events: { position: number }[],
  cycleLength: number,
): number {
  if (cycleLength <= 0) return 0;
  // Count how many unique positions are occupied
  const occupied = new Set(events.map((e) => e.position));
  const ratio = occupied.size / events.length;
  // If all events are on unique positions → more random
  // If events repeat on same positions → less random
  const uniqueRatio = events.length > 0 ? occupied.size / events.length : 0;
  // Combine with density complement
  const density = computeDensity(events, cycleLength);
  // Low density + high uniqueness = higher randomness
  const densityFactor = 1 - density;
  return clamp01(uniqueRatio * 0.6 + densityFactor * 0.4);
}

// ─── Full DNA Computation ────────────────────────────────────────────────────

/**
 * Compute the full GrooveDNA for a set of events.
 * Merges percussion and bass events for complete analysis.
 */
export function computeDNA(
  percEvents: PercussionEvent[],
  bassEvents: BassEvent[],
  cycleLength: number,
): GrooveDNA {
  const allEvents: GrooveEvent[] = [...percEvents, ...bassEvents];
  const allPositions = allEvents.map((e) => ({ position: e.position }));

  return {
    density: computeDensity(allPositions, cycleLength),
    syncopation: computeSyncopation(allPositions, cycleLength),
    complexity: computeComplexity(allPositions, cycleLength),
    swing: computeSwing(allEvents),
    ghostFactor: computeGhostFactor(bassEvents),
    aggression: computeAggression(allEvents),
    repetition: computeRepetition(allPositions, cycleLength),
    randomness: computeRandomness(allPositions, cycleLength),
  };
}
