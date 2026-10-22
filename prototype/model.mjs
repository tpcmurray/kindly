// Kindly — economy model v2 (prototype; feeds docs/kindly-playthrough.md and src/engine/constants.ts).
// Simulates one player policy through the whole game. All rates are per real second; 1 in-game month = 80 s.
//   node prototype/model.mjs            happy path: plays well, goes along with everything
//   node prototype/model.mjs --hidden   hidden path: dual-class shares, lives modestly, stays honest
//   add --all to also list every upgrade purchase in the timeline

const HIDDEN = process.argv.includes('--hidden');
const MONTH = 80, DT = 1, TAM = 60e6;
const G_BASE = 0.22;

const fmt = n => {
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return s + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e3) return s + (a / 1e3).toFixed(1) + 'k';
  return s + a.toFixed(0);
};
const money = n => (n < 0 ? '-$' : '$') + fmt(Math.abs(n));
const clock = t => `${Math.floor(t / 3600)}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}`;

// ---------- content ----------
// ret = retention points (retention = 45% + 54% × (1 − e^(−points/3)), creeping toward 99%)
// dark = skipped by the hidden-path player
const UPG = [
  { id: 'invite', act: 1, cost: 2e3, needUsers: 50, vir: 2.0 },
  { id: 'onboarding', act: 1, cost: 5e3, needUsers: 500, click: 2 },
  { id: 'albums', act: 1, cost: 30e3, needUsers: 5e3, nps: 5, ret: 0.6 },
  { id: 'darkmode', act: 1, cost: 120e3, needUsers: 2e4, nps: 3 },
  { id: 'chats', act: 1, cost: 340e3, needUsers: 6e4, nps: 4, ret: 0.5, vir: 1.15 },
  { id: 'storage', act: 1, cost: 900e3, needUsers: 1.5e5, nps: 4, ret: 0.5 },
  { id: 'mobile', act: 1, cost: 1.5e6, needUsers: 2.5e5, nps: 3, vir: 1.4 },
  { id: 'memories', act: 1, cost: 2.5e6, needUsers: 6e5, nps: 3, ret: 0.5 },
  { id: 'kindlyplus', act: 2, cost: 3e6, needUsers: 3e6, flag: 'paid' },
  { id: 'dark_paywall', act: 2, cost: 2e6, needUsers: 3.5e6, conv: 1.3, nps: -6, dark: true },
  { id: 'ads', act: 2, cost: 8e6, needUsers: 5e6, flag: 'ads' },
  { id: 'simplify', act: 2, cost: 6e6, needUsers: 7e6, ret: 0.8, nps: -3, dark: true },
  { id: 'storage_limit', act: 2, cost: 12e6, needUsers: 1e7, conv: 1.8, nps: -10, ret: 0.4, dark: true },
  { id: 'algo_feed', act: 2, cost: 25e6, needUsers: 1.4e7, eng: 1.3, nps: -5, dark: true },
  { id: 'annual', act: 2, cost: 20e6, needUsers: 1.8e7, ret: 0.6, paidChurn: 0.5 },
  { id: 'cancel_flow', act: 2, cost: 30e6, needUsers: 2.4e7, ret: 0.6, nps: -4, dark: true },
  { id: 'supporter', act: 2, cost: 2e6, needUsers: 3e6, honestConv: 1.6, honestOnly: true },
  { id: 'business', act: 3, cost: 40e6, act3Min: 1, flag: 'biz' },
  { id: 'marketplace', act: 3, cost: 80e6, act3Min: 6, flag: 'market' },
  { id: 'promoted', act: 3, cost: 60e6, act3Min: 13, adMult: 1.3, nps: -8, dark: true },
  { id: 'data', act: 3, cost: 50e6, act3Min: 20, flag: 'data', dark: true },
  { id: 'ai_moonshot', act: 3, cost: 3e9, act3Min: 26, eng: 1.1, nps: -4, dark: true },   // money sink
  { id: 'synthetic', act: 3, cost: 120e6, act3Min: 30, eng: 1.2, nps: -6, dark: true },
];

