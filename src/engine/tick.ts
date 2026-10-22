import { EVENTS } from '../content/events';
import { OUTAGES } from '../content/misc';
import { LATE_DECOYS, PUZZLES, SHAPES } from '../content/puzzles';
import { TESTS } from '../content/tests';
import { UPGRADE_BY_ID, UPGRADES } from '../content/upgrades';
import * as C from './constants';
import {
  burn, founderVotes, hasControl, inGameDate, leverNps, organicGrowth, productivity,
  retention, salary, staff, ticketRate, users,
} from './derive';
import { applyEffects } from './effects';
import { LEVERS, lever, leverUnlocked } from './levers';
import { condOk, fire, markTab, pushNews, pushRawPost, tickNarrative } from './narrative';
import { layOff } from './people';
import { between, pick, rand } from './rng';
import type { Modal, State } from './types';

export function openModal(s: State, m: Modal): void {
  if (s.modal) s.modalQueue.push(m);
  else s.modal = m;
}

export function closeModal(s: State): void {
  s.modal = s.modalQueue.shift() ?? null;
}

const DIVEST_ORDER: { id: string; name: string }[] = [
  { id: 'lab', name: 'Growth Lab' },
  { id: 'market', name: 'The Market' },
  { id: 'upgrades', name: 'The product roadmap' },
  { id: 'team', name: 'The Team' },
  { id: 'board', name: 'The Board Room' },
  { id: 'metrics', name: 'Member Health' },
  { id: 'inbox', name: 'Member Support' },
  { id: 'money', name: 'Finance' },
];
export const DIVEST_NAMES = Object.fromEntries([...DIVEST_ORDER, { id: 'feed', name: 'The Kindly feed' }].map(d => [d.id, d.name]));

export function advance(s: State, seconds: number): void {
  let left = seconds;
  while (left > 1e-9) {
    const dt = Math.min(C.TICK, left);
    step(s, dt);
    left -= dt;
  }
}

