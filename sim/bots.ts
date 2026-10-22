// Bots play through the Player API only: they see the View and choose from available() actions.
import type { Game } from '../src/api/player';
import type { View } from '../src/api/view';
import type { Action, LeverId, Team } from '../src/engine/types';

export type BotName = 'compliant' | 'resister' | 'hidden' | 'idle';

export interface Bot {
  name: BotName;
  /** Called every decision step (dt seconds of game time since the last call). */
  decide(game: Game, dt: number): void;
}

const DARK = new Set(['dark_paywall', 'simplify', 'storage_limit', 'algo_feed', 'cancel_flow', 'promoted', 'data', 'ai_moonshot', 'synthetic']);
const MONETIZE = new Set([...DARK, 'kindlyplus', 'ads', 'annual', 'business', 'marketplace', 'supporter']);

const has = (avail: Action[], a: Action) => avail.some(x => JSON.stringify(x) === JSON.stringify(a));

function tryAct(game: Game, a: Action): boolean {
  return game.act(a).ok;
}

function scoreOption(detail: string, style: 'business' | 'honest'): number {
  const d = detail.toLowerCase();
  let s = 0;
  const pos = (k: string) => d.includes('+' + k);
  const neg = (k: string) => d.includes('−' + k) || d.includes('-' + k);
  if (style === 'business') {
    if (pos('users')) s += 2; if (pos('board')) s += 2; if (pos('cash') || pos('revenue')) s += 2;
    if (neg('board')) s -= 2; if (neg('cash')) s -= 1; if (d.includes('risk')) s -= 0.5;
  } else {
    if (pos('nps')) s += 3; if (neg('nps')) s -= 3; if (d.includes('risk')) s -= 2; if (pos('morale')) s += 1;
    if (neg('cash')) s -= 0.5; if (d.includes('ad campaign')) s -= 3;
  }
  return s;
}

interface Plan {
  amendment: string | null;
  sellSecondaries: boolean;
  lifestyle: boolean;
  skipUpgrade: (id: string) => boolean;
  testVariant: 'A' | 'B';
  eventStyle: 'business' | 'honest';
  levers: boolean;
  acquire: boolean;
  dividends: boolean;
  repurchase: boolean;
  buyout: 'accept' | 'refuse' | 'trust';
  clicks: boolean;
}

