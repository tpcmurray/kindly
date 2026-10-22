# Kindly

A browser incremental game, about 2 hours 20 minutes long, with a real ending. You found a friendly photo-sharing app called Kindly and build something people love. Then you grow it.

Design: [docs/kindly-tdd.md](docs/kindly-tdd.md) · Tasks: [docs/kindly-tasks.md](docs/kindly-tasks.md) · Wireframes: [docs/kindly-wireframes.html](docs/kindly-wireframes.html) · Screenshots: [docs/screenshots/](docs/screenshots/)

## Run it

```bash
npm install
npm run dev        # http://localhost:5288
```

Add `?debug` to the URL for the developer panel: game speed (×1/×10/×100), jumps to each act (a bot plays until that point), a "hidden path → Trust" shortcut, and the hidden numbers.

The game saves automatically to the browser. Settings (⚙, top right) has sound, export/import of a save, and reset.

## Test, simulate, play

```bash
npm test                              # all evals (Vitest)
npm run sim -- --bot compliant        # pacing simulator: compliant | resister | hidden | idle
npm run play                          # play the real game in the terminal (type `help`)
npm run play -- --script commands.txt # run a scripted session
npm run build                         # production build in dist/
```

The simulator writes per-minute numbers to `sim/out/<bot>.csv`.

## How it's built

- `src/engine/`: pure game logic, no DOM. Deterministic: same seed and actions give the same game. `constants.ts` holds every tunable number.
- `src/content/`: all text and content as plain data (feed posts, news, memos, A/B tests, events, upgrades, endings).
- `src/api/`: the **Player API** (`createGame` → `observe`, `available`, `act`, `advance`, `log`). The browser UI, the bots, the text client and the tests all play through it and see only what a player sees.
- `src/ui/`: the browser UI (plain DOM, renders `observe()`, sends `act()`).
- `sim/`: bots, the pacing simulator and the text client.
- `prototype/model.mjs`: the original economy model the constants were tuned from.