export function step(s: State, realDt: number): void {
  if (s.modal || s.final) return;
  const dt = realDt * s.speed;
  s.t += dt;
  const U = users(s);
  const prod = productivity(s);

  // ---------------- users ----------------
  const organic = s.act === 4 ? organicGrowth(s) * 0.3 : organicGrowth(s);
  const ret = retention(s);
  const churnPerMin = C.CHURN_K * (1 - ret) * Math.pow(1.5 - s.nps / 100, 2) + (s.act4?.sunset ? C.SUNSET_CHURN : 0);
  const freeChurn = s.free * churnPerMin / 60 * dt;
  const paidChurn = s.paid * churnPerMin * C.PAID_CHURN_FACTOR * s.paidChurnMult / 60 * dt;
  let conv = 0;
  if (s.flags.includes('paid') && s.act !== 5) {
    const honest = !s.upgrades.some(id => UPGRADE_BY_ID[id]?.dark && UPGRADE_BY_ID[id]?.paywalls);
    const base = honest ? C.PAID_SHARE_HONEST * s.honestConv * s.conv : C.PAID_SHARE_BASE * s.conv;
    const share = Math.min(C.PAID_SHARE_CAP, base * Math.pow(4.99 / lever(s, 'price'), 1.2) * (1 + 0.05 * Math.sqrt(s.team.sales * prod)));
    conv = Math.max(0, share * U - s.paid) / C.CONVERSION_CLOSE_SECONDS * dt;
  }
  s.free = Math.max(0, s.free + organic * dt - freeChurn - conv);
  s.paid = Math.max(0, s.paid + conv - paidChurn);
  s.lastGrowthPerMin = U > 0 ? (organic - (freeChurn + paidChurn) / dt) * 60 / U : 0;
  const U2 = users(s);
  if (U2 > s.peakUsers) s.peakUsers = U2;

  // ---------------- support inbox ----------------
  const arrivals = ticketRate(s) * dt;
  if ('inbox' in s.beats && !(s.act4?.sold.includes('inbox'))) {
    s.tickets += arrivals;
    if (!s.assistant) s.tickets = Math.max(0, s.tickets - s.team.support * prod * C.SUPPORT_CAPACITY * dt);
  }
  // Hand-answered tickets count as capacity (a rolling one-minute rate).
  s.handRate = s.handRate * Math.exp(-dt / 60) + s.handBurst / 60;
  s.handBurst = 0;
  const capacity = (s.assistant ? 0 : s.team.support * prod * C.SUPPORT_CAPACITY) + s.handRate;
  const coverage = s.tickets < 1 ? 1 : Math.min(1, capacity / ticketRate(s));
  const ticketPenalty = C.TICKET_NPS_PENALTY * (1 - coverage);

  // ---------------- outages ----------------
  if (s.outage) {
    if (s.t >= s.outage.autoAt) resolveOutage(s);
  } else if ('inbox' in s.beats && s.t >= s.nextOutageAt && s.act <= 3) {
    const autoAt = s.team.product > 0 ? s.t + C.OUTAGE_AUTO_FIX / (1 + s.team.product / 5) : Infinity;
    s.outage = newOutage(s, autoAt);
    fire(s, 'firstOutage');
  }

  // ---------------- NPS ----------------
  const product = C.PRODUCT_NPS_MAX * (1 - Math.exp(-s.team.product * prod / C.PRODUCT_NPS_SCALE));
  const act4Pen = s.act4 ? 10 * s.act4.sold.length : 0;
  s.npsTarget = Math.max(-100, Math.min(100, C.NPS_BASE + product + s.npsMods - ticketPenalty - (s.outage ? C.OUTAGE_NPS_PENALTY : 0) + leverNps(s) - act4Pen));
  s.nps += (s.npsTarget - s.nps) * dt / C.NPS_EASE_SECONDS;
  if (s.nps < 0 && !s.everNegativeNps) { s.everNegativeNps = true; fire(s, 'npsZero'); }

  // ---------------- money ----------------
  const notifF = 1 + 0.15 * (lever(s, 'notif') - 1);
  const subs = s.paid * lever(s, 'price');
  const ads = s.flags.includes('ads') ? U2 * lever(s, 'adLoad') * C.AD_RATE * s.eng * s.adMult * notifF * (1 + 0.03 * Math.sqrt(s.team.ads * prod)) : 0;
  const advertisers = s.flags.includes('biz') ? U2 / C.ADVERTISER_PER_USERS * (1 + 0.05 * Math.sqrt(s.team.sales * prod)) : 0;
  const biz = advertisers * C.ADVERTISER_SPEND * Math.pow(1 / lever(s, 'reach'), 0.5);
  const sellers = s.flags.includes('market') ? U2 * C.GMV_PER_USER * lever(s, 'sellerFee') : 0;
  const data = s.flags.includes('data') ? U2 * C.DATA_RATE * lever(s, 'data') : 0;
  const decay = s.act4 ? Math.pow(C.DIVEST_REVENUE, s.act4.sold.filter(x => x !== 'feed').length) : 1;
  s.revParts = { subs: subs * decay, ads: ads * decay, biz: biz * decay, sellers: sellers * decay, data: data * decay };
  s.revenue = s.act === 5 ? subs : (subs + ads + biz + sellers + data) * decay;
  const perks = s.perks.length ? s.perks.reduce((a, id) => a + (id === 'lunches' ? 800 : id === 'gym' ? 300 : 0), 0) : 0;
  const fees = s.act4 ? s.act4.ev * C.MGMT_FEE / 12 : 0;
  s.costs = staff(s) * (salary(s) + perks) + U2 * (s.act === 1 ? C.SERVER_ACT1 : C.SERVER_LATER) + s.debt * s.rate / 12 + fees;
  s.cash += (s.revenue - s.costs) / C.MONTH * dt;
  s.founder.netWorth += s.founder.salary / 12 / C.MONTH * dt;
  s.quarterRev += s.revenue / C.MONTH * dt;
  if (s.revenue > s.costs && s.act >= 2 && !('breakEven' in s.beats)) fire(s, 'breakEven');

  if (s.t >= s.nextHistoryAt) {
    s.nextHistoryAt += C.MONTH;
    s.history.rev.push(s.revenue); s.history.cost.push(s.costs); s.history.labels.push(inGameDate(s.t).label);
    if (s.history.rev.length > 24) { s.history.rev.shift(); s.history.cost.shift(); s.history.labels.shift(); }
  }

  // ---------------- layoffs when the money runs out ----------------
  if (s.cash < 0 && s.act <= 3 && staff(s) > 0 && s.t - s.lastLayoffAt >= C.LAYOFF_INTERVAL) {
    s.lastLayoffAt = s.t;
    const n = layOff(s, Math.max(1, Math.round(staff(s) * 0.02)));
    if (n > 0) fire(s, 'layoff', { count: n.toLocaleString('en-US') });
  }

  // ---------------- funding rounds ----------------
  if (s.rounds < C.ROUNDS.length && s.roundOffered < s.rounds && s.act <= 2) {
    const r = C.ROUNDS[s.rounds];
    const need = r.users * (s.founder.life.includes('vineyard') ? 0.8 : 1);
    if (U2 >= need && s.lastGrowthPerMin > 0.005) {
      s.roundOffered = s.rounds;
      openModal(s, { kind: 'termSheet', round: s.rounds, showAmend: false, amendment: null });
    }
  }
  if (s.act === 1 && s.rounds >= 1 && !s.bridged && burn(s) > 0 && s.cash < burn(s) * 2) {
    s.bridged = true;
    openModal(s, { kind: 'bridge', amount: Math.max(500e3, burn(s) * 4) });
  }

  // ---------------- rivals ----------------
  if (s.act === 5 && s.rival.share > 0.05) s.rival.share = Math.max(0.05, s.rival.share - 0.0001 * dt); // members drift home
  else if (s.rival.active && !s.rival.acquired) {
    s.rival.share = Math.min(C.RIVAL_MAX_SHARE, s.rival.share + C.RIVAL_GROWTH * dt * Math.max(0.2, 1 - s.team.product / 150));
  }
  if (s.act === 3 && !s.porch.acquired) {
    if (s.nps < C.PORCH_NPS && !s.porch.active) { s.porch.active = true; fire(s, 'porch'); markTab(s, 'market'); pushNews(s, 'Porch, a new app from former Kindly users, is growing fast'); }
    if (s.porch.active) s.porch.share = Math.min(C.PORCH_MAX, s.porch.share + C.PORCH_GROWTH * dt);
  }

  // ---------------- morale ----------------
  const perkMorale = (s.perks.includes('lunches') ? 12 : 0) + (s.perks.includes('gym') ? 5 : 0);
  const moraleTarget = Math.min(100, C.MORALE_BASE + perkMorale) - (s.act === 3 ? 15 : 0) - (s.assistant ? 10 : 0) - (s.act === 4 ? 50 : 0) + (s.act === 5 ? 15 : 0);
  s.morale += (moraleTarget - s.morale) * dt / 120;
  s.retreatBoost *= Math.exp(-dt / C.RETREAT_FADE);
  const st = staff(s);
  if (st > s.peakStaff) s.peakStaff = st;

  // ---------------- A/B tests ----------------
  if (!s.test && s.t >= s.nextTestAt && s.act <= 3) {
    const next = TESTS.find(x => !s.testsSeen.includes(x.id) && condOk(s, x));
    if (next) {
      s.test = { id: next.id, arrived: s.t };
      s.testsSeen.push(next.id);
      fire(s, 'firstTest');
      if (s.act >= 2) markTab(s, 'lab');
    } else s.nextTestAt = s.t + C.TEST_EVERY;
  }

  // ---------------- events ----------------
  if (s.rounds >= 2 && s.act <= 3 && s.t >= s.nextEventAt) {
    s.nextEventAt = s.t + C.EVENT_EVERY * between(s, 0.85, 1.15);
    const pool = EVENTS.filter(e => !s.eventsSeen.includes(e.id) && condOk(s, e));
    const trustSkip = s.team.trust / (s.team.trust + 30);
    const choices = pool.filter(e => !e.bad || rand(s) >= trustSkip);
    if (choices.length) {
      const e = pick(s, choices);
      s.eventsSeen.push(e.id);
      openModal(s, { kind: 'event', eventId: e.id });
    }
  }
  for (const p of [...s.pending]) {
    if (s.t < p.at) continue;
    s.pending = s.pending.filter(x => x !== p);
    const ev = EVENTS.find(e => e.id === p.eventId);
    const d = ev?.options[p.option]?.delayed;
    if (d && rand(s) < p.prob) {
      applyEffects(s, d.effects, ev?.bad ? s.team.trust / (s.team.trust + 30) : 0);
      pushNews(s, d.headline);
      if (d.post) pushRawPost(s, pick(s, ['jules.b', 'priya.r', 'sam_in_ohio']), d.post);
    }
  }

  // ---------------- board ----------------
  if (s.board !== null && (s.act === 2 || s.act === 3)) {
    if (s.t - s.lastQuarter >= C.QUARTER) {
      const qRev = s.quarterRev / 3;
      s.lastQuarter = s.t; s.quarterRev = 0;
      if (qRev < s.boardQuota) fire(s, 'targetMissed');
      s.boardQuota = Math.max(s.boardQuota, qRev) * (s.act === 3 ? C.BOARD_GROWTH_ACT3 : C.BOARD_GROWTH_ACT2);
      fire(s, 'quarterTarget', { target: '$' + shortMoney(s.boardQuota) });
    }
    const ratio = Math.max(s.revenue / Math.max(1, s.boardQuota), 1e-3);
    const tgt = Math.max(0, Math.min(100, 50 + 40 * Math.tanh(Math.log(ratio))));
    const ease = C.BOARD_EASE_SECONDS * (tgt < s.board && s.founder.life.includes('coach') ? 1.25 : 1);
    s.board += (tgt - s.board) * dt / ease;
    boardInterventions(s);
  }

  // ---------------- acts ----------------
  if (s.act === 2) {
    if (U2 > C.ACT3_MIN_USERS && s.lastGrowthPerMin < C.ACT3_GROWTH_BELOW) s.act3Flat ??= s.t;
    else s.act3Flat = null;
    if ((s.act3Flat !== null && s.t - s.act3Flat > C.ACT3_SUSTAIN) || s.t - s.act2Start > C.ACT2_MAX_SECONDS) {
      s.act = 3; s.act3Start = s.t;
      fire(s, 'act3');
      markTab(s, 'home');
    }
  }
  if (s.act === 3) act3Script(s);
  if (s.act === 4) act4Script(s);

  // ---------------- unlocks ----------------
  if (U2 >= 10 && !('feed' in s.beats)) { fire(s, 'feed'); s.nextPostAt = s.t + 2; }
  if ((U2 >= 30 || s.t > 90) && !('inbox' in s.beats)) fire(s, 'inbox');
  if (U2 >= 10000 && !('ticker' in s.beats)) { fire(s, 'ticker'); s.nextNewsAt = s.t + C.NEWS_EVERY; }
  if (U2 >= 15000 && !('npsGauge' in s.beats)) fire(s, 'npsGauge');

  tickNarrative(s);
}

