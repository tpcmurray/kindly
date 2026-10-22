# Build playtest: Phases 1–11

**Who:** Claude · **Date:** October 21, 2026 · **Build:** first full build (all four acts, three endings)
**How:** the text client (`npm run play`) for the first minutes of Act 1, then the browser with `?debug` jumps for each act and ending, plus four simulator bots playing full games through the Player API.

This isn't a substitute for Terry's playtest. It's what I could check myself, and what to watch for.

## Simulator results (seed 1)

| Bot | Ending | Length | Notes |
|---|---|---|---|
| Compliant (goes along with everything) | Main, Chapter 11 | 2:14–2:21 | 0 board interventions; NPS crosses zero ~0:55; Act 3 ~1:13; buyout offer ~1:54 |
| Hidden path | Members' Trust | ~1:59 | 8 failed board proposals, 0 layoffs, NPS stays positive |
| Resister (refuses monetization) | Removed as CEO, Chapter 11 | ~2:49 | 13 board interventions; everyone it hired is eventually laid off |
| Idle (stops clicking after a minute) | Main | ~2:26 | Seed at ~0:09; still finishes |

Longest stretch with nothing new on screen (compliant, Acts 1–3): about 150 seconds.

## What worked

- **The palette shift lands.** Blue → red is a jolt; the red Act 2 dashboard feels pushy and the calm blue logo looks out of place, as intended. Gray Act 3 and monochrome Act 4 read clearly.
- **The two gauges.** In Act 2 the NPS and board needles visibly move in opposite directions.
- **The feed carries the story.** Reaction posts arrive a few seconds after each decision ("wait dark mode costs money now??"), and Act 3's posts are genuinely uncomfortable to read.
- **Act 4.** Watching tabs get struck through and stamped "Asset sold", while Collect Earnout stays bright blue, is the strongest moment in the build.
- **The main ending** is quiet and cold: net worth, owned toys, "Kindly, Inc. has filed for Chapter 11. Your payment has cleared.", grandma's post, the founder's own newspaper headline among the damning ones.

## What to watch for in your playtest

1. **The first few minutes are quiet (30 seconds to ~4 minutes in).** After Invite Friends, the next upgrade needs 500 users; until then it's clicking and the odd ticket. **This is intentional (Terry, 2026-10-21):** an easy start gives players time to adapt to the style, read the feed and news, and understand the intent before the systems pile on.
2. **Act 1 money gets tight around Series A** (cash falls to roughly $500K at 0:20). It's meant to feel like "will we make payroll?". If you hire aggressively you'll get the bridge-note offer.
3. **NPS is retired before it bottoms out.** On the compliant path the gauge goes dark around −50 and keeps falling underneath to −100 by about 1:50. Only the feed shows it.
4. **Act 3 cash piles up again** (over $1B) between dividends. Kindly AI ($1B) and special dividends are the sinks; check whether that feels like a decision or a chore.
5. **Feed posts repeat in long sessions** once an act's pool is used up (repeats avoid the last 30 posts shown).
6. **Phone:** the Team tab works, but it's long. The dashboard is one long column.
7. **Event cadence** (every ~3 minutes from Series A) may feel frequent. Events pause the game while open.

## Known gaps

- The inbox shows one sample ticket at a time, not a list.
- The "kept" ending (refusing the buyout three times while keeping control with NPS below zero) is implemented but only reachable with dual-class shares; it hasn't been playtested.
- Balance is tuned against bots. Real human click rates and reading time will shift the timeline; the TDD's ±20% windows are the target.
