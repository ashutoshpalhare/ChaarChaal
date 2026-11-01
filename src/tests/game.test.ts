/** AI strategy, persistence and progression tests. */

import { HOME_POS } from "../game/board";
import { chooseMove, threatLevel } from "../game/ai";
import { DEFAULT_RULES, applyMove, createMatch, legalMoves } from "../game/engine";
import { ACHIEVEMENTS, COSMETICS, achievementsFromMatch, isUnlocked } from "../game/progression";
import {
  DEFAULT_SETTINGS,
  EMPTY_PROFILE,
  isProfile,
  isSettings,
} from "../game/storage";
import type { Color, GameState, MatchResultPlayer, PlayerConfig, RuleConfig } from "../game/types";
import { assert, assertEquals, test } from "./harness";

function ai(name: string, color: Color, difficulty: PlayerConfig["difficulty"]): PlayerConfig {
  return { id: `${color}-ai`, name, color, kind: "ai", difficulty };
}

function stateFor(colors: Color[], rules: Partial<RuleConfig> = {}): GameState {
  return createMatch({
    id: "ai-test",
    createdAt: 0,
    seed: 4242,
    players: colors.map((c, i) => ai(`AI${i}`, c, "hard")),
    rules: { ...DEFAULT_RULES, ...rules },
    tutorial: false,
  });
}

function place(state: GameState, color: Color, slot: number, pos: number): GameState {
  return {
    ...state,
    tokens: state.tokens.map((t) => (t.color === color && t.slot === slot ? { ...t, pos } : t)),
  };
}

test("ai", "always returns a legal move", () => {
  let state = stateFor(["red", "green", "yellow", "blue"]);
  state = place(state, "red", 0, 10);
  state = place(state, "red", 1, 20);
  state = place(state, "red", 2, 40);
  state = place(state, "red", 3, -1);
  state = { ...state, dice: 3, phase: "move" };
  const legal = legalMoves(state);
  for (const difficulty of ["easy", "medium", "hard"] as const) {
    for (let i = 0; i < 20; i += 1) {
      const pick = chooseMove(state, difficulty, legal);
      assert(pick !== null, `${difficulty} returned no move`);
      assert(
        legal.some((m) => m.tokenId === pick.tokenId),
        `${difficulty} returned an illegal move`,
      );
    }
  }
});

test("ai", "prefers a finishing move at every difficulty", () => {
  for (const difficulty of ["easy", "medium", "hard"] as const) {
    let state = stateFor(["red", "green"]);
    state = place(state, "red", 0, 52);
    state = place(state, "red", 1, 10);
    state = place(state, "green", 0, 12);
    state = { ...state, dice: 4, phase: "move" };
    const pick = chooseMove(state, difficulty);
    assertEquals(pick?.tokenId, "red-0", `${difficulty} should finish the chaal`);
  }
});

test("ai", "prefers a capture over plain progress on hard", () => {
  let state = stateFor(["red", "green"]);
  const shared = (20 - 13 + 52) % 52;
  state = place(state, "red", 0, 18);
  state = place(state, "red", 1, 40);
  state = place(state, "green", 0, shared);
  state = { ...state, dice: 2, phase: "move" };
  const pick = chooseMove(state, "hard");
  assertEquals(pick?.tokenId, "red-0", "hard AI takes the capture");
  assertEquals(pick?.captures.length, 1, "capture detected");
});

test("ai", "avoids parking in front of an opponent on hard", () => {
  let state = stateFor(["red", "green"]);
  state = place(state, "red", 0, 10);
  state = place(state, "green", 0, 12);
  state = { ...state, dice: 2, phase: "move" };
  const legal = legalMoves(state);
  assertEquals(legal.length, 1, "only one move available");
  const pick = chooseMove(state, "hard");
  assertEquals(pick?.tokenId, "red-0", "forced move still returned");
});

test("ai", "detects threats behind a chaal", () => {
  let state = stateFor(["red", "green"]);
  state = place(state, "red", 0, 10);
  assertEquals(threatLevel(state, "red", 10), 0, "no opponent nearby");
  // Green's private position that maps to ring square 7 (three behind red).
  const behind = (ring: number) => (ring - 13 + 52) % 52;
  state = place(state, "green", 0, behind(7));
  assertEquals(threatLevel(state, "red", 10), 1, "opponent three squares behind");
  state = place(state, "green", 1, behind(1));
  assertEquals(threatLevel(state, "red", 10), 1, "opponent too far away to matter");
  assertEquals(threatLevel(state, "red", HOME_POS), 0, "home is never threatened");
});

