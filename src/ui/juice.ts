// Feedback effects ("juice"): number pops, floating +n, rolling counters, bursts and banners.
// The intensity follows the story: gentle in Act 1, casino in Act 2, muted in Act 3, gone in Act 4
// (except Collect Earnout, which gets everything). Respects prefers-reduced-motion.
import type { View } from '../api/view';
import type { Action } from '../engine/types';
import { fmtN, money, moneyFull, rate } from './format';
import * as sound from './sound';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
let layer: HTMLElement | null = null;
let active = 0;

function fxLayer(): HTMLElement {
  if (!layer || !layer.isConnected) {
    layer = document.createElement('div');
    layer.className = 'fx-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }
  return layer;
}

type Mood = 'soft' | 'casino' | 'mute' | 'off';
function mood(act: number): Mood {
  if (act === 2) return 'casino';
  if (act === 3) return 'mute';
  if (act === 4) return 'off';
  return 'soft';
}

function anchor(key: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-fx="${key}"]`);
}

function centerOf(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

// ---------------- primitives ----------------
export function floatText(x: number, y: number, text: string, cls = '', size = 1): void {
  if (reduced() || active > 40) return;
  const el = document.createElement('div');
  el.className = 'fx-float ' + cls;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.setProperty('--s', String(size));
  el.style.setProperty('--dx', ((Math.random() - 0.5) * 30).toFixed(0) + 'px');
  active++;
  el.addEventListener('animationend', () => { el.remove(); active--; }, { once: true });
  fxLayer().appendChild(el);
}

export function bounce(el: Element | null, cls = 'fx-bounce'): void {
  if (!el || reduced()) return;
  const classes = cls.split(' ');
  el.classList.remove(...classes);
  void (el as HTMLElement).offsetWidth;   // restart the animation
  el.classList.add(...classes);
  el.addEventListener('animationend', () => el.classList.remove(...classes), { once: true });
}

function burst(x: number, y: number, count: number, chars: string[], cls: string, spread = 90, rise = 60): void {
  if (reduced()) return;
  for (let i = 0; i < count; i++) {
    if (active > 80) return;
    const p = document.createElement('div');
    p.className = 'fx-p ' + cls;
    p.textContent = chars[i % chars.length];
    const ang = Math.random() * Math.PI * 2;
    const dist = spread * (0.4 + Math.random() * 0.6);
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(0) + 'px');
    p.style.setProperty('--dy', (Math.sin(ang) * dist - rise).toFixed(0) + 'px');
    p.style.setProperty('--r', ((Math.random() - 0.5) * 540).toFixed(0) + 'deg');
    p.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
    active++;
    p.addEventListener('animationend', () => { p.remove(); active--; }, { once: true });
    fxLayer().appendChild(p);
  }
}

function banner(text: string, cls: string, near?: Element | null): void {
  if (reduced()) return;
  const el = document.createElement('div');
  el.className = 'fx-banner ' + cls;
  el.textContent = text;
  if (near) {
    const c = centerOf(near);
    el.style.left = c.x + 'px';
    el.style.top = c.y + 'px';
  } else {
    el.style.left = '50%';
    el.style.top = '38%';
  }
  el.addEventListener('animationend', () => el.remove(), { once: true });
  fxLayer().appendChild(el);
}

// ---------------- stat changes caused by the player ----------------
interface Snap { perSec: number; revenue: number; cash: number; board: number | null; users: number; paid: number; netWorth: number; morale: number | null; staff: number | null }

function snap(v: View): Snap {
  return {
    perSec: v.main.perSec, revenue: v.money?.revenue ?? 0, cash: v.money?.cash ?? 0,
    board: v.boardroom?.board ?? v.health?.board ?? null, users: v.main.users, paid: v.main.paid ?? 0,
    netWorth: v.life?.netWorth ?? 0, morale: v.team?.morale ?? null, staff: v.team?.headcount ?? null,
  };
}

interface Pending { action: Action; before: Snap; act: number; x: number; y: number; frames: number; label: string | null }
let pending: Pending | null = null;

/** Call just before a player action is applied. */
export function beforeAction(action: Action, v: View, x: number, y: number, label: string | null): void {
  pending = { action, before: snap(v), act: v.act, x, y, frames: 0, label };
}

/** Immediate feedback for an action that succeeded (the button the player pressed). */
export function onAction(action: Action, v: View, x: number, y: number, label: string | null): void {
  const m = mood(v.act);
  if (action.type === 'collectEarnout') { earnoutShower(x, y, label); return; }
  if (m === 'off') return;
  switch (action.type) {
    case 'click': {
      const btn = anchor('mainbtn');
      bounce(btn, 'fx-squish');
      floatText(x, y - 14, label ?? '+1', `click ${m}`, m === 'casino' ? 1.15 : 1);
      if (m === 'casino' && Math.random() < 0.08) burst(x, y, 4, ['✦', '★'], 'gold', 50, 40);
      break;
    }
    case 'buyUpgrade':
    case 'buyPerk':
      floatText(x, y, 'SHIPPED ✓', `big ${m}`, m === 'casino' ? 1.5 : 1.2);
      burst(x, y, m === 'casino' ? 14 : 8, m === 'casino' ? ['$', '✦', '★'] : ['✦', '•'], m === 'casino' ? 'gold' : m, 70, 30);
      break;
    case 'shipTest':
      if (action.variant === 'B' && label) floatText(x, y, label, `big ${m}`, 1.2);
      else floatText(x, y, action.variant === 'skip' ? 'skipped' : 'shipped A', 'mute', 0.9);
      break;
    case 'hire':
      floatText(x, y, `+${action.n} ${action.n === 1 ? 'person' : 'people'}`, m, 1);
      break;
    case 'buyLifestyle':
      floatText(x, y, label ?? '✓', `big ${m === 'casino' ? 'casino' : 'soft'}`, 1.2);
      burst(x, y, 10, ['✦', '★'], 'gold', 70, 30);
      break;
    case 'dividend':
    case 'acquire':
      floatText(x, y, label ?? '✓', `big ${m}`, 1.4);
      burst(x, y, 12, ['$', '✦'], m === 'mute' ? 'mute' : 'gold', 80, 30);
      break;
    case 'answerTicket':
      floatText(x, y, '✓', 'soft', 0.8);
      break;
    case 'fixBug':
      floatText(x, y, '🔧', 'soft', 0.9);
      break;
    case 'acceptRound':
      sound.coin();
      break;
  }
}

/** Called every rendered frame. Compares stats a couple of frames after an action and pops what changed. */
export function frame(v: View): void {
  milestones(v);
  targets(v);
  if (!pending) return;
  pending.frames++;
  if (pending.frames < 3) return;
  const p = pending;
  pending = null;
  const m = mood(v.act);
  if (m === 'off') return;
  const a = snap(v), b = p.before;
  const pops: { key: string; text: string }[] = [];
  const rel = (x: number, y: number) => (Math.abs(y) > 1e-9 ? (x - y) / Math.abs(y) : x > y ? 1 : 0);
  if (a.perSec - b.perSec > 0.05 && rel(a.perSec, b.perSec) > 0.004 && p.action.type !== 'click') pops.push({ key: 'persec', text: `+${rate(a.perSec - b.perSec)}/sec` });
  if (a.revenue - b.revenue > 1 && rel(a.revenue, b.revenue) > 0.003) pops.push({ key: 'revenue', text: `+${money(a.revenue - b.revenue)}/mo` });
  if (a.board !== null && b.board !== null && a.board - b.board >= 1) pops.push({ key: 'board', text: `+${Math.round(a.board - b.board)}` });
  if (a.morale !== null && b.morale !== null && a.morale - b.morale >= 2) pops.push({ key: 'morale', text: `+${Math.round(a.morale - b.morale)}` });
  if (a.users - b.users > 1e5 && p.action.type !== 'click') pops.push({ key: 'users', text: `+${fmtN(a.users - b.users)}` });
  if (a.cash - b.cash > Math.max(1e5, Math.abs(b.cash) * 0.2)) pops.push({ key: 'cash', text: `+${money(a.cash - b.cash)}` });
  if (a.netWorth - b.netWorth > Math.max(1e5, b.netWorth * 0.05)) pops.push({ key: 'networth', text: `+${money(a.netWorth - b.netWorth)}` });
  let i = 0;
  for (const pop of pops) {
    const el = anchor(pop.key);
    // If the number isn't on this tab, float the change from where the player clicked.
    if (el) bounce(el, m === 'casino' ? 'fx-bounce fx-big' : 'fx-bounce');
    const c = el ? centerOf(el) : { x: p.x - 40, y: p.y - 30 - i * 26 };
    const casinoMoney = m === 'casino' && (pop.key === 'revenue' || pop.key === 'cash');
    setTimeout(() => floatText(c.x + 40, c.y - 6, pop.text, `big ${casinoMoney ? 'gold' : m}`, casinoMoney ? 1.6 : m === 'casino' ? 1.35 : 1.15), i++ * 120);
    if (casinoMoney) burst(c.x, c.y, 10, ['$', '¢', '✦'], 'gold', 70, 20);
  }
  // A lever that pays off in Act 2 hits the jackpot.
  if (m === 'casino' && p.action.type === 'setLever' && a.revenue - b.revenue > 0) {
    banner(`JACKPOT +${money(a.revenue - b.revenue)}/mo`, 'gold', anchor('revenue') ?? null);
    sound.coin();
  }
}

// ---------------- milestones and board targets ----------------
const MILESTONES = [1e3, 1e4, 1e5, 1e6, 1e7, 5e7];
let lastUsers: number | null = null;
function milestones(v: View): void {
  const u = v.main.users;
  // Only celebrate a milestone crossed naturally (a jump past several at once is a load or a debug skip).
  const crossed = lastUsers === null ? [] : MILESTONES.filter(m => lastUsers! < m && u >= m);
  if (crossed.length === 1 && mood(v.act) !== 'off') {
    for (const m of crossed) {
      {
        const el = anchor('users');
        if (el) {
          const c = centerOf(el);
          bounce(el, 'fx-bounce fx-big');
          burst(c.x, c.y, mood(v.act) === 'casino' ? 26 : 18, ['✦', '★', '•', '✿'], mood(v.act) === 'mute' ? 'mute' : 'confetti', 130, 40);
          floatText(c.x, c.y - 30, `${m.toLocaleString('en-US')} ${v.act === 5 ? 'members' : 'users'}!`, `big ${mood(v.act)}`, 1.5);
          sound.ding(v.act);
        }
      }
    }
  }
  lastUsers = u;
}

let lastQuota: number | null = null;
let lastRevenue = 0;
function targets(v: View): void {
  const b = v.boardroom;
  if (!b) { lastQuota = null; return; }
  if (lastQuota !== null && b.quota > lastQuota * 1.001 && lastRevenue >= lastQuota && mood(v.act) !== 'off') {
    const el = anchor('board');
    bounce(el, 'fx-bounce fx-big');
    banner('TARGET MET ✓', mood(v.act) === 'casino' ? 'gold' : 'good', el);
  }
  lastQuota = b.quota;
  lastRevenue = b.revenue;
}

/** A block snapped into a slot of the bug-fix puzzle. */
export function onPlaced(x: number, y: number, act: number, fixed: boolean): void {
  const m = mood(act);
  if (m === 'off') return;
  burst(x, y, fixed ? 16 : 6, fixed ? ['✦', '★', '✓'] : ['✦'], m === 'casino' ? 'gold' : m === 'mute' ? 'mute' : 'soft', fixed ? 90 : 40, 10);
  if (fixed) { floatText(x, y - 10, 'FIXED ✓', `big ${m}`, 1.4); sound.ding(act); }
}

/** A tab appeared: make sure the player sees it. */
export function tabUnlocked(id: string, label: string, act: number): void {
  const el = document.querySelector<HTMLElement>(`.tabs [data-tab="${id}"]`);
  if (!el) return;
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
  if (mood(act) === 'off') return;
  setTimeout(() => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    burst(x, y, 18, ['✦', '★', '•', '✿'], mood(act) === 'mute' ? 'mute' : 'confetti', 80, 10);
    floatText(x, r.bottom + 26, `New: ${label}`, `big ${mood(act)}`, 1.1);
  }, 250);
  sound.ding(act);
}

export function resetTracking(): void {
  lastUsers = null; lastQuota = null; pending = null; rolls.clear();
}

// ---------------- the one thing still shiny in Act 4 ----------------
function earnoutShower(x: number, y: number, label: string | null): void {
  floatText(x, y - 20, label ?? '', 'big gold', 2);
  burst(x, y, 36, ['$', '$', '¢', '✦', '★'], 'gold', 160, 80);
  bounce(anchor('networth'), 'fx-bounce fx-big');
  sound.coin();
  setTimeout(() => sound.coin(), 120);
}

// ---------------- rolling numbers ----------------
interface Roll { from: number; to: number; start: number; shown: number }
const rolls = new Map<string, Roll>();
const ROLL_MS = 900;

function format(kind: string, n: number): string {
  if (kind === 'whole') return Math.floor(n).toLocaleString('en-US');
  if (kind === 'moneyFull') return moneyFull(n);
  return money(n);
}

/** Smoothly count up/down numbers marked with data-roll when they jump. Call after every render. */
export function applyRolls(root: ParentNode): void {
  const now = performance.now();
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-roll]'))) {
    const key = el.dataset.roll!;
    const target = Number(el.dataset.val);
    const kind = el.dataset.fmt ?? 'money';
    let r = rolls.get(key);
    if (!r || reduced()) { rolls.set(key, { from: target, to: target, start: now, shown: target }); continue; }
    if (target !== r.to) {
      const rolling = now - r.start < ROLL_MS;
      if (rolling) {
        r.to = target;                       // keep the roll going, aimed at the new value
      } else {
        const jump = Math.abs(target - r.to);
        const big = jump > Math.max(Math.abs(r.to) * 0.05, kind === 'whole' ? 500 : 50e3);
        r = big ? { from: r.to, to: target, start: now, shown: r.to } : { from: target, to: target, start: now - ROLL_MS, shown: target };
        rolls.set(key, r);
      }
    }
    const t = Math.min(1, (now - r.start) / ROLL_MS);
    const e = 1 - Math.pow(1 - t, 3);
    r.shown = r.from + (r.to - r.from) * e;
    const text = format(kind, t >= 1 ? r.to : r.shown);
    if (el.textContent !== text) el.textContent = text;
  }
}