function makeBot(name: BotName, plan: Plan): Bot {
  let leverClock = 0;
  let clickCarry = 0;
  let ticketCarry = 0;
  return {
    name,
    decide(game, dt) {
      let v: View = game.observe();
      const minutes = v.t / 60;

      // ---- dialogs first ----
      for (let guard = 0; v.modal && guard < 10; guard++) {
        const m = v.modal;
        if (m.kind === 'termSheet') {
          if (m.canAmend && plan.amendment && !m.amendments.some(a => a.chosen)) {
            if (!m.showAmend) tryAct(game, { type: 'toggleAmendments' });
            tryAct(game, { type: 'chooseAmendment', id: plan.amendment });
          }
          tryAct(game, { type: 'acceptRound' });
        } else if (m.kind === 'secondary') tryAct(game, { type: 'secondary', accept: plan.sellSecondaries });
        else if (m.kind === 'bridge') tryAct(game, { type: 'bridge', accept: true });
        else if (m.kind === 'event') {
          let best = 0, bestScore = -Infinity;
          m.options.forEach((o, i) => { const sc = scoreOption(o.detail, plan.eventStyle); if (sc > bestScore) { bestScore = sc; best = i; } });
          tryAct(game, { type: 'chooseEvent', option: best });
        } else if (m.kind === 'buyout') {
          if (m.stage !== 'offer') tryAct(game, { type: 'continue' });
          else if (plan.buyout === 'trust' && m.trust) tryAct(game, { type: 'buyout', choice: 'trust' });
          else tryAct(game, { type: 'buyout', choice: plan.buyout === 'refuse' ? 'refuse' : 'accept' });
        }
        v = game.observe();
      }
      if (v.ending) return;
      const avail = game.available();

      // ---- hands-on verbs ----
      if (v.outage) for (let i = 0; i < v.outage.clicksLeft; i++) tryAct(game, { type: 'fixBug' });
      if (v.inbox && v.inbox.answerEnabled && (v.team?.rows.find(r => r.team === 'support')?.count ?? 0) === 0) {
        ticketCarry += dt * 1;
        while (ticketCarry >= 1) { ticketCarry--; tryAct(game, { type: 'answerTicket' }); }
      }
      if (plan.clicks && v.main.button.enabled) {
        const cps = minutes < 5 ? 4 : minutes < 15 ? 3 : minutes < 35 ? 1.5 : 0.5;
        clickCarry += cps * dt;
        while (clickCarry >= 1) { clickCarry--; tryAct(game, { type: 'click' }); }
      }

      // ---- A/B test ----
      if (v.test) tryAct(game, { type: 'shipTest', variant: v.test.dark ? plan.testVariant : 'B' });

      // ---- directive: reassign Support and Trust & Safety to Ads ----
      if (v.team?.directive) {
        for (const t of ['support', 'trust'] as Team[]) {
          const row = v.team.rows.find(r => r.team === t)!;
          let left = row.count;
          for (const d of [100, 10, 1]) while (left >= d && tryAct(game, { type: 'assign', team: t, delta: -d })) left -= d;
        }
        v = game.observe();
      }

      // ---- hiring and assignment ----
      if (v.team && !v.team.frozen) {
        const target = Math.round(4 + v.main.users / 25e3);
        const runway = v.money?.runway;
        const profitable = v.money ? v.money.profit > 0.05 * v.money.costs : false;
        const ok = v.act === 1 ? (runway == null || runway > 12) : (profitable || runway == null || runway > 24);
        let gap = target - v.team.headcount;
        const cushion = (v.money?.cash ?? 0) > 3 * (v.money?.costs ?? 0);
        if (ok && cushion && gap > 0) {
          for (const n of [100, 10, 1]) {
            if (gap >= n && has(avail, { type: 'hire', n })) { if (tryAct(game, { type: 'hire', n })) { gap -= n; break; } }
          }
        }
        v = game.observe();
        // Spread unassigned people toward target proportions.
        const weights: Partial<Record<Team, number>> = v.act === 1
          ? { product: 2, growth: 3, support: 2, trust: 1 }
          : v.team!.assistant ? { sales: 2, ads: 2, product: 1, growth: 1 } : { sales: 2, ads: 2, product: 1, growth: 1, support: 2, trust: 0.5 };
        let un = v.team!.unassigned;
        let guard = 0;
        while (un > 0 && guard++ < 300) {
          const rows = v.team!.rows.filter(r => !r.locked && (weights[r.team] ?? 0) > 0);
          const total = rows.reduce((a, r) => a + r.count, 0) + un;
          const wsum = rows.reduce((a, r) => a + (weights[r.team] ?? 0), 0);
          let best = rows[0], bestGap = -Infinity;
          for (const r of rows) { const gap = total * (weights[r.team] ?? 0) / wsum - r.count; if (gap > bestGap) { bestGap = gap; best = r; } }
          if (!best) break;
          const d = un >= 100 && bestGap >= 100 ? 100 : un >= 10 && bestGap >= 10 ? 10 : 1;
          if (!tryAct(game, { type: 'assign', team: best.team, delta: d })) break;
          un -= d;
          v = game.observe();
        }
      }

      // ---- upgrades ----
      v = game.observe();
      if (v.build && !v.build.sold) {
        for (const u of v.build.items) {
          if (u.state !== 'buy' || plan.skipUpgrade(u.id)) continue;
          if ((v.money?.cash ?? 0) >= u.cost * 1.2 && tryAct(game, { type: 'buyUpgrade', id: u.id })) break;
        }
      }

      // ---- perks, retreats (business players only) ----
      if (plan.lifestyle && v.team) {
        for (const p of v.team.perks) if (p.enabled) tryAct(game, { type: 'buyPerk', id: p.id });
        if (v.team.retreat?.enabled) tryAct(game, { type: 'retreat' });
      }

      // ---- levers ----
      leverClock += dt;
      if (plan.levers && v.lab && !v.lab.sold) {
        const lv = (id: LeverId) => v.lab!.levers.find(l => l.id === id)!;
        const set = (id: LeverId, step: number) => { const l = lv(id); if (!l.locked && !l.boardSet && l.current !== step) tryAct(game, { type: 'setLever', lever: id, step }); };
        if (v.act === 2 && leverClock >= 240) {
          leverClock = 0;
          const ad = lv('adLoad'), no = lv('notif'), pr = lv('price');
          if (!ad.locked && ad.current < 3) set('adLoad', ad.current + 1);
          else if (ad.locked) { /* wait for ads */ }
          else if (no.current < 3) set('notif', no.current + 1);
          else if (!pr.locked && pr.current < 5) set('price', pr.current + 1);
        }
        if (v.act === 3 && leverClock >= 180) {
          leverClock = 0;
          const sf = lv('sellerFee'), re = lv('reach'), da = lv('data');
          if (!sf.locked && sf.current < 5) set('sellerFee', sf.current + 1);
          if (!re.locked && re.current < 6) set('reach', re.current + 1);
          if (!da.locked && da.current < 2) set('data', da.current + 1);
        }
      } else if (!plan.levers && v.lab && !v.lab.sold && name === 'hidden') {
        const ad = v.lab.levers.find(l => l.id === 'adLoad')!;
        if (!ad.locked && ad.current !== 1) tryAct(game, { type: 'setLever', lever: 'adLoad', step: 1 });
        const re = v.lab.levers.find(l => l.id === 'reach')!;
        if (!re.locked && re.current !== 1) tryAct(game, { type: 'setLever', lever: 'reach', step: 1 });
      }

      // ---- market ----
      if (plan.acquire && v.market) {
        if (v.market.huddle?.canAcquire && (v.money?.cash ?? 0) > v.market.huddle.price * 1.05) tryAct(game, { type: 'acquire', rival: 'huddle' });
        if (v.market.porch?.canAcquire && (v.money?.cash ?? 0) > v.market.porch.price * 1.3) tryAct(game, { type: 'acquire', rival: 'porch' });
      }

      // ---- board room ----
      if (plan.dividends && v.boardroom?.dividend.enabled && v.boardroom.dividend.amount > 0) tryAct(game, { type: 'dividend' });

      // ---- your life ----
      if (v.life) {
        if (plan.lifestyle) {
          const next = v.life.items.find(i => i.next);
          if (next && next.canBuy && v.life.netWorth * 0.4 >= next.cost) tryAct(game, { type: 'buyLifestyle', id: next.id });
        }
        if (v.life.earnout?.enabled) tryAct(game, { type: 'collectEarnout' });
        if (plan.repurchase && v.life.cap.founder < 0.41) {
          for (const r of v.life.cap.rows) if (r.repurchase?.enabled && (v.money?.cash ?? 0) > r.repurchase.cost + 6 * (v.money?.costs ?? 0)) { tryAct(game, { type: 'repurchase', investorId: r.id }); break; }
        }
      }
    },
  };
}

