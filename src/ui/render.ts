import type { ModalView, View } from '../api/view';
import type { Action, TabId, Team } from '../engine/types';
import { ENDING_LIST } from '../content/misc';
import { clock, esc, fmtN, money, moneyFull, pct, rate as fmtRate, signed } from './format';
import { gauge, moneyChart } from './svg';

export interface UiState {
  tab: TabId;
  pick: { block: number | null; slot: number | null };
  popup: string | null;
  settings: boolean;
  trustDismissed: boolean;
}

// Exact counts with commas, so every click visibly moves the number.
const whole = (n: number) => Math.floor(n).toLocaleString('en-US');
const act = (a: Action) => `data-act='${esc(JSON.stringify(a))}'`;
const ui = (cmd: string) => `data-ui="${esc(cmd)}"`;
const q = (id: string) => `<button class="q" ${ui('popup:' + id)} aria-label="What is this?">?</button>`;
const TEAM_COLOR: Record<Team, string> = { product: 'var(--t-product)', growth: 'var(--t-growth)', support: 'var(--t-support)', trust: 'var(--t-trust)', sales: 'var(--t-sales)', ads: 'var(--t-ads)' };
const AV_COLORS = ['#F59E8B', '#8BC6F5', '#9BD3A8', '#C9A7F5', '#F5C98B', '#8BE0D9', '#E59BC8', '#B5B5E8'];

