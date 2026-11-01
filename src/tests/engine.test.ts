/** Engine + geometry unit tests for ChaarChal. */

import {
  HOME_COLUMN,
  HOME_ENTRY_INDEX,
  HOME_POS,
  RING_END,
  START_INDEX,
  TRACK,
  TRACK_LENGTH,
  cellFor,
  ringIndexFor,
} from "../game/board";
import { chooseMove } from "../game/ai";
import {
  DEFAULT_RULES,
  applyMove,
  createMatch,
  endTurn,
  hasFinished,
  legalMoves,
  rollDice,
  tokensHome,
  validateState,
  winnerOf,
} from "../game/engine";
import { nextDie } from "../game/rng";
import type { Color, GameState, MatchConfig, PlayerConfig, RuleConfig } from "../game/types";
import { assert, assertEquals, test } from "./harness";

function player(name: string, color: Color, kind: PlayerConfig["kind"] = "human"): PlayerConfig {
  return { id: `${color}-p`, name, color, kind, difficulty: "medium" };
}

function matchConfig(
  colors: Color[],
  rules: Partial<RuleConfig> = {},
  seed = 12345,
): MatchConfig {
  return {
    id: "test-match",
    createdAt: 0,
    seed,
    players: colors.map((c, i) => player(`P${i + 1}`, c)),
    rules: { ...DEFAULT_RULES, ...rules },
    tutorial: false,
  };
}

function begin(colors: Color[], rules: Partial<RuleConfig> = {}, seed = 12345): GameState {
  return createMatch(matchConfig(colors, rules, seed));
}

/** Position on `color`'s private path that sits on the given ring square. */
function ringPos(color: Color, ringIndex: number): number {
  const pos = (ringIndex - START_INDEX[color] + TRACK_LENGTH) % TRACK_LENGTH;
  assert(pos >= 0 && pos <= RING_END, `ringPos out of range for ${color}`);
  return pos;
}

/** Brings the state to "dice already rolled" without touching the RNG. */
function withDice(state: GameState, dice: number): GameState {
  return { ...state, dice, phase: "move", sixStreak: dice === 6 ? 1 : 0 };
}

function place(state: GameState, color: Color, slot: number, pos: number): GameState {
  return {
    ...state,
    tokens: state.tokens.map((t) => (t.color === color && t.slot === slot ? { ...t, pos } : t)),
  };
}

function tokenAt(state: GameState, color: Color, slot: number) {
  const found = state.tokens.find((t) => t.color === color && t.slot === slot);
  if (!found) throw new Error(`missing token ${color}-${slot}`);
  return found;
}

/** Finds an rng seed that produces the requested die value. */
function seedFor(value: number): number {
  for (let seed = 1; seed < 100000; seed += 1) {
    if (nextDie(seed)[0] === value) return seed;
  }
  throw new Error("no seed found");
}

/* -------------------------------------------------------------- geometry */

test("board", "the shared ring has exactly 52 squares", () => {
  assertEquals(TRACK.length, TRACK_LENGTH, "ring length");
  assertEquals(TRACK_LENGTH, 52, "ludo ring size");
});

test("board", "ring squares are unique", () => {
  const keys = new Set(TRACK.map((c) => `${c.x},${c.y}`));
  assertEquals(keys.size, TRACK_LENGTH, "unique ring cells");
});

test("board", "start squares are evenly spaced 13 apart", () => {
  const starts = Object.values(START_INDEX);
  assertEquals(starts, [0, 13, 26, 39], "start indexes");
});

test("board", "each colour walks 50 squares before turning home", () => {
  for (const color of Object.keys(START_INDEX) as Color[]) {
    const entry = HOME_ENTRY_INDEX[color];
    const distance = (entry - START_INDEX[color] + TRACK_LENGTH) % TRACK_LENGTH;
    assertEquals(distance, 50, `${color} walk length`);
    assertEquals(HOME_COLUMN[color].length, 5, `${color} home column length`);
  }
});

test("board", "private path index 50 is the home entry square", () => {
  for (const color of Object.keys(START_INDEX) as Color[]) {
    assertEquals(
      ringIndexFor(color, RING_END),
      HOME_ENTRY_INDEX[color],
      `${color} ring end`,
    );
  }
});

test("board", "cellFor maps every position onto the board", () => {
  const red = cellFor("red", 0, 0);
  assertEquals(red, TRACK[0], "red start cell");
  const home = cellFor("red", HOME_POS, 2);
  assertEquals(home.x > 5 && home.x < 9, true, "home slot sits in the centre");
});

