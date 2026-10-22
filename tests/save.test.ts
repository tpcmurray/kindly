import { describe, expect, it } from 'vitest';
import { createGame } from '../src/api/player';
import { decode, encode } from '../src/save';
import { playUntil } from './helpers';

describe('save', () => {
  it('round-trips the full state', () => {
    const g = playUntil('kindlyplus');
    const text = encode(g.debugState());
    const r = decode(text);
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(JSON.stringify(r.save.state)).toBe(JSON.stringify(g.debugState()));
    const resumed = createGame({ state: r.save.state });
    resumed.advance(60); g.advance(60);
    expect(JSON.stringify(resumed.observe())).toBe(JSON.stringify(g.observe()));
  }, 60000);

  it('rejects damaged and old saves without crashing', () => {
    expect(decode('not json').kind).toBe('incompatible');
    expect(decode('{}').kind).toBe('incompatible');
    expect(decode(JSON.stringify({ version: 0, state: { v: 0, t: 1, upgrades: [] } })).kind).toBe('incompatible');
  });
});
