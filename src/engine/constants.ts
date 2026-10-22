// All tunable numbers. Seeded from prototype/model.mjs (the tuned playthrough model).
// Money figures are per in-game month unless named otherwise. Rates are per real second.

export const SAVE_VERSION = 1;
export const TICK = 0.1;                 // seconds per engine tick (10 Hz)
export const MONTH = 80;                 // real seconds per in-game month
export const QUARTER = 3 * MONTH;
export const YEAR = 12 * MONTH;

// ---- users ----
export const TAM = 60e6;
export const G_BASE = 0.22;              // growth per minute at small size
export const G_SIZE_REF = 1e4;
export const G_SIZE_EXP = 0.45;
export const GROWTH_TEAM_K = 0.18;
export const ACT2_GROWTH_BONUS = 0.25;
export const CLICK_SHARE_OF_GROWTH = 0.01;   // a click = 1% of one second's organic growth (min 1)
export const CONVERT_CLICK_SPEEDUP = 0.01;   // Act 3: each click speeds conversion by 1% for a second

// ---- retention / churn ----
export const RET_BASE = 0.45;
export const RET_SPAN = 0.54;
export const RET_SCALE = 3;
export const CHURN_K = 0.05;             // per minute
export const PAID_CHURN_FACTOR = 0.5;
export const SUNSET_CHURN = 0.03;        // per minute, Act 4 after feed sunset

// ---- conversion ----
export const PAID_SHARE_BASE = 0.05;
export const PAID_SHARE_HONEST = 0.03;
export const PAID_SHARE_CAP = 0.3;
export const CONVERSION_CLOSE_SECONDS = 240;

// ---- NPS ----
export const NPS_BASE = 34;
export const LEVER_NPS_SCALE = 0.75;
export const NPS_EASE_SECONDS = 90;
export const PRODUCT_NPS_MAX = 15;
export const PRODUCT_NPS_SCALE = 25;
export const TICKET_NPS_PENALTY = 20;
export const OUTAGE_NPS_PENALTY = 5;
export const DARK_TEST_NPS = -0.6;
export const DARK_TEST_RET = 0.05;

// ---- support inbox ----
export const TICKET_BASE_RATE = 0.03;    // tickets per second at zero users
export const TICKET_PER_USER = 2e-6;     // tickets per second per user
export const SUPPORT_CAPACITY = 0.12;    // tickets per second per support person

// ---- outages ----
export const OUTAGE_MEAN_GAP = 200;      // seconds, shrinks with Product headcount
export const OUTAGE_FIX_CLICKS = 5;
export const OUTAGE_AUTO_FIX = 30;       // seconds with one product person; faster with more

// ---- money ----
export const START_CASH = 15e3;
export const START_NET_WORTH = 15e3;
export const SALARY_ACT1 = 6e3;
export const SALARY_LATER = 15e3;
export const SERVER_ACT1 = 0.10;
export const SERVER_LATER = 0.30;
export const HIRE_COST_ACT1 = 2e3;
export const HIRE_COST_LATER = 5e3;
export const HIRE_COST_GROWTH = 1.002;   // per existing head
export const AD_RATE = 0.15;             // $ per user per ad slot per month
export const ADVERTISER_PER_USERS = 150;
export const ADVERTISER_SPEND = 100;
export const GMV_PER_USER = 4;
export const DATA_RATE = 0.25;
export const LAYOFF_INTERVAL = 10;

