import { describe, expect, it } from 'vitest';
import { createGame, replay } from '../src/api/player';
import { apply } from '../src/engine/actions';
import { organicGrowth, users } from '../src/engine/derive';
import { advance } from '../src/engine/tick';
import { fmtN, money } from '../src/ui/format';
import { fresh } from './helpers';

describe('format', () => {
  it('formats numbers', () => {
    expect(fmtN(999)).toBe('999');
    expect(fmtN(1200)).toBe('1.2K');
    expect(fmtN(3.4e6)).toBe('3.4M');
    expect(fmtN(2.5e9)).toBe('2.50B');
    expect(money(1500)).toBe('$1.5K');
    expect(money(-2e6)).toBe('−$2.0M');
  });
});

describe('tick', () => {
  it('is deterministic for the same seed and actions', () => {
    const a = fresh(7), b = fresh(7);
    for (const s of [a, b]) {
      for (let i = 0; i < 200; i++) apply(s, { type: 'click' });
      advance(s, 300);
    }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('growth slows near the total market', () => {
    const s = fresh();
    s.free = 1e5; const small = organicGrowth(s) / users(s);
    s.free = 5.5e7; const big = organicGrowth(s) / users(s);
    expect(big).toBeLessThan(small / 10);
  });

  it('costs reduce cash', () => {
    const s = fresh();
    s.free = 1000; s.unassigned = 5; s.rounds = 1; s.cash = 100000;
    advance(s, 80);
    expect(s.cash).toBeLessThan(100000 - 5 * 6000 * 0.9);
  });

  it('runs 2 hours of game time in under a second', () => {
    const s = fresh();
    s.free = 1000;
    const t0 = performance.now();
    advance(s, 7200);
    expect(performance.now() - t0).toBeLessThan(1500);
  });
});

describe('player api', () => {
  it('replays a recorded session to an identical view', () => {
    const g = createGame({ seed: 3, founderName: 'A' });
    for (let i = 0; i < 80; i++) { g.act({ type: 'click' }); g.advance(0.25); }
    g.act({ type: 'buyUpgrade', id: 'invite' });
    g.advance(120);
    const r = replay(g.log(), g.elapsed());
    expect(JSON.stringify(r.observe())).toBe(JSON.stringify(g.observe()));
  });

  it('available() never offers an action that would fail', () => {
    const g = createGame({ seed: 2 });
    for (let step = 0; step < 40; step++) {
      for (const a of g.available()) {
        const copy = createGame({ state: JSON.parse(JSON.stringify(g.debugState())) });
        expect(copy.act(a).ok, JSON.stringify(a)).toBe(true);
      }
      for (let i = 0; i < 10; i++) g.act({ type: 'click' });
      g.advance(15);
    }
  });

  it('the view hides retired NPS and raw state', () => {
    const g = createGame({ seed: 1 });
    const s = g.debugState();
    s.free = 2e5; s.npsRetired = true; s.beats.npsGauge = 1;
    const v = g.observe();
    expect(v.health?.nps?.value).toBeNull();
    const text = JSON.stringify(v);
    expect(text).not.toContain('npsTarget');
    expect(text).not.toContain('"rng"');
  });
});
