import { BRIDGE_DILUTION, CLASS_B_VOTES, ROUNDS, SECONDARY_PCT, SUNSET_THRESHOLD } from './constants';
import type { CapTable } from './types';

export const AMENDMENTS = [
  { id: 'valuation', label: 'Raise the valuation by 20%', detail: 'Pebble takes a smaller stake.' },
  { id: 'more', label: 'Increase the round to $1,800,000', detail: 'More cash now.' },
  { id: 'observer', label: 'Investor takes an observer seat instead of a board seat', detail: 'One fewer vote on the board.' },
  { id: 'dualclass', label: 'Create Class B Common Stock for founder (10 votes per share); investors receive Class A Common Stock (1 vote per share). Class B converts to Class A should the founder\'s holdings fall below 40% of outstanding shares.', detail: '' },
];

function scale(cap: CapTable, f: number) {
  cap.founder *= f;
  cap.pool *= f;
  for (const i of cap.investors) i.pct *= f;
}

export function closeRound(cap: CapTable, roundIndex: number, amendment: string | null): number {
  const r = ROUNDS[roundIndex];
  let d = r.dilution;
  let cash = r.cash;
  if (roundIndex === 0) {
    if (amendment === 'valuation') d = r.dilution / 1.2;
    if (amendment === 'more') { cash = 1.8e6; d = r.dilution * 1.2; }
    if (amendment === 'dualclass') cap.dualClass = true;
  }
  scale(cap, 1 - d);
  cap.investors.push({ id: r.investorId, name: r.investor, pct: d, seat: !(roundIndex === 0 && amendment === 'observer') });
  if (r.pool > 0) { scale(cap, 1 - r.pool); cap.pool += r.pool; }
  return cash;
}

export function sellSecondary(cap: CapTable): void {
  const buyer = cap.investors.find(i => i.id === 'northlight') ?? cap.investors[cap.investors.length - 1];
  const x = Math.min(SECONDARY_PCT, cap.founder);
  cap.founder -= x;
  buyer.pct += x;
}

export function bridgeNote(cap: CapTable): void {
  scale(cap, 1 - BRIDGE_DILUTION);
  const pebble = cap.investors.find(i => i.id === 'pebble');
  if (pebble) pebble.pct += BRIDGE_DILUTION;
  else cap.investors.push({ id: 'pebble', name: 'Pebble Ventures', pct: BRIDGE_DILUTION, seat: false });
}

// Kindly buys back x (fraction of the company) from one investor; everyone else's share rises.
export function repurchase(cap: CapTable, investorId: string, x: number): number {
  const inv = cap.investors.find(i => i.id === investorId);
  if (!inv) return 0;
  const take = Math.min(x, inv.pct);
  inv.pct -= take;
  scale(cap, 1 / (1 - take));
  return take;
}

export function classBActive(cap: CapTable): boolean {
  return cap.dualClass && cap.founder >= SUNSET_THRESHOLD;
}

export function votes(cap: CapTable): number {
  const e = cap.founder;
  if (!classBActive(cap)) return e;
  return CLASS_B_VOTES * e / (CLASS_B_VOTES * e + (1 - e));
}

export function boardSeats(cap: CapTable): { name: string; who: string }[] {
  const seats = [{ name: 'Founder', who: 'founder' }];
  for (const i of cap.investors) if (i.seat) seats.push({ name: i.name, who: i.id });
  if (cap.investors.length >= 3) seats.push({ name: 'Independent director', who: 'independent' });
  return seats;
}
