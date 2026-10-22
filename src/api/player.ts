// The Player API: the one interface between the game and everything that plays it
// (browser UI, bots, the text playtest client, tests). See TDD §10.5.
import { LIFESTYLE, PERKS } from '../content/founder';
import { EVENTS } from '../content/events';
import { UPGRADES } from '../content/upgrades';
import { apply, check, type Result } from '../engine/actions';
import { LEVERS } from '../engine/levers';
import { initialState } from '../engine/state';
import { advance as advanceState } from '../engine/tick';
import type { Action, State, TabId } from '../engine/types';
import { TEAMS } from '../engine/types';
import { buildView, type View } from './view';

export interface Session { seed: number; founderName: string; entries: { at: number; action: Action }[] }

export interface Game {
  observe(): View;
  available(): Action[];
  act(action: Action): Result;
  advance(seconds: number): string[];
  log(): Session;
  elapsed(): number;
  /** Debug only: the raw state. Not part of what a player can see. */
  debugState(): State;
}

export function createGame(opts: { seed?: number; founderName?: string; state?: State } = {}): Game {
  const s: State = opts.state ?? initialState(opts.seed ?? Math.floor(Math.random() * 2 ** 31), opts.founderName ?? 'Jordan Reyes');
  let elapsed = 0;
  const entries: Session['entries'] = [];

  return {
    observe: () => buildView(s),
    available: () => availableActions(s),
    act(action) {
      const r = apply(s, action);
      if (r.ok && action.type !== 'viewTab') entries.push({ at: elapsed, action });
      return r;
    },
    advance(seconds) {
      const before = signature(s);
      advanceState(s, seconds);
      elapsed += seconds;
      return diff(before, signature(s));
    },
    log: () => ({ seed: s.seed, founderName: s.founderName, entries: [...entries] }),
    elapsed: () => elapsed,
    debugState: () => s,
  };
}

export function replay(session: Session, until?: number): Game {
  const g = createGame({ seed: session.seed, founderName: session.founderName });
  for (const e of session.entries) {
    if (until !== undefined && e.at > until) break;
    const gap = e.at - g.elapsed();
    if (gap > 0) g.advance(gap);
    g.act(e.action);
  }
  if (until !== undefined && until > g.elapsed()) g.advance(until - g.elapsed());
  return g;
}

function candidates(): Action[] {
  const list: Action[] = [{ type: 'click' }, { type: 'answerTicket' }, { type: 'fixBug' }];
  for (const n of [1, 10, 100]) list.push({ type: 'hire', n });
  for (const team of TEAMS) for (const d of [1, 10, 100]) { list.push({ type: 'assign', team, delta: d }); list.push({ type: 'assign', team, delta: -d }); }
  for (const u of UPGRADES) list.push({ type: 'buyUpgrade', id: u.id });
  list.push({ type: 'acceptRound' }, { type: 'toggleAmendments' }, { type: 'chooseAmendment', id: null });
  for (const id of ['valuation', 'more', 'observer', 'dualclass']) list.push({ type: 'chooseAmendment', id });
  list.push({ type: 'secondary', accept: true }, { type: 'secondary', accept: false }, { type: 'bridge', accept: true }, { type: 'bridge', accept: false });
  for (const l of LEVERS) for (let i = 0; i < l.steps.length; i++) list.push({ type: 'setLever', lever: l.id, step: i });
  list.push({ type: 'shipTest', variant: 'A' }, { type: 'shipTest', variant: 'B' }, { type: 'shipTest', variant: 'skip' });
  const maxOpts = Math.max(...EVENTS.map(e => e.options.length));
  for (let i = 0; i < maxOpts; i++) list.push({ type: 'chooseEvent', option: i });
  list.push({ type: 'acquire', rival: 'huddle' }, { type: 'acquire', rival: 'porch' }, { type: 'competeFeature' });
  for (const l of LIFESTYLE) list.push({ type: 'buyLifestyle', id: l.id });
  for (const p of PERKS) list.push({ type: 'buyPerk', id: p.id });
  list.push({ type: 'retreat' }, { type: 'dividend' });
  for (const id of ['pebble', 'northlight']) list.push({ type: 'repurchase', investorId: id });
  list.push({ type: 'buyout', choice: 'accept' }, { type: 'buyout', choice: 'refuse' }, { type: 'buyout', choice: 'trust' }, { type: 'continue' }, { type: 'collectEarnout' });
  return list;
}

export function availableActions(s: State): Action[] {
  const out = candidates().filter(a => check(s, a).ok);
  if (s.outage) s.outage.tray.forEach((_, block) => { for (let slot = 0; slot < s.outage!.active; slot++) { const a: Action = { type: 'fixBug', block, slot }; if (check(s, a).ok) out.push(a); } });
  for (const tab of buildView(s).tabs) if (!tab.sold) out.push({ type: 'viewTab', tab: tab.id as TabId });
  return out;
}

// What changed between two moments, as short event strings (used for engagement metrics).
function signature(s: State) {
  return {
    beats: Object.keys(s.beats),
    modal: s.modal ? s.modal.kind : null,
    test: s.test?.id ?? null,
    tabs: Object.keys(s.tabNew),
    ready: UPGRADES.filter(u => !s.upgrades.includes(u.id) && check(s, { type: 'buyUpgrade', id: u.id }).ok).map(u => u.id),
    memos: s.memos[0]?.id ?? null,
    outage: !!s.outage,
    act: s.act,
  };
}

function diff(a: ReturnType<typeof signature>, b: ReturnType<typeof signature>): string[] {
  const out: string[] = [];
  for (const k of b.beats) if (!a.beats.includes(k)) out.push('beat:' + k);
  if (b.modal && b.modal !== a.modal) out.push('modal:' + b.modal);
  if (b.test && b.test !== a.test) out.push('test:' + b.test);
  for (const k of b.tabs) if (!a.tabs.includes(k)) out.push('tab:' + k);
  for (const k of b.ready) if (!a.ready.includes(k)) out.push('upgrade:' + k);
  if (b.memos && b.memos !== a.memos) out.push('memo');
  if (b.outage && !a.outage) out.push('outage');
  if (b.act !== a.act) out.push('act:' + b.act);
  return out;
}
