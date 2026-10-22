import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run';
import { apply, check } from '../src/engine/actions';
import { closeRound, repurchase, sellSecondary, votes } from '../src/engine/captable';
import type { CapTable } from '../src/engine/types';
import { playUntil } from './helpers';

function capAfterRounds(dual: boolean, secondaries: boolean): CapTable {
  const cap: CapTable = { founder: 1, pool: 0, investors: [], dualClass: false };
  for (let r = 0; r < 4; r++) {
    closeRound(cap, r, r === 0 && dual ? 'dualclass' : null);
    if (secondaries && r >= 1) sellSecondary(cap);
  }
  return cap;
}

describe('hidden path vote math (TDD §8.2)', () => {
  it('without dual-class the founder never holds a majority', () => {
    const cap = capAfterRounds(false, false);
    for (let i = 0; i < 4; i++) repurchase(cap, 'pebble', 0.01);
    expect(votes(cap)).toBeLessThan(0.5);
  });
  it('dual-class alone is not enough after Series C (sunset clause)', () => {
    const cap = capAfterRounds(true, false);
    expect(cap.founder).toBeLessThan(0.40);
    expect(votes(cap)).toBeLessThan(0.5);
  });
  it('dual-class plus a repurchase restores control', () => {
    const cap = capAfterRounds(true, false);
    while (cap.founder < 0.41) repurchase(cap, 'pebble', 0.01) || repurchase(cap, 'northlight', 0.01);
    expect(votes(cap)).toBeGreaterThan(0.8);
  });
  it('selling secondaries makes the repurchase much bigger', () => {
    const honest = capAfterRounds(true, false), seller = capAfterRounds(true, true);
    expect(seller.founder).toBeLessThan(honest.founder - 0.04);
  });
});

describe('the Trust button', () => {
  it('appears only with control and positive NPS', () => {
    const g = playUntil('buyoutOffer');
    const s = g.debugState();
    expect(check(s, { type: 'buyout', choice: 'trust' }).ok).toBe(false);
    s.cap = { founder: 0.45, pool: 0, investors: [], dualClass: true };
    s.nps = -5;
    expect(check(s, { type: 'buyout', choice: 'trust' }).ok).toBe(false);
    s.nps = 10;
    expect(check(s, { type: 'buyout', choice: 'trust' }).ok).toBe(true);
    apply(s, { type: 'buyout', choice: 'trust' });
    expect(s.ending).toBe('trust');
    expect(s.act).toBe(5);
  }, 60000);

  it('the hidden bot reaches the Members\' Trust', () => {
    const r = simulate('hidden', { minutes: 200 });
    expect(r.ending).toBe('trust');
    expect(r.game.debugState().laidOff).toBe(0);
  });
});
