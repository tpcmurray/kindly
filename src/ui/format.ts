// Number formatting shared by the UI and the text playtest client.
export function fmtN(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 1e12) return sign + (a / 1e12).toFixed(2) + 'T';
  if (a >= 1e9) return sign + (a / 1e9).toFixed(a >= 1e10 ? 1 : 2) + 'B';
  if (a >= 1e6) return sign + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e4) return sign + (a / 1e3).toFixed(0) + 'K';
  if (a >= 1e3) return sign + (a / 1e3).toFixed(1) + 'K';
  return sign + Math.round(a).toString();
}

export function money(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a < 1e3) return sign + '$' + Math.round(a);
  return sign + '$' + fmtN(a);
}

export function moneyFull(n: number): string {
  return (n < 0 ? '−$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
}

export function pct(n: number, digits = 1): string {
  return (n * 100).toFixed(digits) + '%';
}

export function signed(n: number): string {
  return (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(Math.round(n));
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function clock(t: number): string {
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

// Rates like users/sec: one decimal below 10 so small early numbers still move.
export function rate(n: number): string {
  const a = Math.abs(n);
  if (a < 10) return (n < 0 ? '−' : '') + a.toFixed(1);
  return fmtN(n);
}
