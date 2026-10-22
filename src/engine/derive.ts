import * as C from './constants';
import { votes } from './captable';
import { lever } from './levers';
import type { State, Team } from './types';
import { TEAMS } from './types';

export const users = (s: State) => s.free + s.paid;
export const staff = (s: State) => TEAMS.reduce((a, t) => a + s.team[t], 0) + s.unassigned;
export const has = (s: State, key: string) =>
  s.upgrades.includes(key) || s.flags.includes(key) || key in s.beats || s.eventsSeen.includes(key) || s.founder.life.includes(key);

export const retention = (s: State) => C.RET_BASE + C.RET_SPAN * (1 - Math.exp(-s.retPts / C.RET_SCALE));
export const founderVotes = (s: State) => votes(s.cap);
export const hasControl = (s: State) => founderVotes(s) > 0.5;

export function productivity(s: State): number {
  const m = Math.max(0, Math.min(100, s.morale + s.retreatBoost));
  return 0.8 + 0.4 * m / 100;
}

export function valuation(s: State): number {
  const last = s.rounds > 0 ? C.ROUNDS[s.rounds - 1].post : 1e6;
  return Math.max(last, s.revenue * 12 * C.BUYOUT_MULTIPLE);
}

export function availableMarket(s: State): number {
  const rival = s.rival.acquired ? 0 : s.rival.share;
  const porch = s.porch.acquired ? 0 : s.porch.share;
  return C.TAM * Math.max(0.1, 1 - rival - porch);
}

// Organic growth in users per second (before churn).
export function organicGrowth(s: State): number {
  const U = users(s);
  if (U < 10) return 0;
  if (s.outage) return 0;
  const room = Math.max(0, 1 - U / availableMarket(s));
  const gPerMin = C.G_BASE / (1 + Math.pow(U / C.G_SIZE_REF, C.G_SIZE_EXP));
  const growthMult = 1 + C.GROWTH_TEAM_K * Math.sqrt(s.team.growth * productivity(s)) + (s.act === 2 ? C.ACT2_GROWTH_BONUS : 0);
  const npsF = Math.max(0.2, 1 + s.nps / 150);
  return (U * gPerMin / 60) * s.vir * growthMult * npsF * room;
}

export function clickValue(s: State): number {
  let v = Math.max(1, C.CLICK_SHARE_OF_GROWTH * organicGrowth(s)) * s.clickMult;
  if (s.founder.life.includes('apartment')) v *= 1.1;
  if (s.founder.life.includes('car')) v *= 2;
  return v;
}

export function salary(s: State): number {
  return s.act === 1 ? C.SALARY_ACT1 : C.SALARY_LATER;
}

export function hireCost(s: State, n: number): number {
  const base = (s.act === 1 ? C.HIRE_COST_ACT1 : C.HIRE_COST_LATER) * (s.founder.life.includes('house') ? 0.85 : 1);
  let total = 0;
  const h = staff(s);
  for (let i = 0; i < n; i++) total += base * Math.pow(C.HIRE_COST_GROWTH, h + i);
  return total;
}

export function ticketRate(s: State): number {
  return C.TICKET_BASE_RATE + users(s) * C.TICKET_PER_USER;
}

export function leverNps(s: State): number {
  const paid = s.flags.includes('paid');
  return C.LEVER_NPS_SCALE * ((paid ? -(lever(s, 'price') - 4.99) * 3 : 0)
    - lever(s, 'adLoad') * 6
    - (lever(s, 'notif') - 1) * 4
    - (1 - lever(s, 'reach')) * 12
    - lever(s, 'data') * 4
    - (lever(s, 'sellerFee') - 0.08) * 20);
}

export function teamUnlocked(s: State, t: Team): boolean {
  if (t === 'product' || t === 'growth' || t === 'support') return s.rounds >= 1;
  if (t === 'trust') return s.rounds >= 2;
  return s.act >= 2;
}

export function rivalUsers(s: State): number {
  return s.rival.share * C.TAM * Math.min(1, users(s) / (C.TAM * 0.5));
}

export function rivalPrice(s: State, which: 'huddle' | 'porch'): number {
  if (which === 'huddle') return rivalUsers(s) * C.PRICE_PER_RIVAL_USER;
  return s.porch.share * C.TAM * C.PRICE_PER_RIVAL_USER;
}

export function burn(s: State): number {
  return Math.max(0, s.costs - s.revenue);
}

export function runwayMonths(s: State): number | null {
  const b = burn(s);
  if (b <= 0) return null;
  return Math.max(0, s.cash / b);
}

export function excessCash(s: State): number {
  return s.cash - 6 * s.costs;
}

export function inGameDate(t: number): { year: number; month: number; label: string } {
  const months = Math.floor(t / C.MONTH);
  const year = Math.floor(months / 12) + 1;
  const month = months % 12;
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return { year, month, label: `Year ${year}, ${names[month]}` };
}
