import { describe, expect, it } from 'vitest';
import { apply } from '../src/engine/actions';
import { hasControl } from '../src/engine/derive';
import { advance } from '../src/engine/tick';
import { playUntil } from './helpers';

describe('Act 3', () => {
  it('retiring NPS hides the gauge but NPS keeps affecting churn', () => {
    const g = playUntil('npsRetired');
    const v = g.observe();
    expect(v.health?.nps?.retired).toBe(true);
    expect(v.health?.nps?.value).toBeNull();
    const s = g.debugState();
    const a = JSON.parse(JSON.stringify(s)), b = JSON.parse(JSON.stringify(s));
    a.nps = 50; a.npsMods = 200; b.nps = -90; b.npsMods = -300;
    advance(a, 60); advance(b, 60);
    expect(a.free + a.paid).toBeGreaterThan(b.free + b.paid);
  }, 60000);
});

describe('Act 4', () => {
  it('refusing without control loses the vote and still pays the founder', () => {
    const g = playUntil('buyoutOffer');
    const s = g.debugState();
    expect(hasControl(s)).toBe(false);
    const before = s.founder.netWorth;
    expect(apply(s, { type: 'buyout', choice: 'refuse' }).ok).toBe(true);
    expect(s.modal?.kind === 'buyout' && s.modal.stage).toBe('vote');
    apply(s, { type: 'continue' });
    expect(s.act).toBe(4);
    expect(s.act4?.removed).toBe(true);
    expect(s.founder.netWorth).toBeGreaterThan(before + 1e8);
  }, 60000);

  it('divests in order, never sells Your Life, and ends in Chapter 11', () => {
    const g = playUntil('buyoutOffer');
    const s = g.debugState();
    apply(s, { type: 'buyout', choice: 'accept' });
    advance(s, 1300);
    expect(s.act4!.sold.slice(0, 3)).toEqual(['lab', 'market', 'upgrades']);
    expect(s.act4!.sold).not.toContain('life');
    expect(g.observe().tabs.find(t => t.id === 'life')?.sold).toBe(false);
    expect(s.ending).toBe('main');
    expect('chapter11' in s.beats).toBe(true);
    expect(s.final?.netWorth).toBe(s.founder.netWorth);
  }, 60000);
});
