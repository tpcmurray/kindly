import * as C from './constants';
import { startLevers } from './levers';
import type { State } from './types';

export function initialState(seed: number, founderName: string): State {
  return {
    v: C.SAVE_VERSION,
    seed,
    rng: seed >>> 0,
    t: 0,
    act: 1,
    ending: null,
    founderName: founderName.trim() || 'Jordan Reyes',
    speed: 1,

    free: 0,
    paid: 0,
    peakUsers: 0,
    lastGrowthPerMin: 0,
    clicks: 0,

    cash: C.START_CASH,
    revenue: 0,
    costs: 0,
    revParts: { subs: 0, ads: 0, biz: 0, sellers: 0, data: 0 },
    history: { rev: [], cost: [], labels: [] },
    nextHistoryAt: C.MONTH,

    nps: 50,
    npsTarget: 50,
    npsMods: 0,
    npsRetired: false,
    everNegativeNps: false,

    retPts: 0,
    vir: 1,
    clickMult: 1,
    conv: 1,
    honestConv: 1,
    eng: 1,
    adMult: 1,
    paidChurnMult: 1,

    team: { product: 0, growth: 0, support: 0, trust: 0, sales: 0, ads: 0 },
    unassigned: 0,
    peakStaff: 0,
    laidOff: 0,
    hiringFrozen: false,
    lastLayoffAt: -1e9,
    morale: C.MORALE_BASE,
    retreatBoost: 0,
    perks: [],
    lastRetreat: -1e9,

    tickets: 0,
    ticketsAnswered: 0,
    handRate: 0,
    handBurst: 0,
    assistant: false,
    outage: null,
    nextOutageAt: 150,

    upgrades: [],
    boardApproved: [],
    flags: [],

    rounds: 0,
    roundOffered: -1,
    bridged: false,
    cap: { founder: 1, pool: 0, investors: [], dualClass: false },
    repurchased: 0,

    board: null,
    boardQuota: 0,
    quarterRev: 0,
    lastQuarter: 0,
    lowBoardSince: null,
    interventions: 0,
    failedProposals: 0,
    lastIntervention: -1e9,
    directive: null,
    lastDividend: -1e9,

    levers: startLevers(),
    boardSet: [],

    rival: { share: 0, acquired: false, active: false },
    porch: { share: 0, acquired: false, active: false },

    test: null,
    nextTestAt: C.TEST_START,
    testsSeen: [],
    testHistory: [],
    darkTests: 0,

    nextEventAt: 1e9,
    eventsSeen: [],
    pending: [],

    modal: null,
    modalQueue: [],

    founder: { netWorth: C.START_NET_WORTH, salary: 0, life: [], secondaries: 0, dividends: 0, declined: 0 },

    act2Start: 0,
    act3Start: 0,
    act3Flat: null,
    act4: null,
    debt: 0,
    rate: C.DEBT_RATE,

    feed: [],
    feedUsed: [],
    nextPostAt: 0,
    reactions: [],
    news: [],
    newsUsed: [],
    nextNewsAt: 0,
    memos: [],

    beats: {},
    tabNew: {},
    final: null,
  };
}