// pool = option-pool top-up (dilutes everyone)
const ROUNDS = [
  { id: 'Seed', users: 5e3, cash: 1.5e6, dilution: 0.15, pool: 0, post: 10e6 },
  { id: 'Series A', users: 2.5e5, cash: 15e6, dilution: 0.20, pool: 0.10, post: 75e6 },
  { id: 'Series B', users: 3e6, cash: 40e6, dilution: 0.18, pool: 0, post: 222e6 },
  { id: 'Series C', users: 2e7, cash: 150e6, dilution: 0.20, pool: 0.05, post: 750e6 },
];

const LIFESTYLE = [
  ['Better apartment', 60e3], ['Executive coach', 150e3], ['Sports car', 180e3],
  ['Bay Area house', 4.5e6], ['Vineyard', 12e6], ['Yacht', 40e6], ['NZ bunker', 40e6],
  ['A newspaper', 250e6], ['Private island', 300e6], ['Suborbital flight', 450e6], ['A sports team', 2e9],
];

const PERKS = [ // monthly cost per head, morale
  { id: 'Catered lunches', perHead: 800, morale: 12 },
  { id: 'On-site gym', perHead: 300, morale: 5 },
];

// ---------- simulation ----------
const s = {
  t: 0, act: 1, free: 0, paid: 0, cash: 15e3, nps: 50,
  team: { product: 0, growth: 0, support: 0, trust: 0, sales: 0, ads: 0 },
  owned: new Set(), flags: new Set(), vir: 1, click: 1, conv: 1, honestConv: 1, eng: 1, adMult: 1, paidChurn: 1,
  npsMods: 0, retPts: 0, morale: 70, perks: [], retreatBoost: 0, lastRetreat: -1e9,
  founderEcon: 1, dualClass: HIDDEN, netWorth: 15e3, life: [], salary: 0, dividendsToFounder: 0,
  rounds: 0, bridged: false, board: null, boardQuota: 0, quarterRev: 0,
  rivalShare: 0, huddleAcquired: false, porch: 0, porchAcquired: false,
  levers: { price: 4.99, adLoad: 0, notif: 1, sellerFee: 0.08, reach: 1.0, data: 0 },
  abShipped: 0, peakUsers: 0, peakStaff: 0, laidOff: 0, revenue: 0, costs: 0, debt: 0, rate: 0.09,
  beats: [], rows: [], act3Start: 0, act4: null, repurchased: 0,
};
const beat = (name, extra = '') => s.beats.push({ t: s.t, name, extra });
const users = () => s.free + s.paid;
const staff = () => Object.values(s.team).reduce((a, b) => a + b, 0);
const retention = () => 0.45 + 0.54 * (1 - Math.exp(-(s.retPts + 0.05 * s.abShipped) / 3));
const votes = () => {
  const e = s.founderEcon;
  const classB = s.dualClass && e >= 0.40;                   // sunset clause: 10 votes only while founder owns ≥ 40%
  return classB ? 10 * e / (10 * e + (1 - e)) : e;
};
const valuation = () => Math.max(ROUNDS[Math.max(0, s.rounds - 1)].post, s.revenue * 12 * 3);

function buy(u) {
  s.cash -= u.cost; s.owned.add(u.id);
  if (u.vir) s.vir *= u.vir; if (u.click) s.click *= u.click; if (u.conv) s.conv *= u.conv;
  if (u.honestConv) s.honestConv *= u.honestConv;
  if (u.eng) s.eng *= u.eng; if (u.adMult) s.adMult *= u.adMult; if (u.paidChurn) s.paidChurn *= u.paidChurn;
  if (u.nps) s.npsMods += u.nps; if (u.ret) s.retPts += u.ret; if (u.flag) s.flags.add(u.flag);
  beat('Buy ' + u.id, money(u.cost));
}

let lastAB = 0, lastRow = -1, flatSince = null, lastQuarter = 0;

