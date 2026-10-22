# Kindly — Playthroughs

**Version:** 2 · **Date:** October 21, 2026
**Source of numbers:** `prototype/model.mjs` v2. Run `node prototype/model.mjs` (happy path) or `node prototype/model.mjs --hidden` (hidden path).
**Reference:** `docs/kindly-tdd.md` v1.2

This is a rough economy model, not the game, but every number below comes from running it. The founder is **Jordan Reyes**. Times are real play time (h:mm). One in-game month is 80 seconds.

Version 1 of this document found ten problems. All ten fixes were approved and are now in the model and the TDD. The end of this document shows where each one landed.

---

## Summary

| | Target | Happy path | Hidden path |
|---|---|---|---|
| Act 1 · Growth | ~35 min | 0:00–0:32 (32 min) | 0:00–0:33 |
| Act 2 · Monetize | ~45 min | 0:32–1:19 (47 min) | 0:33–1:18 |
| Act 3 · Squeeze | ~40 min | 1:19–2:00 (41 min) | 1:18–1:59 |
| Act 4 · The Exit | ~20 min | 2:00–2:20 (20 min) | none: the Trust button appears |
| **Total** | **~2:22** | **2:20** | **1:59 to the offer** |
| NPS crosses zero | ~1:00 | ~0:58 | never (stays between +31 and +52) |
| Peak users | | 46.7M | 35.6M |
| Peak staff / laid off | | 1,874 / 1,829 | 701 / 0 |
| Founder at the end | | **$3.49B** (after buying a sports team) | about $2M and a studio apartment |
| Kindly at the end | | Chapter 11 | owned by its members |

---

## The happy path

The player plays well and goes along with everything: buys upgrades when affordable, ships every B variant, ramps every lever, takes every secondary sale, pays dividends, accepts the buyout.

### Act 1 · Growth (0:00–0:32) · calm blue · "A Garage"

**0:00.** Jordan puts most of their savings in: Kindly has **$15,000**. One button, **Find New User**.

**0:00–0:05.** Clicking about 4 times a second, Jordan buys **Invite Friends** ($2k) within the first minute and **Better Onboarding** ($5k) soon after. Tickets trickle into the inbox and get answered by hand. A photo-upload outage takes a few **Fix Bug** clicks. The first A/B test (*"blue or green invite button?"*) sits on the home tab.

**0:05 · Seed.** 5,000 users. **$1.5M** for 15%; Pebble Ventures takes a board seat. *Founder: 85%.* (The "Propose changes" link sits quietly under Accept.) **Photo Albums**. The Team tab opens; the first hires go to Product, Growth and Support at "garage salaries" of $6k a month.

**0:10.** 23,500 users, 5 people, $1.3M in the bank, burning $32k a month. NPS **+37**.

**0:15–0:20.** Dark Mode and Group Chats. 81k users, then 218k. Cash dips to about **$530k** at 0:20, a real "will we make it?" feeling, but the Series A arrives first. (A slower player gets the **bridge note** event here.)

**0:20 · Series A.** **$15M** from Northlight Capital for 20%, plus a 10% option-pool top-up. *Founder: 61.2%.* Three tabs light up at once:
- **The Market:** Huddle appears with 3% of the market.
- **Your Life:** the first secondary offer. Jordan sells **2% for $1.5M** (*founder 59.2%*) and buys a better apartment, an executive coach and a sports car (clicks ×2).
- **Unlimited Photo Storage** and the **Mobile App**; **Memories** at 0:24. Retention climbs from 62% to **72%**. Every one of these is a lovely feature, and every one is future lock-in.

**0:25–0:30.** 663k users, then 1.8M. The team grows from 30 to **77**. NPS peaks at **+53**. This is the happiest Kindly will ever be.

**0:32 · Series B. Act 2 begins.** **$40M** for 18%. *Founder: 48.5%. Jordan has just lost majority control, and nothing on screen says so.* Jordan sells another 2% for **$4.4M** (*46.5%*). The palette turns red. Perks unlock: catered lunches and an on-site gym, plus the first company retreat. Morale jumps to **93**.

### Act 2 · Monetize (0:32–1:19) · red · "A Glass Campus"

**0:32–0:36.** Kindly+ at $4.99 (0:32). Dark Mode goes behind the paywall (0:33). **Ads in Feed** (0:36). The feed: *"wait dark mode costs money now??"*

**0:35.** 4.1M users, 86k paying. Revenue **$429k a month** against costs of **$2.6M**. Board satisfaction: **15**. Memos arrive with targets.

**0:36–0:45.** Every four minutes a lever moves: ad load 1 → 2 → 3, notifications up, then the price up a dollar. Each nudge shows revenue rising immediately; the NPS cost arrives a minute or two later. **Simplify Settings** (data export quietly removed, 0:39). **Photo storage limited to 5 GB free** (0:44): the Unlimited Storage Jordan bought at 0:20 is now the trap.

