// Browser saves. The whole game state is plain JSON.
import { SAVE_VERSION } from './engine/constants';
import type { State } from './engine/types';

const KEY = 'kindly.save';
const SETTINGS = 'kindly.settings';

export interface SaveFile { version: number; savedAt: number; state: State }
export type LoadResult = { kind: 'none' } | { kind: 'ok'; save: SaveFile } | { kind: 'incompatible'; reason: string };

export function encode(state: State): string {
  return JSON.stringify({ version: SAVE_VERSION, savedAt: Date.now(), state } satisfies SaveFile);
}

export function decode(text: string): LoadResult {
  let data: unknown;
  try { data = JSON.parse(text); } catch { return { kind: 'incompatible', reason: 'The save is damaged.' }; }
  const d = data as Partial<SaveFile>;
  if (!d || typeof d !== 'object' || !d.state || typeof d.state !== 'object') return { kind: 'incompatible', reason: 'The save is damaged.' };
  if (d.version !== SAVE_VERSION || d.state.v !== SAVE_VERSION) return { kind: 'incompatible', reason: 'This save is from an older version of Kindly.' };
  if (typeof d.state.t !== 'number' || !Array.isArray(d.state.upgrades)) return { kind: 'incompatible', reason: 'The save is damaged.' };
  return { kind: 'ok', save: d as SaveFile };
}

function storage(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

export function saveGame(state: State): boolean {
  try { storage()?.setItem(KEY, encode(state)); return true; } catch { return false; }
}

export function loadGame(): LoadResult {
  let text: string | null = null;
  try { text = storage()?.getItem(KEY) ?? null; } catch { return { kind: 'none' }; }
  if (!text) return { kind: 'none' };
  return decode(text);
}

export function clearSave(): void {
  try { storage()?.removeItem(KEY); } catch { /* ignore */ }
}

export interface Settings { sound: boolean; clicks: boolean }
export function loadSettings(): Settings {
  try { return { sound: false, clicks: true, ...JSON.parse(storage()?.getItem(SETTINGS) ?? '{}') }; } catch { return { sound: false, clicks: true }; }
}
export function saveSettings(s: Settings): void {
  try { storage()?.setItem(SETTINGS, JSON.stringify(s)); } catch { /* ignore */ }
}

const ENDINGS_KEY = 'kindly.endings';
export function loadEndings(): string[] {
  try { const v = JSON.parse(storage()?.getItem(ENDINGS_KEY) ?? '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; }
}
export function addEnding(id: string): string[] {
  const found = loadEndings();
  if (!found.includes(id)) {
    found.push(id);
    try { storage()?.setItem(ENDINGS_KEY, JSON.stringify(found)); } catch { /* ignore */ }
  }
  return found;
}