/* ------------------------------------------------------------------ dice */

test("dice", "values are always 1..6 and the seed advances", () => {
  let seed = 7;
  for (let i = 0; i < 500; i += 1) {
    const [value, next] = nextDie(seed);
    assert(value >= 1 && value <= 6, `die out of range: ${value}`);
    assert(next !== seed || value >= 1, "seed must advance");
    seed = next;
  }
});

test("dice", "the same seed always produces the same roll", () => {
  assertEquals(nextDie(99)[0], nextDie(99)[0], "deterministic roll");
  assertEquals(nextDie(99)[1], nextDie(99)[1], "deterministic seed");
});

test("dice", "all six faces appear over a long run", () => {
  const seen = new Set<number>();
  let seed = 3;
  for (let i = 0; i < 600; i += 1) {
    const [value, next] = nextDie(seed);
    seen.add(value);
    seed = next;
  }
  assertEquals(seen.size, 6, "every face appears");
});

/* ----------------------------------------------------------- legal moves */

test("moves", "a six is required to enter the ring by default", () => {
  let state = begin(["red", "green"]);
  state = withDice(state, 3);
  assertEquals(legalMoves(state).length, 0, "no entry without a six");
  state = withDice(state, 6);
  assertEquals(legalMoves(state).length, 4, "all four chaals may enter");
});

test("moves", "sixToEnter=false lets any roll enter", () => {
  let state = begin(["red", "green"], { sixToEnter: false });
  state = withDice(state, 2);
  const moves = legalMoves(state);
  assertEquals(moves.length, 4, "entry allowed with any value");
  assertEquals(moves[0].enters, true, "move is an entry");
});

test("moves", "a chaal on the ring moves exactly the dice value", () => {
  let state = begin(["red", "green"]);
  state = place(state, "red", 0, 4);
  state = withDice(state, 5);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "one move available");
  assertEquals(moves[0].from, 4, "from position");
  assertEquals(moves[0].to, 9, "to position");
});

test("moves", "the exact roll is required to finish", () => {
  let state = begin(["red", "green"]);
  state = place(state, "red", 0, 52);
  state = withDice(state, 5);
  assertEquals(legalMoves(state).length, 0, "overshooting home is illegal");
  state = withDice(state, 4);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "exact roll finishes");
  assertEquals(moves[0].finishes, true, "flagged as a finishing move");
});

test("moves", "exactRollToFinish=false allows overshooting home", () => {
  let state = begin(["red", "green"], { exactRollToFinish: false });
  state = place(state, "red", 0, 52);
  state = withDice(state, 5);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "overshoot still finishes");
  assertEquals(moves[0].to, HOME_POS, "clamped to home");
});

test("moves", "finished chaals cannot move again", () => {
  let state = begin(["red", "green"]);
  state = place(state, "red", 0, HOME_POS);
  state = place(state, "red", 1, 10);
  state = withDice(state, 3);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "only the active chaal can move");
  assertEquals(moves[0].tokenId, "red-1", "token id");
});

test("moves", "applyMove ignores a token that has no legal move", () => {
  let state = begin(["red", "green"]);
  state = place(state, "red", 0, 10);
  state = place(state, "green", 0, 3);
  state = withDice(state, 3);
  const before = JSON.stringify(state.tokens);
  const result = applyMove(state, "green-0");
  assertEquals(JSON.stringify(result.tokens), before, "illegal move is a no-op");
});

/* --------------------------------------------------------------- captures */

test("capture", "landing on an opponent sends it back to the yard", () => {
  let state = begin(["red", "green"]);
  // Red walks onto ring square 20, where green already sits.
  state = place(state, "green", 0, ringPos("green", 20));
  state = place(state, "red", 0, 18);
  state = withDice(state, 2);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "single move");
  assertEquals(moves[0].captures.length, 1, "one capture available");
  const next = applyMove(state, moves[0].tokenId);
  assertEquals(tokenAt(next, "green", 1).pos, -1, "victim returns to the yard");
  assertEquals(tokenAt(next, "red", 0).pos, 20, "attacker lands");
});

test("capture", "marked squares are safe", () => {
  let state = begin(["red", "green"]);
  // green sits on the star square at ring 8 — a safe square
  state = place(state, "green", 0, ringPos("green", 8));
  state = place(state, "red", 0, 6);
  state = withDice(state, 2);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "move exists");
  assertEquals(moves[0].captures.length, 0, "no capture on a safe square");
  const next = applyMove(state, moves[0].tokenId);
  assertEquals(tokenAt(next, "green", 0).pos, 47, "safe chaal survives");
});