// Pick an outage and build its puzzle: open slots, the right blocks, and decoys that fit nowhere.
function newOutage(s: State, autoAt: number): NonNullable<State['outage']> {
  const idx = Math.floor(rand(s) * OUTAGES.length);
  const options = PUZZLES.map((p, i) => ({ p, i })).filter(x => x.p.outage === idx);
  const { p, i } = options.length ? pick(s, options) : { p: PUZZLES[0], i: 0 };
  const active = s.act === 1 && s.t < 20 * 60 ? 2 : 3;
  const used = new Set(p.slots.slice(0, active).map(x => x.shape));
  const free = SHAPES.filter(x => !used.has(x));
  const decoyLabels = [...p.decoys.slice(0, active === 2 ? 1 : 2)];
  if (s.act >= 2) { decoyLabels.push(pick(s, LATE_DECOYS)); if (s.act >= 3) decoyLabels.push(pick(s, LATE_DECOYS.filter(d => !decoyLabels.includes(d)))); }
  const tray = [
    ...p.slots.slice(0, active).map(x => ({ label: x.answer, shape: x.shape as string, used: false })),
    ...decoyLabels.map((label, k) => ({ label, shape: free[k % free.length] as string, used: false })),
  ];
  for (let k = tray.length - 1; k > 0; k--) { const j = Math.floor(rand(s) * (k + 1)); [tray[k], tray[j]] = [tray[j], tray[k]]; }
  return { text: OUTAGES[idx], clicksLeft: active, autoAt, since: s.t, puzzle: i, active, placed: p.slots.map((_, k) => k >= active), tray };
}

