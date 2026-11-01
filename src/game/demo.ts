/**
 * Mid-game demo states for the rules walkthrough.
 * Uses the real engine + AI so the illustration always shows a legal position.
 */

import { chooseMove } from "./ai";
import { DEFAULT_RULES, applyMove, createMatch, endTurn, legalMoves, rollDice } from "./engine";
import type { GameState } from "./types";

/** Plays `turns` playout turns and returns the resulting board. */
export function makeDemoState(seed: number, turns = 14): GameState {
  let state = createMatch({
    id: `demo-${seed}`,
    createdAt: 0,
    seed,
    players: [
      { id: "d-red", name: "Laal", color: "red", kind: "ai", difficulty: "hard" },
      { id: "d-green", name: "Hara", color: "green", kind: "ai", difficulty: "hard" },
    ],
    rules: { ...DEFAULT_RULES },
    tutorial: false,
  });

  for (let i = 0; i < turns * 6 && state.turnCount < turns; i += 1) {
    if (state.phase === "finished") break;
    if (state.phase === "roll") {
      state = rollDice(state);
      continue;
    }
    if (state.phase === "nomove") {
      state = endTurn(state);
      continue;
    }
    const move = chooseMove(state, "hard");
    if (!move) {
      state = endTurn(state);
      continue;
    }
    state = applyMove(state, move.tokenId);
  }

  // Leave the board in a "pick a chaal" state whenever possible.
  if (state.phase === "roll") {
    for (let attempt = 0; attempt < 24 && state.phase !== "move"; attempt += 1) {
      state = rollDice(state);
      if (state.phase === "nomove") state = endTurn(state);
    }
  }
  return state;
}

export function demoLegalMoves(state: GameState) {
  return state.phase === "move" ? legalMoves(state) : [];
}