test("capture", "safeSquares=false allows captures everywhere", () => {
  let state = begin(["red", "green"], { safeSquares: false });
  state = place(state, "green", 0, ringPos("green", 8));
  state = place(state, "red", 0, 6);
  state = withDice(state, 2);
  const moves = legalMoves(state);
  assertEquals(moves[0].captures.length, 1, "capture allowed on the start square");
});

test("capture", "two opponent chaals form a block", () => {
  let state = begin(["red", "green"]);
  const shared = ringPos("green", 20);
  state = place(state, "green", 0, shared);
  state = place(state, "green", 1, shared);
  state = place(state, "red", 0, 18);
  state = withDice(state, 2);
  assertEquals(legalMoves(state).length, 0, "cannot land on a block");
});

test("capture", "blocking=false allows landing on a stack", () => {
  let state = begin(["red", "green"], { blocking: false });
  const shared = ringPos("green", 20);
  state = place(state, "green", 0, shared);
  state = place(state, "green", 1, shared);
  state = place(state, "red", 0, 18);
  state = withDice(state, 2);
  const moves = legalMoves(state);
  assertEquals(moves.length, 1, "landing allowed");
  assertEquals(moves[0].captures.length, 2, "both defenders are captured");
});

test("capture", "own chaals may share a square", () => {
  let state = begin(["red", "green"]);
  state = place(state, "red", 0, 20);
  state = place(state, "red", 1, 18);
  state = withDice(state, 2);
  const moves = legalMoves(state);
  assertEquals(moves.length, 2, "both own chaals can move");
  const next = applyMove(state, "red-1");
  assertEquals(tokenAt(next, "red", 1).pos, 20, "stacking allowed");
});

/* ------------------------------------------------------------ extra turns */

test("turns", "a six grants another roll", () => {
  let state = begin(["red", "green"]);
  state = { ...state, rng: seedFor(6) };
  state = rollDice(state);
  assertEquals(state.dice, 6, "rolled a six");
  state = place(state, "red", 0, 10);
  state = { ...state, rng: seedFor(3) };
  // re-enter move phase with the six pending
  state = withDice(state, 6);
  const moves = legalMoves(state);
  const next = applyMove(state, moves[0].tokenId);
  assertEquals(next.phase, "roll", "extra roll granted");
  assertEquals(next.turn, 0, "still red's turn");
});

test("turns", "extraTurnOnSix=false passes the turn", () => {
  let state = begin(["red", "green"], { extraTurnOnSix: false });
  state = place(state, "red", 0, 10);
  state = withDice(state, 6);
  const next = applyMove(state, legalMoves(state)[0].tokenId);
  assertEquals(next.turn, 1, "turn passes to green");
});

test("turns", "a capture grants another roll", () => {
  let state = begin(["red", "green"], { extraTurnOnSix: false });
  state = place(state, "green", 0, ringPos("green", 20));
  state = place(state, "red", 0, 18);
  state = withDice(state, 2);
  const next = applyMove(state, legalMoves(state)[0].tokenId);
  assertEquals(next.phase, "roll", "extra roll after a capture");
  assertEquals(next.turn, 0, "still red's turn");
});

test("turns", "bringing a chaal home grants another roll", () => {
  let state = begin(["red", "green"], { extraTurnOnSix: false, extraTurnOnCapture: false });
  state = place(state, "red", 0, 52);
  state = withDice(state, 4);
  const next = applyMove(state, legalMoves(state)[0].tokenId);
  assertEquals(next.phase, "roll", "extra roll after reaching home");
});

test("turns", "three sixes forfeit the turn", () => {
  let state = begin(["red", "green"]);
  state = { ...state, sixStreak: 2, phase: "roll", dice: null, rng: seedFor(6) };
  state = rollDice(state);
  assertEquals(state.dice, 6, "third six");
  assertEquals(state.phase, "nomove", "turn forfeited");
  assertEquals(legalMoves(state).length, 0, "no moves after the penalty");
});

test("turns", "the penalty can be switched off", () => {
  let state = begin(["red", "green"], { consecutiveSixPenalty: false });
  state = { ...state, sixStreak: 2, phase: "roll", dice: null, rng: seedFor(6) };
  state = rollDice(state);
  assertEquals(state.phase, "move", "player still moves");
  assertEquals(legalMoves(state).length, 4, "entry moves available");
});

