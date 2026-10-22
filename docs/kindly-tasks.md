# Kindly — Phases and Tasks

**Reference:** `docs/kindly-tdd.md` (v1.2) · **Wireframes:** `docs/kindly-wireframes.html` · **Playthrough model:** `prototype/model.mjs`, `docs/kindly-playthrough.md`
**Rule:** every phase ends with its eval green before the next phase starts.
**Pacing rule:** from Phase 4 onward, every phase that adds a system also updates the simulator, and the pacing tests must pass.

Evals are Vitest unless stated. Run all with `npm test` from the repo root.

**Status, 2026-10-21:** Phases 1–11 built. 48 tests pass (`npm test`). Simulated full games: compliant 2:14–2:21 (main ending), hidden path → Members' Trust at ~1:59, resister → removed and Chapter 11, idle → main. Screenshots in `docs/screenshots/`, build playtest notes in `docs/playtests/`. The manual "done when" checks marked *(Terry's call)* are waiting on Terry's playtest.

---

## Phase 1 — Scaffolding

**Objective:** project skeleton, tooling, test harness.

- [x] `git init`, `.gitignore` (node_modules, dist, sim output)
- [x] Vite + TypeScript project, strict mode
- [x] Vitest configured; `npm test` script
- [x] `tsx` for the simulator; `npm run sim` script stub
- [x] Folder layout from TDD §10.2 with empty modules
- [x] `README.md`: what it is, how to run, test, simulate and build

**Eval:** one trivial test passes; `npm run build` produces `dist/`.
**Done when:** `npm test` and `npm run build` both succeed, and `npm run dev` shows a blank page titled Kindly.

---

## Phase 2 — Engine core

**Objective:** deterministic state and tick loop with no DOM.

- [x] `state.ts`: `GameState` with every field from TDD §3, an initial state, and an act field
- [x] `constants.ts`: all starting constants from TDD §3, seeded from `prototype/model.mjs` (the tuned playthrough model)
- [x] `rng.ts`: seeded RNG stored in state
- [x] `tick.ts`: `advance(state, dt)` for users (click, organic logistic growth, marketing), cash and costs
- [x] `actions.ts`: Find New User click, Answer Ticket, Fix Bug, hire, assign/unassign team member
- [x] `format.ts`: number and money formatting
- [x] Player API skeleton (TDD §10.5): `createGame`, `observe`, `available`, `act`, `advance`, `log`; View built from state; replay from log

**Eval:** `api.test.ts`: a recorded session replays to an identical View; `available()` never offers a disabled or invisible action; the View contains no hidden values. `tick.test.ts`: same state, same actions, same seed gives identical results; logistic growth slows near TAM; costs reduce cash. `format.test.ts`: 999 → "999", 1200 → "1.2K", 3.4e6 → "3.4M", money formatting with $.
**Done when:** the engine runs 2 hours of game time in a test in under 1 second.

---

## Phase 3 — Act 1 playable (rough UI)

**Objective:** Act 1 playable in the browser with plain panels.

- [x] Incorporation form (founder name, random default from `names.ts`)
- [x] Game loop: requestAnimationFrame driving fixed 10 Hz ticks; the UI renders `observe()` and sends `act()` only
- [x] Location tabs (TDD §3.11): home tab with changing name, The Team, The Market, Your Life; tab dots for new content
- [x] Panels: Main button, Users, Money with burn chart (§3.17), Upgrades, User feed (placeholder posts)
- [x] Support inbox and outages (TDD §3.15): Answer Ticket, Fix Bug, coverage affects NPS
- [x] Team tab: hire, assign Product / Growth / Support / Trust & Safety with [−]/[+], dot grid colored by team (TDD §3.5)
- [x] Benign Act 1 A/B tests (TDD §3.13), a handful of placeholder cards
- [x] Rival Huddle and market share bar on The Market tab (TDD §3.16), compete actions only
- [x] Your Life tab: cap table, net worth, lifestyle (perks come in Phase 5)
- [x] Panels appear when unlocked (TDD §2.2 order)
- [x] Act 1 upgrades from TDD §3.10 as data
- [x] NPS system (TDD §3.2) with easing and the gauge plus popup
- [x] Funding rounds Seed and Series A with term sheet modal (Accept only for now; "Propose changes" later)
- [x] `?debug` dev panel: speed multiplier, jump-to-beat, show hidden state

