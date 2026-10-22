import { EVENTS } from '../content/events';
import { LIFESTYLE, PERKS } from '../content/founder';
import { TESTS } from '../content/tests';
import { UPGRADE_BY_ID } from '../content/upgrades';
import { PUZZLES } from '../content/puzzles';
import type { UpgradeDef } from '../content/types';
import * as C from './constants';
import { closeRound, repurchase, sellSecondary, bridgeNote } from './captable';
import {
  clickValue, excessCash, hasControl, hireCost, rivalPrice, rivalUsers, staff, teamUnlocked, users, valuation,
} from './derive';
import { applyEffects } from './effects';
import { LEVER_BY_ID, leverUnlocked } from './levers';
import { fire, markTab } from './narrative';
import { closeModal, earnoutAvailable, finishKept, openModal, resolveOutage, startAct4, startTrust } from './tick';
import type { Action, State } from './types';

export type Result = { ok: true } | { ok: false; reason: string };
const OK: Result = { ok: true };
const no = (reason: string): Result => ({ ok: false, reason });

export function upgradeVisible(s: State, u: UpgradeDef): boolean {
  if (s.act >= 4) return false;
  if (s.act === 5) return u.act === 1;
  if (u.act > s.act) return false;
  if (u.needUsers && users(s) < u.needUsers * 0.5) return false;
  if (u.needFlag && !s.flags.includes(u.needFlag)) return false;
  if (u.act3Min && (s.act !== 3 || s.t - s.act3Start < u.act3Min * 60)) return false;
  return true;
}

export function upgradeReady(s: State, u: UpgradeDef): boolean {
  return upgradeVisible(s, u) && !s.upgrades.includes(u.id) && (!u.needUsers || users(s) >= u.needUsers);
}

export const MAIN_BUTTON_ENABLED = (s: State) => !s.modal && !s.final && (s.act !== 4 || false);

export function blockFits(s: State, block: number, slot: number): boolean {
  const o = s.outage;
  if (!o) return false;
  const b = o.tray[block];
  const want = PUZZLES[o.puzzle].slots[slot];
  return !!b && !!want && !b.used && !o.placed[slot] && slot < o.active && b.shape === want.shape && b.label === want.answer;
}

export function nextLifestyle(s: State) {
  return LIFESTYLE.find(l => !s.founder.life.includes(l.id)) ?? null;
}

export function retreatReady(s: State): boolean {
  return (s.act === 2 || s.act === 3) && !s.hiringFrozen && s.t - s.lastRetreat >= C.YEAR;
}

export function dividendReady(s: State): boolean {
  return s.act === 3 && s.t - s.lastDividend >= C.DIVIDEND_COOLDOWN && excessCash(s) > 0;
}

export function repurchaseCost(s: State): number {
  return 0.01 * valuation(s);
}

export function repurchaseReady(s: State, investorId: string): boolean {
  if (s.rounds < 4 || s.act < 2 || s.act > 3) return false;
  const inv = s.cap.investors.find(i => i.id === investorId);
  if (!inv || inv.pct < 0.001 || !['pebble', 'northlight'].includes(investorId)) return false;
  return s.cash >= repurchaseCost(s) * Math.min(1, inv.pct / 0.01);
}

export function competeCost(s: State): number {
  return Math.max(200e3, 0.25 * Math.max(s.revenue, s.costs));
}