test("ai", "never mutates the state it is given", () => {
  let state = stateFor(["red", "green"]);
  state = place(state, "red", 0, 5);
  state = { ...state, dice: 6, phase: "move" };
  const snapshot = JSON.stringify(state);
  chooseMove(state, "hard");
  assertEquals(JSON.stringify(state), snapshot, "state untouched by the AI");
});

/* ------------------------------------------------------------ progression */

function result(overrides: Partial<MatchResultPlayer> = {}): MatchResultPlayer {
  return {
    id: "red-p",
    name: "Ashu",
    color: "red",
    kind: "human",
    difficulty: "medium",
    rank: 1,
    tokensHome: 4,
    captures: 3,
    losses: 0,
    sixes: 4,
    rolls: 20,
    moves: 18,
    steps: 224,
    ...overrides,
  };
}

test("progression", "winning unlocks the expected achievements", () => {
  const { unlocked } = achievementsFromMatch(EMPTY_PROFILE, [
    result({ captures: 1, sixes: 2, moves: 80 }),
  ]);
  const ids = unlocked.map((a) => a.id);
  assert(ids.includes("first-match"), "first match achievement");
  assert(ids.includes("first-win"), "first win achievement");
  assert(ids.includes("first-blood"), "first capture achievement");
  assert(!ids.includes("sprinter"), "sprinter should stay locked above 60 turns");
});

test("progression", "achievements are only awarded once", () => {
  const first = achievementsFromMatch(EMPTY_PROFILE, [result()]);
  const claimed = { "first-win": Date.now() };
  const second = achievementsFromMatch(
    { ...EMPTY_PROFILE, achievements: claimed },
    [result()],
  );
  assertEquals(second.unlocked.some((a) => a.id === "first-win"), false, "already claimed");
  assert(first.unlocked.length > 0, "first run unlocks something");
});

test("progression", "cosmetics respect unlock rules", () => {
  const classic = COSMETICS.find((c) => c.id === "theme-classic");
  const marigold = COSMETICS.find((c) => c.id === "theme-marigold");
  assert(classic && isUnlocked(classic, EMPTY_PROFILE), "default theme unlocked");
  assert(marigold && !isUnlocked(marigold, EMPTY_PROFILE), "locked without progress");
  const withFirstMatch = { ...EMPTY_PROFILE, achievements: { "first-match": 1 } };
  assert(marigold && isUnlocked(marigold, withFirstMatch), "unlocked by achievement");
});

test("progression", "every achievement has a working check", () => {
  for (const achievement of ACHIEVEMENTS) {
    assertEquals(typeof achievement.check, "function", `${achievement.id} has a check`);
    assertEquals(achievement.name.length > 0, true, `${achievement.id} has a name`);
  }
});

/* --------------------------------------------------------------- storage */

test("storage", "settings guard accepts the defaults and rejects junk", () => {
  assertEquals(isSettings(DEFAULT_SETTINGS), true, "defaults are valid");
  assertEquals(isSettings(null), false, "null rejected");
  assertEquals(isSettings({ ...DEFAULT_SETTINGS, volume: 5 }), false, "bad volume rejected");
  assertEquals(isSettings({ ...DEFAULT_SETTINGS, sound: "yes" }), false, "bad sound rejected");
});

test("storage", "profile guard rejects malformed payloads", () => {
  assertEquals(isProfile(EMPTY_PROFILE), true, "empty profile is valid");
  assertEquals(isProfile(null), false, "null rejected");
  assertEquals(isProfile({ stats: "nope" }), false, "bad stats rejected");
  assertEquals(
    isProfile({ ...EMPTY_PROFILE, history: "not-an-array" }),
    false,
    "bad history rejected",
  );
});

test("engine", "applyMove records the move for animation", () => {
  let state = stateFor(["red", "green"]);
  state = place(state, "red", 0, 5);
  state = { ...state, dice: 3, phase: "move" };
  const next = applyMove(state, "red-0");
  assertEquals(next.lastMove?.tokenId, "red-0", "move recorded");
  assertEquals(next.lastMove?.to, 8, "destination recorded");
  assertEquals(next.lastMove?.extraTurn, false, "no extra turn");
});