**Eval:** `nps.test.ts`: NPS eases toward target, does not jump; clamped to ±100. `rounds.test.ts`: round unlocks at its threshold, adds cash, dilutes founder control correctly. `teams.test.ts`: assigning moves people between teams without changing headcount; unassigned people still cost salary. `inbox.test.ts`: unanswered tickets lower NPS; an outage pauses growth until fixed.
**Done when:** Terry can play from incorporation to Series A in the browser, everything appears in the right order, and there is always something to click (Terry's call — pending).

---

## Phase 4 — Pacing simulator

**Objective:** measure the timeline before more content exists.

- [x] `sim/run.ts`: headless runner with CLI flags `--bot`, `--minutes`, `--seed`, playing through the Player API
- [x] `sim/play.ts`: text playtest client (prints the View, reads commands, `wait` advances the clock)
- [x] Engagement metrics (TDD §9): time between unlocks, longest idle gap, share of time with a useful action available
- [x] `sim/bots.ts`: `compliant` and `idle` bots (TDD §9), with policies for tickets, bugs, team mix and A/B tests
- [x] Port the happy-path policy from `prototype/model.mjs` and compare timelines
- [x] Beat recorder: every beat in TDD §2.2 logs its first timestamp
- [x] Output: printed timeline plus `sim/out/<bot>.csv` with per-minute numbers
- [x] Tune Act 1 constants until compliant beats land within ±20%

**Eval:** `pacing.test.ts`: compliant bot hits every Act 1 beat within ±20% of target; idle bot still reaches Seed within 15 minutes. `engagement.test.ts`: no gap with nothing new to see or do longer than 3 minutes in Act 1.
**Playtest:** Claude plays Act 1 through `sim/play.ts` and writes notes to `docs/playtests/`.
**Done when:** `npm run sim -- --bot compliant` prints an Act 1 timeline that matches TDD §2.2.

---

## Phase 5 — Act 2: monetize users

**Objective:** the squeeze on users, the board, and the founder's temptations.

- [x] Series B and C; act transition to Act 2 at Series B
- [x] Free vs paying users, conversion, Kindly+ (TDD §3.1)
- [x] Revenue, costs, profit, runway (TDD §3.4)
- [x] Sales and Ads teams
- [x] Retention metric and churn (TDD §3.3)
- [x] Growth Lab tab: levers Kindly+ price, ad load, notifications (TDD §3.12); dark-pattern A/B tests (§3.13)
- [x] Events with choices (TDD §3.14), a first set of ~10
- [x] Market: Acquire & sunset from Series C (TDD §3.16)
- [x] Board Room tab; red Act 2 palette and A Glass Campus home tab
- [x] Board Satisfaction gauge beside NPS, targets via memos (TDD §3.7)
- [x] Board memos panel
- [x] Act 2 upgrades including paywall callbacks and "Kindly+ only" badges, plus honest options
- [x] Resistance spiral: rounds need growth, automatic layoffs at cash < 0, board interventions with BOARD-APPROVED (TDD §2.3)
- [x] Your Life tab: Net Worth, salary, secondary sale offers, lifestyle ladder with perks (TDD §3.9)
- [x] Team morale (eNPS) gauge and perks: catered lunches, gym, yearly retreat (TDD §3.5)
- [x] Bridge note event at low runway in Act 1 (TDD §3.4)
- [x] Click power scales with production (TDD §3.1)
- [x] Simulator: `resister` bot; extend beat recorder to Act 2

**Eval:** `levers.test.ts`: a lever change moves revenue at once and NPS only gradually. `events.test.ts`: each choice applies its effects exactly once. `churn.test.ts`: high retention holds users despite negative NPS. `board.test.ts`: interventions fire only when board satisfaction is low **and** founder control < 50%; bought upgrades cannot be undone. `layoffs.test.ts`: cash < 0 triggers layoffs one at a time until profit ≥ 0. `pacing.test.ts`: Act 2 beats within ±20%.
**Done when:** a playthrough reaches the Act 3 transition, the two gauges visibly cross for a compliant player, and the resister bot shows layoffs then interventions.

---

## Phase 6 — Act 3: squeeze businesses

**Objective:** the dread act.

- [x] Act 3 transition when growth flattens; button relabel to **Convert User**
- [x] Advertisers, Sellers, business revenue (TDD §3.8)
- [x] Act 3 upgrades
- [x] Act 3 levers: seller fee, organic reach, data sharing; BOARD-SET lever locks
- [x] Board directive to move Support and Trust & Safety to Ads; inbox backlog and disabled Answer Ticket
- [x] Second rival Porch when NPS falls below −40; acquisitions paid in cash
- [x] Board Room: Act 3 quarterly target +25%, special dividends (TDD §3.7), AI moonshot (§3.18)
- [x] Year of Efficiency cancels perks; morale falls
- [x] NPS gauge retired by board memo (gauge goes dark; NPS still works)
- [x] Year of Efficiency layoffs
- [x] Slow user decline masked by Retention
- [x] Simulator: Act 3 beats

**Eval:** `act3.test.ts`: retiring NPS hides the gauge but NPS keeps affecting churn. `pacing.test.ts`: Act 3 beats within ±20%; buyout offer arrives near 2:00 for compliant bot.
**Done when:** a playthrough reaches the buyout offer at about 2 hours.

---

## Phase 7 — Act 4 and the main endings

**Objective:** the exit, the dismantling and the emptiness.

- [x] Buyout offer modal with Accept and Refuse (TDD §6.1)
- [x] Board vote on Refuse, using founder voting control (TDD §6.2)
- [x] `act4.ts` scripted timeline: debt, interest, management fees, layoff waves, price hikes, panel divestitures (TDD §6.3)
- [x] Act 4 timeline from TDD §6.3: dividend recaps #1 and #2, feed sunset exodus, refinancing at 14%, Chapter 11 at the end
- [x] Late lifestyle purchases (newspaper, island, flight, sports team); newspaper slips flattering headlines into the ticker
- [x] Tabs and panels turn into gray "Asset sold" blocks; tabs struck through; main button disabled; events become Acknowledge-only
- [x] Collect Earnout button; Founder panel never sold
- [x] Main ending and Refused ending screens with final stats (TDD §7.1, §7.2)
- [x] Resister nod: different final post after 3+ interventions
- [x] Simulator: runs through to the ending

**Eval:** `act4.test.ts`: Refuse with control < 50% loses the vote and still pays the founder; divestitures happen in order; Founder panel is never divested. `pacing.test.ts`: compliant bot reaches the final screen at 2:22 ±20%; resister bot finishes within 3 hours.
**Done when:** Terry can play Act 4 start to finish from a debug jump, and it lands emotionally (Terry's call — pending).

---

## Phase 8 — The hidden path

**Objective:** the hard-to-find good ending.

- [x] Seed term sheet **Propose changes** link: four amendments, choose one, dual-class listed last (TDD §8.1)
- [x] Sunset clause: Class B votes count only while the founder owns ≥ 40% (TDD §8.1)
- [x] Cap table: clicking an early investor's row reveals **Repurchase**, paid from Kindly's cash (TDD §8.1)
- [x] Failed board proposals when founder control > 50%
- [x] Third buyout button: Transfer Kindly to a Members' Trust (control > 50% and NPS > 0)
- [x] Hidden ending: color returns, "A Small Office", "Welcome someone", game continues forever (TDD §7.3)
- [x] Hints placed (TDD §8.3)
- [x] Simulator: `hidden` bot

**Eval:** `hidden.test.ts`: reproduces the TDD §8.2 table; removing any one step (dual-class, no secondaries, repurchase, positive NPS) loses the Trust button; the Trust button appears only when both conditions hold. `pacing.test.ts`: hidden bot reaches the Trust option.
**Done when:** the hidden bot reaches the Trust ending, and a manual playthrough from a debug save confirms it.

---

## Phase 9 — Content pass

**Objective:** the writing that carries the horror.

- [x] User feed: ~250 posts tagged by act, NPS band and upgrade (TDD §5)
- [x] Business posts: ~40
- [x] Board memos: ~40 plus targets and interventions
- [x] News ticker: ~80 headlines, including the ending sets
- [x] Upgrade descriptions in press-release voice
- [x] A/B tests: ~45 cards (benign in Act 1, dark patterns after)
- [x] Events: ~35 with choices and effects
- [x] Support ticket templates: ~60
- [x] "What is this?" popups
- [x] Ending texts and final user posts (3 endings, plus the resister variant)
- [x] Consistency check: no pronouns for the founder anywhere; no real brands or people

**Eval:** `content.test.ts`: every content item's condition tags reference real upgrades and acts; no founder pronouns (scan for "he/she/his/her" next to founder references); each act has at least 40 eligible feed posts.
**Done when:** Terry has read through every content file and approved the tone (pending).

---

## Phase 10 — Look, feel and sound

**Objective:** the polished dashboard and the color drain.

- [x] SaaS dashboard styling: cards, rounded font, brand color, Kindly logo
- [x] Act palettes and transitions (TDD §4.3): blue → red → gray → monochrome; logo stays calm blue; ▲/▼ arrows on numbers
- [x] News ticker along the bottom
- [x] Panel reveal animations; "Asset sold" stamp
- [x] Phone layout (single column)
- [x] Web Audio sounds, off by default; detuned ding in Act 4 (TDD §4.4)
- [x] Title screen: *"Kindly: Build something people love."*

**Eval:** manual: screenshots of each act at desktop and phone widths in `docs/`; contrast check passes WCAG AA in every palette.
**Done when:** Terry approves the screenshots (`docs/screenshots/`, pending). Contrast: every palette's text passes WCAG AA (4.5:1) after darkening the accents.

---

## Phase 11 — Saving and settings

- [x] Autosave every 10 s and on `visibilitychange` (TDD §10.4)
- [x] Load on start; version check offers fresh start on mismatch
- [x] Settings: sound, reset (confirmed), export/import save text

**Eval:** `save.test.ts`: save → load round-trip equals original state; a corrupt or old save does not crash and offers a fresh start.
**Done when:** closing the tab mid-Act 2 and reopening resumes exactly.

---

## Phase 12 — Playtest, tune and ship

- [ ] Terry plays all the way through without debug tools; notes timing problems
- [ ] One outside playtester, ideally someone who doesn't know the premise
- [ ] Retune constants from playtest notes; simulator still green
- [ ] Resolve TDD §11 open questions
- [ ] Deploy (GitHub Pages or itch.io)

**Eval:** all tests pass; production build loads from the deployed URL.
**Done when:** Kindly is live and the outside playtester reached an ending and could tell us when they first realized something was wrong. The target answer is "somewhere in Act 3."