test("turns", "no legal move hands the turn over", () => {
  let state = begin(["red", "green"]);
  state = { ...state, rng: seedFor(3) };
  state = rollDice(state);
  assertEquals(state.phase, "nomove", "nothing to do");
  const next = endTurn(state);
  assertEquals(next.turn, 1, "green is next");
  assertEquals(next.dice, null, "dice cleared");
  assertEquals(next.sixStreak, 0, "six streak reset");
});

test("turns", "rollDice is ignored outside the roll phase", () => {
  let state = begin(["red", "green"]);
  state = withDice(state, 4);
  const next = rollDice(state);
  assertEquals(next, state, "state untouched");
});

/* ------------------------------------------------------------ win conditions */

test("win", "all four chaals home wins the match", () => {
  let state = begin(["red", "green"]);
  state = place(state, "red", 0, HOME_POS);
  state = place(state, "red", 1, HOME_POS);
  state = place(state, "red", 2, HOME_POS);
  state = place(state, "red", 3, 52);
  state = withDice(state, 4);
  const next = applyMove(state, "red-3");
  assertEquals(next.phase, "finished", "match over");
  assertEquals(hasFinished(next, next.players[0].id), true, "red finished");
  assertEquals(winnerOf(next)?.id, next.players[0].id, "red wins");
  assertEquals(tokensHome(next, "red"), 4, "four chaals home");
});

test("win", "playForRankings keeps the match going", () => {
  let state = begin(["red", "green", "yellow"], { playForRankings: true });
  state = place(state, "red", 0, HOME_POS);
  state = place(state, "red", 1, HOME_POS);
  state = place(state, "red", 2, HOME_POS);
  state = place(state, "red", 3, 52);
  state = withDice(state, 4);
  const next = applyMove(state, "red-3");
  assertEquals(next.phase, "roll", "match continues");
  assertEquals(next.rankings.length, 1, "red recorded");
  assert(next.turn !== 0, "turn moved away from the finished player");
});

test("win", "endTurn skips players who already finished", () => {
  let state = begin(["red", "green", "yellow"], { playForRankings: true });
  state = place(state, "green", 0, HOME_POS);
  state = place(state, "green", 1, HOME_POS);
  state = place(state, "green", 2, HOME_POS);
  state = place(state, "green", 3, HOME_POS);
  state = { ...state, turn: 0, phase: "nomove" };
  const next = endTurn(state);
  assertEquals(next.turn, 2, "green is skipped");
});

/* ------------------------------------------------------- validation + save */

test("state", "validateState rejects corrupted payloads", () => {
  assertEquals(validateState(null), false, "null rejected");
  assertEquals(validateState({}), false, "empty object rejected");
  assertEquals(validateState("nope"), false, "string rejected");
});

test("state", "a live state passes validation", () => {
  const state = begin(["red", "blue"]);
  assertEquals(validateState(state), true, "fresh state is valid");
});

/* ------------------------------------------------------- simulated matches */

for (const difficulty of ["easy", "medium", "hard"] as const) {
  for (const players of [["red", "green"], ["red", "green", "yellow"], ["red", "green", "yellow", "blue"]] as Color[][]) {
    test("simulation", `${players.length} players vs ${difficulty} AI plays to a clean finish`, () => {
      let state = createMatch({
        ...matchConfig(players),
        players: players.map((c, i) => ({
          id: `${c}-p`,
          name: `AI ${i + 1}`,
          color: c,
          kind: "ai",
          difficulty,
        })),
      });
      let guard = 0;
      while (state.phase !== "finished" && guard < 20000) {
        guard += 1;
        if (state.phase === "roll") {
          state = rollDice(state);
          continue;
        }
        if (state.phase === "nomove") {
          state = endTurn(state);
          continue;
        }
        const move = chooseMove(state, difficulty);
        if (!move) {
          state = endTurn(state);
          continue;
        }
        assert(
          legalMoves(state).some((m) => m.tokenId === move.tokenId),
          "AI chose an illegal move",
        );
        state = applyMove(state, move.tokenId);
        for (const token of state.tokens) {
          assert(token.pos >= -1 && token.pos <= HOME_POS, "token position out of range");
        }
        assert(state.turn >= 0 && state.turn < state.players.length, "turn out of range");
      }
      assert(guard < 20000, "match did not terminate");
      assertEquals(state.phase, "finished", "match finished");
      assertEquals(state.rankings.length, state.players.length, "full ranking produced");
      const winner = winnerOf(state);
      assert(winner !== null, "a winner exists");
      assertEquals(tokensHome(state, winner.color), 4, "winner has four chaals home");
    });
  }
}
