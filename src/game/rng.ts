/**
 * Deterministic, seedable pseudo random number generator (mulberry32).
 *
 * The engine owns the seed and advances it as part of the game state so that
 * matches are reproducible, resumable and testable. Nothing in the AI layer
 * can peek at future rolls — the seed is only advanced inside `rollDice`.
 */

export function nextRandom(seed: number): [number, number] {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, t === 0 ? 0x9e3779b9 : t];
}

/** Returns a die value (1..6) and the next seed. */
export function nextDie(seed: number): [number, number] {
  const [value, next] = nextRandom(seed);
  return [Math.floor(value * 6) + 1, next];
}

/** Fresh seed sourced from the platform (never used for gameplay prediction). */
export function randomSeed(): number {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    cryptoObj.getRandomValues(buf);
    return buf[0] | 0;
  }
  return (Math.floor(Math.random() * 0x7fffffff) | 0) || 1;
}
