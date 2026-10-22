// GameState → View: exactly what a player can see. No hidden values.
import { EVENTS } from '../content/events';
import { LIFESTYLE, PERKS } from '../content/founder';
import { BAY_LEDGER_ARTICLE, ENDINGS, POPUPS, TICKETS } from '../content/misc';
import { TESTS } from '../content/tests';
import { PUZZLES } from '../content/puzzles';
import { UPGRADES } from '../content/upgrades';
import { check, competeCost, dividendReady, nextLifestyle, repurchaseCost, upgradeReady, upgradeVisible } from '../engine/actions';
import { AMENDMENTS, boardSeats, classBActive } from '../engine/captable';
import * as C from '../engine/constants';
import {
  clickValue, excessCash, founderVotes, hasControl, hireCost, inGameDate, organicGrowth, retention, rivalPrice, rivalUsers,
  runwayMonths, staff, teamUnlocked, ticketRate, users,
} from '../engine/derive';
import { LEVERS, leverUnlocked } from '../engine/levers';
import { fill } from '../engine/narrative';
import { DIVEST_NAMES, earnoutAvailable } from '../engine/tick';
import type { Memo, Post, State, TabId, Team } from '../engine/types';
import { TEAMS } from '../engine/types';

export type Palette = 'blue' | 'red' | 'gray' | 'mono';

export interface View {
  t: number;
  date: string;
  act: number;
  palette: Palette;
  header: { founder: string; title: string; homeName: string };
  tabs: { id: TabId; label: string; dot: boolean; sold: boolean; fresh: boolean }[];
  main: {
    users: number; free: number | null; paid: number | null; perSec: number;
    button: { label: string; enabled: boolean; value: string };
    advertisers: number | null; sellers: number | null;
  };
  inbox: null | { open: number; perMin: number; answerEnabled: boolean; note: string | null; sold: boolean; ticket: string | null };
  outage: null | {
    text: string; clicksLeft: number; autoIn: number | null;
    lines: ({ kind: 'text'; text: string } | { kind: 'slot'; slot: number; shape: string; filled: string | null })[][];
    tray: { block: number; label: string; shape: string; used: boolean }[];
  };
  health: null | {
    sold: boolean;
    nps: null | { value: number | null; retired: boolean };
    board: number | null;
    retention: number | null;
    retentionLabel: string;
  };
  money: null | {
    sold: boolean; cash: number; revenue: number | null; costs: number; profit: number; runway: number | null;
    debt: number | null; interest: number | null; fees: number | null;
    chart: { rev: number[]; cost: number[]; labels: string[] };
  };
  build: null | { sold: boolean; items: { id: string; name: string; desc: string; hint: string; cost: number; state: 'buy' | 'poor' | 'owned' | 'locked'; badge: string | null }[] };
  test: null | { id: string; title: string; a: string; b: string; result: string; dark: boolean; where: 'home' | 'lab' };
  feed: null | { sold: boolean; posts: Post[] };
  ticker: string[] | null;
  team: null | {
    sold: boolean; headcount: number; unassigned: number; payroll: number; frozen: boolean;
    hire: { n: number; cost: number; enabled: boolean }[];
    rows: { team: Team; label: string; count: number; effect: string; locked: boolean; highlight: boolean; inc: number[]; dec: number[] }[];
    morale: number;
    perks: { id: string; name: string; desc: string; perHead: number; morale: number; owned: boolean; enabled: boolean; cancelled: boolean }[];
    retreat: null | { cost: number; enabled: boolean; readyIn: number };
    directive: null | { text: string; secondsLeft: number };
    assistant: boolean;
  };
  market: null | {
    sold: boolean;
    share: { kindly: number; huddle: number; porch: number; other: number };
    huddle: { users: number; acquired: boolean; price: number; canAcquire: boolean; acquireLocked: boolean; canCompete: boolean; competeCost: number } | null;
    porch: { users: number; acquired: boolean; price: number; canAcquire: boolean } | null;
    advertisers: number | null; sellers: number | null;
  };
  life: null | {
    netWorth: number; salary: number; dividends: number;
    items: { id: string; name: string; cost: number; perk: string; owned: boolean; next: boolean; canBuy: boolean }[];
    cap: { rows: { id: string; name: string; pct: number; seat: boolean; repurchase: null | { cost: number; enabled: boolean } }[]; founder: number; control: number; classB: boolean; dualClass: boolean };
    earnout: null | { available: number; enabled: boolean; total: number };
  };
  lab: null | {
    sold: boolean;
    levers: { id: string; name: string; labels: string[]; current: number; locked: boolean; boardSet: boolean; now: string; later: string }[];
    history: { title: string; variant: string; dark: boolean }[];
  };
  boardroom: null | {
    sold: boolean; board: number | null; quota: number; revenue: number; seats: { name: string }[];
    dividend: { enabled: boolean; amount: number; founderShare: number };
    interventions: number;
  };
  memos: Memo[];
  modal: ModalView | null;
  ending: null | EndingView;
  popups: { id: string; title: string; text: string }[];
}

