# ChaarChal 🎲

**A premium, offline-first Indian Ludo board game.** Four chaals, four directions, one die.
ChaarChal is a complete, genuinely playable Ludo implementation — a single authoritative rules
engine, rule-aware computer opponents, local multiplayer for 2–4 players, achievements, unlockable
cosmetics and resumable matches. No account, no backend, no tracking.

> Built & enhanced by **Ashutosh Palhare** — Full Stack Developer.
> [Portfolio](https://ashutoshpalhare.github.io/) · [GitHub](https://github.com/ashutoshpalhare) ·
> [All social profiles](https://ashutoshpalhare.github.io/BioLinksV2/)

---

## Contents

- [Quick start](#quick-start)
- [Game modes](#game-modes)
- [The rules ChaarChal enforces](#the-rules-chaarchal-enforces)
- [House rules](#house-rules)
- [Computer opponents](#computer-opponents)
- [Quality-of-life features](#quality-of-life-features)
- [Architecture](#architecture)
- [Testing](#testing)
- [GitHub Pages deployment](#github-pages-deployment)
- [Privacy & local data](#privacy--local-data)
- [Credits & licence](#credits--licence)

---

## Quick start

```bash
npm install        # install dependencies
npm run dev        # start the dev server (http://localhost:5173)
npm run typecheck  # TypeScript validation
npm test           # game-engine and application logic tests
npm run test:smoke # render smoke tests for every app route
npm run build      # production build into dist/
npm run preview    # preview the production build locally
npm run check      # run all checks and the production build
```

Requirements: Node.js `^20.19.0` or `>=22.12.0`, and npm `>=10`. Use Node.js 22 LTS for local development and CI.

ChaarChal is a **static site** — after `npm run build` the whole game lives in `dist/index.html`.
Drop it on any static host and it works.

## Game modes

| Mode | What you get |
| --- | --- |
| **Quick match** | One tap and you are playing against a Medium computer opponent. Easy and Hard variants are one click away. |
| **Custom match** | Choose 2, 3 or 4 seats. Each seat can be a human (pass-and-play) or a computer at Easy / Medium / Hard. |
| **Learn with the coach** | A two-player match with the tutorial coach switched on — contextual hints explain every decision. |
| **Resume** | A match in progress is saved automatically and can be resumed from the lobby or the home screen. |

Seat names, colours and turn order are configurable. Colours can be rotated before the match
starts, and the seat that opens the match is shown in the lobby.

## The rules ChaarChal enforces

All of these live in `src/game/engine.ts`. **The UI can never bypass them** — every interaction is
expressed as intent (`rollDice`, `applyMove`, `endTurn`) and re-validated by the engine.

- **Board geometry** — 15 × 15 grid, four 6 × 6 yards, a 52-square shared ring, five coloured
  run-in squares per player and the home triangle. A chaal walks 57 squares from its start square
  to home.
- **Roll a six to enter** — a chaal leaves its yard only on a six (configurable).
- **Movement** — one chaal moves exactly the number rolled, clockwise around the ring.
- **Extra turns** — for a six, for a capture and for bringing a chaal home (each configurable).
- **Three consecutive sixes** — the turn is forfeited (configurable).
- **Safe squares** — the four start squares and four star squares protect chaals from capture.
- **Capturing** — land on a lone opponent and it returns to its yard.
- **Blocking pairs** — two chaals of one colour on a square form a wall opponents may not land on.
- **Home entry** — a chaal must land exactly on the home triangle; overshooting is illegal.
- **Forced moves** — if a legal move exists you must play one; if none exists the turn passes
  automatically.
- **Win detection** — the first player to bring all four chaals home wins. Optionally keep playing
  for a full ranking of second and third place.
- **Deterministic dice** — the RNG seed lives inside the game state and only advances when a roll
  happens, so matches are reproducible, resumable and testable.

## House rules

Every switch below is enforced by the engine and communicated in the lobby before the match:

`six to enter` · `extra roll on a six` · `extra roll on capture` · `extra roll on reaching home` ·
`three sixes forfeit the turn` · `exact roll to finish` · `safe squares` · `blocking pairs` ·
`play for full rankings` · `turn timer (off / 15s / 30s / 60s)`

## Computer opponents

`src/game/ai.ts` evaluates **only the moves the engine declares legal**. Each candidate is scored
on:

1. finishing a chaal,
2. capturing (weighted by how far the victim had travelled),
3. escaping a square that an opponent can reach within six,
4. avoiding landing in front of an opponent,
5. landing on a marked (safe) square,
6. forming a blocking pair,
7. overall progress and position in the run-in.

| Difficulty | Behaviour |
| --- | --- |
| **Easy** | Mostly noise — it misses captures and walks into danger. |
| **Medium** | Core priorities with moderate noise; a fair sparring partner. |
| **Hard** | Full evaluation with threat detection; punishes loose chaals. |

The AI never sees a future dice value — it receives the state *after* the roll is applied.

## Quality-of-life features

- Animated dice tumble and step-by-step chaal movement.
- Optional synthesised sound effects (Web Audio, no audio files), volume control and haptics.
- Pause / resume, restart, rematch, and a quit confirmation.
- Match feed with colour-coded events, progress bars and per-player statistics.
- Achievements, unlockable board themes, dice skins and chaal styles.
- Match history with full rankings, durations and turn counts.
- Optional turn timer and tutorial coach.
- Keyboard support (`R`/`Space` to roll, `1`–`4` to pick a chaal, `Esc` to pause), focus outlines,
  semantic buttons, ARIA labels and a reduced-motion mode that follows the OS setting.
- In-app **Diagnostics** screen that runs the whole test suite in the browser.

## Architecture

```
src/
  game/                 pure, framework-free domain layer (fully unit tested)
    board.ts            board geometry: ring, start squares, home columns, coordinates
    engine.ts           the authoritative state machine and every rule
    ai.ts               computer-opponent strategy (rule aware, no cheating)
    rng.ts              seeded mulberry32 PRNG owned by the game state
    routes.ts           hash routes (GitHub Pages friendly)
    progression.ts      achievements and unlockable cosmetics
    sound.ts            Web Audio synthesis + haptics
    storage.ts          versioned, validated localStorage persistence
    summary.ts          match summaries and formatting
    types.ts            shared domain types
  hooks/
    useGameSession.ts   orchestration: animation timing, AI turns, turn timer, saves
  state/
    AppState.tsx        settings + profile + navigation context
  components/           presentation only — no rule logic
  tests/                the test suite (runs in-app and in CI)
```

TypeScript is in `strict` mode. There is no `any`, no dead code and no placeholder handler — every
visible button does something real.

## Testing

```bash
npm run typecheck  # TypeScript validation
npm test           # run the full game and application test suite
npm run test:smoke # render every route to catch component-tree failures
```

`npm run check` executes all three checks followed by a production build. The same commands run in GitHub Actions for pull requests and pushes to `main`.

The suite (`src/tests/`) covers:

## GitHub Pages deployment

ChaarChal is a pure static build — no server runtime is required.

1. The site is published automatically from `main` by `.github/workflows/deploy-pages.yml`.
2. In repository settings, choose **Pages → Source: GitHub Actions**.
3. Every successful deployment is published at **https://ashutoshpalhare.github.io/ChaarChaal/**.
4. Pull requests run the normal CI checks; only pushes to `main` publish the live site.

Because the production build is a **single self-contained `index.html`** (via
`vite-plugin-singlefile`) there are no external asset URLs to break, and navigation uses **hash
routes** (`#/play`, `#/rules`, …) so every deep link works from a repository sub-path with no
server rewrites. If you prefer a classic multi-file build, override the base path at build time:

```bash
npx vite build --base=/REPOSITORY_NAME/
```

**Online multiplayer is not part of V1.** Nothing pretends to be a backend. The domain layer is
kept framework-free precisely so a real-time transport (WebSocket/WebRTC) can be added later
without touching the rules engine.

## Privacy & local data

- No account, no server, no database, no API and no analytics.
- Preferences, statistics, achievements, unlocked cosmetics, match history and the match in
  progress are stored in `localStorage` under `chaarchal.*` keys.
- Every read is validated; a corrupted or outdated payload is discarded and the app falls back to
  defaults instead of crashing.
- If storage is blocked (private mode), ChaarChal still plays — it simply cannot remember anything.
- **Settings → Local data & privacy** provides buttons to clear statistics or erase all local data.

## Credits & licence

### Built & enhanced by

**Ashutosh Palhare** — Full Stack Developer

- GitHub: <https://github.com/ashutoshpalhare>
- Portfolio: <https://ashutoshpalhare.github.io/>
- Social profiles: <https://ashutoshpalhare.github.io/BioLinksV2/>

Rules engine, computer opponents, match orchestration, interface, artwork (CSS/SVG), audio
synthesis and the deployment pipeline were all written for ChaarChal.

### Original creator attribution

ChaarChal is an **original codebase** written for this project. It is not a fork, clone or re-skin
of another Ludo repository, so no prior author is claimed or omitted — and no attribution has been
invented. If you fork or reuse ChaarChal, please keep this notice and the licence intact and credit
the original work and your own enhancements separately.

### Licence

MIT — see [LICENSE](./LICENSE).

© ChaarChal
