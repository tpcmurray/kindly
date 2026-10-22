import { describe, expect, it } from 'vitest';
import { simulate } from '../sim/run';

// Targets from TDD §2.2 (minutes). Tolerance ±20%.
const TARGETS: Record<string, number> = { seed: 5, seriesA: 20, act2: 32, npsZero: 58, act3: 79, buyoutOffer: 120, chapter11: 140 };

const compliant = simulate('compliant', { minutes: 200 });

describe('pacing: compliant player', () => {
  for (const [beat, min] of Object.entries(TARGETS)) {
    it(`${beat} lands near ${min} min`, () => {
      expect(beat in compliant.beats, `${beat} never happened`).toBe(true);
      const at = compliant.beats[beat] / 60;
      expect(at).toBeGreaterThan(min * 0.8);
      expect(at).toBeLessThan(min * 1.2);
    });
  }
  it('ends in the main ending', () => expect(compliant.ending).toBe('main'));
  it('rarely sees board interventions', () => expect(compliant.game.debugState().interventions).toBeLessThanOrEqual(1));
});

describe('engagement', () => {
  it('never goes more than 3 minutes without something new (Acts 1–3)', () => {
    const gaps = compliant.engagement.gapsOver(180, compliant.beats.buyoutOffer ?? Infinity);
    expect(gaps.map(g => `${Math.round(g.at / 60)}m:${Math.round(g.length)}s`)).toEqual([]);
  });
});

describe('other players', () => {
  it('the idle player still reaches the seed round within 15 minutes', () => {
    const r = simulate('idle', { minutes: 20 });
    expect(r.beats.seed / 60).toBeLessThan(15);
  });

  it('the resister sees layoffs, then board interventions, and finishes within 3 hours', () => {
    const r = simulate('resister', { minutes: 200 });
    const s = r.game.debugState();
    expect(s.interventions).toBeGreaterThan(0);
    expect(s.laidOff).toBeGreaterThan(0);
    expect(r.ending).not.toBeNull();
    expect(r.endTime / 60).toBeLessThan(180);
  });
});