export function resolveOutage(s: State): void {
  s.outage = null;
  fire(s, 'outageFixed');
  s.nextOutageAt = s.t + C.OUTAGE_MEAN_GAP * (1 + s.team.product / 10) * between(s, 0.6, 1.4);
}

function shortMoney(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
  return n.toFixed(0);
}

function boardInterventions(s: State): void {
  if (s.board === null) return;
  if (s.board >= C.INTERVENTION_THRESHOLD || (s.act === 2 && s.t - s.act2Start < C.BOARD_GRACE)) { s.lowBoardSince = null; return; }
  s.lowBoardSince ??= s.t;
  if (s.t - s.lowBoardSince < C.INTERVENTION_AFTER || s.t - s.lastIntervention < C.INTERVENTION_COOLDOWN) return;
  s.lastIntervention = s.t;
  const u = UPGRADES.find(x => x.dark && x.act <= s.act && !s.upgrades.includes(x.id)
    && (!x.needUsers || users(s) >= x.needUsers) && (!x.needFlag || s.flags.includes(x.needFlag))
    && (!x.act3Min || (s.act === 3 && s.t - s.act3Start >= x.act3Min * 60)));
  const lv = LEVERS.find(l => leverUnlocked(s, l.id) && l.id !== 'sellerFee' && s.levers[l.id] < l.steps.length - 1 && l.id !== 'price')
    ?? LEVERS.find(l => leverUnlocked(s, l.id) && s.levers[l.id] < l.steps.length - 1);
  const item = u ? u.name : lv ? `${lv.name} raised` : null;
  if (!item) return;
  if (founderVotes(s) > 0.5) {
    s.failedProposals++;
    fire(s, 'interventionFailed', { item });
    return;
  }
  s.interventions++;
  if (u) {
    s.upgrades.push(u.id); s.boardApproved.push(u.id);
    applyEffects(s, u.effects);
    fire(s, u.id);
    if (u.flag && !s.flags.includes(u.flag)) s.flags.push(u.flag);
  } else if (lv) {
    s.levers[lv.id]++;
    if (!s.boardSet.includes(lv.id)) s.boardSet.push(lv.id);
  }
  s.board = Math.min(100, s.board + 10);
  fire(s, 'intervention', { item });
}

