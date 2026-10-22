// Game state is plain JSON so it can be saved, replayed and diffed.

export type Team = 'product' | 'growth' | 'support' | 'trust' | 'sales' | 'ads';
export const TEAMS: Team[] = ['product', 'growth', 'support', 'trust', 'sales', 'ads'];

export type TabId = 'home' | 'team' | 'market' | 'life' | 'lab' | 'board';

export type LeverId = 'price' | 'adLoad' | 'notif' | 'sellerFee' | 'reach' | 'data';

export type EndingId = 'main' | 'removed' | 'kept' | 'trust';

export interface Investor { id: string; name: string; pct: number; seat: boolean }

export interface CapTable {
  founder: number;          // economic share 0..1
  pool: number;
  investors: Investor[];
  dualClass: boolean;
}

export interface Post { id: string; text: string; handle: string; kind: 'user' | 'biz' | 'insider' | 'founder'; t: number }
export interface Memo { id: string; from: string; subject: string; text: string; t: number; tone?: 'board' | 'warn' | 'pe' | 'info' }

export interface PendingEffect { at: number; prob: number; eventId: string; option: number }

export type Modal =
  | { kind: 'termSheet'; round: number; showAmend: boolean; amendment: string | null }
  | { kind: 'secondary'; round: number; amount: number }
  | { kind: 'event'; eventId: string }
  | { kind: 'bridge'; amount: number }
  | { kind: 'buyout'; stage: 'offer' | 'vote' | 'kept'; ev: number; payout: number; refusals: number; voteResult?: 'lost' | 'won' };

export interface Act4State {
  start: number;
  ev: number;
  payout: number;
  earnoutTotal: number;
  earnoutCollected: number;
  sold: string[];
  removed: boolean;
  sunset: boolean;
  recap1: boolean;
  recap2: boolean;
  refinanced: boolean;
  lastDivest: number;
  lastHike: number;
}

export interface TestCard { id: string; arrived: number }

export interface State {
  v: number;
  seed: number;
  rng: number;
  t: number;
  act: 1 | 2 | 3 | 4 | 5;          // 5 = Members' Trust (hidden ending, plays on)
  ending: EndingId | null;
  founderName: string;
  speed: number;

  free: number;
  paid: number;
  peakUsers: number;
  lastGrowthPerMin: number;
  clicks: number;

  cash: number;
  revenue: number;                 // per month
  costs: number;                   // per month
  revParts: { subs: number; ads: number; biz: number; sellers: number; data: number };
  history: { rev: number[]; cost: number[]; labels: string[] };
  nextHistoryAt: number;

  nps: number;
  npsTarget: number;
  npsMods: number;
  npsRetired: boolean;
  everNegativeNps: boolean;

  retPts: number;
  vir: number;
  clickMult: number;
  conv: number;
  honestConv: number;
  eng: number;
  adMult: number;
  paidChurnMult: number;

  team: Record<Team, number>;
  unassigned: number;
  peakStaff: number;
  laidOff: number;
  hiringFrozen: boolean;
  lastLayoffAt: number;
  morale: number;
  retreatBoost: number;
  perks: string[];
  lastRetreat: number;

  tickets: number;
  ticketsAnswered: number;
  handRate: number;
  handBurst: number;
  assistant: boolean;              // Support replaced by "Kindly Assistant"
  outage: null | {
    text: string; clicksLeft: number; autoAt: number; since: number;
    puzzle: number;                                   // index into PUZZLES
    active: number;                                   // how many slots are open (2 early, 3 later)
    placed: boolean[];
    tray: { label: string; shape: string; used: boolean }[];
  };
  nextOutageAt: number;

  upgrades: string[];
  boardApproved: string[];
  flags: string[];

  rounds: number;                  // rounds closed
  roundOffered: number;            // highest round index offered
  bridged: boolean;
  cap: CapTable;
  repurchased: number;             // $ spent by Kindly buying back shares

  board: number | null;
  boardQuota: number;
  quarterRev: number;
  lastQuarter: number;
  lowBoardSince: number | null;
  interventions: number;
  failedProposals: number;
  lastIntervention: number;
  directive: null | { issuedAt: number; deadline: number; done: boolean };
  lastDividend: number;

  levers: Record<LeverId, number>; // step index per lever
  boardSet: LeverId[];

  rival: { share: number; acquired: boolean; active: boolean };
  porch: { share: number; acquired: boolean; active: boolean };

  test: TestCard | null;
  nextTestAt: number;
  testsSeen: string[];
  testHistory: { id: string; variant: 'A' | 'B' | 'skip'; t: number }[];
  darkTests: number;

  nextEventAt: number;
  eventsSeen: string[];
  pending: PendingEffect[];

  modal: Modal | null;
  modalQueue: Modal[];

  founder: { netWorth: number; salary: number; life: string[]; secondaries: number; dividends: number; declined: number };

  act2Start: number;
  act3Start: number;
  act3Flat: number | null;
  act4: Act4State | null;
  debt: number;
  rate: number;

  feed: Post[];
  feedUsed: string[];
  nextPostAt: number;
  reactions: { id: string; at: number }[];
  news: string[];
  newsUsed: string[];
  nextNewsAt: number;
  memos: Memo[];

  beats: Record<string, number>;
  tabNew: Partial<Record<TabId, boolean>>;
  final: null | { netWorth: number; peakUsers: number; peakStaff: number; laidOff: number; time: number };
}

export type Action =
  | { type: 'click' }
  | { type: 'answerTicket' }
  | { type: 'fixBug'; block?: number; slot?: number }
  | { type: 'hire'; n: number }
  | { type: 'assign'; team: Team; delta: number }
  | { type: 'buyUpgrade'; id: string }
  | { type: 'acceptRound' }
  | { type: 'toggleAmendments' }
  | { type: 'chooseAmendment'; id: string | null }
  | { type: 'secondary'; accept: boolean }
  | { type: 'bridge'; accept: boolean }
  | { type: 'setLever'; lever: LeverId; step: number }
  | { type: 'shipTest'; variant: 'A' | 'B' | 'skip' }
  | { type: 'chooseEvent'; option: number }
  | { type: 'acquire'; rival: 'huddle' | 'porch' }
  | { type: 'competeFeature' }
  | { type: 'buyLifestyle'; id: string }
  | { type: 'buyPerk'; id: string }
  | { type: 'retreat' }
  | { type: 'dividend' }
  | { type: 'repurchase'; investorId: string }
  | { type: 'buyout'; choice: 'accept' | 'refuse' | 'trust' }
  | { type: 'continue' }
  | { type: 'collectEarnout' }
  | { type: 'viewTab'; tab: TabId };
