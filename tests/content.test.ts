import { describe, expect, it } from 'vitest';
import { EVENTS } from '../src/content/events';
import { POSTS } from '../src/content/feed';
import { LIFESTYLE } from '../src/content/founder';
import { MEMOS } from '../src/content/memos';
import { ENDINGS, POPUPS, TICKETS } from '../src/content/misc';
import { NEWS, FLATTERING } from '../src/content/news';
import { TESTS } from '../src/content/tests';
import type { Cond } from '../src/content/types';
import { UPGRADES } from '../src/content/upgrades';
import { LEVERS } from '../src/engine/levers';
import { KEY_BEATS } from '../sim/run';

const BEATS = new Set([
  ...KEY_BEATS, 'layoff', 'outageFixed', 'quarterTarget', 'targetMissed', 'intervention', 'interventionFailed', 'directiveMissed', 'divest', 'dividend',
  'secondarySold', 'offerRaised', 'retreat', 'repurchase', 'lastCompete',
  ...['lunches', 'gym'].map(p => 'perk_' + p), ...LIFESTYLE.map(l => 'life_' + l.id),
  ...['price', 'adLoad', 'notif', 'sellerFee', 'reach', 'data'].map(l => 'lever_' + l),
  ...['valuation', 'more', 'observer', 'dualclass'].map(a => 'amend_' + a),
]);
const KEYS = new Set([...BEATS, ...UPGRADES.map(u => u.id), ...EVENTS.map(e => e.id), 'paid', 'ads', 'biz', 'market', 'data', 'trust', ...LIFESTYLE.map(l => l.id)]);
for (const e of EVENTS) e.options.forEach((_, i) => KEYS.add(`${e.id}:${i}`));
for (const t of TESTS) KEYS.add('test_' + t.id);
for (const l of LEVERS) l.steps.forEach((_, i) => KEYS.add(`lever_${l.id}_${i}`));

function checkCond(c: Cond, where: string) {
  for (const k of [c.after, c.notAfter]) if (k) expect(KEYS.has(k), `${where}: unknown key "${k}"`).toBe(true);
  if (c.act !== undefined) {
    const [lo, hi] = Array.isArray(c.act) ? c.act : [c.act, c.act];
    expect(lo >= 1 && hi <= 5 && lo <= hi, `${where}: bad act`).toBe(true);
  }
}

const ALL_TEXT: { where: string; text: string }[] = [
  ...POSTS.map(p => ({ where: 'post ' + p.id, text: p.text })),
  ...NEWS.map(n => ({ where: 'news ' + n.id, text: n.text })),
  ...FLATTERING.map((t, i) => ({ where: 'flattering ' + i, text: t })),
  ...MEMOS.map(m => ({ where: 'memo ' + m.id, text: m.text })),
  ...EVENTS.map(e => ({ where: 'event ' + e.id, text: e.text + ' ' + e.options.map(o => o.label + ' ' + o.detail).join(' ') })),
  ...UPGRADES.map(u => ({ where: 'upgrade ' + u.id, text: u.desc })),
  ...Object.values(ENDINGS).map(e => ({ where: 'ending ' + e.id, text: [...e.lines, ...e.articles.flatMap(a => [a.headline, a.deck]), e.lastPost.text].join(' ') })),
];

describe('content', () => {
  it('ids are unique', () => {
    for (const [name, list] of [['posts', POSTS], ['news', NEWS], ['memos', MEMOS], ['tests', TESTS], ['events', EVENTS], ['tickets', TICKETS]] as const) {
      const ids = (list as { id: string }[]).map(x => x.id);
      expect(new Set(ids).size, name).toBe(ids.length);
    }
  });

  it('condition tags reference real things', () => {
    POSTS.forEach(p => checkCond(p, 'post ' + p.id));
    NEWS.forEach(n => checkCond(n, 'news ' + n.id));
    TESTS.forEach(t => checkCond(t, 'test ' + t.id));
    EVENTS.forEach(e => checkCond(e, 'event ' + e.id));
    for (const m of MEMOS) expect(BEATS.has(m.on) || UPGRADES.some(u => u.id === m.on), `memo ${m.id} on "${m.on}"`).toBe(true);
    for (const n of NEWS) if (n.on) expect(BEATS.has(n.on) || UPGRADES.some(u => u.id === n.on), `news ${n.id} on "${n.on}"`).toBe(true);
  });

  it('has enough feed posts for every act', () => {
    for (const act of [1, 2, 3]) {
      const n = POSTS.filter(p => p.act === undefined ? act !== 5 : Array.isArray(p.act) ? p.act[0] <= act && act <= p.act[1] : p.act === act).length;
      expect(n, `act ${act}`).toBeGreaterThanOrEqual(40);
    }
  });

  it('never uses pronouns for the founder', () => {
    const bad = /\b(founder|CEO|\{name\})[^.!?"]{0,40}\b(he|she|his|her|him|they|their|them)\b/i;
    const hits = ALL_TEXT.filter(t => bad.test(t.text)).map(t => `${t.where}: ${t.text}`);
    expect(hits).toEqual([]);
  });

  it('mentions no real brands', () => {
    const brands = /\b(facebook|instagram|meta|google|twitter|tiktok|snapchat|whatsapp|amazon|apple|microsoft|linkedin|reddit|youtube|uber|airbnb|blackstone|kkr|carlyle)\b/i;
    expect(ALL_TEXT.filter(t => brands.test(t.text)).map(t => t.where)).toEqual([]);
  });

  it('popups exist for every "what is this?" button', () => {
    for (const id of ['nps', 'retention', 'board', 'cap', 'runway', 'enps']) expect(POPUPS.some(p => p.id === id)).toBe(true);
  });
});
