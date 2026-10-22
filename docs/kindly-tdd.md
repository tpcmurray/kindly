# Kindly — Technical Design Document

**Version:** 1.3 (built: values below match `src/engine/constants.ts` after simulator tuning)
**Date:** October 21, 2026
**Author:** Terry (Product), Claude (Design and Technical)
**Status:** Built through tasks Phase 11; awaiting Terry's playtest
**Tasks:** `docs/kindly-tasks.md` · **Wireframes:** `docs/kindly-wireframes.html` · **Playthrough:** `docs/kindly-playthrough.md`

---

## 1. Overview

Kindly is a browser incremental game, about 2.5 hours long, with a real ending. The player founds a friendly social app called Kindly and grows it into a giant. Along the way they follow, step by step, the enshittification arc described by Cory Doctorow: be good to users, squeeze the users, squeeze the businesses. The game ends with a private equity leveraged buyout that strips the company bare while the founder walks away rich.

The player should believe they are building a great company until well into Act 3. The horror is that every number they were proud of was part of the problem, and by the time they notice, there is nothing they can do.

Influences: Universal Paperclips (mechanics carry the story, the game dismantles itself), A Dark Room and Candy Box (minimal start, layers revealed, many small controls, location tabs), Cookie Clicker (satisfying growth).

### 1.1 Design pillars

1. **The mechanics are the message.** Every system means something in the story: funding rounds give away control, Retention is lock-in, layoffs are what resisting costs. Text supports the mechanics; it never replaces them.
2. **Late realization.** Act 1 is genuinely joyful. Act 2 cuts are framed as smart business. The dread arrives in Act 3. Nothing ominous before then except what the player chooses to notice (the user feed, the NPS needle).
3. **Deadpan corporate tone.** All system text is cheerful press release and memo language. The horror comes from the contrast. The only honest voice is the user feed.
4. **The palette tells the story.** Act 1 is calm blue, Act 2 is a coarse, salesy red, Act 3 is gray, Act 4 is monochrome. The Kindly logo stays calm blue the whole time and looks increasingly out of place.
5. **Resistance is futile, except for one hidden path.** A player who resists only stalls, and the stall costs the employees their jobs. One hard-to-find path keeps Kindly good.
6. **Always something to do.** Like A Dark Room, the player directs the game through many small controls: tabs, team assignments, levers, A/B tests, events, tickets and bugs. Each verb also carries the story; the most satisfying actions in Acts 2 and 3 are the squeezing ones.
7. **Respect the player's time.** No dark patterns in the game itself. It saves automatically, needs no grinding, has no offline progress to chase, and ends.

### 1.2 Decisions log

| Decision | Choice |
|---|---|
| Genre | Incremental/clicker, single run, no prestige loop |
| Length | ~2.5 hours: Act 1 ~35 min, Act 2 ~45, Act 3 ~45, Act 4 ~20 |
| Title / company | **Kindly**. Title-screen subtitle: *"Build something people love."* |
| Product | A friendly social app for sharing photos and updates with friends |
| Main button | **Find New User**, relabelled later (§4.2) |
| Money in Act 1 | Venture funding rounds; each round dilutes founder control |
| Tone | Deadpan corporate; palette moves blue → red → gray → monochrome |
| Player verbs | Location tabs, team assignment, levers, A/B tests, events with choices, support inbox and outages, the market (rivals and acquisitions) (§3.11–3.17) |
| Founder identity | Player enters a name on an "incorporation form" (random default). All game text avoids pronouns and uses the name or "the founder". |
| Real brands | None. All companies, firms and people are fictional. |
| Platform | Static website, desktop first, playable on phone |
| Saving | Automatic, in the browser |
| Offline progress | None. The game only runs while open. |
| Sound | Minimal, synthesized, off by default |
| Founder payout | Billions (about $4.6B on the happy path, plus ~$2B in dividends). Late absurd purchases make the lifestyle ladder look like small change. |
| Acquisitions | Paid in cash, never stock, so founder voting math stays clean |
| Phone tabs | A scrollable row at the top, so the home tab's changing name stays visible |

---

## 2. The Arc

### 2.1 Four acts

| Act | Doctorow stage | What the player feels | What is actually happening |
|---|---|---|---|
| 1. Growth | Be good to users | Joy. Building something people love. | Building the trap: photos, friends and albums are future lock-in. Giving away control one funding round at a time. |
| 2. Monetize | Squeeze users | Smart, successful founder. Board is proud. | Paywalling features that were free, ads in the feed, making it hard to leave. |
| 3. Squeeze | Squeeze businesses | Pressure. Things stop working. Unease. | Gouging advertisers and sellers, hiding NPS, layoffs, decline hidden by lock-in. |
| 4. The Exit | Extraction | Powerlessness, then emptiness. | Leveraged buyout, debt loaded onto Kindly, stripping and selling off, founder cashes out. |

### 2.2 Pacing targets (the timeline)

These are the targets the pacing simulator (§9) checks. Times are for a "compliant" player who buys upgrades as soon as they can afford them. The tolerance is ±20% for each beat. They match the tuned prototype model (`prototype/model.mjs`, happy path: 2:20 total, acts of 32 / 47 / 41 / 20 minutes).