function avatar(handle: string, kind: string): string {
  let h = 0; for (const c of handle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const color = kind === 'insider' ? '#9AA0A8' : kind === 'biz' ? '#C2A27A' : AV_COLORS[h % AV_COLORS.length];
  const letter = kind === 'insider' ? '·' : (handle.replace(/[^a-z]/gi, '')[0] ?? '?').toUpperCase();
  return `<div class="av" style="background:${color}">${letter}</div>`;
}

function soldBlock(name: string, label = 'Asset sold', h = 110): string {
  return `<div class="sold" style="min-height:${h}px"><span class="stamp">${label}</span><small>${esc(name)}</small></div>`;
}

export function renderTopbar(v: View, u: UiState): string {
  return `<header class="topbar">
    <div class="logo"><div class="mark">k</div>kindly</div>
    <div class="meta">
      <span>${esc(v.header.founder)}, ${esc(v.header.title)}</span>
      <span>${esc(v.date)}</span>
      ${v.act === 4 ? '<span>A portfolio company of Ashgrove Equity Partners</span>' : ''}
      <button class="iconbtn" ${ui('settings')} aria-label="Settings" aria-expanded="${u.settings}">⚙</button>
    </div>
  </header>`;
}

export function renderTabs(v: View, u: UiState): string {
  if (!v.tabs.length) return "";
  return `<nav class="tabs" aria-label="Locations">${v.tabs.map(t => {
    const fresh = t.fresh && t.id !== u.tab;
    const cls = [t.id === u.tab ? 'on' : '', !fresh && t.dot && !t.sold && t.id !== u.tab ? 'new' : '', fresh ? 'fresh' : '', t.sold ? 'soldtab' : '', t.id === 'life' ? 'lifetab' : ''].join(' ').trim();
    return `<button data-key="tab-${t.id}" data-tab="${t.id}" class="${cls}" ${t.sold ? 'disabled' : ui('tab:' + t.id)} aria-current="${t.id === u.tab}">${esc(t.label)}${fresh ? '<span class="newpill">NEW</span>' : ''}${t.sold ? '<span class="soldtag">sold</span>' : ''}</button>`;
  }).join('')}</nav>`;
}

export function renderTicker(v: View): string {
  if (!v.ticker || !v.ticker.length) return '';
  const items = v.ticker.slice(0, 6).map(h => esc(h)).join('<em>•</em>');
  return `<div class="ticker" aria-live="off"><span class="tag">NEWS</span><div class="track"><span class="items" data-key="${esc(v.ticker[0])}"><span>${items}</span><span aria-hidden="true">${items}</span></span></div></div>`;
}

// ---------------- HOME ----------------
function mainCard(v: View): string {
  const m = v.main;
  const rate = m.perSec;
  return `<div class="card" style="text-align:center">
    <div class="stat"><span data-fx="users" data-roll="users" data-val="${Math.floor(m.users)}" data-fmt="whole" class="fx-num">${whole(m.users)}</span> <small>${v.act === 5 ? 'members' : 'users'}</small></div>
    <div class="rate ${rate >= 0 ? 'pos' : 'neg'}"><span data-fx="persec" class="fx-num">${rate >= 0 ? '▲ +' : '▼ −'}${fmtRate(Math.abs(rate))} / sec</span></div>
    ${m.free !== null ? `<div class="split"><div><b>${whole(m.free)}</b><span>Free</span></div><div><b>${whole(m.paid ?? 0)}</b><span>Kindly+</span></div></div>` : ''}
    ${m.advertisers !== null ? `<div class="split"><div><b>${fmtN(m.advertisers)}</b><span>Advertisers</span></div><div><b>${m.sellers !== null ? fmtN(m.sellers) : '—'}</b><span>Sellers</span></div></div>` : ''}
    <div style="margin-top:10px"><button class="big-btn" data-fx="mainbtn" data-label="${esc(m.button.value)}" ${act({ type: 'click' })} ${m.button.enabled ? '' : 'disabled'}>${esc(m.button.label)}${m.button.enabled ? `<small>${esc(m.button.value)}</small>` : ''}</button></div>
  </div>`;
}

function healthCard(v: View): string {
  const h = v.health;
  if (!h) return '';
  if (h.sold) return soldBlock('Member Health');
  const npsG = h.nps ? gauge(h.nps.value ?? 0, -100, 100, 'User NPS', true, h.nps.retired) : '';
  const boardG = h.board !== null ? `<div data-fx="board" class="fx-num">${gauge(h.board, 0, 100, 'Board satisfaction')}</div>` : '';
  return `<div class="card"><h4>${v.act >= 2 ? 'Health' : 'Happiness'} <span>${q('nps')}${h.board !== null ? ' ' + q('board') : ''}</span></h4>
    ${boardG ? `<div class="gauges">${npsG}${boardG}</div>` : npsG}
    ${h.retention !== null ? `<div class="kv" style="margin-top:8px"><span>${esc(h.retentionLabel)} ${q('retention')}</span><b>${pct(h.retention)}</b></div>` : ''}
  </div>`;
}

function moneyCard(v: View): string {
  const m = v.money;
  if (!m) return '';
  if (m.sold) return soldBlock('Finance');
  const rows: string[] = [];
  rows.push(`<span>Cash</span><b class="${m.cash < 0 ? 'neg' : ''}"><span data-fx="cash" data-roll="cash" data-val="${m.cash}" class="fx-num">${money(m.cash)}</span></b>`);
  if (m.revenue !== null) rows.push(`<span>Revenue</span><b class="pos">▲ <span data-fx="revenue" data-roll="revenue" data-val="${m.revenue}" class="fx-num">${money(m.revenue)}</span> / mo</b>`);
  rows.push(`<span>Costs</span><b>${money(m.costs)} / mo</b>`);
  if (m.revenue !== null) rows.push(`<span>Profit</span><b class="${m.profit >= 0 ? 'pos' : 'neg'}">${m.profit >= 0 ? '▲' : '▼'} ${money(m.profit)} / mo</b>`);
  if (m.runway !== null && m.runway < 600) rows.push(`<span>Runway ${q('runway')}</span><b class="${m.runway < 3 ? 'neg' : ''}">${m.runway.toFixed(m.runway < 10 ? 1 : 0)} months</b>`);
  if (m.debt !== null) rows.push(`<span>Debt</span><b class="neg">${money(m.debt)}</b>`);
  if (m.interest !== null) rows.push(`<span>Interest</span><b class="neg">▼ ${money(m.interest)} / mo</b>`);
  if (m.fees !== null) rows.push(`<span>Management fees</span><b class="neg">▼ ${money(m.fees)} / mo</b>`);
  return `<div class="card"><h4>Money</h4>${moneyChart(m.chart.rev, m.chart.cost, m.revenue !== null)}<div class="kv" style="margin-top:8px">${rows.join('')}</div></div>`;
}

// Tetromino glyphs for the bug-fix puzzle (cells on a 4×2 grid).
const CELLS: Record<string, [number, number][]> = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
};
function shapeSvg(shape: string, ghost = false): string {
  const cells = CELLS[shape] ?? CELLS.O;
  return `<svg class="tet ${ghost ? 'ghost' : ''} sh-${shape}" viewBox="0 0 40 20" aria-hidden="true">${cells.map(([x, y]) => `<rect x="${x * 10 + 0.75}" y="${y * 10 + 0.75}" width="8.5" height="8.5" rx="1.5"/>`).join('')}</svg>`;
}

function outageCard(v: View, u: UiState): string {
  if (!v.outage) return '';
  const o = v.outage;
  const code = o.lines.map(line => `<div class="cl">${line.map(seg => seg.kind === 'text'
    ? `<span>${esc(seg.text)}</span>`
    : seg.filled
      ? `<span class="slot filled sh-${seg.shape}">${shapeSvg(seg.shape)}${esc(seg.filled)}</span>`
      : `<button class="slot ${u.pick.slot === seg.slot ? 'sel' : ''}" data-ui="slot:${seg.slot}" data-key="slot-${seg.slot}" aria-label="Empty slot ${seg.slot + 1}">${shapeSvg(seg.shape, true)}</button>`).join('')}</div>`).join('');
  const tray = o.tray.map(b => `<button class="block sh-${b.shape} ${u.pick.block === b.block ? 'sel' : ''} ${b.used ? 'used' : ''}" data-ui="block:${b.block}" data-key="block-${b.block}" ${b.used ? 'disabled' : ''}>${shapeSvg(b.shape)}<code>${esc(b.label)}</code></button>`).join('');
  return `<div class="alert bug" role="alert"><div class="t">${esc(o.text)}</div>
    <div class="fine" style="margin:2px 0 8px">Growth is paused until it's fixed. Tap a block, then the slot with the same shape.</div>
    <div class="code">${code}</div>
    <div class="tray">${tray}</div>
    ${o.autoIn !== null ? `<div class="fine">Or let the Product team handle it: about ${Math.ceil(o.autoIn)}s.</div>` : ''}</div>`;
}