export type ModalView =
  | { kind: 'termSheet'; round: string; amount: number; investor: string; stake: number; seat: boolean; controlBefore: number; controlAfter: number; canAmend: boolean; showAmend: boolean; amendments: { id: string; label: string; detail: string; chosen: boolean }[] }
  | { kind: 'secondary'; amount: number; pct: number; controlBefore: number; controlAfter: number; unlocks: { name: string; perk: string }[] }
  | { kind: 'bridge'; amount: number }
  | { kind: 'event'; title: string; text: string; options: { label: string; detail: string }[] }
  | { kind: 'buyout'; stage: 'offer' | 'vote' | 'kept'; ev: number; debt: number; payout: number; control: number; trust: boolean; refusals: number; voteText: string | null };

export interface EndingView {
  id: string;
  title: string;
  lines: string[];
  netWorth: number;
  owned: string[];
  articles: { outlet: string; section: string; headline: string; deck: string; byline: string | null; disclosure: string | null }[];
  dateline: string;
  lastPost: { handle: string; text: string };
  stats: { peakUsers: number; peakStaff: number; laidOff: number; time: number } | null;
  continues: boolean;
}

const TEAM_LABEL: Record<Team, string> = { product: 'Product', growth: 'Growth', support: 'Support', trust: 'Trust & Safety', sales: 'Sales', ads: 'Ads' };

function palette(s: State): Palette {
  if (s.act === 5) return 'blue';
  return (['blue', 'blue', 'red', 'gray', 'mono'] as Palette[])[s.act];
}

function homeName(s: State): string {
  if (s.act === 5) return 'A Small Office';
  if (s.act === 4) return 'An Empty Floor';
  if (s.act >= 2) return 'A Glass Campus';
  return s.rounds >= 1 ? 'An Open-Plan Office' : 'A Garage';
}

const sold = (s: State, id: string) => !!s.act4?.sold.includes(id);

