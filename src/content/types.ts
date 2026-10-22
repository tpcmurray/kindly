// Content is plain typed data. No logic lives here.
// Conditions are checked by src/engine/narrative.ts.

export interface Effects {
  nps?: number;          // added to the NPS target (permanent)
  ret?: number;          // retention points
  vir?: number;          // × virality
  conv?: number;         // × paid-share multiplier (dark monetization)
  honestConv?: number;   // × paid-share multiplier (honest monetization)
  eng?: number;          // × engagement (ad revenue)
  adMult?: number;       // × ad revenue
  paidChurn?: number;    // × paid churn
  click?: number;        // × click value
  board?: number;        // board satisfaction, added once
  cash?: number;         // dollars, added once (negative = cost)
  cashMonths?: number;   // × current monthly revenue (or burn in Act 1), added once
  usersPct?: number;     // fraction of users added (negative = lost)
  morale?: number;       // added once
  rival?: number;        // added to Huddle's market share
  staffPct?: number;     // fraction of staff laid off
  flag?: string;         // sets a flag
}

export interface Cond {
  act?: number | [number, number];   // single act or inclusive range
  npsMin?: number;
  npsMax?: number;
  after?: string;                    // upgrade id, event id, beat or flag that must exist
  notAfter?: string;
  flag?: string;
  notFlag?: string;
  minRound?: number;                 // funding rounds closed
  usersMin?: number;
}

export interface UpgradeDef {
  id: string;
  act: number;
  name: string;
  desc: string;                      // press-release voice
  cost: number;
  needUsers?: number;
  act3Min?: number;                  // minutes into Act 3 before it appears
  needFlag?: string;
  effects: Effects;
  flag?: string;                     // capability unlocked (paid, ads, biz, market, data)
  dark?: boolean;                    // the hidden path avoids these
  honest?: boolean;                  // honest alternatives
  paywalls?: string;                 // Act 1 upgrade this puts behind Kindly+
  hint?: string;                     // short effect summary shown on the card
}

export interface TestDef extends Cond {
  id: string;
  title: string;
  a: string;                         // what variant A is
  b: string;                         // what variant B is
  result: string;                    // predicted result of B, e.g. "+4% retention"
  effectsB: Effects;
  effectsA?: Effects;
  dark: boolean;
}

export interface EventOption {
  label: string;
  detail: string;                    // trade-off shown on the button
  effects: Effects;
  delayed?: { in: number; prob: number; effects: Effects; headline: string; post?: string };
}

export interface EventDef extends Cond {
  id: string;
  title: string;
  text: string;
  options: EventOption[];
  bad?: boolean;                     // Trust & Safety reduces how often and how badly
}

export interface PostDef extends Cond {
  id: string;
  text: string;
  handle?: string;                   // omitted → random handle
  kind?: 'user' | 'biz' | 'insider';
  priority?: boolean;                // reaction posts: shown soon after `after` happens
}

export interface HeadlineDef extends Cond {
  id: string;
  text: string;                      // {name} = founder name
  on?: string;                       // fire immediately when this beat happens
}

export interface MemoDef {
  id: string;
  on: string;                        // beat that triggers it
  from: string;
  subject: string;
  text: string;                      // {name}, {target}, {amount}, {count}, {item}
  tone?: 'board' | 'warn' | 'pe' | 'info';
}

export interface TicketDef { id: string; text: string; act?: number | [number, number] }

export interface LifestyleDef { id: string; name: string; cost: number; perk: string }
export interface PerkDef { id: string; name: string; perHead: number; morale: number; desc: string }

export interface PopupDef { id: string; title: string; text: string }

export interface ArticleDef {
  outlet: string;                    // fictional publication
  section: string;                   // e.g. Business, Analysis, Opinion
  headline: string;                  // {name}, {payout}, {laidOff}
  deck: string;                      // one-line summary under the headline
  byline?: string;
  disclosure?: string;               // e.g. the founder owns this paper
}

export interface EndingDef {
  id: string;
  title: string;
  lines: string[];                   // final card text, {name}
  articles: ArticleDef[];             // the final front page; the first is the lead story
  lastPost: { handle: string; text: string };
  lastPostResister?: { handle: string; text: string };
}