export function createBot(name: BotName): Bot {
  switch (name) {
    case 'compliant':
      return makeBot(name, { amendment: null, sellSecondaries: true, lifestyle: true, skipUpgrade: () => false, testVariant: 'B', eventStyle: 'business', levers: true, acquire: true, dividends: true, repurchase: false, buyout: 'accept', clicks: true });
    case 'idle': {
      const b = makeBot(name, { amendment: null, sellSecondaries: true, lifestyle: true, skipUpgrade: () => false, testVariant: 'B', eventStyle: 'business', levers: true, acquire: true, dividends: true, repurchase: false, buyout: 'accept', clicks: true });
      const inner = b.decide;
      b.decide = (g, dt) => {
        if (g.observe().t > 60) { idleNoClick(g, dt, inner); return; }
        inner(g, dt);
      };
      return b;
    }
    case 'resister':
      return makeBot(name, { amendment: null, sellSecondaries: true, lifestyle: true, skipUpgrade: id => MONETIZE.has(id), testVariant: 'A', eventStyle: 'honest', levers: false, acquire: false, dividends: false, repurchase: false, buyout: 'refuse', clicks: true });
    case 'hidden':
      return makeBot(name, { amendment: 'dualclass', sellSecondaries: false, lifestyle: false, skipUpgrade: id => DARK.has(id), testVariant: 'A', eventStyle: 'honest', levers: false, acquire: false, dividends: false, repurchase: true, buyout: 'trust', clicks: true });
  }
}

// The idle bot does everything except click the main button.
function idleNoClick(g: Game, dt: number, inner: (g: Game, dt: number) => void) {
  const realAct = g.act.bind(g);
  g.act = (a: Action) => (a.type === 'click' ? { ok: false, reason: 'idle' } : realAct(a));
  try { inner(g, dt); } finally { g.act = realAct; }
}