function inboxCard(v: View): string {
  const i = v.inbox;
  if (!i) return '';
  if (i.sold) return soldBlock('Member Support');
  return `<div class="card"><h4>Support inbox</h4>
    <div class="inbox-head"><div class="count">${fmtN(i.open)} <small>open · ${fmtN(i.perMin)} new / min</small></div>
    <button class="sbtn" ${act({ type: 'answerTicket' })} ${i.answerEnabled ? '' : 'disabled'}>Answer Ticket</button></div>
    ${i.ticket ? `<div class="ticket">"${esc(i.ticket)}"</div>` : ''}
    ${i.note ? `<div class="fine">${esc(i.note)}</div>` : ''}</div>`;
}

export function testCard(v: View): string {
  const t = v.test;
  if (!t) return '';
  return `<div class="card"><h4>New test</h4>
    <div class="test-title">${esc(t.title)}</div>
    <div class="test-from">From the Growth team</div>
    <div class="variants">
      <div class="variant"><span class="vl">A</span><div>${esc(t.a)}</div><div class="pred">Baseline</div></div>
      <div class="variant"><span class="vl">B</span><div>${esc(t.b)}</div><div class="pred pos">▲ ${esc(t.result)}</div></div>
    </div>
    <div class="btns"><button class="btn" ${act({ type: 'shipTest', variant: 'A' })}>Ship A</button><button class="btn primary" ${act({ type: 'shipTest', variant: 'B' })}>Ship B</button><button class="btn" ${act({ type: 'shipTest', variant: 'skip' })}>Skip</button></div>
  </div>`;
}

function buildCard(v: View): string {
  const b = v.build;
  if (!b) return '';
  if (b.sold) return soldBlock('The product roadmap', 'Asset sold', 220);
  if (!b.items.length) return '';
  const order = { buy: 0, poor: 1, locked: 2, owned: 3 } as const;
  const owned = b.items.filter(i => i.state === 'owned');
  const items = [...b.items].filter(i => i.state !== 'owned' || i.badge).sort((x, y) => order[x.state] - order[y.state]);
  const ownedPlain = owned.filter(i => !i.badge);
  return `<div class="card"><h4>${v.act === 3 ? 'Optimize' : v.act === 2 ? 'Grow' : 'Build'}</h4><div class="upg">${items.map(i => {
    const badge = i.badge ? `<span class="badge ${i.badge === 'KINDLY+ ONLY' ? 'plus' : i.badge === 'HONEST' ? 'honest' : 'board'}">${i.badge}</span>` : '';
    const dis = i.state !== 'buy' ? 'disabled' : '';
    return `<button class="u ${i.state}" ${act({ type: 'buyUpgrade', id: i.id })} ${dis} data-key="${i.id}"><div><b>${esc(i.name)}${i.state === 'owned' ? ' ✓' : ''} ${badge}</b><span>${esc(i.desc)}</span>${i.hint && i.state !== 'owned' ? `<span>${esc(i.hint)}</span>` : ''}</div>${i.state !== 'owned' ? `<div class="cost">${i.state === 'locked' ? 'soon' : money(i.cost)}</div>` : ''}</button>`;
  }).join('')}</div>${ownedPlain.length ? `<div class="owned-list">Shipped: ${ownedPlain.map(i => `<b>${esc(i.name)}</b>`).join(' · ')}</div>` : ''}</div>`;
}

function feedCard(v: View): string {
  const f = v.feed;
  if (!f) return '';
  if (f.sold) return soldBlock('The Kindly feed', 'Sunset', 160);
  return `<div class="card"><h4>Kindly feed</h4><div class="feed" aria-live="polite">${f.posts.map(p =>
    `<div class="post ${p.kind}" data-key="${esc(p.id + p.t)}">${avatar(p.handle, p.kind)}<p><span class="h">${p.kind === 'insider' ? esc(p.handle) : p.kind === 'biz' ? esc(p.handle) + ' · business' : '@' + esc(p.handle)}</span>${esc(p.text)}</p></div>`).join('')}</div></div>`;
}

function latestMemo(v: View): string {
  if (!v.memos.length || v.act < 2) return '';
  const m = v.memos[0];
  return `<div class="card"><h4>Latest memo</h4>${memoHtml(m)}</div>`;
}

function memoHtml(m: View['memos'][number]): string {
  return `<div class="memo ${m.tone ?? ''}" data-key="${esc(m.id)}"><div class="from">From: ${esc(m.from)}</div><div class="subj">${esc(m.subject)}</div><p>${esc(m.text)}</p></div>`;
}

