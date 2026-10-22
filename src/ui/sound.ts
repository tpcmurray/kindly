// Tiny Web Audio synth. Off by default. No audio files.
let ctx: AudioContext | null = null;
let enabled = false;

export function setSound(on: boolean): void {
  enabled = on;
  if (on && !ctx) {
    try { ctx = new AudioContext(); } catch { ctx = null; }
  }
}

export function soundOn(): boolean { return enabled; }

function tone(freq: number, dur: number, type: OscillatorType, gain: number, when = 0): void {
  if (!enabled || !ctx) return;
  const t0 = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

export function click(): void { tone(660, 0.05, 'triangle', 0.05); }

// Milestone ding. In Act 4 it is slightly out of tune.
export function ding(act: number): void {
  const detune = act === 4 ? 0.965 : 1;
  tone(880 * detune, 0.35, 'sine', 0.08);
  tone(1320 * (act === 4 ? 1.03 : 1), 0.45, 'sine', 0.05, 0.09);
}

export function thud(): void { tone(110, 0.4, 'sine', 0.1); }

// Act 2 jackpot / payout: two quick bright notes.
export function coin(): void {
  tone(1568, 0.08, 'square', 0.03);
  tone(2093, 0.18, 'square', 0.03, 0.07);
}
