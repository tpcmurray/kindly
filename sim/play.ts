// Text playtest client: plays the real game through the Player API, in a terminal.
//   npm run play                      interactive (type `help`)
//   npm run play -- --script file.txt run commands from a file, one per line
//   npm run play -- --seed 7 --name "Sam Okafor"
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { createGame } from '../src/api/player';
import type { View } from '../src/api/view';
import type { Action, LeverId, TabId, Team } from '../src/engine/types';
import { fmtN, money, pct } from '../src/ui/format';

const args = process.argv.slice(2);
const get = (k: string, d: string) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const game = createGame({ seed: +get('seed', '1'), founderName: get('name', 'Jordan Reyes') });
let tab: TabId = 'home';

const HELP = `commands:
  look                 show the current tab        tab <home|team|market|life|lab|board>
  click [n]            press the main button n times
  answer [n]           answer n tickets            fix   fix the outage
  hire <1|10|100>      hire people                 assign <team> <±n>
  buy <upgrade-id>     buy an upgrade              lever <id> <step>
  ship <A|B|skip>      decide the A/B test         choose <n>   pick an event option
  accept | refuse | trust | continue              (term sheets, offers, buyout)
  amend [id]           open amendments / choose one (seed only)
  sell | keep          secondary sale offer        bridge | nobridge
  acquire <huddle|porch>  compete   lifestyle <id>  perk <id>  retreat  dividend
  repurchase <investor>  earnout
  wait <sec>           let time pass (e.g. wait 30)
  actions              list every available action
  quit`;

function line(s = '') { process.stdout.write(s + '\n'); }