while (s.t < 4 * 3600) {
  const U = users();
  const min = s.t / 60;
  const prod = 0.8 + 0.4 * Math.min(100, s.morale + s.retreatBoost) / 100;   // morale → productivity 0.8–1.2

  // ---- growth ----
  const room = Math.max(0, 1 - U / (TAM * (1 - s.rivalShare - s.porch)));
  const gPerMin = G_BASE / (1 + Math.pow(Math.max(U, 1) / 1e4, 0.45));
  const growthMult = 1 + 0.18 * Math.sqrt(s.team.growth * prod) + (s.act === 2 ? 0.25 : 0);
  const npsF = Math.max(0.2, 1 + s.nps / 150);
  const outageF = 0.97;                                              // outages average ~3% lost growth
  const organic = U < 10 ? 0 : (U * gPerMin / 60) * s.vir * growthMult * npsF * room * outageF;
  const cps = min < 5 ? 4 : min < 15 ? 3 : min < 35 ? 1.5 : 0.5;
  const perClick = Math.max(1, 0.01 * organic) * s.click * (s.life.includes('Sports car') ? 2 : 1);
  const newUsers = (organic + (s.act < 3 && !s.act4 ? cps * perClick : 0)) * DT;

  // ---- churn ----
  const ret = retention();
  const churnPerMin = 0.05 * (1 - ret) * Math.pow(1.5 - s.nps / 100, 2) + (s.act4?.sunset ? 0.03 : 0);
  const freeChurn = s.free * churnPerMin / 60 * DT;
  const paidChurn = s.paid * churnPerMin * 0.5 * s.paidChurn / 60 * DT;

  // ---- conversion: flows toward a target paid share; Convert User click = 1% of a second's conversion ----
  let conv = 0;
  if (s.flags.has('paid')) {
    const base = HIDDEN ? 0.03 * s.honestConv : 0.05 * s.conv;
    const share = Math.min(0.3, base * Math.pow(4.99 / s.levers.price, 1.2) * (1 + 0.05 * Math.sqrt(s.team.sales * prod)));
    conv = Math.max(0, share * U - s.paid) / 240 * DT;
    if (s.act >= 3) conv *= 1 + cps * 0.01;
  }
  s.free = Math.max(0, s.free + newUsers - freeChurn - conv);
  s.paid = Math.max(0, s.paid + conv - paidChurn);

  // ---- NPS ----
  const product = 15 * (1 - Math.exp(-s.team.product * prod / 25));
  const need = Math.max(1, U / 60000);
  const coverage = s.act === 1 && s.team.support === 0 ? 1 : Math.min(1, s.team.support * prod / need);
  const leverNps = (s.flags.has('paid') ? -(s.levers.price - 4.99) * 3 : 0) - s.levers.adLoad * 6 - (s.levers.notif - 1) * 4
    - (1 - s.levers.reach) * 12 - s.levers.data * 4 - (s.levers.sellerFee - 0.08) * 20;
  const target = Math.max(-100, Math.min(100, 30 + product + s.npsMods - 20 * (1 - coverage) + leverNps - 0.6 * s.abShipped
    - (s.act4 ? 10 * s.act4.sold : 0)));
  s.nps += (target - s.nps) * DT / 90;

  // ---- money (monthly figures) ----
  const notifF = 1 + 0.15 * (s.levers.notif - 1);
  const adRev = s.flags.has('ads') ? U * s.levers.adLoad * 0.15 * s.eng * s.adMult * notifF * (1 + 0.03 * Math.sqrt(s.team.ads * prod)) : 0;
  const advertisers = s.flags.has('biz') ? U / 150 * (1 + 0.05 * Math.sqrt(s.team.sales * prod)) : 0;
  const bizRev = advertisers * 100 * Math.pow(1 / s.levers.reach, 0.5);
  const sellerRev = s.flags.has('market') ? U * 4 * s.levers.sellerFee : 0;
  const dataRev = s.flags.has('data') ? U * 0.25 * s.levers.data : 0;
  const decay = s.act4 ? Math.pow(0.82, s.act4.sold) : 1;
  s.revenue = (s.paid * s.levers.price + adRev + bizRev + sellerRev + dataRev) * decay;
  const salaryPer = s.act === 1 ? 6e3 : 15e3;
  const perksCost = s.perks.reduce((a, p) => a + p.perHead, 0) * staff();
  const fees = s.act4 ? s.act4.ev * 0.03 / 12 : 0;
  s.costs = staff() * salaryPer + perksCost + U * (s.act === 1 ? 0.10 : 0.30) + s.debt * s.rate / 12 + fees;
  s.cash += (s.revenue - s.costs) / MONTH * DT;
  s.netWorth += s.salary / 12 / MONTH * DT;
  s.quarterRev += s.revenue / MONTH * DT;

  // ---- bridge note: designed near-miss in Act 1 ----
  const burn = Math.max(1, s.costs - s.revenue);
  if (s.act === 1 && s.rounds >= 1 && !s.bridged && s.cash < burn * 2) {
    s.bridged = true; const amt = Math.max(500e3, burn * 4); s.cash += amt; s.founderEcon *= 0.97;
    beat('Event: bridge note', `${money(amt)} to make payroll, founder ${(s.founderEcon * 100).toFixed(1)}%`);
  }

  // ---- funding rounds ----
  const r = ROUNDS[s.rounds];
  if (r && U >= r.users && !s.act4) {
    s.cash += r.cash; s.founderEcon *= (1 - r.dilution) * (1 - r.pool); s.rounds++; s.bridged = false;
    s.salary = [90e3, 150e3, 250e3, 400e3][s.rounds - 1];
    beat(r.id, `${money(r.cash)} · founder ${(s.founderEcon * 100).toFixed(1)}% of shares, ${(votes() * 100).toFixed(1)}% of votes`);
    if (r.id === 'Series A') { s.rivalShare = 0.03; beat('Rival Huddle appears'); }
    if (r.id === 'Series B') {
      s.act = 2; s.board = 45; s.boardQuota = 3e6; lastQuarter = s.t; s.quarterRev = 0;
      beat('ACT 2 begins', 'board satisfaction 45');
      if (!HIDDEN) { s.perks.push(...PERKS); beat('Perks: catered lunches + on-site gym', 'morale +17'); }
    }
    if (!HIDDEN && s.rounds >= 2) {
      const proceeds = 0.02 * r.post; s.founderEcon -= 0.02; s.netWorth += proceeds;
      beat('Secondary sale', `2% for ${money(proceeds)}`);
    }
  }

  // ---- rivals ----
  if (s.rivalShare > 0 && !s.huddleAcquired) {
    s.rivalShare = Math.min(0.30, s.rivalShare + 0.0001 * DT * Math.max(0.2, 1 - s.team.product / 150));
    const huddleUsers = s.rivalShare * TAM * Math.min(1, U / (TAM * 0.5));
    const price = huddleUsers * 40;
    if (!HIDDEN && s.rounds >= 4 && s.cash > price * 1.3) {
      s.cash -= price; s.huddleAcquired = true; s.free += huddleUsers * 0.6; s.rivalShare = 0; s.retPts += 0.5;
      beat('Acquire & sunset Huddle (cash)', `${money(price)}, +${fmt(huddleUsers * 0.6)} users`);
    }
  }
  if (s.act === 3 && !s.act4 && s.nps < -40 && !s.porchAcquired) {
    if (s.porch === 0) beat('Rival Porch springs up from unhappy users');
    s.porch = Math.min(0.08, s.porch + 0.00008 * DT);
    const porchUsers = s.porch * TAM, price = porchUsers * 40;
    if (s.porch > 0.03 && s.cash > price * 1.3) {
      s.cash -= price; s.porchAcquired = true; s.free += porchUsers * 0.5; s.porch = 0; s.retPts += 0.5;
      beat('Acquire & sunset Porch (cash)', `${money(price)}`);
    }
  }

  // ---- hiring toward a headcount target ----
  if (s.rounds >= 1 && !s.act4 && Math.floor(s.t) % 5 === 0) {
    const runway = s.cash / burn;
    const ok = s.act === 1 ? runway > 12 : (s.revenue > s.costs * 1.05 || runway > 24);
    const frozen = s.act === 3 && s.efficiency;
    if (ok && !frozen) {
      const mix = s.act === 1 ? ['product', 'growth', 'growth', 'support', 'product', 'growth', 'trust', 'support']
        : ['sales', 'ads', 'product', 'growth', 'sales', 'support', 'ads', 'trust'];
      const n = Math.min(Math.max(0, Math.round(4 + U / 25e3) - staff()), Math.max(1, Math.floor(staff() * 0.03)));
      for (let i = 0; i < n; i++) s.team[mix[(staff() + i) % mix.length]]++;
    }
  }
  s.peakStaff = Math.max(s.peakStaff, staff());

  // ---- morale: drifts toward 70 + perks; retreats once a year in Act 2 ----
  const moraleTarget = 70 + s.perks.reduce((a, p) => a + p.morale, 0) - (s.act === 3 ? 15 : 0) - (s.act4 ? 50 : 0) - (s.supportCutDone ? 10 : 0);
  s.morale += (moraleTarget - s.morale) * DT / 120;
  s.retreatBoost *= Math.exp(-DT / 480);
  if (!HIDDEN && s.act === 2 && s.t - s.lastRetreat > 12 * MONTH) {
    const cost = staff() * 3e3; s.cash -= cost; s.retreatBoost = 15; s.lastRetreat = s.t;
    beat('Company retreat', `${money(cost)}, morale +15`);
  }

  // ---- upgrades ----
  for (const u of UPG) {
    if (s.owned.has(u.id) || u.act > s.act) continue;
    if (HIDDEN && u.dark) continue;
    if (!HIDDEN && u.honestOnly) continue;
    if (u.needUsers && U < u.needUsers) continue;
    if (u.act3Min && (s.act < 3 || s.t - s.act3Start < u.act3Min * 60)) continue;
    if (u.flag === 'market' && !s.flags.has('biz')) continue;
    if (s.cash >= u.cost * 1.2) { buy(u); break; }
  }

  // ---- founder lifestyle ----
  if (!HIDDEN) for (const [id, cost] of LIFESTYLE) {
    if (s.life.includes(id)) continue;
    if (s.netWorth * 0.4 >= cost) { s.netWorth -= cost; s.life.push(id); beat('Founder buys ' + id, money(cost)); }
    break;
  }

  // ---- A/B tests every 90 s ----
  if (s.t - lastAB >= 90 && min > 4 && !s.act4) {
    lastAB = s.t;
    if (s.act === 1) s.vir *= 1.01;
    else if (!HIDDEN && s.abShipped < 40) { s.abShipped++; s.conv *= 1.01; }
  }

  // ---- levers ----
  if (s.act >= 2 && s.flags.has('ads') && Math.floor(s.t) % 240 === 0) {
    if (HIDDEN) s.levers.adLoad = 1;
    else if (s.levers.adLoad < 3) s.levers.adLoad++;
    else if (s.levers.notif < 3) s.levers.notif++;
    else if (s.levers.price < 7.99) s.levers.price = +(s.levers.price + 1).toFixed(2);
  }
  if (s.act >= 3 && !s.act4 && Math.floor(s.t) % 180 === 0) {
    if (HIDDEN) { if (s.flags.has('biz')) s.levers.reach = 0.85; }
    else {
      if (s.flags.has('market') && s.levers.sellerFee < 0.25) s.levers.sellerFee += 0.04;
      if (s.flags.has('biz') && s.levers.reach > 0.15) s.levers.reach = Math.max(0.15, s.levers.reach - 0.15);
      if (s.flags.has('data') && s.levers.data < 2) s.levers.data++;
    }
  }

  // ---- board: quarterly target = beat last quarter (Act 2 +15%, Act 3 +25%) ----
  if (s.board !== null && !s.act4) {
    if (s.t - lastQuarter >= 3 * MONTH) {
      const qRev = s.quarterRev / 3; lastQuarter = s.t; s.quarterRev = 0;
      s.boardQuota = Math.max(s.boardQuota, qRev) * (s.act === 3 ? 1.25 : 1.15);
      // happy path pays a special dividend from excess cash in Act 3: a cash sink the board likes
      const excess = s.cash - 6 * s.costs - 500e6;
      if (!HIDDEN && s.act === 3 && excess > 0) {
        const d = excess * 0.5; s.cash -= d; s.board = Math.min(100, s.board + 6);
        const toFounder = d * s.founderEcon; s.netWorth += toFounder; s.dividendsToFounder += toFounder;
        beat('Special dividend', `${money(d)} (founder gets ${money(toFounder)}), board +6`);
      }
    }
    const tgt = Math.max(0, Math.min(100, 50 + 40 * Math.tanh(Math.log(Math.max(s.revenue / s.boardQuota, 1e-3)))));
    s.board += (tgt - s.board) * DT / 60;
  }

  // ---- hidden path: Kindly repurchases early investors' shares to keep founder ≥ 41% ----
  if (HIDDEN && s.act >= 2 && !s.act4 && s.founderEcon < 0.41 && s.cash > 6 * s.costs + 5e6) {
    const spend = Math.min(s.cash - 6 * s.costs - 5e6, 2e6 * DT);
    const pct = spend / valuation();
    s.cash -= spend; s.repurchased += spend; s.founderEcon = s.founderEcon / (1 - pct);
    if (s.founderEcon >= 0.41) beat('Repurchase from early investors complete', `${money(s.repurchased)} total, founder ${(s.founderEcon * 100).toFixed(1)}%`);
  }

  // ---- Act 3 trigger ----
  if (s.act === 2) {
    const g = (newUsers - freeChurn - paidChurn) / DT * 60 / Math.max(U, 1);
    if (U > 3e7 && g < 0.012) flatSince ??= s.t; else flatSince = null;
    if (flatSince !== null && s.t - flatSince > 60) { s.act = 3; s.act3Start = s.t; beat('ACT 3 begins', `${fmt(U)} users, growth ${(g * 100).toFixed(2)}%/min`); }
  }
  if (s.act === 3 && !s.act4) {
    const e = s.t - s.act3Start;
    const control = votes() > 0.5;
    if (!s.npsRetired && e > 15 * 60) {
      s.npsRetired = true;
      beat(control ? 'Board proposal to retire NPS fails (founder control)' : 'Board retires NPS reporting', `NPS ${s.nps.toFixed(0)}`);
    }
    if (!s.supportCut && e > 23 * 60) {
      s.supportCut = true;
      if (control) beat('Board directive (Support → Ads) fails: founder control');
      else { const moved = s.team.support + s.team.trust; s.team.ads += moved; s.team.support = 0; s.team.trust = 0; s.supportCutDone = true; beat('Board directive: Support + T&S → Ads', `${moved} people`); }
    }
    if (!s.efficiency && e > 30 * 60 && !control) {
      s.efficiency = true; const cut = Math.round(staff() * 0.22);
      for (let i = 0; i < cut; i++) { const k = ['product', 'growth', 'sales', 'ads'][i % 4]; if (s.team[k] > 0) s.team[k]--; }
      s.laidOff += cut; s.perks = [];
      beat('Year of Efficiency: layoffs, perks cancelled', `${cut} people`);
    }
    if (e > 41 * 60) {
      const ev = s.revenue * 12 * 3, debt = ev * 0.7, payout = s.founderEcon * ev;
      const trust = control && s.nps > 0;
      beat('BUYOUT OFFER — ACT 4', `EV ${money(ev)}, debt ${money(debt)}, founder ${(s.founderEcon * 100).toFixed(1)}% shares / ${(votes() * 100).toFixed(1)}% votes, NPS ${s.nps.toFixed(0)} → payout ${money(payout)}${trust ? ' · TRUST BUTTON SHOWN' : ''}`);
      if (trust) { s.rows.push(snap()); break; }
      s.act = 4; s.act4 = { start: s.t, ev, payout, sold: 0, sunset: false };
      s.debt = debt; s.netWorth += payout * 0.6;
    }
  }

  // ---- Act 4 script ----
  if (s.act4) {
    const e = Math.floor(s.t - s.act4.start);
    if (e === 90) { const d = s.cash; s.cash -= d; beat('Dividend recap #1: Ashgrove pays itself', money(d)); }
    if (e === 480) { s.act4.sunset = true; beat('Kindly feed sunset: users leave'); }
    if (e === 600) { s.debt += s.act4.ev * 0.3; beat('Dividend recap #2: new debt paid out to Ashgrove', `debt now ${money(s.debt)}`); }
    if (e === 540) { s.rate = 0.14; beat('Debt refinanced at 14%', `interest ${money(s.debt * s.rate / 12)}/mo`); }
    if (e > 0 && e % 150 === 0) {
      s.act4.sold++; const cut = Math.ceil(staff() * 0.35);
      for (let i = 0; i < cut; i++) { const k = Object.keys(s.team).find(k => s.team[k] > 0); if (k) s.team[k]--; }
      s.laidOff += cut;
      beat('Divestiture #' + s.act4.sold, `revenue ${money(s.revenue)}/mo, cash ${money(s.cash)}, staff ${staff()}`);
    }
    if (e > 0 && e % 200 === 0) s.levers.price = +(s.levers.price * 1.15).toFixed(2);
    s.netWorth += s.act4.payout * 0.4 / 1200 * DT;
    if (e >= 1200) {
      beat(s.cash < 0 ? 'Kindly files for Chapter 11' : 'Kindly limps on', `cash ${money(s.cash)}, debt ${money(s.debt)}`);
      beat('FINAL SCREEN', `net worth ${money(s.netWorth)}`); s.rows.push(snap()); break;
    }
  }

  s.peakUsers = Math.max(s.peakUsers, users());
  const row = Math.floor(s.t / 300);
  if (row !== lastRow) { lastRow = row; s.rows.push(snap()); }
  s.t += DT;
}