function lifeSummary(v: View): string {
  if (v.act !== 4 || !v.life) return '';
  const l = v.life;
  return `<div class="card lifecard"><h4>${esc(v.header.founder)}</h4><div class="stat"><span data-fx="networth" data-roll="networth" data-val="${l.netWorth}" data-fmt="moneyFull" class="fx-num">${moneyFull(l.netWorth)}</span></div><div class="fine" style="margin:2px 0 0">net worth</div>
    ${l.earnout ? `<div class="btns"><button class="btn primary huge" ${act({ type: 'collectEarnout' })} ${l.earnout.enabled ? '' : 'disabled'}>Collect Earnout · +${money(l.earnout.available)}</button></div>` : ''}</div>`;
}

function renderHome(v: View, u: UiState): string {
  return `<main class="dash">
    <div class="col">${mainCard(v)}${healthCard(v)}${moneyCard(v)}</div>
    <div class="col">${outageCard(v, u)}${inboxCard(v)}${v.test?.where === 'home' ? testCard(v) : ''}${buildCard(v)}</div>
    <div class="col">${lifeSummary(v)}${latestMemo(v)}${feedCard(v)}</div>
  </main>`;
}

// ---------------- TEAM ----------------
function renderTeam(v: View): string {
  const t = v.team!;
  if (t.sold) return `<main class="dash two"><div class="col">${soldBlock('The Team', 'Asset sold', 260)}</div></main>`;
  const rows = t.rows.map(r => {
    const dec = [100, 10, 1].map(d => `<button class="pm minus" ${act({ type: 'assign', team: r.team, delta: -d })} ${r.dec.includes(d) ? '' : 'disabled'} aria-label="Remove ${d} from ${r.label}">−${d === 1 ? '' : d}</button>`).join('');
    const inc = [1, 10, 100].map(d => `<button class="pm" ${act({ type: 'assign', team: r.team, delta: d })} ${r.inc.includes(d) ? '' : 'disabled'} aria-label="Add ${d} to ${r.label}">+${d === 1 ? '' : d}</button>`).join('');
    return `<div class="team-row ${r.locked ? 'locked' : ''} ${r.highlight ? 'hi' : ''}" data-key="${r.team}"><span class="sw" style="background:${TEAM_COLOR[r.team]}"></span>
      <div><b>${r.label}</b><span class="eff">${r.locked ? 'Unlocks later' : esc(r.effect)}</span></div>
      <div class="stepper">${r.locked ? '' : dec}<b>${fmtN(r.count)}</b>${r.locked ? '' : inc}</div></div>`;
  }).join('');
  const total = t.headcount || 1;
  const scale = total > 240 ? Math.ceil(total / 240) : 1;
  const dots = t.rows.flatMap(r => Array.from({ length: Math.round(r.count / scale) }, () => `<i style="background:${TEAM_COLOR[r.team]}"></i>`)).join('')
    + Array.from({ length: Math.round(t.unassigned / scale) }, () => '<i class="idle"></i>').join('');
  const perks = t.perks.length ? `<div class="card"><h4>Perks</h4><div class="upg">${t.perks.map(p => `<button class="u ${p.owned ? 'owned' : p.enabled ? 'buy' : 'locked'}" ${act({ type: 'buyPerk', id: p.id })} ${p.enabled ? '' : 'disabled'}><div><b>${p.cancelled ? `<s>${esc(p.name)}</s>` : esc(p.name)}${p.owned ? ' ✓' : ''}</b><span>${esc(p.desc)} +${p.morale} morale</span>${p.cancelled ? '<span class="cuttag">cancelled — Year of Efficiency</span>' : ''}</div><div class="cost">${money(p.perHead)}/head/mo</div></button>`).join('')}
    ${t.retreat ? `<button class="u ${t.retreat.enabled ? 'buy' : 'locked'}" ${act({ type: 'retreat' })} ${t.retreat.enabled ? '' : 'disabled'}><div><b>Company retreat</b><span>${t.retreat.readyIn > 0 ? `Next retreat in ${Math.ceil(t.retreat.readyIn / 80)} months` : 'Three days, everyone, somewhere warm. +15 morale for a while'}</span></div><div class="cost">${money(t.retreat.cost)}</div></button>` : ''}</div></div>` : '';
  return `<main class="dash two">
    <div class="col"><div class="card"><h4>Team</h4>
      <div class="team-top"><div><span class="count">${fmtN(t.headcount)}</span> <span class="fine">people · ${fmtN(t.unassigned)} unassigned · payroll ${money(t.payroll)}/mo</span></div>
      <div class="btns" style="margin:0">${t.frozen ? '<span class="fine">Hiring frozen</span>' : t.hire.map(h => `<button class="sbtn small" ${act({ type: 'hire', n: h.n })} ${h.enabled ? '' : 'disabled'}>Hire ${h.n} · ${money(h.cost)}</button>`).join('')}</div></div>
      ${t.directive ? `<div class="alert" style="margin:8px 0"><div class="t">Board directive</div><div>${esc(t.directive.text)} · ${Math.ceil(t.directive.secondsLeft / 80)} months left</div></div>` : ''}
      ${rows}
      <div class="dots" aria-hidden="true">${dots}</div>
      <div class="fine">${scale > 1 ? `Each dot is ${scale} people.` : 'Each dot is a person.'} Hollow dots are unassigned.</div>
    </div></div>
    <div class="col"><div class="card"><h4>Team morale (eNPS) ${q('enps')}</h4><div class="morale"><div data-fx="morale" class="fx-num">${gauge(t.morale, -100, 100, 'Team morale', true)}</div><div class="fine" style="margin:0">Morale multiplies every team's output (0.8× to 1.2×).${t.assistant ? ' Support is handled by Kindly Assistant (AI).' : ''}</div></div></div>${perks}</div>
  </main>`;
}