export function buildView(s: State): View {
  const U = users(s);
  const organic = organicGrowth(s);
  const trust = s.act === 5;

  // ---------- tabs ----------
  const tabs: View['tabs'] = [{ id: 'home', label: homeName(s), dot: !!s.tabNew.home, sold: false, fresh: false }];
  if (s.rounds >= 1) tabs.push({ id: 'team', label: 'The Team', dot: !!s.tabNew.team, sold: sold(s, 'team'), fresh: false });
  if (s.rounds >= 2) tabs.push({ id: 'market', label: 'The Market', dot: !!s.tabNew.market, sold: sold(s, 'market'), fresh: false });
  if (s.act >= 2 && !trust) tabs.push({ id: 'lab', label: 'Growth Lab', dot: !!s.tabNew.lab, sold: sold(s, 'lab'), fresh: false });
  if (s.act >= 2 && !trust) tabs.push({ id: 'board', label: 'The Board Room', dot: !!s.tabNew.board, sold: sold(s, 'board'), fresh: false });
  if (s.rounds >= 2) tabs.push({ id: 'life', label: 'Your Life', dot: !!s.tabNew.life, sold: false, fresh: false });
  for (const t of tabs) t.fresh = t.id !== 'home' && !t.sold && !(('visit_' + t.id) in s.beats);

  // ---------- main ----------
  const btnLabel = s.act === 5 ? 'Welcome someone' : s.act === 4 ? 'Asset sold' : s.act === 3 ? 'Convert User' : 'Find New User';
  const btnValue = s.act === 3 ? `+${fmtN(Math.max(1, s.free * 0.00025))} paying` : `+${fmtN(clickValue(s))}`;
  const main: View['main'] = {
    users: U,
    free: s.flags.includes('paid') ? s.free : null,
    paid: s.flags.includes('paid') ? s.paid : null,
    perSec: organic - (U * C.CHURN_K * (1 - retention(s)) * Math.pow(1.5 - s.nps / 100, 2)) / 60,
    button: { label: btnLabel, enabled: check(s, { type: 'click' }).ok, value: btnValue },
    advertisers: s.flags.includes('biz') && !trust ? U / C.ADVERTISER_PER_USERS : null,
    sellers: s.flags.includes('market') && !trust ? U * 0.03 : null,
  };

  const inbox: View['inbox'] = 'inbox' in s.beats ? {
    open: Math.floor(s.tickets), perMin: ticketRate(s) * 60,
    answerEnabled: check(s, { type: 'answerTicket' }).ok,
    note: s.assistant ? 'Support moved to Kindly Assistant (AI)' : s.team.support > 0 ? `Support (${s.team.support}) answers ${fmtN(s.team.support * C.SUPPORT_CAPACITY * 60)} / min` : 'Answer them yourself',
    sold: sold(s, 'inbox'),
    ticket: s.tickets >= 1 ? sampleTicket(s) : null,
  } : null;

  const health: View['health'] = 'npsGauge' in s.beats ? {
    sold: sold(s, 'metrics'),
    nps: { value: s.npsRetired ? null : Math.round(s.nps), retired: s.npsRetired },
    board: trust ? null : s.board === null ? null : Math.round(s.board),
    retention: s.act >= 2 ? retention(s) : null,
    retentionLabel: s.act >= 3 && !trust ? 'Our moat (retention)' : 'Retention',
  } : null;

  const money: View['money'] = {
    sold: sold(s, 'money'),
    cash: s.cash,
    revenue: s.act >= 2 || s.revenue > 0 ? s.revenue : null,
    costs: s.costs,
    profit: s.revenue - s.costs,
    runway: runwayMonths(s),
    debt: s.debt > 0 ? s.debt : null,
    interest: s.debt > 0 ? s.debt * s.rate / 12 : null,
    fees: s.act4 ? s.act4.ev * C.MGMT_FEE / 12 : null,
    chart: { rev: [...s.history.rev], cost: [...s.history.cost], labels: [...s.history.labels] },
  };

  const items = UPGRADES.filter(u => upgradeVisible(s, u) || s.upgrades.includes(u.id)).map(u => {
    const owned = s.upgrades.includes(u.id);
    const ready = upgradeReady(s, u);
    const paywalledBy = UPGRADES.find(x => x.paywalls === u.id && s.upgrades.includes(x.id));
    return {
      id: u.id, name: u.name, desc: u.desc, hint: u.hint ?? '', cost: u.cost,
      state: (owned ? 'owned' : !ready ? 'locked' : s.cash >= u.cost ? 'buy' : 'poor') as 'buy' | 'poor' | 'owned' | 'locked',
      badge: s.boardApproved.includes(u.id) ? 'BOARD-APPROVED' : paywalledBy ? 'KINDLY+ ONLY' : u.honest ? 'HONEST' : null,
    };
  });
  const build: View['build'] = s.act <= 3 || trust || s.act === 4 ? { sold: sold(s, 'upgrades'), items: s.act === 4 ? [] : items } : null;

  const testDef = s.test ? TESTS.find(x => x.id === s.test!.id) : null;
  const test: View['test'] = testDef ? { id: testDef.id, title: testDef.title, a: testDef.a, b: testDef.b, result: testDef.result, dark: testDef.dark, where: s.act >= 2 ? 'lab' : 'home' } : null;

  // ---------- team ----------
  const team: View['team'] = s.rounds >= 1 ? {
    sold: sold(s, 'team'),
    headcount: staff(s), unassigned: s.unassigned,
    payroll: staff(s) * (s.act === 1 ? C.SALARY_ACT1 : C.SALARY_LATER),
    frozen: s.hiringFrozen,
    hire: [1, 10, 100].filter(n => !(s.act === 1 && n === 100)).map(n => ({ n, cost: hireCost(s, n), enabled: check(s, { type: 'hire', n }).ok })),
    rows: TEAMS.map(t => ({
      team: t, label: TEAM_LABEL[t], count: s.team[t], effect: teamEffect(s, t), locked: !teamUnlocked(s, t),
      highlight: !!(s.directive && !s.directive.done && (t === 'support' || t === 'trust')),
      inc: [1, 10, 100].filter(d => check(s, { type: 'assign', team: t, delta: d }).ok),
      dec: [1, 10, 100].filter(d => check(s, { type: 'assign', team: t, delta: -d }).ok),
    })),
    morale: Math.round(Math.min(100, s.morale + s.retreatBoost)),
    perks: s.act >= 2 ? PERKS.map(p => ({ id: p.id, name: p.name, desc: p.desc, perHead: p.perHead, morale: p.morale, owned: s.perks.includes(p.id), enabled: check(s, { type: 'buyPerk', id: p.id }).ok, cancelled: s.hiringFrozen && !s.perks.includes(p.id) && 'efficiency' in s.beats })) : [],
    retreat: s.act >= 2 && s.act <= 3 ? { cost: staff(s) * C.RETREAT_COST_PER_HEAD, enabled: check(s, { type: 'retreat' }).ok, readyIn: Math.max(0, C.YEAR - (s.t - s.lastRetreat)) } : null,
    directive: s.directive && !s.directive.done ? { text: 'Reassign Support and Trust & Safety to Ads', secondsLeft: Math.max(0, s.directive.deadline - s.t) } : null,
    assistant: s.assistant,
  } : null;

  // ---------- market ----------
  const hU = s.rival.active ? rivalUsers(s) : 0;
  const pU = s.porch.active && !s.porch.acquired ? s.porch.share * C.TAM : 0;
  const market: View['market'] = s.rounds >= 2 ? {
    sold: sold(s, 'market'),
    share: { kindly: U / C.TAM, huddle: s.rival.acquired ? 0 : hU / C.TAM, porch: pU / C.TAM, other: Math.max(0, 1 - (U + (s.rival.acquired ? 0 : hU) + pU) / C.TAM) },
    huddle: s.rival.active ? {
      users: s.rival.acquired ? 0 : hU, acquired: s.rival.acquired, price: rivalPrice(s, 'huddle'),
      canAcquire: check(s, { type: 'acquire', rival: 'huddle' }).ok, acquireLocked: s.rounds < 4,
      canCompete: check(s, { type: 'competeFeature' }).ok, competeCost: competeCost(s),
    } : null,
    porch: s.porch.active ? { users: pU, acquired: s.porch.acquired, price: rivalPrice(s, 'porch'), canAcquire: check(s, { type: 'acquire', rival: 'porch' }).ok } : null,
    advertisers: main.advertisers, sellers: main.sellers,
  } : null;

  // ---------- your life ----------
  const next = nextLifestyle(s);
  const life: View['life'] = s.rounds >= 2 ? {
    netWorth: s.founder.netWorth, salary: s.founder.salary, dividends: s.founder.dividends,
    items: LIFESTYLE.map(l => ({ id: l.id, name: l.name, cost: l.cost, perk: l.perk, owned: s.founder.life.includes(l.id), next: next?.id === l.id, canBuy: check(s, { type: 'buyLifestyle', id: l.id }).ok }))
      .filter((l, i) => l.owned || l.next || (next && i <= LIFESTYLE.findIndex(x => x.id === next.id) + 1)),
    cap: {
      rows: [
        { id: 'founder', name: s.founderName, pct: s.cap.founder, seat: true, repurchase: null },
        ...s.cap.investors.map(i => ({ id: i.id, name: i.name, pct: i.pct, seat: i.seat, repurchase: s.rounds >= 4 && ['pebble', 'northlight'].includes(i.id) && s.act >= 2 && s.act <= 3 && i.pct > 0.001 ? { cost: repurchaseCost(s) * Math.min(1, i.pct / 0.01), enabled: check(s, { type: 'repurchase', investorId: i.id }).ok } : null })),
        ...(s.cap.pool > 0 ? [{ id: 'pool', name: 'Employee option pool', pct: s.cap.pool, seat: false, repurchase: null }] : []),
      ],
      founder: s.cap.founder, control: founderVotes(s), classB: classBActive(s.cap), dualClass: s.cap.dualClass,
    },
    earnout: s.act4 ? { available: earnoutAvailable(s), enabled: check(s, { type: 'collectEarnout' }).ok, total: s.act4.earnoutTotal } : null,
  } : null;

  // ---------- growth lab ----------
  const lab: View['lab'] = s.act >= 2 && !trust ? {
    sold: sold(s, 'lab'),
    levers: LEVERS.map(l => ({ id: l.id, name: l.name, labels: l.labels, current: s.levers[l.id], locked: !leverUnlocked(s, l.id), boardSet: s.boardSet.includes(l.id), now: l.now, later: l.later })),
    history: s.testHistory.slice(0, 12).map(h => { const d = TESTS.find(x => x.id === h.id)!; return { title: d.title, variant: h.variant, dark: d.dark }; }),
  } : null;

  // ---------- board room ----------
  const ex = excessCash(s);
  const boardroom: View['boardroom'] = s.act >= 2 && !trust ? {
    sold: sold(s, 'board'), board: s.board === null ? null : Math.round(s.board), quota: s.boardQuota, revenue: s.revenue,
    seats: boardSeats(s.cap),
    dividend: { enabled: dividendReady(s), amount: Math.max(0, ex * 0.5), founderShare: Math.max(0, ex * 0.5) * s.cap.founder },
    interventions: s.interventions,
  } : null;

  return {
    t: s.t,
    date: inGameDate(s.t).label,
    act: s.act,
    palette: palette(s),
    header: { founder: s.founderName, title: s.act4?.removed ? 'Former CEO' : s.act === 5 ? 'Founder' : s.rounds >= 2 ? 'CEO' : 'Founder', homeName: homeName(s) },
    tabs,
    main,
    inbox,
    outage: outageView(s),
    health,
    money,
    build,
    test,
    feed: 'feed' in s.beats ? { sold: sold(s, 'feed'), posts: s.feed.slice(0, 12) } : null,
    ticker: 'ticker' in s.beats ? [...s.news] : null,
    team, market, life, lab, boardroom,
    memos: s.memos.slice(0, 12),
    modal: modalView(s),
    ending: endingView(s),
    popups: POPUPS,
  };
}

