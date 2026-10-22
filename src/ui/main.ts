import './theme.css';
import { FOUNDER_NAMES } from '../content/misc';
import { createGame, type Game } from '../api/player';
import type { View } from '../api/view';
import type { Action, TabId } from '../engine/types';
import { addEnding, clearSave, decode, encode, loadEndings, loadGame, loadSettings, saveGame, saveSettings } from '../save';
import { ENDING_LIST } from '../content/misc';
import { esc, fmtN, money } from './format';
import { morphInto } from './morph';
import { renderEnding, renderModal, renderPopup, renderTab, renderTabs, renderTicker, renderTopbar, type UiState } from './render';
import * as sound from './sound';
import * as juice from './juice';
import { createBot } from '../../sim/bots';

const root = document.getElementById('app')!;
const DEBUG = new URLSearchParams(location.search).has('debug');

let game: Game | null = null;
const uiState: UiState = { tab: 'home', pick: { block: null, slot: null }, popup: null, settings: false, trustDismissed: false };
let speed = 1;
let lastFrame = performance.now();
let lastRender = 0;
let lastSave = performance.now();
let lastBeats = 0;
let knownTabs: Set<string> | null = null;
let settings = loadSettings();
sound.setSound(settings.sound);

// ---------------- screens ----------------
function titleScreen(): void {
  setPalette('act1');
  const saved = loadGame();
  root.innerHTML = `<div class="center-screen"><div>
    <div class="title-logo"><div class="mark">k</div>kindly</div>
    <p style="font-size:18px;color:var(--muted);margin-top:8px">Build something people love.</p>
    <div class="btns" style="justify-content:center;margin-top:26px">
      <button class="btn primary huge" id="start" style="flex:none;min-width:200px">Start a company</button>
      ${saved.kind === 'ok' ? '<button class="btn huge" id="continue" style="flex:none;min-width:160px">Continue</button>' : ''}
    </div>
    ${saved.kind === 'incompatible' ? `<p class="fine" style="margin-top:12px">${esc(saved.reason)} Starting fresh is the only option.</p>` : ''}
    <p class="fine" style="margin-top:18px">Saves automatically · <button class="quiet" id="snd">Sound: ${settings.sound ? 'on' : 'off'}</button>${loadEndings().length ? ` · Endings found: ${loadEndings().length} of ${ENDING_LIST.length}` : ''}</p>
  </div></div>`;
  root.querySelector('#start')!.addEventListener('click', () => {
    if (saved.kind === 'ok' && !confirm('Start a new company? Your saved game will be replaced.')) return;
    incorporationScreen();
  });
  root.querySelector('#continue')?.addEventListener('click', () => { if (saved.kind === 'ok') startGame(createGame({ state: saved.save.state })); });
  root.querySelector('#snd')!.addEventListener('click', () => { toggleSound(); titleScreen(); });
}

function incorporationScreen(): void {
  let name = FOUNDER_NAMES[Math.floor(Math.random() * FOUNDER_NAMES.length)];
  root.innerHTML = `<div class="center-screen"><form class="form" id="inc">
    <div class="logo" style="margin-bottom:10px"><div class="mark">k</div>kindly</div>
    <p style="font-weight:800;font-size:16px">Certificate of Incorporation</p>
    <p class="fine" style="margin-bottom:12px">Kindly, Inc. · A Delaware corporation</p>
    <label class="lab" for="fname">Founder name</label>
    <div class="field"><input id="fname" maxlength="40" autocomplete="off" value="${esc(name)}"><button type="button" class="quiet" id="reroll">↻ random</button></div>
    <div class="lab">Mission</div>
    <div class="field" style="font-weight:600">Help people stay close to the people they love.</div>
    <div class="lab">Founder shares</div>
    <div class="field" style="font-weight:600">10,000,000 (100%)</div>
    <button class="btn primary huge" style="width:100%" type="submit">Sign &amp; incorporate</button>
  </form></div>`;
  const input = root.querySelector<HTMLInputElement>('#fname')!;
  root.querySelector('#reroll')!.addEventListener('click', () => { name = FOUNDER_NAMES[Math.floor(Math.random() * FOUNDER_NAMES.length)]; input.value = name; });
  root.querySelector('#inc')!.addEventListener('submit', e => {
    e.preventDefault();
    clearSave();
    startGame(createGame({ seed: Math.floor(Math.random() * 2 ** 31), founderName: input.value.trim() || name }));
  });
  input.focus(); input.select();
}

function startGame(g: Game): void {
  game = g;
  juice.resetTracking();
  knownTabs = null;
  uiState.tab = 'home';
  root.innerHTML = '<div id="top"></div><div id="tabs"></div><div id="body"></div><div id="ticker"></div><div id="layer"></div><div id="panel"></div><div id="debug"></div>';
  lastFrame = performance.now();
  lastBeats = Object.keys(g.debugState().beats).length;
  saveGame(g.debugState());
  requestAnimationFrame(frame);
}