// ---------------- MARKET ----------------
function renderMarket(v: View): string {
  const m = v.market!;
  if (m.sold) return `<main class="dash two"><div class="col">${soldBlock('The Market', 'Asset sold', 260)}</div></main>`;
  const seg = (share: number, label: string, color: string) => share > 0.004 ? `<i style="width:${(share * 100).toFixed(1)}%;background:${color}">${share > 0.08 ? label : ''}</i>` : '';
  const h = m.huddle;
  const huddle = h ? `<div class="card"><h4>Rival</h4><div class="rival"><div class="rlogo">h</div><div style="flex:1"><b>Huddle</b>${h.acquired ? ' <span class="fine">— acquired &amp; sunset</span>' : `<div class="fine" style="margin:0">${fmtN(h.users)} users and growing</div>`}</div></div>
    ${h.acquired ? '' : `<div class="btns"><button class="btn" ${act({ type: 'competeFeature' })} ${h.canCompete ? '' : 'disabled'}>Ship a better feature · ${money(h.competeCost)}</button>
    <button class="btn primary" ${act({ type: 'acquire', rival: 'huddle' })} ${h.canAcquire ? '' : 'disabled'}>Acquire &amp; sunset · ${money(h.price)} cash</button></div>
    <div class="fine">${h.acquireLocked ? 'Acquisitions open after the Series C.' : 'Sunsetting Huddle moves part of its users to Kindly. They\'ll have nowhere else to go.'}</div>`}</div>` : '';
  const p = m.porch;
  const porch = p ? `<div class="card"><h4>New rival</h4><div class="rival"><div class="rlogo" style="background:#2E7D6B">p</div><div style="flex:1"><b>Porch</b>${p.acquired ? ' <span class="fine">— acquired &amp; sunset</span>' : `<div class="fine" style="margin:0">Started by unhappy Kindly users · ${fmtN(p.users)} users</div>`}</div></div>
    ${p.acquired ? '' : `<div class="btns"><button class="btn primary" ${act({ type: 'acquire', rival: 'porch' })} ${p.canAcquire ? '' : 'disabled'}>Acquire &amp; sunset · ${money(p.price)} cash</button></div>`}</div>` : '';
  const biz = m.advertisers !== null ? `<div class="card"><h4>Kindly for Business</h4><div class="kv"><span>Advertisers</span><b>${fmtN(m.advertisers)}</b>${m.sellers !== null ? `<span>Sellers</span><b>${fmtN(m.sellers)}</b>` : ''}</div></div>` : '';
  return `<main class="dash two">
    <div class="col"><div class="card"><h4>Market share</h4>
      <div class="share">${seg(m.share.kindly, 'Kindly', 'var(--brand)')}${seg(m.share.huddle, 'Huddle', '#6B4FA0')}${seg(m.share.porch, 'Porch', '#2E7D6B')}</div>
      <div class="legend" style="margin-top:6px"><span><i style="border-color:var(--brand)"></i>Kindly ${pct(m.share.kindly, 0)}</span>${m.share.huddle > 0 ? `<span><i style="border-color:#6B4FA0"></i>Huddle ${pct(m.share.huddle, 0)}</span>` : ''}${m.share.porch > 0 ? `<span><i style="border-color:#2E7D6B"></i>Porch ${pct(m.share.porch, 0)}</span>` : ''}<span>Not online yet ${pct(m.share.other, 0)}</span></div>
    </div>${huddle}${porch}</div>
    <div class="col">${biz}</div>
  </main>`;
}