// Can this action be taken right now? Mirrors exactly what the UI shows as enabled.
export function check(s: State, a: Action): Result {
  if (s.final && s.act !== 5) return no('the game is over');
  const m = s.modal;
  const modalActions = ['acceptRound', 'toggleAmendments', 'chooseAmendment', 'secondary', 'bridge', 'chooseEvent', 'buyout', 'continue'];
  if (m && !modalActions.includes(a.type) && a.type !== 'viewTab') return no('a dialog is open');
  switch (a.type) {
    case 'click':
      if (s.act === 4) return no('asset sold');
      return OK;
    case 'answerTicket':
      if (!('inbox' in s.beats) || s.assistant || s.act === 4) return no('inbox unavailable');
      return s.tickets >= 1 ? OK : no('no tickets');
    case 'fixBug':
      if (!s.outage) return no('nothing is broken');
      if (a.block === undefined && a.slot === undefined) return OK;   // brute force (bots, text client)
      return blockFits(s, a.block ?? -1, a.slot ?? -1) ? OK : no('that block doesn\'t fit there');
    case 'hire':
      if (s.rounds < 1 || s.act === 4 || s.hiringFrozen) return no('hiring unavailable');
      if (![1, 10, 100].includes(a.n)) return no('bad amount');
      if (a.n > 1 && s.act === 1 && a.n === 100) return no('too many');
      return s.cash >= hireCost(s, a.n) ? OK : no('not enough cash');
    case 'assign': {
      if (s.act === 4) return no('no');
      if (!teamUnlocked(s, a.team)) return no('team locked');
      if (![1, -1, 10, -10, 100, -100].includes(a.delta)) return no('bad amount');
      if (a.delta > 0) {
        if (s.assistant && (a.team === 'support' || a.team === 'trust')) return no('handled by Kindly Assistant');
        return s.unassigned >= a.delta ? OK : no('nobody unassigned');
      }
      return s.team[a.team] >= -a.delta ? OK : no('not enough people');
    }
    case 'buyUpgrade': {
      const u = UPGRADE_BY_ID[a.id];
      if (!u || !upgradeReady(s, u)) return no('unavailable');
      return s.cash >= u.cost ? OK : no('not enough cash');
    }
    case 'acceptRound':
      return m?.kind === 'termSheet' ? OK : no('no term sheet');
    case 'toggleAmendments':
      return m?.kind === 'termSheet' && m.round === 0 ? OK : no('no amendments');
    case 'chooseAmendment':
      return m?.kind === 'termSheet' && m.round === 0 && m.showAmend ? OK : no('no amendments');
    case 'secondary':
      return m?.kind === 'secondary' ? OK : no('no offer');
    case 'bridge':
      return m?.kind === 'bridge' ? OK : no('no offer');
    case 'setLever': {
      if (!leverUnlocked(s, a.lever)) return no('locked');
      if (s.boardSet.includes(a.lever)) return no('set by the board');
      const d = LEVER_BY_ID[a.lever];
      if (a.step < 0 || a.step >= d.steps.length || a.step === s.levers[a.lever]) return no('bad step');
      return OK;
    }
    case 'shipTest':
      return s.test ? OK : no('no test');
    case 'chooseEvent': {
      if (m?.kind !== 'event') return no('no event');
      const ev = EVENTS.find(e => e.id === m.eventId);
      return ev && a.option >= 0 && a.option < ev.options.length ? OK : no('bad option');
    }
    case 'acquire':
      if (a.rival === 'huddle') {
        if (s.rounds < 4 || !s.rival.active || s.rival.acquired || s.act > 3) return no('unavailable');
        return s.cash >= rivalPrice(s, 'huddle') ? OK : no('not enough cash');
      }
      if (!s.porch.active || s.porch.acquired || s.porch.share < 0.01 || s.act !== 3) return no('unavailable');
      return s.cash >= rivalPrice(s, 'porch') ? OK : no('not enough cash');
    case 'competeFeature':
      if (s.rounds < 2 || !s.rival.active || s.rival.acquired || s.act > 3) return no('unavailable');
      if (s.rival.share < 0.01) return no('Huddle is too small to matter');
      if ((s.beats['lastCompete'] ?? -1e9) > s.t - 60) return no('the team is still shipping');
      return s.cash >= competeCost(s) ? OK : no('not enough cash');
    case 'buyLifestyle': {
      const next = nextLifestyle(s);
      if (s.rounds < 2 || !next || next.id !== a.id) return no('unavailable');
      return s.founder.netWorth >= next.cost ? OK : no('not enough money');
    }
    case 'buyPerk': {
      const p = PERKS.find(x => x.id === a.id);
      if (!p || s.perks.includes(p.id) || s.act < 2 || s.act > 3 || s.hiringFrozen) return no('unavailable');
      return OK;
    }
    case 'retreat':
      if (!retreatReady(s)) return no('unavailable');
      return s.cash >= staff(s) * C.RETREAT_COST_PER_HEAD ? OK : no('not enough cash');
    case 'dividend':
      return dividendReady(s) ? OK : no('unavailable');
    case 'repurchase':
      return repurchaseReady(s, a.investorId) ? OK : no('unavailable');
    case 'buyout': {
      if (m?.kind !== 'buyout' || m.stage !== 'offer') return no('no offer');
      if (a.choice === 'trust' && !(hasControl(s) && s.nps > 0)) return no('unavailable');
      return OK;
    }
    case 'continue':
      return m?.kind === 'buyout' && (m.stage === 'vote' || m.stage === 'kept') ? OK : no('nothing to continue');
    case 'collectEarnout':
      return s.act === 4 && earnoutAvailable(s) >= 1 ? OK : no('nothing to collect');
    case 'viewTab':
      return OK;
  }
}