function act3Script(s: State): void {
  const e = s.t - s.act3Start;
  const control = hasControl(s);
  if (e >= C.NPS_RETIRE_AT && !('npsRetired' in s.beats) && !('npsRetireFailed' in s.beats)) {
    if (control) { s.failedProposals++; fire(s, 'npsRetireFailed'); fire(s, 'interventionFailed', { item: 'stop reporting NPS' }); }
    else { s.npsRetired = true; fire(s, 'npsRetired'); }
  }
  if (e >= C.DIRECTIVE_AT && !s.directive && !('directiveFailed' in s.beats)) {
    if (control) { s.failedProposals++; fire(s, 'directiveFailed'); fire(s, 'interventionFailed', { item: 'move Support and Trust & Safety to Ads' }); }
    else { s.directive = { issuedAt: s.t, deadline: s.t + C.DIRECTIVE_DEADLINE, done: false }; fire(s, 'directive'); markTab(s, 'team'); }
  }
  if (s.directive && !s.directive.done) {
    if (s.team.support === 0 && s.team.trust === 0) {
      s.directive.done = true; s.assistant = true; fire(s, 'assistant');
    } else if (s.t >= s.directive.deadline) {
      s.team.ads += s.team.support + s.team.trust; s.team.support = 0; s.team.trust = 0;
      s.directive.done = true; s.assistant = true;
      if (s.board !== null) s.board = Math.max(0, s.board - 15);
      fire(s, 'directiveMissed'); fire(s, 'assistant');
    }
  }
  if (e >= C.EFFICIENCY_AT && !control && !('efficiency' in s.beats)) {
    const n = layOff(s, Math.round(staff(s) * C.EFFICIENCY_CUT), ['support', 'trust']);
    s.perks = []; s.hiringFrozen = true;
    fire(s, 'efficiency', { count: n.toLocaleString('en-US') });
  }
  if (e >= C.BUYOUT_AT && !('buyoutOffer' in s.beats)) {
    const ev = Math.max(s.revenue * 12 * C.BUYOUT_MULTIPLE, 100e6);
    fire(s, 'buyoutOffer');
    openModal(s, { kind: 'buyout', stage: 'offer', ev, payout: s.cap.founder * ev, refusals: 0 });
  }
}