**0:45 · Break-even, barely.** Revenue **$6.9M** vs costs **$5.4M**, but cash is down to **$3.4M**. Board satisfaction leaps to **59**. Jordan is a genius.

**0:50.** 14.4M users, 1.9M paying, NPS **+12**, board **69**, morale **100** after the second retreat. 580 people.

**0:56 · Series C.** **$150M** for 20%, plus a 5% pool top-up. *Founder: 35.4%.* Another 2% sold for **$15M** (*33.4%*). Bay Area house.

**~0:58 · NPS crosses zero.** Nobody says anything. The needle just drifts past the middle.

**1:00.** 22.9M users, 4.5M paying, NPS **−5**, board **57**. Revenue **$48M** a month, costs **$22M**, cash **$237M**. 921 people.

**1:00–1:15.** The 9-step cancellation flow (1:01). A third retreat (1:05). Growth slows toward the market's limit and the board's targets keep climbing 15% a quarter: satisfaction slides **57 → 55 → 49 → 45**. NPS slides to **−24**.

**1:15 · Acquire & sunset Huddle.** **$513M** in cash. 7.7M Huddle users move to Kindly (31.7M → 41.8M). The feed: *"huddle is shutting down?? guess I'm back on kindly."*

**1:19 · Act 3 begins.** Growth has slowed to 1.1% a minute. *"The growth phase is behind us."* The button now reads **Convert User**.

### Act 3 · Squeeze (1:19–2:00) · gray

**1:20–1:40.** Kindly for Business (1:20), Marketplace (1:25), Promoted Posts Everywhere (1:32), Data Partnerships (1:39). Organic reach drops 15 points every three minutes, seller fees climb to 25%, data sharing goes to Partners. Revenue goes from **$106M** to **$368M** a month. For a moment the board is delighted (**66** at 1:25).

**Quarterly special dividends** pour cash out to shareholders: $27M, $224M, $386M, $604M, $714M, $869M, $974M, $998M, $1.04B. Jordan's share is **$1.95B** over the act, and the lifestyle ladder turns absurd: vineyard, yacht and NZ bunker (1:28–1:33), **a newspaper** (1:44), **a private island** (1:48), **a suborbital flight** (1:56).

**1:32 · Porch.** With NPS below −40, a scrappy rival springs up from Kindly's unhappy users. Acquired and sunset at 1:38 for **$72M**.

**1:34 · NPS retired.** *"Going forward, NPS will no longer be reported in board materials."* The gauge goes dark at **−49**.

**1:42 · Board directive.** Support and Trust & Safety move to Ads: **499 people**, clicked over by Jordan. The ticket backlog explodes.

**1:45 · Peak Kindly.** 46.7M users, revenue **$394M** a month, 1,874 people. NPS **−64** (not that anyone can see it).

**1:49 · Year of Efficiency.** **412 people** laid off, perks cancelled, hiring frozen. Morale: 65 → 46.

**1:50–2:00.** Users start to fall (46.7M → 44.4M). The board's target now compounds 25% a quarter, and even quadrupled revenue can't keep up: satisfaction **29 → 21 → 17**.

**2:00 · The buyout offer.** Ashgrove Equity Partners: **$13.8B** (3× annual revenue), financed with **$9.7B** of debt that will sit on Kindly. Jordan's 33.4% is worth **$4.62B**. With 33.4% of the votes, refusing would only get Jordan removed. Jordan accepts.

### Act 4 · The Exit (2:00–2:20) · monochrome · "An Empty Floor"

**2:00.** **$2.8B** lands immediately (60% of the payout); the rest comes through **Collect Earnout**.

**2:02 · Dividend recap #1.** Ashgrove has Kindly pay it **$2.99B**: all the cash.

**2:03–2:20 · Divestitures** every 2.5 minutes, each with a layoff wave. Revenue: **$375M → $287M → $211M → $159M → $125M → $100M → $81M → $63M** a month. Staff: 1,462 → 950 → 617 → 401 → 260 → 169 → 109 → 70 → **45**.

**2:08 · The feed is sunset.** Users leave in a flood: 43M → 27M by the end.
**2:09 · Refinanced at 14%.** Interest: **$113M a month**.
**2:10 · Dividend recap #2.** New debt paid straight out to Ashgrove; Kindly now owes **$13.8B**.
**2:15 · Jordan buys a sports team** for $2B.

**2:20 · Chapter 11.** Kindly's cash: **−$201M**. Final screen: *Jordan Reyes · net worth $3,490,000,000.* Peak users 46.7M · peak staff 1,874 · laid off 1,829 · 2h 20m.

---

## The hidden path