// ---- funding ----
export interface RoundDef { id: string; name: string; users: number; cash: number; dilution: number; pool: number; post: number; investor: string; investorId: string; salary: number }
export const ROUNDS: RoundDef[] = [
  { id: 'seed', name: 'Seed', users: 5e3, cash: 1.5e6, dilution: 0.15, pool: 0, post: 10e6, investor: 'Pebble Ventures', investorId: 'pebble', salary: 90e3 },
  { id: 'a', name: 'Series A', users: 2.5e5, cash: 15e6, dilution: 0.20, pool: 0.10, post: 75e6, investor: 'Northlight Capital', investorId: 'northlight', salary: 150e3 },
  { id: 'b', name: 'Series B', users: 3e6, cash: 50e6, dilution: 0.18, pool: 0, post: 278e6, investor: 'Ironbridge Growth', investorId: 'ironbridge', salary: 250e3 },
  { id: 'c', name: 'Series C', users: 2e7, cash: 150e6, dilution: 0.20, pool: 0.05, post: 750e6, investor: 'Tallwater Crossover Fund', investorId: 'tallwater', salary: 400e3 },
];
export const SECONDARY_PCT = 0.02;
export const SUNSET_THRESHOLD = 0.40;    // Class B keeps 10 votes only while founder owns ≥ 40%
export const CLASS_B_VOTES = 10;
export const BRIDGE_DILUTION = 0.03;

// ---- board ----
export const BOARD_START = 45;
export const BOARD_START_QUOTA = 3e6;
export const BOARD_GROWTH_ACT2 = 1.15;
export const BOARD_GROWTH_ACT3 = 1.25;
export const BOARD_EASE_SECONDS = 60;
export const INTERVENTION_THRESHOLD = 25;
export const INTERVENTION_AFTER = 180;
export const INTERVENTION_COOLDOWN = 120;
export const BOARD_GRACE = 12 * 60;       // no interventions in the first 12 minutes of Act 2
export const DIVIDEND_COOLDOWN = QUARTER;
export const DIVIDEND_BOARD = 6;

// ---- act timing ----
export const ACT3_MIN_USERS = 2.5e7;
export const ACT3_GROWTH_BELOW = 0.015;  // per minute
export const ACT3_SUSTAIN = 60;
export const ACT2_MAX_SECONDS = 75 * 60;
export const NPS_RETIRE_AT = 15 * 60;    // seconds into Act 3
export const DIRECTIVE_AT = 23 * 60;
export const DIRECTIVE_DEADLINE = 2 * QUARTER;
export const EFFICIENCY_AT = 30 * 60;
export const EFFICIENCY_CUT = 0.22;
export const BUYOUT_AT = 41 * 60;

// ---- rivals ----
export const RIVAL_START_SHARE = 0.03;
export const RIVAL_MAX_SHARE = 0.30;
export const RIVAL_GROWTH = 0.0001;      // share per second
export const PRICE_PER_RIVAL_USER = 40;
export const PORCH_NPS = -40;
export const PORCH_GROWTH = 0.00008;
export const PORCH_MAX = 0.08;

// ---- morale and perks ----
export const MORALE_BASE = 70;
export const RETREAT_COST_PER_HEAD = 3e3;
export const RETREAT_BOOST = 15;
export const RETREAT_FADE = 480;

// ---- cadence ----
export const TEST_EVERY = 90;
export const TEST_EVERY_LATER = 120;   // Acts 2–3: stretch the dark-pattern tests across both acts
export const TEST_START = 4 * 60;
export const EVENT_EVERY = 190;
export const POST_EVERY: [number, number] = [8, 14];
export const REACTION_DELAY = 2;        // a reaction post jumps the queue this many seconds after its trigger
export const NEWS_EVERY = 25;

// ---- act 4 ----
export const BUYOUT_MULTIPLE = 3;        // × annual revenue
export const BUYOUT_DEBT = 0.7;
export const PAYOUT_UPFRONT = 0.6;
export const ACT4_LENGTH = 1200;
export const DIVEST_EVERY = 150;
export const DIVEST_REVENUE = 0.82;
export const DIVEST_LAYOFF = 0.35;
export const PRICE_HIKE_EVERY = 200;
export const RECAP1_AT = 90;
export const SUNSET_AT = 480;
export const REFI_AT = 540;
export const RECAP2_AT = 600;
export const MGMT_FEE = 0.03;
export const DEBT_RATE = 0.09;
export const REFI_RATE = 0.14;
export const OFFER_RAISE = 1.15;
