import type { LeverId, State } from './types';

export interface LeverDef {
  id: LeverId;
  name: string;
  steps: number[];
  labels: string[];
  start: number;
  needFlag?: string;
  needAct?: number;
  now: string;      // immediate effect, shown on the card
  later: string;    // delayed effect
}

const money = (n: number) => '$' + n.toFixed(2);

export const LEVERS: LeverDef[] = [
  { id: 'price', name: 'Kindly+ price', steps: [2.99, 3.99, 4.99, 5.99, 6.99, 7.99, 9.99, 11.99, 14.99], labels: [], start: 2, needFlag: 'paid',
    now: 'more revenue per member', later: 'fewer sign-ups, NPS ▼ slowly' },
  { id: 'adLoad', name: 'Ad load', steps: [0, 1, 2, 3, 4, 5], labels: ['0', '1', '2', '3', '4', '5'], start: 0, needFlag: 'ads',
    now: 'ads per 10 posts', later: 'NPS ▼ slowly' },
  { id: 'notif', name: 'Notifications', steps: [0, 1, 2, 3, 4], labels: ['Off', 'Weekly', 'Daily', 'Hourly', 'Engagement-optimized'], start: 1, needAct: 2,
    now: 'daily active users ▲', later: 'NPS ▼ slowly' },
  { id: 'sellerFee', name: 'Seller fee', steps: [0.05, 0.08, 0.10, 0.15, 0.20, 0.25, 0.30], labels: ['5%', '8%', '10%', '15%', '20%', '25%', '30%'], start: 1, needFlag: 'market',
    now: 'marketplace revenue ▲', later: 'sellers unhappy' },
  { id: 'reach', name: 'Organic reach for businesses', steps: [1, 0.85, 0.70, 0.55, 0.40, 0.25, 0.15, 0.05], labels: ['100%', '85%', '70%', '55%', '40%', '25%', '15%', '5%'], start: 0, needFlag: 'biz',
    now: 'businesses must buy ads', later: 'feed fills with promoted posts, NPS ▼' },
  { id: 'data', name: 'Data sharing', steps: [0, 1, 2, 3], labels: ['None', 'Anonymized', 'Partners', 'Everyone'], start: 0, needFlag: 'data',
    now: 'data revenue ▲', later: 'NPS ▼, privacy risk' },
];
LEVERS[0].labels = LEVERS[0].steps.map(money);

export const LEVER_BY_ID = Object.fromEntries(LEVERS.map(l => [l.id, l])) as Record<LeverId, LeverDef>;

export function lever(s: State, id: LeverId): number {
  return LEVER_BY_ID[id].steps[s.levers[id]];
}

export function leverUnlocked(s: State, id: LeverId): boolean {
  const d = LEVER_BY_ID[id];
  if (s.act >= 4) return false;
  if (d.needAct && s.act < d.needAct) return false;
  if (d.needFlag && !s.flags.includes(d.needFlag)) return false;
  return true;
}

export function startLevers(): Record<LeverId, number> {
  return Object.fromEntries(LEVERS.map(l => [l.id, l.start])) as Record<LeverId, number>;
}
