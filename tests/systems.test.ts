import { describe, expect, it } from 'vitest';
import { EVENTS } from '../src/content/events';
import { apply, check } from '../src/engine/actions';
import { closeRound, votes } from '../src/engine/captable';
import { retention, staff } from '../src/engine/derive';
import { advance, openModal } from '../src/engine/tick';
import { fresh } from './helpers';

describe('NPS', () => {
  it('eases toward its target instead of jumping, and stays within ±100', () => {
    const s = fresh();
    s.free = 1000; s.npsMods = -200;
    advance(s, 1);
    expect(s.nps).toBeGreaterThan(40);
    advance(s, 2000);
    expect(s.nps).toBeGreaterThanOrEqual(-100);
    expect(s.nps).toBeLessThan(-95);
  });
});

describe('funding rounds', () => {
  it('unlock at their threshold, add cash, dilute the founder', () => {
    const s = fresh();
    s.free = 4000; advance(s, 1);
    expect(s.modal).toBeNull();
    s.free = 5200; advance(s, 1);
    expect(s.modal?.kind).toBe('termSheet');
    const cash = s.cash;
    apply(s, { type: 'acceptRound' });
    expect(s.cash).toBeCloseTo(cash + 1.5e6, -3);
    expect(s.cap.founder).toBeCloseTo(0.85, 5);
    expect(s.rounds).toBe(1);
  });

  it('dual-class only counts while the founder owns at least 40%', () => {
    const cap = { founder: 1, pool: 0, investors: [], dualClass: false };
    closeRound(cap, 0, 'dualclass');
    expect(votes(cap)).toBeGreaterThan(0.95);
    cap.founder = 0.39;
    expect(votes(cap)).toBeCloseTo(0.39, 5);
  });
});

describe('teams', () => {
  it('assigning moves people without changing headcount; unassigned people still cost salary', () => {
    const s = fresh();
    s.rounds = 1; s.unassigned = 10; s.free = 1000;
    const before = staff(s);
    apply(s, { type: 'assign', team: 'growth', delta: 1 });
    apply(s, { type: 'assign', team: 'product', delta: 1 });
    expect(staff(s)).toBe(before);
    expect(s.team.growth).toBe(1);
    advance(s, 1);
    expect(s.costs).toBeGreaterThanOrEqual(10 * 6000);
  });
});

describe('support inbox and outages', () => {
  it('unanswered tickets lower the NPS target', () => {
    const a = fresh(), b = fresh();
    for (const s of [a, b]) { s.free = 1000; s.beats.inbox = 0; s.nextOutageAt = 1e9; }
    advance(a, 120);
    for (let i = 0; i < 120; i++) { apply(b, { type: 'answerTicket' }); advance(b, 1); }
    expect(a.npsTarget).toBeLessThan(b.npsTarget);
  });

  it('an outage pauses growth until fixed', () => {
    const s = fresh();
    s.free = 3000; s.beats.inbox = 0; s.nextOutageAt = 0;
    advance(s, 0.2);
    expect(s.outage).not.toBeNull();
    const u = s.free;
    advance(s, 5);
    expect(s.free).toBeLessThanOrEqual(u);
    for (let i = 0; i < 5; i++) apply(s, { type: 'fixBug' });
    expect(s.outage).toBeNull();
  });
});

describe('levers', () => {
  it('move revenue at once and NPS only gradually', () => {
    const s = fresh();
    s.act = 2; s.rounds = 3; s.free = 1e7; s.flags.push('ads'); s.board = 50; s.boardQuota = 1e6; s.nps = 40; s.beats.npsGauge = 0;
    advance(s, 1);
    const rev = s.revenue, nps = s.nps;
    apply(s, { type: 'setLever', lever: 'adLoad', step: 3 });
    advance(s, 0.2);
    expect(s.revenue).toBeGreaterThan(rev + 1e6);
    expect(Math.abs(s.nps - nps)).toBeLessThan(1);
    advance(s, 300);
    expect(s.nps).toBeLessThan(nps - 10);
  });
});

describe('events', () => {
  it('each choice applies its effects exactly once', () => {
    const s = fresh();
    s.rounds = 2; s.act = 2; s.board = 50;
    const ev = EVENTS.find(e => e.options.some(o => o.effects.nps))!;
    const i = ev.options.findIndex(o => o.effects.nps);
    openModal(s, { kind: 'event', eventId: ev.id });
    const before = s.npsMods;
    expect(apply(s, { type: 'chooseEvent', option: i }).ok).toBe(true);
    expect(apply(s, { type: 'chooseEvent', option: i }).ok).toBe(false);
    expect(s.npsMods).toBeCloseTo(before + ev.options[i].effects.nps!, 5);
  });
});

describe('retention and churn', () => {
  it('high retention holds users despite negative NPS', () => {
    const lo = fresh(), hi = fresh();
    for (const s of [lo, hi]) { s.free = 1e7; s.nps = -60; s.npsMods = -200; s.act = 2; s.rival.share = 0; }
    hi.retPts = 10;
    advance(lo, 600); advance(hi, 600);
    expect(retention(hi)).toBeGreaterThan(0.9);
    expect(hi.free).toBeGreaterThan(lo.free);
  });
});

describe('board', () => {
  it('intervenes only when satisfaction is low and founder control is under 50%', () => {
    const s = fresh();
    s.act = 2; s.act2Start = -10000; s.rounds = 3; s.free = 1e7; s.board = 5; s.boardQuota = 1e12;
    s.cap.founder = 0.3;
    advance(s, 400);
    expect(s.interventions).toBeGreaterThan(0);
    expect(s.boardApproved.length + s.boardSet.length).toBeGreaterThan(0);
    const u = s.boardApproved[0];
    if (u) expect(check(s, { type: 'buyUpgrade', id: u }).ok).toBe(false);

    const c = fresh();
    c.act = 2; c.act2Start = -10000; c.rounds = 3; c.free = 1e7; c.board = 5; c.boardQuota = 1e12;
    c.cap = { founder: 0.45, pool: 0, investors: [], dualClass: true };
    advance(c, 400);
    expect(c.interventions).toBe(0);
    expect(c.failedProposals).toBeGreaterThan(0);
  });
});

describe('layoffs', () => {
  it('cash below zero lays people off a few at a time until profit returns', () => {
    const s = fresh();
    s.rounds = 1; s.free = 1000; s.team.product = 50; s.cash = -1;
    advance(s, 10.5);
    expect(staff(s)).toBeLessThan(50);
    expect(staff(s)).toBeGreaterThan(40);
  });
});
