import type { State } from './types';

// mulberry32, with its state kept in the game state so saves and replays stay deterministic.
export function rand(s: State): number {
  s.rng = (s.rng + 0x6d2b79f5) >>> 0;
  let t = s.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function pick<T>(s: State, list: T[]): T {
  return list[Math.floor(rand(s) * list.length)];
}

export function between(s: State, lo: number, hi: number): number {
  return lo + rand(s) * (hi - lo);
}