// ---------------- YOUR LIFE ----------------
function renderLife(v: View): string {
  const l = v.life!;
  const ladder = l.items.map(i => `<button class="u ${i.owned ? 'owned' : i.next && i.canBuy ? 'buy' : 'locked'}" ${act({ type: 'buyLifestyle', id: i.id })} ${i.next && i.canBuy ? '' : 'disabled'} data-key="${i.id}"><div><b>${esc(i.name)}${i.owned ? ' ✓' : ''}</b><span>${esc(i.perk)}</span></div>${i.owned ? '' : `<div class="cost">${i.next ? money(i.cost) : '…'}</div>`}</button>`).join('');
  const cap = l.cap;
  const rows = cap.rows.map(r => `<div class="capr"><b>${esc(r.name)}</b><span>${pct(r.pct)}</span><span>${r.seat ? 'board seat' : ''}</span>${r.repurchase ? `<button class="sbtn small ghost rp" ${act({ type: 'repurchase', investorId: r.id })} ${r.repurchase.enabled ? '' : 'disabled'}>Repurchase 1% · ${money(r.repurchase.cost)} (company cash)</button>` : ''}</div>`).join('');
  const earn = l.earnout ? `<div class="btns"><button class="btn primary huge" ${act({ type: 'collectEarnout' })} ${l.earnout.enabled ? '' : 'disabled'}>Collect Earnout · +${money(l.earnout.available)}</button></div>` : '';
  return `<main class="dash two">
    <div class="col"><div class="card ${v.act === 4 ? 'lifecard' : ''}"><h4>${esc(v.header.founder)}</h4>
      <div class="stat"><span data-fx="networth" data-roll="networth" data-val="${l.netWorth}" data-fmt="moneyFull" class="fx-num">${moneyFull(l.netWorth)}</span> <small>net worth</small></div>
      <div class="kv" style="margin-top:8px"><span>Salary</span><b>${money(l.salary)} / yr</b>${l.dividends > 0 ? `<span>Dividends received</span><b>${money(l.dividends)}</b>` : ''}</div>
      ${earn}
      <div class="ladder" style="margin-top:10px">${ladder}</div>
    </div></div>
    <div class="col"><div class="card"><h4>Cap table ${q('cap')}</h4>${rows}
      <div class="control">Founder control: ${pct(cap.control)}${cap.classB ? ' <span class="fine">(Class B shares)</span>' : cap.dualClass ? ' <span class="fine">(Class B converted)</span>' : ''}</div>
      <div class="bar fifty"><i style="width:${(cap.control * 100).toFixed(1)}%"></i></div>
    </div></div>
  </main>`;
}

// ---------------- GROWTH LAB ----------------
function renderLab(v: View): string {
  const l = v.lab!;
  if (l.sold) return `<main class="dash two"><div class="col">${soldBlock('Growth Lab', 'Asset sold', 260)}</div></main>`;
  const levers = l.levers.map(x => `<div class="lever ${x.locked ? 'locked' : ''}" data-key="${x.id}">
    <div class="lv-head"><b>${esc(x.name)} ${x.boardSet ? '<span class="boardset">BOARD-SET</span>' : ''}</b><span class="val">${esc(x.labels[x.current])}</span></div>
    <div class="steps" style="--n:${x.labels.length}">${x.labels.map((lab, i) => `<button class="${i === x.current ? 'on' : ''}" ${act({ type: 'setLever', lever: x.id as never, step: i })} ${x.locked || x.boardSet || i === x.current ? 'disabled' : ''}>${esc(lab)}</button>`).join('')}</div>
    <div class="fx"><span class="now">▲ ${esc(x.now)}</span><span class="later">${esc(x.later)}</span></div>
    ${x.locked ? '<div class="fine">Locked</div>' : ''}</div>`).join('');
  const hist = l.history.length ? `<div class="card"><h4>Shipped tests</h4><ul class="hist">${l.history.map(h => `<li class="${h.dark ? '' : 'old'}"><span>${esc(h.title)}</span><span>${h.variant === 'skip' ? 'skipped' : 'shipped ' + h.variant}</span></li>`).join('')}</ul></div>` : '';
  return `<main class="dash two">
    <div class="col"><div class="card"><h4>Levers</h4>${levers}</div></div>
    <div class="col">${v.test?.where === 'lab' ? testCard(v) : '<div class="card"><h4>Tests</h4><div class="fine">The Growth team is preparing the next test.</div></div>'}${hist}</div>
  </main>`;
}

// ---------------- BOARD ROOM ----------------
function renderBoard(v: View): string {
  const b = v.boardroom!;
  if (b.sold) return `<main class="dash two"><div class="col">${soldBlock('The Board Room', 'Asset sold', 260)}</div></main>`;
  const memos = v.memos.map(memoHtml).join('');
  return `<main class="dash two">
    <div class="col"><div class="card"><h4>Board satisfaction ${q('board')}</h4>${b.board !== null ? `<div data-fx="board" class="fx-num">${gauge(b.board, 0, 100, 'Board satisfaction')}</div>` : ''}
      <div class="kv" style="margin-top:8px"><span>This quarter's target</span><b>${money(b.quota)} / mo</b><span>Revenue now</span><b class="${b.revenue >= b.quota ? 'pos' : 'neg'}">${money(b.revenue)} / mo</b>${b.interventions ? `<span>Initiatives approved on your behalf</span><b>${b.interventions}</b>` : ''}</div></div>
      ${v.act === 3 ? `<div class="card"><h4>Return capital</h4><div class="fine" style="margin:0 0 8px">A special dividend pays out half of Kindly's spare cash to shareholders. The board loves them.</div>
        <button class="btn primary" ${act({ type: 'dividend' })} ${b.dividend.enabled ? '' : 'disabled'} style="width:100%">Special dividend · ${money(b.dividend.amount)} · you receive ${money(b.dividend.founderShare)}</button></div>` : ''}
      <div class="card"><h4>Board seats</h4>${b.seats.map(s => `<div class="seat"><b>${esc(s.name)}</b></div>`).join('')}</div>
    </div>
    <div class="col"><div class="card"><h4>Memos</h4>${memos || '<div class="fine">No memos yet.</div>'}</div></div>
  </main>`;
}