function sampleTicket(s: State): string | null {
  const pool = TICKETS.filter(k => k.act === undefined || (Array.isArray(k.act) ? s.act >= k.act[0] && s.act <= k.act[1] : s.act === k.act));
  if (!pool.length) return null;
  return pool[(s.ticketsAnswered + Math.floor(s.t / 12)) % pool.length].text;
}

function outageView(s: State): View['outage'] {
  const o = s.outage;
  if (!o) return null;
  const p = PUZZLES[o.puzzle];
  const lines = p.code.map(line => {
    const out: NonNullable<View['outage']>['lines'][number] = [];
    const re = /⟦(\d)⟧/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m.index > last) out.push({ kind: 'text', text: line.slice(last, m.index) });
      const k = +m[1];
      if (k >= o.active) out.push({ kind: 'text', text: p.slots[k].answer });
      else out.push({ kind: 'slot', slot: k, shape: p.slots[k].shape, filled: o.placed[k] ? p.slots[k].answer : null });
      last = m.index + m[0].length;
    }
    if (last < line.length) out.push({ kind: 'text', text: line.slice(last) });
    return out;
  });
  return {
    text: o.text, clicksLeft: o.clicksLeft, autoIn: Number.isFinite(o.autoAt) ? Math.max(0, o.autoAt - s.t) : null,
    lines, tray: o.tray.map((b, i) => ({ block: i, label: b.label, shape: b.shape, used: b.used })),
  };
}

