// Headless pacing simulator. Plays the real game through the Player API.
//   npm run sim -- --bot compliant [--minutes 180] [--seed 1] [--quiet]
import { mkdirSync, writeFileSync } from 'node:fs';
import { createGame, type Game } from '../src/api/player';
import { fmtN } from '../src/api/view';
import { createBot, type BotName } from './bots';
import { EngagementMeter } from './metrics';

export interface SimResult {
  bot: BotName;
  beats: Record<string, number>;
  rows: Record<string, string | number>[];
  engagement: ReturnType<EngagementMeter['report']>;
  ending: string | null;
  endTime: number;
  game: Game;
}

export function simulate(bot: BotName, opts: { minutes?: number; seed?: number; step?: number } = {}): SimResult {
  const game = createGame({ seed: opts.seed ?? 1, founderName: 'Jordan Reyes' });
  const b = createBot(bot);
  const step = opts.step ?? 0.5;
  const limit = (opts.minutes ?? 200) * 60;
  const meter = new EngagementMeter();
  const rows: SimResult['rows'] = [];
  let nextRow = 0;
  while (game.elapsed() < limit) {
    b.decide(game, step);
    const events = game.advance(step);
    const v = game.observe();
    meter.record(v.t, events, game.available());
    if (v.t >= nextRow) {
      nextRow += 60;
      const s = game.debugState();
      rows.push({
        min: Math.round(v.t / 60), act: v.act, users: Math.round(v.main.users), paid: Math.round(v.main.paid ?? 0),
        nps: Math.round(s.nps), board: v.boardroom?.board ?? '', morale: v.team?.morale ?? '',
        cash: Math.round(v.money?.cash ?? 0), revenue: Math.round(v.money?.revenue ?? 0), costs: Math.round(v.money?.costs ?? 0),
        staff: v.team?.headcount ?? 0, founder: +(s.cap.founder * 100).toFixed(1), control: +((v.life?.cap.control ?? 1) * 100).toFixed(1),
        netWorth: Math.round(s.founder.netWorth), retention: +((v.health?.retention ?? 0) * 100).toFixed(1),
      });
    }
    if (v.ending && (v.ending.id !== 'trust' || v.t > (game.debugState().beats['trust'] ?? 0) + 5)) break;
  }
  const s = game.debugState();
  return { bot, beats: { ...s.beats }, rows, engagement: meter.report(), ending: s.ending, endTime: s.t, game };
}

const clock = (t: number) => `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}`;

export const KEY_BEATS = [
  'feed', 'inbox', 'firstOutage', 'firstTest', 'seed', 'npsGauge', 'ticker', 'seriesA', 'bridge', 'seriesB', 'act2', 'kindlyplus', 'breakEven',
  'seriesC', 'npsZero', 'huddleAcquired', 'act3', 'porch', 'porchAcquired', 'npsRetired', 'npsRetireFailed', 'directive', 'directiveFailed', 'assistant', 'efficiency',
  'buyoutOffer', 'act4', 'removed', 'recap1', 'sunset', 'refi', 'recap2', 'chapter11', 'trust', 'kept',
];

function main() {
  const args = process.argv.slice(2);
  const get = (k: string, d: string) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
  const bot = get('bot', 'compliant') as BotName;
  const t0 = Date.now();
  const r = simulate(bot, { minutes: +get('minutes', '200'), seed: +get('seed', '1') });
  const s = r.game.debugState();
  console.log(`\n=== ${bot.toUpperCase()} · ended ${r.ending ?? 'no ending'} at ${clock(r.endTime)} · simulated in ${((Date.now() - t0) / 1000).toFixed(1)}s ===\n`);
  for (const k of KEY_BEATS) if (k in r.beats) console.log(clock(r.beats[k]).padStart(5), ' ', k);
  console.log(`\npeak users ${fmtN(s.peakUsers)} · peak staff ${s.peakStaff} · laid off ${s.laidOff} · interventions ${s.interventions} · failed proposals ${s.failedProposals}`);
  console.log(`founder: shares ${(s.cap.founder * 100).toFixed(1)}% · net worth $${fmtN(s.founder.netWorth)} · dividends $${fmtN(s.founder.dividends)} · lifestyle: ${s.founder.life.join(', ') || 'none'}`);
  console.log(`upgrades: ${s.upgrades.join(', ')}`);
  const e = r.engagement;
  console.log(`engagement: longest gap with nothing new ${Math.round(e.longestGap)}s (at ${clock(e.longestGapAt)}), useful action available ${(e.usefulShare * 100).toFixed(0)}% of the time`);
  if (!args.includes('--quiet')) {
    console.table(r.rows.filter((_, i) => i % 5 === 0).map(x => ({ ...x, users: fmtN(+x.users), paid: fmtN(+x.paid), cash: fmtN(+x.cash), revenue: fmtN(+x.revenue), costs: fmtN(+x.costs), netWorth: fmtN(+x.netWorth) })));
  }
  mkdirSync('sim/out', { recursive: true });
  const cols = Object.keys(r.rows[0] ?? {});
  writeFileSync(`sim/out/${bot}.csv`, [cols.join(','), ...r.rows.map(x => cols.map(c => x[c]).join(','))].join('\n'));
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('sim/run.ts')) main();
