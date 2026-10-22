import { money } from './format';

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

// Semicircle gauge. Green on the right, red on the left.
export function gauge(value: number, min: number, max: number, label: string, signed = false, dark = false): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const ang = Math.PI * (1 - t);
  const cx = 60, cy = 58, r = 46;
  const nx = cx + (r - 8) * Math.cos(ang), ny = cy - (r - 8) * Math.sin(ang);
  const col = t < 0.33 ? 'var(--bad)' : t < 0.6 ? 'var(--warn)' : 'var(--good)';
  const v = Math.round(value);
  const shown = dark ? '—' : `${signed && v > 0 ? '+' : ''}${v < 0 ? '−' + Math.abs(v) : v}`;
  return `<div class="gauge${dark ? ' dark' : ''}" role="img" aria-label="${label}: ${dark ? 'not reported' : shown}">
    <svg viewBox="0 0 120 66" aria-hidden="true">
      <path d="${arc(cx, cy, r, Math.PI, 0)}" stroke="var(--line)" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="${arc(cx, cy, r, Math.PI, Math.min(Math.PI - 0.0001, ang) === Math.PI ? Math.PI - 0.0001 : ang)}" stroke="${col}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="var(--ink)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="var(--ink)"/>
    </svg>
    <div class="gv">${shown}</div>
    <div class="gl">${label}${dark ? ' · not reported' : ''}</div>
  </div>`;
}

// Revenue vs costs over recent in-game months, with the gap shaded.
export function moneyChart(rev: number[], cost: number[], showRevenue: boolean): string {
  if (cost.length < 2) return '<div class="fine">The chart fills in month by month.</div>';
  const W = 300, H = 110, pad = 4;
  const all = [...cost, ...(showRevenue ? rev : [])];
  const max = Math.max(1, ...all) * 1.1;
  const x = (i: number) => pad + (i / (cost.length - 1)) * (W - 2 * pad);
  const y = (v: number) => H - pad - (Math.max(0, v) / max) * (H - 2 * pad);
  const line = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  let shade = '';
  if (showRevenue) {
    for (let i = 0; i < cost.length - 1; i++) {
      const profit = rev[i] + rev[i + 1] >= cost[i] + cost[i + 1];
      shade += `<path d="M${x(i)},${y(rev[i])} L${x(i + 1)},${y(rev[i + 1])} L${x(i + 1)},${y(cost[i + 1])} L${x(i)},${y(cost[i])} Z" fill="${profit ? 'var(--good)' : 'var(--bad)'}" opacity=".18"/>`;
    }
  }
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue and costs, recent months">
      <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="var(--line)"/>
      ${shade}
      <path d="${line(cost)}" fill="none" stroke="var(--bad)" stroke-width="2" stroke-dasharray="5 4"/>
      ${showRevenue ? `<path d="${line(rev)}" fill="none" stroke="var(--good)" stroke-width="2.5"/>` : ''}
      <text x="${W - pad}" y="12" text-anchor="end" font-size="9" fill="var(--muted)">${money(max / 1.1)}/mo</text>
    </svg>
    <div class="legend">${showRevenue ? '<span><i style="border-color:var(--good)"></i>Revenue</span>' : ''}<span><i class="lndash" style="border-color:var(--bad)"></i>Costs</span></div>
  </div>`;
}