export function apply(s: State, a: Action): Result {
  const r = check(s, a);
  if (!r.ok) return r;
  switch (a.type) {
    case 'click': {
      s.clicks++;
      if (s.act === 3) {
        const n = Math.min(s.free, Math.max(1, 0.25 * s.free * 0.0001 * 10));
        s.free -= n; s.paid += n;
      } else {
        s.free += clickValue(s);
      }
      break;
    }
    case 'answerTicket':
      s.tickets = Math.max(0, s.tickets - 1); s.ticketsAnswered++; s.handBurst++;
      break;
    case 'fixBug':
      const o = s.outage!;
      let slot = a.slot ?? o.placed.indexOf(false);
      let block = a.block ?? o.tray.findIndex(b => !b.used && b.label === PUZZLES[o.puzzle].slots[slot].answer);
      if (slot < 0) slot = 0;
      o.placed[slot] = true;
      if (block >= 0) o.tray[block].used = true;
      o.clicksLeft = o.placed.filter(x => !x).length;
      if (o.clicksLeft <= 0) { resolveOutage(s); fire(s, 'bugFixed'); }
      break;
    case 'hire':
      s.cash -= hireCost(s, a.n); s.unassigned += a.n;
      break;
    case 'assign':
      if (a.delta > 0) { s.unassigned -= a.delta; s.team[a.team] += a.delta; }
      else { s.team[a.team] += a.delta; s.unassigned -= a.delta; }
      break;
    case 'buyUpgrade': {
      const u = UPGRADE_BY_ID[a.id];
      s.cash -= u.cost; s.upgrades.push(u.id);
      applyEffects(s, u.effects);
      if (u.flag && !s.flags.includes(u.flag)) {
        s.flags.push(u.flag);
        if (u.flag === 'paid' || u.flag === 'ads') markTab(s, 'lab');
        if (u.flag === 'biz' || u.flag === 'market' || u.flag === 'data') { markTab(s, 'lab'); markTab(s, 'market'); }
      }
      fire(s, u.id);
      if (u.id === 'kindlyplus') fire(s, 'kindlyplus');
      break;
    }
    case 'toggleAmendments':
      if (s.modal?.kind === 'termSheet') s.modal.showAmend = !s.modal.showAmend;
      break;
    case 'chooseAmendment':
      if (s.modal?.kind === 'termSheet') s.modal.amendment = a.id;
      break;
    case 'acceptRound': {
      const m = s.modal as Extract<State['modal'], { kind: 'termSheet' }>;
      const cash = closeRound(s.cap, m.round, m.round === 0 ? m.amendment : null);
      s.cash += cash;
      s.rounds++;
      s.bridged = false;
      s.founder.salary = C.ROUNDS[m.round].salary;
      closeModal(s);
      const beat = ['seed', 'seriesA', 'seriesB', 'seriesC'][m.round];
      fire(s, beat);
      if (m.round === 0) { markTab(s, 'team'); if (m.amendment) fire(s, 'amend_' + m.amendment); }
      if (m.round === 1) {
        s.rival.active = true; s.rival.share = C.RIVAL_START_SHARE;
        s.nextEventAt = s.t + 120;
        markTab(s, 'market'); markTab(s, 'life');
      }
      if (m.round === 2) {
        s.act = 2; s.act2Start = s.t;
        s.board = C.BOARD_START; s.boardQuota = C.BOARD_START_QUOTA; s.lastQuarter = s.t; s.quarterRev = 0;
        fire(s, 'act2');
        markTab(s, 'board'); markTab(s, 'lab'); markTab(s, 'home');
      }
      if (m.round === 3) markTab(s, 'market');
      if (m.round >= 1) openModal(s, { kind: 'secondary', round: m.round, amount: C.SECONDARY_PCT * C.ROUNDS[m.round].post });
      break;
    }
    case 'secondary': {
      const m = s.modal as Extract<State['modal'], { kind: 'secondary' }>;
      if (a.accept) {
        sellSecondary(s.cap); s.founder.netWorth += m.amount; s.founder.secondaries++;
        fire(s, 'secondarySold');
      } else s.founder.declined++;
      closeModal(s);
      markTab(s, 'life');
      break;
    }
    case 'bridge': {
      const m = s.modal as Extract<State['modal'], { kind: 'bridge' }>;
      if (a.accept) { bridgeNote(s.cap); s.cash += m.amount; fire(s, 'bridge'); }
      closeModal(s);
      break;
    }
    case 'setLever':
      s.levers[a.lever] = a.step;
      fire(s, 'lever_' + a.lever);
      fire(s, `lever_${a.lever}_${a.step}`);
      break;
    case 'shipTest': {
      const def = TESTS.find(x => x.id === s.test!.id)!;
      if (a.variant === 'B') {
        fire(s, 'test_' + def.id);
        applyEffects(s, def.effectsB);
        if (def.dark) s.darkTests++;
      } else if (a.variant === 'A' && def.effectsA) applyEffects(s, def.effectsA);
      s.testHistory.unshift({ id: def.id, variant: a.variant, t: s.t });
      s.test = null;
      s.nextTestAt = s.t + (s.act >= 2 ? C.TEST_EVERY_LATER : C.TEST_EVERY);
      break;
    }
    case 'chooseEvent': {
      const m = s.modal as Extract<State['modal'], { kind: 'event' }>;
      const ev = EVENTS.find(e => e.id === m.eventId)!;
      const opt = ev.options[a.option];
      applyEffects(s, opt.effects, ev.bad ? s.team.trust / (s.team.trust + 30) : 0);
      if (opt.delayed) s.pending.push({ at: s.t + opt.delayed.in, prob: opt.delayed.prob, eventId: ev.id, option: a.option });
      fire(s, ev.id + ':' + a.option);
      closeModal(s);
      break;
    }
    case 'acquire': {
      if (a.rival === 'huddle') {
        const price = rivalPrice(s, 'huddle');
        const moved = rivalUsers(s) * 0.6;
        s.cash -= price; s.rival.acquired = true; s.free += moved; s.retPts += 0.5; s.rival.share = 0;
        fire(s, 'huddleAcquired', { amount: '$' + Math.round(price / 1e6) + 'M' });
      } else {
        const price = rivalPrice(s, 'porch');
        s.cash -= price; s.porch.acquired = true; s.free += s.porch.share * C.TAM * 0.5; s.retPts += 0.5; s.porch.share = 0;
        fire(s, 'porchAcquired');
      }
      break;
    }
    case 'competeFeature':
      s.cash -= competeCost(s);
      s.rival.share = Math.max(0, s.rival.share - 0.01);
      s.beats['lastCompete'] = s.t;
      break;
    case 'buyLifestyle': {
      const l = LIFESTYLE.find(x => x.id === a.id)!;
      s.founder.netWorth -= l.cost; s.founder.life.push(l.id);
      if (l.id === 'yacht') s.speed = 1.25;
      fire(s, 'life_' + l.id);
      break;
    }
    case 'buyPerk':
      s.perks.push(a.id);
      fire(s, 'perk_' + a.id);
      break;
    case 'retreat':
      s.cash -= staff(s) * C.RETREAT_COST_PER_HEAD; s.retreatBoost = C.RETREAT_BOOST; s.lastRetreat = s.t;
      fire(s, 'retreat');
      break;
    case 'dividend': {
      const d = excessCash(s) * 0.5;
      s.cash -= d; s.lastDividend = s.t;
      if (s.board !== null) s.board = Math.min(100, s.board + C.DIVIDEND_BOARD);
      const toFounder = d * s.cap.founder;
      s.founder.netWorth += toFounder; s.founder.dividends += toFounder;
      fire(s, 'dividend', { amount: '$' + (d >= 1e9 ? (d / 1e9).toFixed(2) + 'B' : Math.round(d / 1e6) + 'M') });
      markTab(s, 'life');
      break;
    }
    case 'repurchase': {
      const inv = s.cap.investors.find(i => i.id === a.investorId)!;
      const x = Math.min(0.01, inv.pct);
      const cost = repurchaseCost(s) * (x / 0.01);
      s.cash -= cost; s.repurchased += cost;
      repurchase(s.cap, a.investorId, x);
      if (!('repurchase' in s.beats)) fire(s, 'repurchase');
      break;
    }
    case 'buyout': {
      const m = s.modal as Extract<State['modal'], { kind: 'buyout' }>;
      if (a.choice === 'accept') { closeModal(s); startAct4(s, false, m.ev); }
      else if (a.choice === 'trust') { closeModal(s); startTrust(s); }
      else if (!hasControl(s)) { m.stage = 'vote'; m.voteResult = 'lost'; }
      else if (m.refusals < 2) {
        m.refusals++; m.ev *= C.OFFER_RAISE; m.payout = s.cap.founder * m.ev;
        fire(s, 'offerRaised');
      } else { m.stage = 'kept'; }
      break;
    }
    case 'continue': {
      const m = s.modal as Extract<State['modal'], { kind: 'buyout' }>;
      closeModal(s);
      if (m.stage === 'vote') startAct4(s, true, m.ev);
      else finishKept(s);
      break;
    }
    case 'collectEarnout': {
      const amt = earnoutAvailable(s);
      s.founder.netWorth += amt; s.act4!.earnoutCollected += amt;
      break;
    }
    case 'viewTab':
      delete s.tabNew[a.tab];
      if (!(('visit_' + a.tab) in s.beats)) s.beats['visit_' + a.tab] = s.t;
      break;
  }
  return OK;
}

