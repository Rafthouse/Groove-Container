/**
 * Bjorklund's Euclidean distribution — one of many Distribution strategies.
 *
 * Ported from Euclidean Spielzeug with the same algorithm. Returns event
 * metadata for a given hits/steps combo; the caller wraps results into
 * the Groove Container event model.
 *
 * This is a GENERATOR, not an event model. It produces positions; the
 * caller provides velocity/probability/accent/etc.
 */

/** A generated onset position with basic metadata. */
export interface EuclidOnset {
  position: number;   // step index within the cycle
  index: number;      // onset index (0-based, sequential)
}

/**
 * Generate Euclidean hit positions for a given hits/steps config.
 * Pure function: identical inputs → identical outputs.
 *
 * The result is rotated so index 0 is the first onset (canonical form).
 *
 * Edge cases:
 *   hits <= 0 → empty array
 *   hits >= steps → every step is an onset
 */
export function euclid(hits: number, steps: number): EuclidOnset[] {
  if (!Number.isInteger(steps) || steps <= 0) {
    throw new RangeError(`euclid: steps must be a positive integer, got ${steps}`);
  }
  if (!Number.isInteger(hits) || hits < 0) {
    throw new RangeError(`euclid: hits must be a non-negative integer, got ${hits}`);
  }

  if (hits === 0) return [];
  if (hits >= steps) {
    return Array.from({ length: steps }, (_, i) => ({ position: i, index: i }));
  }

  // Bjorklund: repeatedly distribute the "remainder" groups
  const counts: number[] = [];
  const remainders: number[] = [hits];
  let divisor = steps - hits;
  let level = 0;

  for (;;) {
    counts.push(Math.floor(divisor / remainders[level]));
    remainders.push(divisor % remainders[level]);
    divisor = remainders[level];
    level += 1;
    if (remainders[level] <= 1) break;
  }
  counts.push(divisor);

  const pattern: boolean[] = [];
  const build = (lvl: number): void => {
    if (lvl === -1) {
      pattern.push(false);
    } else if (lvl === -2) {
      pattern.push(true);
    } else {
      for (let i = 0; i < counts[lvl]; i++) build(lvl - 1);
      if (remainders[lvl] !== 0) build(lvl - 2);
    }
  };
  build(level);

  // Rotate so index 0 is the first onset
  const first = pattern.indexOf(true);
  const rotated = pattern.slice(first).concat(pattern.slice(0, first));

  // Map boolean array to EuclidOnset[]
  let onsetIdx = 0;
  return rotated
    .map((on, pos) => (on ? { position: pos, index: onsetIdx++ } : null))
    .filter((e): e is EuclidOnset => e !== null);
}