function snap() {
  return {
    t: clock(s.t), act: s.act, users: fmt(users()), paid: fmt(s.paid), nps: s.nps.toFixed(0),
    ret: (retention() * 100).toFixed(1) + '%', board: s.board === null ? '-' : s.board.toFixed(0),
    morale: Math.min(100, s.morale + s.retreatBoost).toFixed(0), cash: money(s.cash), rev: money(s.revenue), cost: money(s.costs),
    staff: staff(), founder: (s.founderEcon * 100).toFixed(1) + '%', votes: (votes() * 100).toFixed(1) + '%', net: money(s.netWorth),
  };
}

console.log(`\n=== ${HIDDEN ? 'HIDDEN' : 'HAPPY'} PATH TIMELINE ===`);
for (const b of s.beats) if (!b.name.startsWith('Buy ') || process.argv.includes('--all')) console.log(clock(b.t).padStart(5), ' ', b.name.padEnd(52), b.extra);
console.log('\nUpgrades: ' + s.beats.filter(b => b.name.startsWith('Buy ')).map(b => `${clock(b.t)} ${b.name.slice(4)}`).join(' · '));
console.log('\n(revenue and costs are per in-game month)');
console.table(s.rows);
console.log(`peak users ${fmt(s.peakUsers)}, peak staff ${s.peakStaff}, laid off ${s.laidOff}, A/B tests shipped ${s.abShipped}, dividends to founder ${money(s.dividendsToFounder)}`);
console.log(`lifestyle: ${s.life.join(', ') || 'none'}`);