| Time | Beat |
|---|---|
| 0:00 | Incorporation form (founder name). Then a blank dashboard, "A Garage": one button, **Find New User**, and a Users counter. |
| ~0:01 | 10 users. The **user feed** appears. First upgrade: Invite Friends. |
| ~0:02 | **Support inbox** appears: first tickets, **Answer Ticket** button. |
| ~0:04 | First **outage** ("Photo uploads are down", **Fix Bug**). First benign A/B test card on the home tab. |
| ~0:05 | 5,000 users. **Seed round** ($1.5M; the buried "Propose changes" link, §8). Cash and the burn chart appear. **The Team** tab unlocks. Home tab becomes **An Open-Plan Office**. |
| ~0:09 | **NPS gauge** appears with its "what is this?" popup. |
| ~0:13 | **News ticker** appears. |
| ~0:20 | **Series A** ($15M, ~250k users). **Your Life** tab (first secondary offer) and **The Market** tab (rival Huddle appears) unlock. Trust & Safety team. First events with choices. |
| ~0:25 | Low-runway moment for slower players: the **bridge note** event (§3.4). |
| ~0:32 | **Series B** ($40M, ~3M users). **Act 2 begins**: red palette, **A Glass Campus**, **The Board Room** with the Board Satisfaction gauge, already low. Perks unlock. |
| ~0:33 | Kindly+ launches. Free vs Paying, Revenue, Profit. **Growth Lab** tab: levers and dark-pattern A/B tests. Sales and Ads teams. |
| ~0:35–0:45 | Retention appears. First paywall callbacks (Dark Mode, then photo storage). Ads in Feed. Break-even around 0:45. |
| ~0:56 | **Series C** ($150M, ~20M users). Founder drops to about a third of the company. Acquire & sunset unlocks. |
| ~0:58 | NPS crosses zero. |
| ~1:15 | Huddle acquired for cash (~$500M). |
| ~1:15 | Growth flattens (Act 3 starts once users pass 25M and growth stays below 1.5%/min for a minute; or 75 minutes into Act 2 at the latest). Memo: *"The growth phase is behind us."* **Act 3 begins.** Button becomes **Convert User**. |
| ~1:20–1:40 | Kindly for Business, Marketplace, Act 3 levers. Revenue roughly quadruples. Quarterly special dividends. Rival Porch springs up and is acquired. |
| ~1:34 | Board memo retires NPS reporting. The gauge goes dark. |
| ~1:42 | Board directive: move Support and Trust & Safety to Ads. The player clicks the [−] buttons. Ticket backlog explodes. |
| ~1:49 | "Year of Efficiency": layoffs, perks cancelled, hiring freeze. Users begin to decline. |
| ~2:00 | **Buyout offer** from Ashgrove Equity Partners. **Act 4 begins.** |
| ~2:00–2:20 | Dividend recaps, layoffs, price hikes, feed sunset, refinancing at 14%, tabs and panels sold. Founder net worth climbs. |
| ~2:20 | *"Kindly files for Chapter 11."* Final screen. |

### 2.3 The resistance spiral

A player who refuses monetization upgrades:

1. Growth stalls as the market saturates and there is no revenue.
2. Funding rounds stop unlocking because there is no traction to show investors.
3. Runway reaches zero. **Staff are laid off automatically**, one at a time, each with a memo.
4. Once the company shrinks past a threshold, and as long as founder voting control is below 50%, **the board steps in**. It buys monetization upgrades on its own, stamped **BOARD-APPROVED**, which the player cannot undo. *"To support your success, the board has approved the following initiatives on your behalf."*
5. Growth returns. The arc continues.

As founder control shrinks, the board steps in sooner. A player who resists sees the full story plus layoffs they caused. A compliant player rarely sees board interventions, and their realization comes from the feed and the gauges instead.

A small nod for resisters: if the board had to intervene at least N times (default 3), the final user post in the main ending is different (§7.1).

---

## 3. Systems

All formulas below are **starting points**. The pacing simulator tunes the constants. Constants live in one file (`src/engine/constants.ts`), not scattered through the code.

The engine ticks at **10 Hz**. Everything is deterministic given the state and the player's actions. The simulator depends on that.

### 3.1 Users

- `free`, `paying`, with `users = free + paying`.
- **Find New User** click: `max(1, 1% of one second's organic growth) × click multipliers` free users. Scaling with production (as Cookie Clicker does) keeps the button worth pressing all game.
- **Organic growth** per minute: `users × 0.22 / (1 + (users / 10,000)^0.45) × virality × growthTeam × npsFactor × (1 − users / availableMarket)`. Growth slows with size and stops near the total addressable market (TAM). That slowdown is the in-world reason Act 2 and Act 3 turn to monetization. `availableMarket` is TAM minus rivals' share.
- **Growth team**: `× (1 + 0.18 × √(growth headcount × productivity))`.
- **Conversion** (Act 2 onward): the paid share moves toward a target `5% × conversion multipliers × (4.99 / price)^1.2 × sales factor`, capped at 30%, closing the gap over about 4 minutes. In Act 3, **Convert User** clicks speed this up by 1% per click.
- **Churn** per second: `users × baseChurn × churnFromNps(NPS) × (1 − retention)`. Paying users churn at a lower rate because annual plans lock them in.
- `TAM` starts around 60M and is fixed (no expansion upgrades).

### 3.2 NPS (user happiness)

- Range −100 to +100. Shown as a gauge with a "what is this?" popup explaining Net Promoter Score.
- `npsTarget = 34 + product team (up to +15) + Σ upgrade/test/event NPS modifiers − ticket penalty (up to −20, by support coverage) − outage (−5) + 0.75 × lever penalties`, clamped to ±100.
- The displayed NPS **eases toward the target slowly**, so the effect of an upgrade arrives a minute or two after you buy it. Consequences arrive late enough that the player doesn't connect them to the purchase. That delay is deliberate.
- Affects growth (`npsGrowthFactor`) and churn (`churnFromNps`).
- In Act 3 the board retires the NPS gauge (§2.2). The gauge goes dark but NPS keeps working underneath. Only the feed shows it.