export function startAct4(s: State, removed: boolean, ev: number): void {
  const payout = s.cap.founder * ev;
  s.act = 4;
  s.act4 = {
    start: s.t, ev, payout, earnoutTotal: payout * (1 - C.PAYOUT_UPFRONT), earnoutCollected: 0, sold: [], removed,
    sunset: false, recap1: false, recap2: false, refinanced: false, lastDivest: s.t, lastHike: s.t,
  };
  s.debt = ev * C.BUYOUT_DEBT;
  s.founder.netWorth += payout * C.PAYOUT_UPFRONT;
  s.test = null;
  s.hiringFrozen = true;
  s.boardSet = [];
  if (removed) fire(s, 'removed');
  fire(s, 'act4');
  markTab(s, 'life');
}

export function earnoutAvailable(s: State): number {
  if (!s.act4) return 0;
  const e = s.t - s.act4.start;
  return Math.max(0, s.act4.earnoutTotal * Math.min(1, e / C.ACT4_LENGTH) - s.act4.earnoutCollected);
}

function act4Script(s: State): void {
  const a = s.act4!;
  const e = s.t - a.start;
  if (!a.recap1 && e >= C.RECAP1_AT) {
    a.recap1 = true;
    const amt = Math.max(0, s.cash); s.cash -= amt;
    fire(s, 'recap1', { amount: '$' + shortMoney(amt) });
  }
  if (s.t - a.lastDivest >= C.DIVEST_EVERY) {
    a.lastDivest = s.t;
    const next = DIVEST_ORDER.find(d => !a.sold.includes(d.id));
    if (next) {
      a.sold.push(next.id);
      const n = layOff(s, Math.ceil(staff(s) * C.DIVEST_LAYOFF));
      if (next.id === 'team' || next.id === 'inbox') { /* the panel goes; people already counted */ }
      fire(s, 'divest', { item: next.name, count: n });
    }
  }
  if (s.t - a.lastHike >= C.PRICE_HIKE_EVERY) {
    a.lastHike = s.t;
    if (s.levers.price < LEVERS[0].steps.length - 1) s.levers.price++;
    pushNews(s, 'Kindly raises prices again');
  }
  if (!a.sunset && e >= C.SUNSET_AT) { a.sunset = true; a.sold.push('feed'); fire(s, 'sunset'); }
  if (!a.refinanced && e >= C.REFI_AT) { a.refinanced = true; s.rate = C.REFI_RATE; fire(s, 'refi'); }
  if (!a.recap2 && e >= C.RECAP2_AT) {
    a.recap2 = true;
    const add = a.ev * 0.3; s.debt += add;
    fire(s, 'recap2', { amount: '$' + shortMoney(add) });
  }
  if (e >= C.ACT4_LENGTH) finishMain(s);
}

function finishMain(s: State): void {
  const a = s.act4!;
  s.founder.netWorth += earnoutAvailable(s);
  a.earnoutCollected = a.earnoutTotal;
  fire(s, 'chapter11');
  s.ending = a.removed ? 'removed' : 'main';
  s.final = { netWorth: s.founder.netWorth, peakUsers: s.peakUsers, peakStaff: s.peakStaff, laidOff: s.laidOff, time: s.t };
}

export function finishKept(s: State): void {
  s.ending = 'kept';
  s.final = { netWorth: s.founder.netWorth, peakUsers: s.peakUsers, peakStaff: s.peakStaff, laidOff: s.laidOff, time: s.t };
  fire(s, 'kept');
}

export function startTrust(s: State): void {
  s.act = 5;
  s.ending = 'trust';
  s.board = null;
  s.test = null;
  s.npsRetired = false;
  s.boardSet = [];
  s.hiringFrozen = false;
  s.assistant = false;
  for (const l of LEVERS) if (l.id !== 'price') s.levers[l.id] = l.start;
  s.flags = s.flags.filter(f => f !== 'ads' && f !== 'data');
  s.flags.push('trust');
  s.news = [];
  fire(s, 'trust');
}