function show(v: View) {
  line(`\n== ${v.header.homeName} · ${v.date} · Act ${v.act} · ${v.header.founder}, ${v.header.title} · t=${Math.round(v.t)}s ==`);
  line('tabs: ' + v.tabs.map(t => `${t.id === tab ? '[' : ''}${t.label}${t.id === tab ? ']' : ''}${t.dot ? '•' : ''}${t.sold ? '(sold)' : ''}`).join(' | '));
  if (v.ending) {
    line(`\n*** ENDING: ${v.ending.id} ***  net worth ${money(v.ending.netWorth)}`);
    v.ending.lines.forEach(l => line('  ' + l));
    v.ending.articles.forEach(a => line(`  » [${a.outlet} · ${a.section}] ${a.headline} — ${a.deck}`));
    line(`  @${v.ending.lastPost.handle}: ${v.ending.lastPost.text}`);
    return;
  }
  if (v.modal) showModal(v);
  if (tab === 'home') {
    const m = v.main;
    line(`users ${fmtN(m.users)} (${m.perSec >= 0 ? '+' : ''}${fmtN(m.perSec)}/s)${m.paid !== null ? ` · free ${fmtN(m.free!)} · Kindly+ ${fmtN(m.paid)}` : ''} · button "${m.button.label}" ${m.button.enabled ? m.button.value : '(disabled)'}`);
    if (v.health) line(`NPS ${v.health.nps?.retired ? 'not reported' : v.health.nps?.value}${v.health.board !== null ? ` · board ${v.health.board}` : ''}${v.health.retention !== null ? ` · ${v.health.retentionLabel} ${pct(v.health.retention)}` : ''}`);
    if (v.money && !v.money.sold) line(`cash ${money(v.money.cash)} · revenue ${v.money.revenue === null ? '—' : money(v.money.revenue)}/mo · costs ${money(v.money.costs)}/mo${v.money.runway !== null ? ` · runway ${v.money.runway.toFixed(1)} mo` : ''}${v.money.debt ? ` · debt ${money(v.money.debt)}` : ''}`);
    if (v.outage) {
      line(`!! ${v.outage.text} — puzzle: place a block in each slot (\`place <block> <slot>\`), or \`fix\` to brute-force`);
      v.outage.lines.forEach(l => line('     ' + l.map(s => s.kind === 'text' ? s.text : s.filled ?? `[slot ${s.slot}:${s.shape}]`).join('')));
      line('     tray: ' + v.outage.tray.filter(b => !b.used).map(b => `${b.block}=${b.label}(${b.shape})`).join('  '));
    }
    if (v.inbox && !v.inbox.sold) line(`inbox: ${fmtN(v.inbox.open)} open · ${v.inbox.note ?? ''}`);
    if (v.test) line(`TEST "${v.test.title}": A=${v.test.a} | B=${v.test.b} (${v.test.result})`);
    if (v.build && !v.build.sold) line('build: ' + v.build.items.filter(i => i.state !== 'owned').map(i => `${i.id}[${i.state} ${money(i.cost)}]`).join(' '));
    if (v.feed && !v.feed.sold) v.feed.posts.slice(0, 4).forEach(p => line(`  @${p.handle}: ${p.text}`));
    if (v.memos[0]) line(`memo (${v.memos[0].from}): ${v.memos[0].subject} — ${v.memos[0].text}`);
  }
  if (tab === 'team' && v.team) {
    line(`headcount ${v.team.headcount} · unassigned ${v.team.unassigned} · morale ${v.team.morale} · hire: ${v.team.hire.map(h => `${h.n}=${money(h.cost)}${h.enabled ? '' : '(x)'}`).join(' ')}`);
    v.team.rows.forEach(r => line(`  ${r.team.padEnd(8)} ${String(r.count).padStart(5)}  ${r.locked ? 'locked' : r.effect}${r.highlight ? '  <- DIRECTIVE' : ''}`));
    v.team.perks.forEach(p => line(`  perk ${p.id}: ${p.owned ? 'owned' : p.enabled ? 'available' : 'n/a'}`));
  }
  if (tab === 'market' && v.market) {
    line(`share: Kindly ${pct(v.market.share.kindly)} Huddle ${pct(v.market.share.huddle)} Porch ${pct(v.market.share.porch)}`);
    if (v.market.huddle) line(`Huddle: ${v.market.huddle.acquired ? 'acquired' : `${fmtN(v.market.huddle.users)} users · acquire ${money(v.market.huddle.price)}${v.market.huddle.canAcquire ? '' : ' (n/a)'}`}`);
  }
  if (tab === 'life' && v.life) {
    line(`net worth ${money(v.life.netWorth)} · control ${pct(v.life.cap.control)}${v.life.cap.classB ? ' (Class B)' : ''}`);
    v.life.cap.rows.forEach(r => line(`  ${r.name.padEnd(28)} ${pct(r.pct)}${r.seat ? ' seat' : ''}${r.repurchase ? ` repurchase ${money(r.repurchase.cost)}${r.repurchase.enabled ? '' : '(x)'}` : ''}`));
    v.life.items.forEach(i => line(`  ${i.owned ? '✓' : i.next ? '>' : ' '} ${i.id} ${money(i.cost)} — ${i.perk}`));
    if (v.life.earnout) line(`  earnout available ${money(v.life.earnout.available)}`);
  }
  if (tab === 'lab' && v.lab) v.lab.levers.forEach(l => line(`  ${l.id.padEnd(10)} ${l.locked ? 'locked' : l.labels.map((x, i) => i === l.current ? `[${x}]` : x).join(' ')}${l.boardSet ? ' BOARD-SET' : ''}`));
  if (tab === 'board' && v.boardroom) {
    line(`board ${v.boardroom.board} · target ${money(v.boardroom.quota)}/mo · revenue ${money(v.boardroom.revenue)}/mo · dividend ${v.boardroom.dividend.enabled ? money(v.boardroom.dividend.amount) : 'n/a'}`);
    v.memos.slice(0, 5).forEach(m => line(`  ${m.from}: ${m.subject} — ${m.text}`));
  }
}

function showModal(v: View) {
  const m = v.modal!;
  line('--- DIALOG ---');
  if (m.kind === 'termSheet') {
    line(`${m.round}: ${money(m.amount)} from ${m.investor} for ${pct(m.stake)} · control ${pct(m.controlBefore)} → ${pct(m.controlAfter)}`);
    if (m.showAmend) m.amendments.forEach(a => line(`  amend ${a.id}${a.chosen ? ' (chosen)' : ''}: ${a.label}`));
    else if (m.canAmend) line('  (Propose changes: type `amend`)');
  } else if (m.kind === 'secondary') line(`Sell ${pct(m.pct, 0)} for ${money(m.amount)}? control ${pct(m.controlBefore)} → ${pct(m.controlAfter)} (sell / keep)`);
  else if (m.kind === 'bridge') line(`Bridge note ${money(m.amount)}? (bridge / nobridge)`);
  else if (m.kind === 'event') { line(`${m.title}: ${m.text}`); m.options.forEach((o, i) => line(`  choose ${i}: ${o.label} — ${o.detail}`)); }
  else if (m.kind === 'buyout') line(m.stage === 'offer' ? `Ashgrove: EV ${money(m.ev)}, debt ${money(m.debt)}, payout ${money(m.payout)}, control ${pct(m.control)} (accept / refuse${m.trust ? ' / trust' : ''})` : `${m.voteText} (continue)`);
}

