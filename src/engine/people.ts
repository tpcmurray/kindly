import type { State, Team } from './types';
import { TEAMS } from './types';

// Lay off n people: unassigned first, then spread across teams (largest first).
export function layOff(s: State, n: number, protect: Team[] = []): number {
  let left = Math.max(0, Math.floor(n));
  let done = 0;
  const fromUn = Math.min(left, s.unassigned);
  s.unassigned -= fromUn; left -= fromUn; done += fromUn;
  while (left > 0) {
    const teams = TEAMS.filter(t => s.team[t] > 0 && !protect.includes(t)).sort((a, b) => s.team[b] - s.team[a]);
    if (teams.length === 0) break;
    const total = teams.reduce((a, t) => a + s.team[t], 0);
    let cut = 0;
    for (const t of teams) {
      const c = Math.min(s.team[t], Math.max(1, Math.round(left * s.team[t] / total)), left - cut);
      s.team[t] -= c; cut += c;
      if (cut >= left) break;
    }
    if (cut === 0) break;
    left -= cut; done += cut;
  }
  s.laidOff += done;
  return done;
}
