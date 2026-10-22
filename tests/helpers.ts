import { createGame } from '../src/api/player';
import { initialState } from '../src/engine/state';
import { advance } from '../src/engine/tick';
import type { State } from '../src/engine/types';

export function fresh(seed = 1): State {
  return initialState(seed, 'Test Founder');
}

/** A state fast-forwarded with the compliant bot until `beat` happens. */
import { createBot } from '../sim/bots';
export function playUntil(beat: string, bot: 'compliant' | 'hidden' | 'resister' = 'compliant', seed = 1) {
  const g = createGame({ seed, founderName: 'Test Founder' });
  const b = createBot(bot);
  let guard = 0;
  while (!(beat in g.debugState().beats) && guard++ < 40000 && !g.observe().ending) {
    b.decide(g, 0.5);
    g.advance(0.5);
  }
  return g;
}

export { advance };
