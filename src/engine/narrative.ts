import { HANDLES, POSTS } from '../content/feed';
import { MEMOS } from '../content/memos';
import { FLATTERING, NEWS } from '../content/news';
import type { Cond, PostDef } from '../content/types';
import * as C from './constants';
import { has, users } from './derive';
import { between, pick, rand } from './rng';
import type { State, TabId } from './types';

const FEED_MAX = 40;
const REACTION_KEYS = new Set(POSTS.filter(p => p.priority && p.after).map(p => p.after!));
const NEWS_MAX = 8;
const MEMO_MAX = 40;

export function fill(s: State, text: string, vars: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => (k === 'name' ? s.founderName : k in vars ? String(vars[k]) : `{${k}}`));
}

export function condOk(s: State, c: Cond): boolean {
  if (c.act !== undefined) {
    const [lo, hi] = Array.isArray(c.act) ? c.act : [c.act, c.act];
    if (s.act < lo || s.act > hi) return false;
  } else if (s.act === 5) return false;            // the trust ending only shows act-5 content
  if (c.npsMin !== undefined && s.nps < c.npsMin) return false;
  if (c.npsMax !== undefined && s.nps > c.npsMax) return false;
  if (c.after && !has(s, c.after)) return false;
  if (c.notAfter && has(s, c.notAfter)) return false;
  if (c.flag && !s.flags.includes(c.flag)) return false;
  if (c.notFlag && s.flags.includes(c.notFlag)) return false;
  if (c.minRound !== undefined && s.rounds < c.minRound) return false;
  if (c.usersMin !== undefined && users(s) < c.usersMin) return false;
  if (c.outage !== undefined && !!s.outage !== c.outage) return false;
  return true;
}

export function markTab(s: State, tab: TabId): void {
  s.tabNew[tab] = true;
}

// Record a beat (first time only) and announce it: memos and `on` headlines fire every time.
export function fire(s: State, name: string, vars: Record<string, string | number> = {}): void {
  if (!(name in s.beats)) s.beats[name] = s.t;
  // A reaction waiting on this trigger? Bring the next post forward so it lands right away.
  if (REACTION_KEYS.has(name) && s.nextPostAt > s.t + C.REACTION_DELAY && 'feed' in s.beats) s.nextPostAt = s.t + C.REACTION_DELAY;
  for (const m of MEMOS) {
    if (m.on !== name) continue;
    s.memos.unshift({ id: m.id + ':' + Math.round(s.t), from: m.from, subject: m.subject, text: fill(s, m.text, vars), t: s.t, tone: m.tone });
    if (s.memos.length > MEMO_MAX) s.memos.length = MEMO_MAX;
    if (s.board !== null) markTab(s, 'board');
  }
  for (const h of NEWS) {
    if (h.on === name && !s.newsUsed.includes(h.id)) {
      s.newsUsed.push(h.id);
      pushNews(s, fill(s, h.text, vars));
    }
  }
}

export function pushNews(s: State, text: string): void {
  s.news.unshift(text);
  if (s.news.length > NEWS_MAX) s.news.length = NEWS_MAX;
}

function pushPost(s: State, p: PostDef): void {
  s.feedUsed.push(p.id);
  s.feed.unshift({ id: p.id, text: fill(s, p.text), handle: p.handle ?? pick(s, HANDLES), kind: p.kind ?? 'user', t: s.t });
  if (s.feed.length > FEED_MAX) s.feed.length = FEED_MAX;
}

export function pushRawPost(s: State, handle: string, text: string): void {
  s.feed.unshift({ id: 'raw:' + Math.round(s.t), text, handle, kind: 'user', t: s.t });
  if (s.feed.length > FEED_MAX) s.feed.length = FEED_MAX;
}

export function feedOpen(s: State): boolean {
  return 'feed' in s.beats && !(s.act4?.sold.includes('feed'));
}

export function tickNarrative(s: State): void {
  // ---- feed ----
  if (feedOpen(s) && s.t >= s.nextPostAt) {
    s.nextPostAt = s.t + between(s, C.POST_EVERY[0], C.POST_EVERY[1]);
    const eligible = POSTS.filter(p => !s.feedUsed.includes(p.id) && condOk(s, p));
    // Reactions to the most recent trigger go first; reactions whose trigger is over 3 minutes old
    // stop jumping the queue and wait in the ordinary pool.
    const when = (p: PostDef) => (p.after && p.after in s.beats ? s.beats[p.after] : -Infinity);
    const urgent = eligible
      .filter(p => p.priority && s.t - when(p) <= 180)
      .map((p, i) => ({ p, i }))
      .sort((a, b) => when(b.p) - when(a.p) || a.i - b.i)
      .map(x => x.p);
    if (urgent.length) pushPost(s, urgent[0]);
    else {
      const pool = eligible.filter(p => p.kind !== 'insider' || rand(s) < 0.3);
      if (pool.length) pushPost(s, pick(s, pool));
      else {
        // pool exhausted: allow repeats of this act's ordinary posts
        const recent = new Set(s.feed.slice(0, 30).map(p => p.id));
        const again = POSTS.filter(p => !p.priority && !p.after && condOk(s, p) && !recent.has(p.id));
        if (again.length) {
          const p = pick(s, again);
          s.feedUsed = s.feedUsed.filter(id => id !== p.id);
          pushPost(s, p);
        }
      }
    }
  }
  // ---- news ticker ----
  if ('ticker' in s.beats && s.t >= s.nextNewsAt) {
    s.nextNewsAt = s.t + C.NEWS_EVERY;
    if (s.founder.life.includes('newspaper') && rand(s) < 0.25) {
      pushNews(s, fill(s, pick(s, FLATTERING)) + ' · The Bay Ledger');
    } else {
      const pool = NEWS.filter(h => !h.on && !s.newsUsed.includes(h.id) && condOk(s, h));
      if (pool.length) {
        const h = pick(s, pool);
        s.newsUsed.push(h.id);
        pushNews(s, fill(s, h.text));
      }
    }
  }
}
