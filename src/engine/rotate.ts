/**
 * Generic cyclic array rotation. Ported from Euclidean Spielzeug.
 *
 * Positive amount rotates LEFT (element at index `amount` moves to 0).
 * Negative rotates RIGHT.
 * Any integer is valid; amount is taken modulo the length.
 */

export function rotate<T>(items: readonly T[], amount: number): T[] {
  if (!Number.isInteger(amount)) {
    throw new RangeError(`rotate: amount must be an integer, got ${amount}`);
  }
  const n = items.length;
  if (n === 0) return [];
  const k = ((amount % n) + n) % n;
  return items.slice(k).concat(items.slice(0, k));
}
