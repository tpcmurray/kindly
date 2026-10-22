// Engagement metrics from what the player sees: how long between new things, and how often
// there's something useful to do besides the main button.
import type { Action } from '../src/engine/types';

const BORING = new Set(['click', 'viewTab', 'answerTicket']);

export class EngagementMeter {
  private lastNew = 0;
  private longestGap = 0;
  private longestGapAt = 0;
  private gaps: { at: number; length: number }[] = [];
  private samples = 0;
  private usefulSamples = 0;

  record(t: number, events: string[], available: Action[]): void {
    const fresh = events.filter(e => e !== 'memo' || true);
    if (fresh.length) {
      const gap = t - this.lastNew;
      this.gaps.push({ at: this.lastNew, length: gap });
      if (gap > this.longestGap) { this.longestGap = gap; this.longestGapAt = this.lastNew; }
      this.lastNew = t;
    }
    this.samples++;
    if (available.some(a => !BORING.has(a.type))) this.usefulSamples++;
  }

  report() {
    return {
      longestGap: this.longestGap,
      longestGapAt: this.longestGapAt,
      usefulShare: this.samples ? this.usefulSamples / this.samples : 0,
      gapsOver: (sec: number, before = Infinity) => this.gaps.filter(g => g.length > sec && g.at < before),
    };
  }
}