// ---------------- loop ----------------
function frame(now: number): void {
  if (!game) return;
  const dt = Math.min(0.5, (now - lastFrame) / 1000);
  lastFrame = now;
  if (!document.hidden) game.advance(dt * speed);
  if (now - lastRender > 100) { lastRender = now; render(); }
  if (now - lastSave > 10_000) { lastSave = now; saveGame(game.debugState()); }
  requestAnimationFrame(frame);
}

function setPalette(cls: string): void {
  if (document.body.className !== cls) document.body.className = cls;
}

function render(): void {
  if (!game) return;
  const v: View = game.observe();
  setPalette(v.palette === 'red' ? 'act2' : v.palette === 'gray' ? 'act3' : v.palette === 'mono' ? 'act4' : 'act1');
  const beats = Object.keys(game.debugState().beats).length;
  if (beats > lastBeats) { lastBeats = beats; sound.ding(v.act); }

  const showEnding = v.ending && !(v.ending.continues && uiState.trustDismissed);
  const body = root.querySelector('#body')!;
  if (showEnding) {
    morphInto(root.querySelector('#top')!, '');
    morphInto(root.querySelector('#tabs')!, '');
    morphInto(body, renderEnding(v, addEnding(v.ending!.id)));
    morphInto(root.querySelector('#ticker')!, '');
    morphInto(root.querySelector('#layer')!, '');
    renderPanels(v);
    return;
  }
  if (!v.tabs.some(t => t.id === uiState.tab && !t.sold)) uiState.tab = 'home';
  morphInto(root.querySelector('#top')!, renderTopbar(v, uiState));
  morphInto(root.querySelector('#tabs')!, renderTabs(v, uiState));
  const newTabs = knownTabs ? v.tabs.filter(t => !knownTabs!.has(t.id)) : [];
  knownTabs = new Set(v.tabs.map(t => t.id));
  for (const t of newTabs) juice.tabUnlocked(t.id, t.label, v.act);
  if (!v.outage) uiState.pick = { block: null, slot: null };
  morphInto(body, renderTab(v, uiState.tab, uiState));
  morphInto(root.querySelector('#ticker')!, renderTicker(v));
  morphInto(root.querySelector('#layer')!, v.modal ? renderModal(v.modal) : uiState.popup ? renderPopup(v, uiState.popup) : '');
  renderPanels(v);
  juice.applyRolls(root);
  juice.frame(v);
}

function renderPanels(v: View): void {
  const panel = root.querySelector('#panel');
  if (panel) morphInto(panel, uiState.settings ? `<div class="panel" role="dialog" aria-label="Settings">
    <b>Settings</b>
    <button class="btn" data-ui="sound">Sound: ${settings.sound ? 'on' : 'off'}</button>
    <button class="btn" data-ui="clicks" ${settings.sound ? '' : 'disabled'}>Click sounds: ${settings.clicks ? 'on' : 'off'}</button>
    <button class="btn" data-ui="export">Copy save to clipboard</button>
    <textarea id="importbox" placeholder="Paste a save here to import"></textarea>
    <button class="btn" data-ui="import">Import save</button>
    <button class="btn" data-ui="reset">Reset game</button>
    <button class="btn primary" data-ui="settings">Close</button>
  </div>` : '');
  const dbg = root.querySelector('#debug');
  if (dbg && DEBUG && game) {
    const s = game.debugState();
    morphInto(dbg, `<div class="debug">
      <div>t=${Math.round(s.t)}s act=${s.act} speed=${[1, 10, 100].map(x => `<button class="${speed === x ? 'on' : ''}" data-ui="speed:${x}">×${x}</button>`).join('')}</div>
      <div>jump: ${[['Seed', 'seed'], ['Series A', 'seriesA'], ['Act 2', 'act2'], ['Act 3', 'act3'], ['Buyout', 'buyoutOffer'], ['Act 4', 'act4']].map(([l, k]) => `<button data-ui="jump:${k}">${l}</button>`).join('')}<button data-ui="hidden">New game: hidden path → Trust</button></div>
      <div>NPS ${s.nps.toFixed(1)} → ${s.npsTarget.toFixed(1)} · board ${s.board?.toFixed(0) ?? '-'} · votes ${(v.life?.cap.control ?? 1).toFixed(3)}</div>
      <div>founder ${(s.cap.founder * 100).toFixed(1)}% · dual ${s.cap.dualClass} · interventions ${s.interventions} · tickets ${s.tickets.toFixed(0)}</div>
    </div>`);
  }
}

// ---------------- input ----------------
function doAction(a: Action, x = innerWidth / 2, y = innerHeight / 2, el?: HTMLElement): void {
  if (!game) return;
  const before = game.observe();
  const label = actionLabel(a, before, el);
  juice.beforeAction(a, before, x, y, label);
  const r = game.act(a);
  if (r.ok) {
    if (a.type === 'click' && settings.clicks) sound.click();
    render();
    juice.onAction(a, before, x, y, label);
  }
}