// ---------------- MODALS ----------------
export function renderModal(m: ModalView): string {
  let body = '';
  switch (m.kind) {
    case 'termSheet':
      body = `<div class="kicker">Term sheet</div><h3>🎉 ${esc(m.round)}: ${moneyFull(m.amount)}</h3>
        <p class="lede">${esc(m.investor)} is excited to partner with Kindly!</p>
        <div class="kv"><span>Investor stake</span><b>${pct(m.stake)}</b><span>Board seat</span><b>${m.seat ? '1 (' + esc(m.investor) + ')' : 'Observer only'}</b><span>Founder control after</span><b>${pct(m.controlBefore)} → ${pct(m.controlAfter)}</b></div>
        <div class="btns"><button class="btn primary huge" ${act({ type: 'acceptRound' })}>Accept</button></div>
        ${m.canAmend ? `<div style="text-align:center;margin-top:10px"><button class="quiet" ${act({ type: 'toggleAmendments' })}>${m.showAmend ? 'Hide changes' : 'Propose changes'}</button></div>` : ''}
        ${m.showAmend ? `<div class="amend"><div class="ah">Request one amendment</div>${m.amendments.map(a => `<button class="radio ${a.chosen ? 'sel' : ''} ${a.id === 'dualclass' ? 'legal' : ''}" ${act({ type: 'chooseAmendment', id: a.chosen ? null : a.id })}><span class="o"></span><span>${esc(a.label)}${a.detail ? `<span class="d">${esc(a.detail)}</span>` : ''}</span></button>`).join('')}<div class="fine">Pebble Ventures will consider one change. Accept to sign.</div></div>` : ''}`;
      break;
    case 'secondary':
      body = `<h3>You've earned it 🥂</h3><p class="lede">An early investor would like to buy ${pct(m.pct, 0)} of your shares.</p>
        <div class="kv"><span>You receive</span><b class="pos">${moneyFull(m.amount)}</b><span>Founder control</span><b>${pct(m.controlBefore)} → ${pct(m.controlAfter)}</b></div>
        ${m.unlocks.length ? `<div class="fine" style="margin-top:10px">This puts within reach:</div><ul class="unlocks">${m.unlocks.map(u => `<li><b>${esc(u.name)}</b> <span class="eff">— ${esc(u.perk)}</span></li>`).join('')}</ul>` : ''}
        <div class="btns"><button class="btn primary" ${act({ type: 'secondary', accept: true })}>Sell</button><button class="btn" ${act({ type: 'secondary', accept: false })}>Maybe later</button></div>`;
      break;
    case 'bridge':
      body = `<div class="kicker">Runway</div><h3>Can we make payroll?</h3><p class="lede">Kindly is about to run out of money. Pebble Ventures offers a bridge note to get you to the next round.</p>
        <div class="kv"><span>Bridge</span><b class="pos">${moneyFull(m.amount)}</b><span>Cost</span><b>3% of the company</b></div>
        <div class="btns"><button class="btn primary" ${act({ type: 'bridge', accept: true })}>Take the bridge</button><button class="btn" ${act({ type: 'bridge', accept: false })}>We'll manage</button></div>`;
      break;
    case 'event':
      body = `<div class="kicker">Decision</div><h3>${esc(m.title)}</h3><p class="lede">${esc(m.text)}</p>
        ${m.options.map((o, i) => `<button class="choice" ${act({ type: 'chooseEvent', option: i })}><b>${esc(o.label)}</b><span class="tr">${esc(o.detail)}</span></button>`).join('')}`;
      break;
    case 'buyout':
      if (m.stage === 'offer') {
        body = `<div class="kicker">Confidential</div><h3>Ashgrove Equity Partners</h3><p class="lede">Ashgrove would like to acquire Kindly, Inc. and take it private.${m.refusals ? ' They have raised their offer.' : ''}</p>
          <div class="kv"><span>Enterprise value</span><b>${money(m.ev)}</b><span>Financed with debt (placed on Kindly)</span><b>${money(m.debt)}</b><span>Your payout</span><b class="pos">${money(m.payout)}</b><span>Your control</span><b>${pct(m.control)}</b></div>
          <div class="btns"><button class="btn primary" ${act({ type: 'buyout', choice: 'accept' })}>Accept</button><button class="btn" ${act({ type: 'buyout', choice: 'refuse' })}>Refuse</button></div>
          ${m.trust ? `<div class="btns"><button class="btn trust" ${act({ type: 'buyout', choice: 'trust' })}>Transfer Kindly to a Members' Trust</button></div>` : ''}`;
      } else {
        body = `<div class="kicker">${m.stage === 'vote' ? 'Board vote' : 'Ashgrove Equity Partners'}</div><h3>${m.stage === 'vote' ? 'The board has voted.' : 'Ashgrove walks away.'}</h3><p class="lede">${esc(m.voteText ?? '')}</p>
          <div class="btns"><button class="btn primary" ${act({ type: 'continue' })}>Continue</button></div>`;
      }
      break;
  }
  return `<div class="overlay" role="dialog" aria-modal="true"><div class="modal">${body}</div></div>`;
}