function teamEffect(s: State, t: Team): string {
  const n = s.team[t];
  switch (t) {
    case 'product': return `+${(15 * (1 - Math.exp(-n / 25))).toFixed(1)} NPS, fewer outages`;
    case 'growth': return `growth ×${(1 + 0.18 * Math.sqrt(n)).toFixed(2)}`;
    case 'support': return s.assistant ? 'Kindly Assistant (AI)' : `answers ${fmtN(n * C.SUPPORT_CAPACITY * 60)} tickets / min`;
    case 'trust': return `blocks ${Math.round(100 * n / (n + 30))}% of abuse`;
    case 'sales': return `Kindly+ ×${(1 + 0.05 * Math.sqrt(n)).toFixed(2)}`;
    case 'ads': return `ad revenue ×${(1 + 0.03 * Math.sqrt(n)).toFixed(2)}`;
  }
}

function modalView(s: State): ModalView | null {
  const m = s.modal;
  if (!m) return null;
  switch (m.kind) {
    case 'termSheet': {
      const r = C.ROUNDS[m.round];
      const am = m.round === 0 ? m.amendment : null;
      const d = am === 'valuation' ? r.dilution / 1.2 : am === 'more' ? r.dilution * 1.2 : r.dilution;
      const after = s.cap.founder * (1 - d) * (1 - r.pool);
      return {
        kind: 'termSheet', round: r.name, amount: am === 'more' ? 1.8e6 : r.cash, investor: r.investor, stake: d, seat: !(am === 'observer'),
        controlBefore: founderVotes(s), controlAfter: after, canAmend: m.round === 0, showAmend: m.showAmend,
        amendments: m.round === 0 ? AMENDMENTS.map(a => ({ ...a, chosen: m.amendment === a.id })) : [],
      };
    }
    case 'secondary': {
      const nextItems = LIFESTYLE.filter(l => !s.founder.life.includes(l.id) && l.cost <= s.founder.netWorth + m.amount).slice(0, 3);
      return { kind: 'secondary', amount: m.amount, pct: C.SECONDARY_PCT, controlBefore: founderVotes(s), controlAfter: Math.max(0, s.cap.founder - C.SECONDARY_PCT), unlocks: nextItems.map(l => ({ name: l.name, perk: l.perk })) };
    }
    case 'bridge':
      return { kind: 'bridge', amount: m.amount };
    case 'event': {
      const e = EVENTS.find(x => x.id === m.eventId)!;
      return { kind: 'event', title: e.title, text: fill(s, e.text), options: e.options.map(o => ({ label: o.label, detail: o.detail })) };
    }
    case 'buyout':
      return {
        kind: 'buyout', stage: m.stage, ev: m.ev, debt: m.ev * C.BUYOUT_DEBT, payout: s.cap.founder * m.ev, control: founderVotes(s),
        trust: hasControl(s) && s.nps > 0, refusals: m.refusals,
        voteText: m.stage === 'vote' ? `The board votes ${Math.round((1 - founderVotes(s)) * 100)}% to ${Math.round(founderVotes(s) * 100)}% to accept. ${s.founderName} is removed as CEO.` : m.stage === 'kept' ? 'Ashgrove withdraws its offer.' : null,
      };
  }
}