// Bug-fix puzzle: try a block in a slot. Wrong ones shake and bounce back.
function tryPlace(block: number, slot: number): void {
  if (!game) return;
  const slotEl = root.querySelector<HTMLElement>(`[data-key="slot-${slot}"]`);
  const blockEl = root.querySelector<HTMLElement>(`[data-key="block-${block}"]`);
  const r = (slotEl ?? blockEl)?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top + r.height / 2 : innerHeight / 2;
  const before = game.observe();
  const res = game.act({ type: 'fixBug', block, slot });
  if (!res.ok) { juice.bounce(slotEl, 'fx-shake'); juice.bounce(blockEl, 'fx-shake'); sound.thud(); render(); return; }
  sound.click();
  render();
  juice.onPlaced(x, y, before.act, !game.observe().outage);
}

// The words that float up from the button the player pressed.
function actionLabel(a: Action, v: View, el?: HTMLElement): string | null {
  switch (a.type) {
    case 'click': return el?.dataset.label ?? v.main.button.value;
    case 'shipTest': return a.variant === 'B' && v.test ? v.test.result : null;
    case 'buyLifestyle': { const i = v.life?.items.find(x => x.id === a.id); return i ? `✓ ${i.name}` : null; }
    case 'dividend': return v.boardroom ? `+${money(v.boardroom.dividend.founderShare)} to you` : null;
    case 'acquire': { const u = a.rival === 'huddle' ? v.market?.huddle?.users : v.market?.porch?.users; return u ? `+${fmtN(u * 0.6)} users` : null; }
    case 'collectEarnout': return v.life?.earnout ? `+${money(v.life.earnout.available)}` : null;
    default: return null;
  }
}

root.addEventListener('click', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act],[data-ui]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  if (el.dataset.act) {
    const me = e as MouseEvent;
    const r = el.getBoundingClientRect();
    const x = me.clientX || r.left + r.width / 2, y = me.clientY || r.top + r.height / 2;
    doAction(JSON.parse(el.dataset.act), x, y, el);
    return;
  }
  const cmd = el.dataset.ui!;
  if (e.target !== el && el.classList.contains('overlay') && !(e.target as HTMLElement).closest('[data-ui="close-popup"]')) {
    if ((e.target as HTMLElement).closest('.modal')) return;
  }
  handleUi(cmd);
});

function handleUi(cmd: string): void {
  if (!game) return;
  const [k, arg] = cmd.split(':');
  switch (k) {
    case 'tab': uiState.tab = arg as TabId; game.act({ type: 'viewTab', tab: arg as TabId }); window.scrollTo({ top: 0 }); break;
    case 'popup': uiState.popup = arg; break;
    case 'close-popup': uiState.popup = null; break;
    case 'settings': uiState.settings = !uiState.settings; break;
    case 'sound': toggleSound(); break;
    case 'clicks': settings = { ...settings, clicks: !settings.clicks }; saveSettings(settings); break;
    case 'export': {
      const text = encode(game.debugState());
      navigator.clipboard?.writeText(text).then(() => alert('Save copied to the clipboard.'), () => prompt('Copy your save:', text));
      break;
    }
    case 'import': {
      const box = root.querySelector<HTMLTextAreaElement>('#importbox');
      const r = decode(box?.value.trim() ?? '');
      if (r.kind !== 'ok') { alert(r.kind === 'incompatible' ? r.reason : 'Nothing to import.'); break; }
      saveGame(r.save.state); uiState.settings = false; startGame(createGame({ state: r.save.state }));
      return;
    }
    case 'reset':
      if (confirm('Reset the game? This deletes your save.')) { clearSave(); game = null; uiState.settings = false; titleScreen(); }
      return;
    case 'trust-continue': uiState.trustDismissed = true; break;
    case 'block': case 'slot': {
      const n = +arg;
      if (k === 'block') uiState.pick.block = uiState.pick.block === n ? null : n;
      else uiState.pick.slot = uiState.pick.slot === n ? null : n;
      const { block, slot } = uiState.pick;
      if (block !== null && slot !== null) {
        uiState.pick = { block: null, slot: null };
        tryPlace(block, slot);
        return;
      }
      break;
    }
    case 'speed': speed = +arg; break;
    case 'jump': jumpTo(arg); break;
    case 'hidden': {
      const g = createGame({ seed: 11, founderName: game.debugState().founderName });
      const bot = createBot('hidden');
      let guard = 0;
      while (!g.observe().ending && guard++ < 40000) { bot.decide(g, 0.5); g.advance(0.5); }
      startGame(g);
      return;
    }
  }
  render();
}

function toggleSound(): void {
  settings = { ...settings, sound: !settings.sound };
  saveSettings(settings);
  sound.setSound(settings.sound);
}

// Debug: fast-forward with the compliant bot until a beat happens.
function jumpTo(beat: string): void {
  if (!game) return;
  const bot = createBot('compliant');
  let guard = 0;
  while (!(beat in game.debugState().beats) && guard++ < 40000 && !game.observe().ending) {
    bot.decide(game, 0.5);
    game.advance(0.5);
  }
  juice.resetTracking();
  knownTabs = null;
}

document.addEventListener('visibilitychange', () => { if (game && document.hidden) saveGame(game.debugState()); });
window.addEventListener('pagehide', () => { if (game) saveGame(game.debugState()); });

titleScreen();