function parse(cmd: string): Action[] | 'look' | 'actions' | { wait: number } | 'quit' | null {
  const [c, a, b] = cmd.trim().split(/\s+/);
  const n = (x: string | undefined, d = 1) => (x === undefined ? d : +x);
  switch (c) {
    case 'look': case '': return 'look';
    case 'actions': return 'actions';
    case 'quit': case 'exit': return 'quit';
    case 'wait': return { wait: n(a, 10) };
    case 'tab': tab = a as TabId; return [{ type: 'viewTab', tab: a as TabId }];
    case 'click': return Array.from({ length: n(a) }, () => ({ type: 'click' }) as Action);
    case 'answer': return Array.from({ length: n(a) }, () => ({ type: 'answerTicket' }) as Action);
    case 'fix': return Array.from({ length: 3 }, () => ({ type: 'fixBug' }) as Action);
    case 'place': return [{ type: 'fixBug', block: n(a, 0), slot: n(b, 0) }];
    case 'hire': return [{ type: 'hire', n: n(a) }];
    case 'assign': return [{ type: 'assign', team: a as Team, delta: n(b) }];
    case 'buy': return [{ type: 'buyUpgrade', id: a }];
    case 'lever': return [{ type: 'setLever', lever: a as LeverId, step: n(b, 0) }];
    case 'ship': return [{ type: 'shipTest', variant: (a === 'skip' ? 'skip' : (a ?? 'B').toUpperCase()) as 'A' | 'B' | 'skip' }];
    case 'choose': return [{ type: 'chooseEvent', option: n(a, 0) }];
    case 'accept': {
      const m = game.observe().modal;
      return [m?.kind === 'buyout' ? { type: 'buyout', choice: 'accept' } : { type: 'acceptRound' }];
    }
    case 'refuse': return [{ type: 'buyout', choice: 'refuse' }];
    case 'trust': return [{ type: 'buyout', choice: 'trust' }];
    case 'continue': return [{ type: 'continue' }];
    case 'amend': return a ? [{ type: 'chooseAmendment', id: a }] : [{ type: 'toggleAmendments' }];
    case 'sell': return [{ type: 'secondary', accept: true }];
    case 'keep': return [{ type: 'secondary', accept: false }];
    case 'bridge': return [{ type: 'bridge', accept: true }];
    case 'nobridge': return [{ type: 'bridge', accept: false }];
    case 'acquire': return [{ type: 'acquire', rival: a as 'huddle' | 'porch' }];
    case 'compete': return [{ type: 'competeFeature' }];
    case 'lifestyle': return [{ type: 'buyLifestyle', id: a }];
    case 'perk': return [{ type: 'buyPerk', id: a }];
    case 'retreat': return [{ type: 'retreat' }];
    case 'dividend': return [{ type: 'dividend' }];
    case 'repurchase': return [{ type: 'repurchase', investorId: a }];
    case 'earnout': return [{ type: 'collectEarnout' }];
    case 'help': line(HELP); return null;
    default: line(`unknown command: ${c} (try help)`); return null;
  }
}

function run(cmd: string): boolean {
  const p = parse(cmd);
  if (p === null) return true;
  if (p === 'quit') return false;
  if (p === 'look') { show(game.observe()); return true; }
  if (p === 'actions') { line(game.available().map(a => JSON.stringify(a)).join('\n')); return true; }
  if ('wait' in p) {
    const events = game.advance(p.wait);
    if (events.length) line('happened: ' + events.join(', '));
    show(game.observe());
    return true;
  }
  let ok = 0, last = '';
  for (const a of p) { const r = game.act(a); if (r.ok) ok++; else last = r.reason; }
  line(ok ? `ok (${ok})` : `can't: ${last}`);
  return true;
}

const script = get('script', '');
if (script) {
  for (const l of readFileSync(script, 'utf8').split(/\r?\n/)) {
    if (!l.trim() || l.startsWith('#')) continue;
    line('> ' + l);
    if (!run(l)) break;
  }
} else {
  line('Kindly text client. Type `help`.');
  show(game.observe());
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
  rl.prompt();
  rl.on('line', l => { if (!run(l)) rl.close(); else rl.prompt(); });
}