function endingView(s: State): EndingView | null {
  if (!s.ending) return null;
  const d = ENDINGS[s.ending];
  const vars = { payout: fmtMoneyWords(s.act4?.payout ?? 0), laidOff: s.laidOff.toLocaleString('en-US') };
  const resister = s.interventions >= 3 && d.lastPostResister;
  const defs = [...d.articles];
  if (s.founder.life.includes('newspaper') && (s.ending === 'main' || s.ending === 'removed')) defs.splice(1, 0, BAY_LEDGER_ARTICLE);
  const articles = defs.map(a => ({
    outlet: a.outlet, section: a.section, headline: fill(s, a.headline, vars), deck: fill(s, a.deck, vars),
    byline: a.byline ? fill(s, a.byline, vars) : null, disclosure: a.disclosure ? fill(s, a.disclosure, vars) : null,
  }));
  return {
    id: s.ending, title: d.title, lines: d.lines.map(l => fill(s, l)),
    netWorth: s.final?.netWorth ?? s.founder.netWorth,
    owned: s.founder.life.map(id => LIFESTYLE.find(l => l.id === id)!.name),
    articles, dateline: inGameDate(s.final?.time ?? s.t).label, lastPost: resister ? d.lastPostResister! : d.lastPost,
    stats: s.final ? { peakUsers: s.final.peakUsers, peakStaff: s.final.peakStaff, laidOff: s.final.laidOff, time: s.final.time } : null,
    continues: s.ending === 'trust',
  };
}

export function fmtN(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(a >= 1e10 ? 1 : 2) + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (a >= 1e4) return (n / 1e3).toFixed(0) + 'K';
  if (a >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toString();
}

function fmtMoneyWords(n: number): string {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + ' billion';
  return '$' + Math.round(n / 1e6) + ' million';
}

export { DIVEST_NAMES };