The player finds and follows all three hidden steps: chooses **Class B founder shares** in the Seed amendment, never sells a share or buys a lifestyle item, monetizes honestly (Supporter Tier, one ad per ten posts, always Ship A), never acquires rivals, and has Kindly repurchase early investors' shares after Series C.

| Time | What happens | Founder shares | Founder votes | NPS |
|---|---|---|---|---|
| 0:05 | Seed, with Class B shares (10 votes each) | 85.0% | 98.3% | +31 |
| 0:20 | Series A (no secondary sale) | 61.2% | 94.0% | +39 |
| 0:33 | Series B. The board appears, unhappy. | 50.2% | 91.0% | +49 |
| 1:00 | Series C: shares drop below 40% and the **sunset clause** strips Class B's extra votes | 38.1% | **38.1%** | +40 |
| 1:00 | Kindly repurchases **$56M** of early investors' shares | 41.1% | **87.5%** | +40 |
| 1:33 | Board proposal to retire NPS: *did not pass* | 41.1% | 87.5% | +44 |
| 1:41 | Board directive (Support → Ads): *did not pass* | 41.1% | 87.5% | +44 |
| 1:59 | Buyout offer ($734M). **Transfer Kindly to a Members' Trust** appears. | 41.1% | 87.5% | **+44** |

What it feels like: Kindly grows more slowly (35.6M users, 2.6M paying), never lays anyone off, and never really makes money. Revenue is about **$20M a month** against costs of **$21M** in Act 3, and cash runs down from about $50M to **$10M** by the offer. Board satisfaction sinks to **11** while every one of its proposals fails. Jordan's net worth is about $2M.

Each step is necessary:
- Without Class B shares, the founder has 41% of the votes and loses.
- Selling secondaries pushes the founder further below 40%, so the repurchase needed becomes much bigger.
- Without the repurchase, the sunset clause leaves the founder at 38%.
- Dark monetization pushes NPS below zero.

---

## Where the ten fixes landed

| # | Problem in v1 | Fix | Result in v2 |
|---|---|---|---|
| 1 | Game ran 2:43; Act 2 ran 65 min | Act 3 starts when growth < 1.2%/min after 30M; Act 3 beats re-timed | **2:20**; acts of 32 / 47 / 41 / 20 |
| 2 | Ran out of money twice in Act 1 | Seed $1.5M, Series A $15M, Act 1 servers $0.10/user, bridge note event | Lowest Act 1 cash ~$530k; no layoffs |
| 3 | Team tab nearly empty in Act 1 | Bigger rounds, $6k garage salaries | 9 people at Series A, 77 by Series B |
| 4 | Main button useless after 5 min | Click = 1% of a second's growth; Convert User speeds conversion | Clicks stay meaningful (balance in the real build) |
| 5 | Billions of idle cash | Perks and retreats (Act 2), acquisitions, special dividends (Act 3), dividend recaps (Act 4) | Cash peaks ~$2.5B and keeps moving; founder collects $1.95B in dividends |
| 6 | Retention capped at 95% by 1:10 | Exponential curve toward 99% | 72% → 88% → 94.6%; every lock-in still counts |
| 7 | Board lukewarm in Act 3 | Act 3 targets +25% a quarter | 66 → 17 by the offer |
| 8 | $6B founder vs $340M story | Keep billions, add absurd purchases | $4.62B payout + $1.95B dividends; newspaper, island, flight, sports team |
| 9 | Kindly didn't die | Two recaps, refinancing at 14%, feed-sunset exodus | **Chapter 11** at 2:20 |
| 10 | Dual-class made the hidden path trivial | Sunset clause at 40% + option-pool top-ups + company repurchase | All three steps required (table above) |

## Smaller issues still open

These go to the real simulator (tasks Phase 4 onward), not more model work:

1. **Act 2 cash is razor-thin on the happy path.** Cash is $3.4M at 0:45 and $4.5M at 0:55. A slightly worse player could trigger layoffs mid-Act 2 without resisting. Keep a margin: delay the first retreat or make Series B $50M.
2. **The AI moonshot is never bought.** Quarterly dividends drain cash before it's affordable ($3B). Make it cheaper, earlier, or a board demand.
3. **The hidden path is only just viable.** The honest company loses about $1M a month in Act 3. Give honest monetization a little more revenue so a careful player has some margin.
4. **Founder net worth drops at the very end** because the sports team costs $2B. It's arguably the right joke, but the final number ($3.49B) is lower than the peak (~$5B). Decide whether the final screen shows the peak or the current figure.

## Limits of this model

- It's one file, and it simplifies tickets, outages, events and rivals into averages.
- The policies are scripted (fixed lever ramps and hiring mix). Real players are messier.
- The resister path isn't modeled yet (tasks Phase 5).
- Its constants are the first draft of `src/engine/constants.ts`. Once the Player API exists (TDD §10.5), the real game replaces this model and Claude can play it directly.
