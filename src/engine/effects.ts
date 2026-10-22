import type { Effects } from '../content/types';
import { staff } from './derive';
import { layOff } from './people';
import type { State } from './types';

// Apply a one-off or permanent set of effects. `soften` (0..1) shrinks harmful numbers (Trust & Safety).
export function applyEffects(s: State, e: Effects, soften = 0): void {
  const harm = (v: number) => (v < 0 ? v * (1 - soften) : v);
  if (e.nps) s.npsMods += harm(e.nps);
  if (e.ret) s.retPts += e.ret;
  if (e.vir) s.vir *= e.vir;
  if (e.conv) s.conv *= e.conv;
  if (e.honestConv) s.honestConv *= e.honestConv;
  if (e.eng) s.eng *= e.eng;
  if (e.adMult) s.adMult *= e.adMult;
  if (e.paidChurn) s.paidChurnMult *= e.paidChurn;
  if (e.click) s.clickMult *= e.click;
  if (e.board && s.board !== null) s.board = Math.max(0, Math.min(100, s.board + harm(e.board)));
  if (e.cash) s.cash += harm(e.cash);
  if (e.cashMonths) s.cash += harm(e.cashMonths) * Math.max(s.revenue, s.costs, 50e3);
  if (e.usersPct) {
    const f = 1 + harm(e.usersPct);
    s.free *= f;
    if (e.usersPct < 0) s.paid *= f;
  }
  if (e.morale) s.morale = Math.max(0, Math.min(100, s.morale + harm(e.morale)));
  if (e.rival && s.rival.active && !s.rival.acquired) s.rival.share = Math.max(0, Math.min(0.3, s.rival.share + e.rival));
  if (e.staffPct) layOff(s, Math.max(1, Math.round(staff(s) * e.staffPct)));
  if (e.flag && !s.flags.includes(e.flag)) s.flags.push(e.flag);
}