### 3.3 Retention (lock-in)

- Displayed as a percentage, labelled **Retention**. It sounds healthy. In Act 3 board memos start calling it "our moat."
- `retention = 45% + 54% × (1 − e^(−points / 3))`. Upgrades, dark-pattern tests and acquisitions add points. There is no hard cap; retention keeps creeping toward 99%, so every lock-in upgrade still does something.
- Act 1 features quietly add retention: photo albums, group chats, friend graph. Act 2 adds the openly coercive ones: data export removed, annual plans with a cancellation fee, a 9-step cancellation flow.
- The gap between falling NPS and steady Retention is the lock-in, and the player can see it. The game never needs to explain it.

### 3.4 Money

- `cash`. Act 1 income comes only from funding rounds.
- `revenue/s` from paying users (`paying × price`), ads (`users × adRate`), and in Act 3 business fees.
- `costs/s`: payroll (Act 1 "garage salaries" $6k/month per person, then $15k), perks (§3.5), servers ($0.10 per user per month in Act 1, $0.30 after), and Act 4 interest and fees.
- `profit/s = revenue − costs`. Displayed with a sign; negative is shown as normal in Act 1, as it is for a real startup.
- **Runway** = `cash / burn` when profit is negative. Shown in months of in-game time.
- **Bridge note** (event): in Act 1, the first time runway drops below two months, a seed investor offers a bridge note (about four months of burn, costs ~3% of the founder's stake). It's a designed "can we make payroll?" moment and it fires at most once per round.
- When `cash < 0`: one automatic layoff every ~10 seconds until profit ≥ 0 (§2.3).

### 3.5 Teams (replaces individual staff roles)

The player hires **headcount** (one Hire button, cost rising `× 1.04^headcount`), then assigns people to teams, like A Dark Room's villager jobs. Unassigned people do nothing but still cost salary.

| Team | Unlock | Effect per person (diminishing, roughly √n) |
|---|---|---|
| Product | Seed | +NPS target, fewer outages, faster bug fixes |
| Growth | Seed | ×organic growth |
| Support | Seed | Answers tickets automatically; coverage below 100% costs NPS |
| Trust & Safety | Series A | Lowers the chance and size of scam, privacy and abuse events |
| Sales | Act 2 | Raises the paid-user share; in Act 3 signs advertisers |
| Ads | Act 2 | ×ad revenue per user |

Each row shows its live effect ("Growth: +1,240 users/sec"). The staff dot grid is colored by team, so layoffs and reassignments are visible. The board can order reassignments (§3.7) that the player must carry out themselves.

**Team morale (eNPS)** is shown as a small gauge on the Team tab, on the usual eNPS scale of −100 to +100. It multiplies every team's output: productivity = `0.8 + 0.4 × clamp(eNPS, 0, 100) / 100` (0.8× to 1.2×). It drifts toward `+70 + perks` (capped at +100), minus 15 in Act 3, minus 10 after the Support reassignment, minus 50 in Act 4. The happy path runs about +93 in Act 2, +45 by the buyout offer and +10 at the end.

| Perk | Unlock | Cost | Morale |
|---|---|---|---|
| Catered lunches | Series B | $800 per head per month | +12 |
| On-site gym | Series B | $300 per head per month | +5 |
| Company retreat | Series B, once per in-game year | $3k per head, one-off | +15, fading over ~8 minutes |

Perks are an Act 2 cash sink that feels generous. The Year of Efficiency cancels them all in one memo (§2.2).

### 3.6 Funding rounds and the cap table

| Round | Unlock (users) | Cash | Investor stake | Option pool top-up | Post-money | Board seats (investor / founder) |
|---|---|---|---|---|---|---|
| Seed | 5,000 | $1.5M | 15% | — | $10M | 1 / 1 |
| Series A | 250k | $15M | 20% | 10% | $75M | 2 / 1 |
| Series B | 3M | $50M | 18% | — | $278M | 3 / 1 + 1 independent |
| Series C | 20M | $150M | 20% | 5% | $750M | 4 / 1 + 1 independent |

Without secondary sales, the founder ends Series C with about **38%**. With the happy path's secondary sales (2% at each of A, B and C), about **33%**.

- Each round shows a **term sheet**: amount, valuation, stake, board seat. The big button is **Accept**. On the Seed round only, a small **Propose changes** link opens the amendment list (§8).
- The **cap table** panel lists the founder, each investor and the employee option pool. It also shows one line: **Founder control: 100% → 85% → …**
- Founder voting control decides the buyout vote (§6.2) and whether the board can intervene (§2.3).
- Rounds also require a minimum growth rate, so a stalled company doesn't unlock them (§2.3).

### 3.7 Board Satisfaction

- Appears at Series B. Range 0–100, drawn as a gauge **right beside the NPS gauge**. The two needles moving in opposite directions is the game's central image.
- Rises when revenue meets the current board target. Falls slowly over time ("expectations"), and quickly when targets are missed.
- Board targets arrive as memos with a number and a deadline: each quarter, beat last quarter's revenue by **15%** in Act 2 and **25%** in Act 3, so even an aggressive player watches satisfaction slide toward ~20 by the buyout offer.
- **Special dividends** (Board Room, Act 3) return excess cash to shareholders: +6 board satisfaction each, and the founder receives their share. This is the main Act 3 cash sink.
- **Directives** (e.g. move Support to Ads) must be carried out by the player. If ignored, board satisfaction drops; if founder control is under 50%, the board carries it out itself.
- Low board satisfaction (below 25 for 3 minutes) plus founder control under 50% triggers interventions (§2.3), at most one every 2 minutes, and never in the first 12 minutes of Act 2.

### 3.8 Act 3: businesses

- **Advertisers** and **Sellers** counts, growing with users and the Sales team.
- Revenue from ad spend and seller fees.
- Act 3 upgrades squeeze them: cut organic reach so businesses must pay to reach their own followers, raise seller fees, auction ad slots, sell data to partners. These also lower user NPS (more ads, worse feed).
- Business partners have their own small happiness number, shown only in the feed as business posts ("our reach dropped 80% overnight").

### 3.9 Founder panel

- **Net Worth:** starts at about $40k of savings.
- **Salary:** a small trickle, raised automatically after each round.
- **Secondary sale offers:** a pop-up after Series A, B and C. *"An early investor would like to buy 2% of your shares for $4.4M. You've earned it!"* Accepting adds to Net Worth and **permanently reduces founder voting control**.
- **Dividends** (Act 3) and the **buyout payout** (Act 4) make the founder a billionaire.
- **Lifestyle ladder:** purchases with real perks, so selling shares is the smart move:

| Purchase | Perk |
|---|---|
| Better apartment | +10% click power ("well rested") |
| Executive coach | Board satisfaction decays 20% slower |
| Electric sports car | Find New User clicks ×2 ("networking") |
| Bay Area house | Hiring 15% cheaper ("recruiting dinners") |
| Vineyard | Funding rounds unlock at 80% of the user threshold |
| Yacht | Game speed +25% |
| NZ bunker | Nothing |
| A newspaper ($250M) | One news ticker headline per minute turns flattering (*"Visionary founder [Name] on the next chapter"*, from a paper the founder owns) |
| Private island ($300M) | Nothing |
| Suborbital flight ($450M) | Nothing |
| A sports team ($2B) | Nothing |

- **Peer pressure** in the feed: *"Your accelerator batchmate just closed a Series C and bought a place in Tahoe."*

### 3.10 Upgrades

Upgrades are data (§10.3), each with a cost, act, unlock condition and effects (NPS, retention, virality, conversion, revenue, board). Some are paired across acts: a feature bought in Act 1 is paywalled by an Act 2 upgrade, and its card in the panel gets a **Kindly+ only** badge.

A first draft. The content pass (tasks Phase 9) finalizes it.

**Act 1 — Growth**
- Better Onboarding (+click power)
- Invite Friends (+virality)
- Photo Albums (+NPS, +retention)
- Group Chats (+NPS, +retention)
- Mobile App (+virality, +NPS)
- Dark Mode (+NPS)
- Unlimited Photo Storage (+NPS, +retention)
- Memories ("On this day…") (+NPS, +retention)

**Act 2 — Monetize users**
- Launch Kindly+ (enables paying users)
- Dark Mode → Kindly+ (paywall callback; +conversion, −NPS)
- Photo storage limit: 5 GB free (paywall callback; +conversion, −−NPS, +retention)
- Ads in Feed (+ad revenue, −NPS)
- Algorithmic Feed ("Engagement") (+ad revenue, −NPS)
- Simplify Settings (removes data export) (+retention, −NPS)
- Annual Plans (+retention for paying users)
- Retention Flow (9-step cancellation) (+retention, −NPS)
- Price Adjustment (+revenue, −NPS; can be bought repeatedly)
- **Honest options** (worse for revenue, needed for the hidden path): Supporter Tier (optional, no paywall), Tasteful Sponsorships (low revenue, small −NPS)

**Act 3 — Squeeze businesses**
- Kindly for Business (enables advertisers and sellers)
- Kindly Marketplace
- Reach Optimization (organic reach cut) (+ad revenue, −NPS)
- Seller Fee Adjustment (repeatable)
- Promoted Posts Everywhere (+ad revenue, −−NPS)
- Data Partnerships (+revenue, −NPS)
- Synthetic Engagement (AI "friends" to keep feeds busy) (+engagement, −NPS)
- Year of Efficiency (layoffs; −payroll, −NPS target from quality)

### 3.11 Location tabs

Text tabs along the top, A Dark Room style. The home tab's name changes with the company's circumstances: **A Garage** (start) → **An Open-Plan Office** (Seed) → **A Glass Campus** (Act 2) → **An Empty Floor** (Act 4).

| Tab | Unlock | Contains |
|---|---|---|
| Home | Start | Main button, inbox, outages, gauges, money, build upgrades, feed |
| The Team | Seed | Hiring and team assignment |
| The Market | Series A | Rivals, market share, acquisitions; in Act 3 advertisers and sellers |
| Your Life | Series A | Founder net worth, salary, lifestyle, secondary offers, cap table |
| Growth Lab | Act 2 | Levers and A/B tests |
| The Board Room | Series B | Board memos, targets, board satisfaction, directives |

A small dot marks a tab with something new. In Act 4 tabs are sold: struck through, tagged "sold", unclickable. Your Life is never sold. On phones the tabs become a scrollable row.

### 3.12 Levers

Stepped sliders in the Growth Lab. Each shows its immediate revenue effect and a delayed NPS cost ("NPS ▼ slowly"), using the NPS easing from §3.2. The gap between instant reward and slow consequence is the design.

| Lever | Unlock | Range | Effect |
|---|---|---|---|
| Kindly+ price | Kindly+ | $2.99–$14.99 | Higher price: more revenue per paying user, lower paid share, −NPS |
| Ad load | Ads in Feed | 0–5 ads per 10 posts | +ad revenue, −NPS |
| Notifications | Act 2 | Off / Weekly / Daily / Hourly / Engagement-optimized | +engagement (ad revenue), −NPS |
| Seller fee | Marketplace | 5–30% | +seller revenue, −business happiness |
| Organic reach | Kindly for Business | 100% → 5% | Lower reach forces businesses to buy ads; −NPS (feed fills with promoted posts) |
| Data sharing | Data Partnerships | None / Anonymized / Partners / Everyone | +data revenue, −NPS, raises privacy event odds |

In late Act 3 the board can lock a lever at a value it chooses (stamped BOARD-SET).

### 3.13 A/B tests

The Growth team proposes a test every 90 seconds in Act 1 and every 120 seconds in Acts 2–3 (about 65 tests in total). In Act 1 the card appears on the home tab; from Act 2 it lives in the Growth Lab (with a tab dot). Each card has a variant A and B with predicted results, and three buttons: **Ship A**, **Ship B**, **Skip**. Shipped tests apply small permanent effects and are listed in a test history.

- **Act 1:** benign. *"Test #3 · Invite button: blue vs green. B: +1% invites."*
- **Act 2–3:** dark patterns. Confirmshaming (*"No thanks, I don't care about my memories"*), a gray Cancel button, pre-checked boxes, fake scarcity, hidden unsubscribe links. B is always the better number.
- Effects (starting values): Act 1 tests +1% virality; Act 2+ B variants +1% paid share or +1% retention, and −0.6 NPS target each.
- About 45 tests in total, written as content (§5).

### 3.14 Events with choices

A modal card roughly every 3 minutes (190 s ± 15%) from Series A on (about 35 events in total), with 2–3 choices that trade between NPS, board satisfaction, cash and future risk. Examples:

| Event | Choices |
|---|---|
| Privacy bug exposes private albums | Fix quietly (risk of a later scandal) · Disclose and fix (−board, +NPS) · Ignore (nothing now, big risk later) |
| A post goes viral | Ride it (+users) · Feature it in an ad campaign (+users, −NPS: the poster didn't consent) |
| Employee open letter about the ad load | Meet with them (−board) · Thank them in a memo (nothing) · "Restructure" the team (−staff, +board) |
| Regulator inquiry | Cooperate (−cash) · Lobby (−cash, more later) · Stall (risk) |
| Huddle launches a feature users love | Copy it (−cash) · Ignore it (Huddle grows) |

Trust & Safety headcount reduces how often bad events happen and how much they cost. In Act 4 events have only one button: **Acknowledge**.

### 3.15 Support inbox and outages

- **Tickets** arrive in proportion to users. The player answers them with **Answer Ticket** (one click, one ticket, a tiny NPS gain). The Support team answers them automatically. Unanswered tickets pile up; the NPS penalty is `20 × (1 − coverage)`, where coverage = (support capacity + recent hand-answering rate) ÷ arrival rate. The inbox shows one sample ticket from ~60 templates.
- **Outages** happen at random ("⚠ Photo uploads are down"). While one is active, growth pauses and NPS dips. Fixing one is a small **puzzle**: a short snippet of broken code (matched to the outage) with 2 empty slots early on and 3 later; each slot has a tetromino shape, and the player taps a block from a tray, then the slot with the same shape. Decoy blocks fit nowhere; from Act 2 the tray also includes blocks like `trackLocation()` and `sellToPartners()`. Once a Product team exists it fixes outages on its own after a delay, so the puzzle becomes optional. Content: `src/content/puzzles.ts` (one puzzle per outage).
- These are Act 1's caring verbs. In Act 3, when the board moves Support to Ads, tickets are "handled by Kindly Assistant (AI)", the backlog counter climbs into the tens of thousands, and Answer Ticket is disabled.

### 3.16 The Market: rivals and acquisitions

- At Series A a rival app, **Huddle**, appears. It takes a growing share of the total market, shown as a share bar (Kindly / Huddle / others). Product headcount slows it.
- Actions: **Ship a better feature** (costs cash, slows Huddle), **Copy their feature** (one-off, small −NPS), and from Series C **Acquire & sunset** (price ≈ $40 per Huddle user, paid in cash; on the happy path about $500M at ~1:15). Sunsetting moves part of Huddle's users to Kindly and adds +3% retention: users have nowhere else to go.
- In Act 3, once NPS falls below −40, a second rival (**Porch**) springs up from unhappy users. The board wants it acquired too.

### 3.17 Money chart

The Money panel includes a small line chart of revenue and costs over the last ~24 in-game months, with the gap shaded (profit vs. loss). In Act 1 it shows only costs, with funding cash as steps. In Act 2 the player sees revenue cross above costs. In Act 4 interest and fees bury it.

### 3.18 Money sinks

Without sinks, the happy path piles up billions with nothing to buy and money stops being a decision. Every sink carries the story:

| Sink | Act | What it says |
|---|---|---|
| Perks and retreats | 2 | We take care of our people (until we don't) |
| Acquisitions (Huddle, Porch) | 2–3 | Buy the exits so users can't leave |
| Lobbying (event choice) | 2–3 | Make the regulator go away |
| Kindly AI ($1B) | 3 | Spend big on hype; board +10, small engagement boost, −NPS |
| Special dividends | 3 | Hand the cash to shareholders, founder included |
| Dividend recaps | 4 | Ashgrove takes whatever is left |

---

## 4. The Interface

### 4.1 Layout

A clean SaaS-style dashboard under a row of location tabs (§3.11): white cards, a friendly rounded font, one brand color. Panels and tabs appear as they unlock, A Dark Room style. Desktop is a 3-column grid; on a phone the panels stack in a single column.

| Panel | Contents |
|---|---|
| Header | Kindly logo and wordmark, founder name, in-game date |
| Main | The big button, Users (later Free / Paying), support inbox, outage alerts |
| Metrics | NPS and Board Satisfaction gauges side by side, Retention |
| Money | Cash, Revenue, Costs, Profit, Runway, and the revenue-vs-costs chart (§3.17) |
| Team (tab) | Hire button, team rows with [−] / [+], dot grid |
| Upgrades | Cards: affordable, locked, bought, Kindly+ only, BOARD-APPROVED |
| User feed | Scrolling short posts from users and later businesses |
| Board memos | Inbox of memos; newest one expanded |
| Cap table | Ownership list and the founder control line |
| Founder | Net Worth, Lifestyle items, salary |
| News ticker | Scrolls along the bottom of the screen |

### 4.2 Main button labels

| Act | Label |
|---|---|
| 1–2 | Find New User |
| 3 | Convert User |
| 4 | Asset sold (gray, disabled) |
| Hidden ending | Welcome someone |

### 4.3 Palette by act

One set of CSS variables per act:

| Act | Palette |
|---|---|
| 1 | Calm blue: pale blue background, white cards, blue accent |
| 2 | Red: pinkish-red background, aggressive red accent. Deliberately coarse and salesy. |
| 3 | Gray creeps into cards and text |
| 4 | Near monochrome. Sold panels become flat gray blocks with an "Asset sold" stamp. |

The Kindly logo stays calm blue in every act. In Act 2 the good/bad colors would clash with the red palette, so numbers also carry ▲/▼ arrows. Contrast stays readable (WCAG AA) in every palette.

### 4.4 Sound

Synthesized with the Web Audio API, with no audio files. Off by default, toggled in settings. A soft click on the button, and a cheerful "ding" on milestones. In Act 4 the ding is slightly detuned. No music.

### 4.5 Popups

- **"What is this?"** explainers for NPS, Retention, Board Satisfaction, Cap table and Runway. They use plain, accurate definitions in the same cheerful voice.
- Term sheets, secondary sale offers and the buyout offer are modal cards.

---

## 5. Content

All text is data, separate from code, triggered by state conditions.

| Stream | Voice | Rough volume |
|---|---|---|
| User feed | Honest, human, short. The only place the truth always shows. | ~250 posts across all acts, chosen by act, NPS band and recent upgrades |
| Business feed posts | Small business owners, Act 3 | ~40 |
| Board memos | Cheerful corporate; colder by Act 3 | ~40, plus targets and interventions |
| News ticker | Press headlines | ~80 |
| Upgrade descriptions | Press release ("We're excited to…") | One per upgrade |
| A/B tests | Growth team, chipper | ~45 (§3.13) |
| Events | Neutral briefing, with choices | ~35 (§3.14) |
| Support tickets | Users, short | ~60 templates |
| Popups | Plain and friendly | ~10 |
| Endings | §7 | 3 endings |

Feed posts are tagged with conditions, for example `{act: 2, npsBelow: 20, after: "ads_in_feed"}`, and picked at random from the eligible pool without repeating recent ones. Reacting to specific upgrades is what makes the feed feel alive: buy Ads in Feed, and a minute later someone posts *"why is my feed 1/3 ads now."*

Hints for the hidden path live in the feed and memos (§8.3).

---

## 6. Act 4: The Exit

### 6.1 The offer

Ashgrove Equity Partners offers to buy Kindly. A modal shows the price, the founder's personal payout, and two buttons: **Accept** and **Refuse**. A third, **Transfer Kindly to a Members' Trust**, appears only if the hidden path conditions are met (§8).

### 6.2 The vote

- **Accept:** the deal closes.
- **Refuse:** a board vote happens on screen, using founder voting control from the cap table. With control below 50%, the founder loses the vote, is removed as CEO, and the deal closes anyway. The founder's shares are still bought, so the payout still arrives. The player refused and got rich anyway.

### 6.3 The buyout sequence (~20 minutes)

Scripted on a timer (minutes after the offer). Happy-path numbers from the model in brackets.

1. **0:00 · The deal closes.** Debt appears in Money [~$9.7B]. Interest at 9% and Ashgrove's 3% management fee appear under Costs. 60% of the founder's payout lands at once [$2.8B of $4.6B].
2. **1:30 · Dividend recap #1.** Ashgrove has Kindly pay it a special dividend of all its cash [~$3B]. The cash the player built up in Act 3 vanishes in one memo.
3. **Every 2.5 minutes · Divestitures.** A tab or panel is sold and turns into a gray "Asset sold" block: Upgrades ("divested to a strategic partner"), the user feed, The Team, The Market, Growth Lab, Metrics, The Board Room, Money. Each sale cuts revenue by about 18% and comes with a layoff wave (about a third of remaining staff). The main button becomes **Asset sold**.
4. **Every ~3 minutes · Price hikes** (+15%) apply automatically.
5. **8:00 · Feed sunset.** Users start leaving in a flood (+3% churn per minute).
6. **9:00 · Refinancing.** The debt is refinanced at 14%.
7. **10:00 · Dividend recap #2.** Kindly borrows more and pays it out to Ashgrove [debt rises to ~$13.8B].
8. **Throughout:** the founder's number keeps climbing from earnout tranches. The Your Life tab is never sold. One button stays live: **Collect Earnout**. It is the player's last action, and it only makes them richer. Events become Acknowledge-only.
9. **20:00 · Chapter 11.** Cash is negative; *"Kindly files for Chapter 11."* The news ticker turns on the founder (§7.1). Final screen.

If the player refused and was removed, the same sequence plays, but the memos are addressed to the "former CEO," and Collect Earnout still works.

---

## 7. Endings

### 7.1 Main ending (Accept, or Refuse and be removed)

The dashboard is all gray blocks except the Founder panel: Net Worth in large type, the lifestyle items owned, and the bright Kindly logo. The news ticker runs its last headlines:

- *"[Name] walks away with $4.6 billion as 1,829 Kindly employees are laid off"* (numbers from the run)
- *"Kindly files for Chapter 11"*
- *"What happened to Kindly?"*
- *"Opinion: The founder who killed Kindly"*
- If the founder bought the newspaper, one flattering headline from it slips in among them.

The final screen shows the founder's **current** net worth, after the last purchase (on the happy path the $2B sports team leaves it below its peak). This screen should be as bleak as possible: no celebration, no peak figure, nothing left to click.

A last user post fades in. If the player resisted (3 or more board interventions), it is a different post that acknowledges the fight. Then a short final card, and the clickable areas stop responding. Final stats appear on request: users at peak, staff at peak, staff laid off, founder net worth, time played.

### 7.2 Refused and removed

Same as 7.1, with the founder called "former CEO" throughout and one extra headline: *"Ousted Kindly founder [Name] says buyout 'was not my decision'."*

### 7.3 Hidden ending: Members' Trust

Kindly becomes owned by its users. The dashboard **regains its Act 1 color**, the home tab becomes **A Small Office**, Growth Lab and The Board Room disappear, and the main button reads **Welcome someone**. The buttons keep working, and the game can be played forever. Net Worth stays small (about $2M in the model). Headlines:

- *"Kindly tops Best Places to Work for third year"*
- *"Kindly users: 'It still feels like the early days'"*
- *"Founder of user-owned Kindly, [Name], says life has never been better"*

A final user post from someone who has been on Kindly for ten years.

---

## 8. The Hidden Path

Three steps. Missing any one closes it.

### 8.1 Steps

1. **Read the fine print (Seed only).** The Seed term sheet has a big **Accept** button and a small text link, **Propose changes**. It opens "Request one amendment" with four options, and only one can be chosen. The tempting ones come first: raise the valuation by 20%, increase the round, or swap the investor's board seat for an observer seat. The last one, in dry legal language: *"Create Class B Common Stock for founder (10 votes per share); investors receive Class A (1 vote per share)."* Most players who open it will take the money.
2. **Live modestly and buy back (Series A onward).** Decline every secondary sale offer. Then, after Series C, have **Kindly repurchase shares from early investors**: clicking an early investor's row in the cap table reveals **Repurchase**, paid from company cash at the latest valuation. Because the founder never sells, the founder's percentage rises. It costs about $56M of company cash at Series C prices, money that would otherwise fund growth.
3. **Keep NPS positive through Act 3.** This means using honest monetization (Supporter Tier, Tasteful Sponsorships) and skipping the worst upgrades. With founder control above 50%, board interventions fail: *"The board's proposal did not pass."* Layoffs from a stall can still happen, so the honest path has to reach break-even through honest revenue.

**Sunset clause.** Class B shares carry 10 votes only while the founder owns at least **40%** of the company. Below that, they convert to ordinary 1-vote shares. This is a real-world provision, and it's what makes step 2 necessary: without it, dual-class alone would keep the founder at about 89% of the votes and the other steps wouldn't matter.

**Condition for the third button at the buyout offer:** founder voting control > 50% **and** NPS > 0 at the moment of the offer.

### 8.2 Tuning (confirmed by the prototype model)

`node prototype/model.mjs --hidden` plays the hidden path: dual-class at Seed, no secondary sales, honest monetization only (Supporter Tier, one ad per ten posts, Ship A), no acquisitions.

| Moment | Founder shares | Founder votes |
|---|---|---|
| After Seed | 85.0% | 98.3% |
| After Series A | 61.2% | 94.0% |
| After Series B | 50.2% | 91.0% |
| After Series C | 38.1% | 38.1% (sunset clause triggered) |
| After repurchase ($56M) | 41.1% | 87.5% |
| Buyout offer (1:59) | 41.1% | 87.5%, NPS +44: **Trust button shown** |

Each step is necessary:
- Without dual-class, the founder has 41% of the votes and loses.
- With secondary sales, the founder falls further below 40% and needs a much larger repurchase.
- Without the repurchase, the sunset clause leaves the founder at 38%.
- Dark monetization pushes NPS below zero.

It is also tight in the right way. The honest company runs at a small loss through Act 3, with cash falling from about $50M at the start of Act 3 to about $10M by the offer, while the board's proposals keep failing (*"The board's proposal did not pass"*). The real simulator must keep a small margin so a careful player isn't forced into layoffs.

### 8.3 Hints (subtle, fair)

- Act 1 user feed: *"always negotiate your term sheet lol (my cousin learned the hard way)"*
- Act 3 board memo, only if dual-class was chosen: a bitter line about the founder's "unusual share structure"
- An early news item about another fictional company that became user-owned
- The "what is this?" popup for the Cap table mentions that some founders keep control through special share classes

---

## 9. Pacing Simulator

The biggest risk is pacing. The simulator exists to manage it from the start.

- A headless Node script plays the real game through the **Player API** (§10.5), at maximum speed. Bots see only what a human would see and can only press what a human could press.
- **Bot policies:**
  - `compliant`: buys the cheapest affordable upgrade, hires on a fixed ratio, accepts everything, clicks 5 times per second for the first 10 minutes, then 1 per second.
  - `resister`: refuses all monetization upgrades it can avoid.
  - `hidden`: follows the hidden path.
  - `idle`: never clicks after the first minute (catches pacing that depends on clicking too much).
- Bots also need simple policies for the new verbs: a fixed team mix, lever ramps, always Ship B (compliant) or A (resister), and event choice rules.
- `prototype/model.mjs` already implements the `compliant` (happy) and `hidden` policies in simplified form. Port them first and compare timelines.
- **Engagement metrics** from the Player API: time to each new unlock, the longest gap with nothing new to see or do, and the share of time with at least one useful action available. Assertions fail if any gap exceeds 3 minutes (tunable). This measures directly whether the game is giving the player enough to do.
- **Output:** a timeline of beat timestamps (§2.2) and a CSV of key numbers per in-game minute, for charting.
- **Assertions** in tests: compliant beats land within ±20% of their targets; resister reaches Act 4 within 3 hours; hidden bot reaches the Trust option; no bot gets permanently stuck.
- Run with `npm run sim -- --bot compliant`.

---

## 10. Architecture

### 10.1 Stack

- TypeScript, Vite, no UI framework. Plain DOM with small render functions per panel.
- Vitest for tests.
- Node (via `tsx`) for the simulator.
- Deployed as a static site to GitHub Pages or itch.io (decide at deploy time).

### 10.2 Layout

```
src/
  engine/        pure logic, no DOM
    state.ts       GameState type, initial state
    constants.ts   all tunable numbers
    tick.ts        advance(state, dt) — growth, money, NPS easing, churn
    actions.ts     click, answer ticket, fix bug, hire, assign team, set lever, ship test, choose event option, buy upgrade, accept round, sell shares, buyback, acquire, offer choice
    teams.ts  levers.ts  experiments.ts  events.ts  inbox.ts  market.ts
    triggers.ts    unlocks, act transitions, beats, board interventions, layoffs
    act4.ts        scripted buyout timeline
    rng.ts         seeded random (feed picks, etc.)
  api/           the Player API (§10.5)
    player.ts      createGame(seed) → { observe, available, act, advance, log }
    view.ts        GameState → View (exactly what the screen shows)
    metrics.ts     engagement metrics from the action/observation log
  content/       data only
    upgrades.ts  feed.ts  news.ts  memos.ts  popups.ts  endings.ts  names.ts
    experiments.ts  events.ts  tickets.ts
  ui/
    main.ts        boot, game loop (requestAnimationFrame → fixed 10 Hz ticks)
    panels/*.ts    one file per panel
    format.ts      number formatting (1.2K, 3.4M, $1.2B)
    theme.css      palettes per act
    sound.ts       Web Audio synth
  save.ts        localStorage save/load with version number
sim/
  run.ts  bots.ts
  play.ts        text playtest client: prints the View as text, reads commands
tests/
```

### 10.3 Rules

- The engine never touches the DOM. Every client (the browser UI, the bots, the text playtest client, tests) goes through the Player API (§10.5). Nothing outside the engine reads raw `GameState`.
- Time only advances through `advance(state, dt)`. No `Date.now()` in the engine.
- Every random choice uses the seeded RNG stored in state.
- Content files are plain typed data with condition tags; no logic inside.

### 10.4 Saving

- Autosave every 10 seconds and on `visibilitychange`, into `localStorage` as JSON with a `version` field.
- Loading an incompatible version offers a fresh start rather than crashing.
- Settings: sound on/off, reset game (with confirmation), export/import save as text.

### 10.5 Player API

One interface between the game and everything that plays it:

```ts
const game = createGame({ seed, founderName });
game.observe(): View                 // what's on screen right now: tabs, panels, numbers as displayed,
                                     // button labels and enabled/disabled, open modal, feed, ticker
game.available(): Action[]           // every action a human could take right now (visible + enabled)
game.act(action): Result             // click, assign, set lever, ship test, choose option, accept, …
game.advance(seconds): Event[]       // run the clock; returns what appeared (unlocks, modals, memos, posts)
game.log(): Session                  // seed + timestamped actions; replays exactly
```

Rules:
- **View, not state.** `observe()` returns what the player can see, formatted as the UI formats it. Hidden values (true NPS after it's retired, voting math, event odds) are not in the View. Bots and playtesters get no more information than a human. The `?debug` overlay is the only exception, and it is a separate call.
- **The browser UI is just a client.** It renders `observe()` and sends `act()`. If the UI can do something, the API can, and the other way round.
- **Deterministic replay.** Seed plus action log reproduces any session exactly. Bug reports and playtest notes can carry a replay file.
- **Speed.** `advance()` runs the fixed 10 Hz tick as fast as the CPU allows; a full 2.5-hour game should simulate in a few seconds.

Clients:

| Client | Purpose |
|---|---|
| Browser UI | The game |
| `sim/run.ts` bots | Pacing and engagement tests (§9) |
| `sim/play.ts` text client | Claude (or anyone) plays the real game in a terminal at any speed: prints the View as compact text, accepts commands like `click 20`, `assign growth +5`, `lever ads 3`, `ship B`, `wait 30s`. Used for judgment-based playtests ("this stretch is dull", "this memo lands"). |
| Vitest | Tests drive scenarios through the same API |

### 10.6 Developer tools

- `?debug` in the URL shows a dev panel: game speed ×1/×10/×100, jump to act, add cash, show hidden state (true NPS, founder voting control, triggers fired).

---

## 11. Open Questions

These don't block starting; decide them during the build.

1. Name of the PE firm: placeholder **Ashgrove Equity Partners**. Check that no real firm has this name before shipping.
2. Default founder names list.
3. Final numbers: all constants are set by simulator tuning.
4. Deploy target: GitHub Pages or itch.io.
5. A founder who keeps control (dual-class kept) but lets NPS fall below zero: what does **Refuse** do? Proposal: Ashgrove raises its offer twice, and a third refusal leads to a short "You kept it. It's still what you made it" ending, where Kindly stays independent but hollow. Decide during Phase 8.
6. Whether to add a "Credits / about enshittification" screen after the ending, with a pointer to Doctorow's writing.