// ---------------- ENDING ----------------
export function endingsTracker(found: string[], current: string | null): string {
  const n = ENDING_LIST.filter(e => found.includes(e.id)).length;
  return `<section class="endings" aria-label="Endings found">
    <div class="endings-head">Endings found: <b>${n} of ${ENDING_LIST.length}</b></div>
    <div class="endings-row">${ENDING_LIST.map(e => {
      const got = found.includes(e.id);
      return `<div class="ending-card ${got ? 'got' : ''} ${e.id === current ? 'now' : ''}">
        <div class="en">${got ? esc(e.name) : '???'}</div>
        <div class="eh">${got ? (e.id === current ? 'This ending' : 'Found') : esc(e.hint)}</div>
      </div>`;
    }).join('')}</div>
  </section>`;
}

export function renderEnding(v: View, found: string[] = []): string {
  const e = v.ending!;
  const stats = e.stats ? `<p class="fine" style="margin-top:26px">Peak users ${fmtN(e.stats.peakUsers)} · Peak staff ${e.stats.peakStaff.toLocaleString('en-US')} · Laid off ${e.stats.laidOff.toLocaleString('en-US')} · Time played ${clock(e.stats.time)}</p>` : '';
  return `<div class="center-screen ending"><div style="max-width:880px;width:100%">
    <div class="logo" style="justify-content:center;margin-bottom:22px"><div class="mark">k</div>kindly</div>
    ${e.title ? `<h2 style="font-size:24px;margin-bottom:10px">${esc(e.title)}</h2>` : ''}
    <p class="fine" style="text-transform:uppercase;letter-spacing:.12em">${esc(v.header.founder)} · net worth</p>
    <div class="networth">${moneyFull(e.netWorth)}</div>
    ${e.owned.length ? `<div class="chips" style="justify-content:center">${e.owned.map(o => `<span>${esc(o)}</span>`).join('')}</div>` : ''}
    <div class="lines">${e.lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>
    <div class="ending-post fadein"><div class="post">${avatar(e.lastPost.handle, 'user')}<p><span class="h">@${esc(e.lastPost.handle)} · last post</span>${esc(e.lastPost.text)}</p></div></div>
    ${frontPage(e)}
    ${stats}
    ${endingsTracker(found, e.id)}
    ${e.continues ? `<div class="btns" style="justify-content:center"><button class="btn primary" ${ui('trust-continue')} style="max-width:260px">Keep going</button></div>` : ''}
  </div></div>`;
}

// The final front page: a lead story across the top, the rest in columns.
function frontPage(e: NonNullable<View['ending']>): string {
  if (!e.articles.length) return '';
  const [lead, ...rest] = e.articles;
  const story = (a: typeof lead, cls: string) => `<article class="${cls}${a.section === 'Opinion' ? ' opinion' : ''}${a.disclosure ? ' owned' : ''}">
      <div class="outlet">${esc(a.outlet)} <span>· ${esc(a.section)}</span></div>
      <h3>${esc(a.headline)}</h3>
      <p class="deck">${esc(a.deck)}</p>
      ${a.byline ? `<p class="byline">${esc(a.byline)}</p>` : ''}
      ${a.disclosure ? `<p class="disclosure">Disclosure: ${esc(a.disclosure)}</p>` : ''}
    </article>`;
  return `<section class="paper fadein" aria-label="News coverage">
    <div class="paper-head"><span>In the news</span><span>${esc(e.dateline)}</span></div>
    ${story(lead, 'lead')}
    ${rest.length ? `<div class="paper-cols" style="--cols:${Math.min(rest.length, 4)}">${rest.map(a => story(a, 'story')).join('')}</div>` : ''}
  </section>`;
}

export function renderPopup(v: View, id: string): string {
  const p = v.popups.find(x => x.id === id);
  if (!p) return '';
  return `<div class="overlay" ${ui('close-popup')}><div class="modal" role="dialog" aria-modal="true"><h3>${esc(p.title)}</h3><p style="margin-top:8px">${esc(p.text)}</p><div class="btns"><button class="btn primary" ${ui('close-popup')}>Got it</button></div></div></div>`;
}

export function renderTab(v: View, tab: TabId, u: UiState): string {
  const ok = v.tabs.some(t => t.id === tab && !t.sold);
  switch (ok ? tab : 'home') {
    case 'team': return renderTeam(v);
    case 'market': return renderMarket(v);
    case 'life': return renderLife(v);
    case 'lab': return renderLab(v);
    case 'board': return renderBoard(v);
    default: return renderHome(v, u);
  }
}

export { signed };
