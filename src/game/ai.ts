/**
 * ChaarChal computer opponents.
 *
 * The AI only ever receives the current `GameState` and the list of *legal*
 * moves produced by the engine, so it can never cheat, skip a rule or peek at
 * a future dice value. Difficulty changes how much of the evaluation is used
 * and how much noise is mixed in.
 */

import { HOME_POS, RING_END, TRACK_LENGTH, ringIndexFor } from "./board";
import { legalMoves } from "./engine";
import type { Difficulty, GameState, LegalMove } from "./types";

export interface AiWeights {
  noise: number;
  finish: number;
  capture: number;
  enter: number;
  escapeDanger: number;
  landingDanger: number;
  safety: number;
  block: number;
  progress: number;
  homeStretch: number;
}

const WEIGHTS: Record<Difficulty, AiWeights> = {
  easy: {
    noise: 260,
    finish: 240,
    capture: 180,
    enter: 90,
    escapeDanger: 30,
    landingDanger: 20,
    safety: 20,
    block: 10,
    progress: 0.4,
    homeStretch: 0.2,
  },
  medium: {
    noise: 70,
    finish: 700,
    capture: 460,
    enter: 150,
    escapeDanger: 120,
    landingDanger: 95,
    safety: 70,
    block: 55,
    progress: 1.6,
    homeStretch: 1.2,
  },
  hard: {
    noise: 12,
    finish: 1200,
    capture: 820,
    enter: 210,
    escapeDanger: 190,
    landingDanger: 175,
    safety: 95,
    block: 80,
    progress: 2.4,
    homeStretch: 2.2,
  },
};

/**
 * How likely is the square at `pos` (of `color`) to be captured before the
 * owner moves again? Counts opponent tokens sitting 1..6 squares behind it.
 */
export function threatLevel(state: GameState, color: ColorLike, pos: number): number {
  if (pos < 0 || pos > RING_END) return 0;
  const target = ringIndexFor(color, pos);
  if (target === null) return 0;
  let threat = 0;
  for (const token of state.tokens) {
    if (token.color === color) continue;
    if (token.pos < 0 || token.pos > RING_END) continue;
    const other = ringIndexFor(token.color, token.pos);
    if (other === null) continue;
    const gap = (target - other + TRACK_LENGTH) % TRACK_LENGTH;
    if (gap >= 1 && gap <= 6) {
      // Only opponents that could still legally walk that far.
      if (token.pos + gap <= HOME_POS) threat += 1;
    }
  }
  return threat;
}

type ColorLike = GameState["tokens"][number]["color"];

function scoreMove(
  state: GameState,
  move: LegalMove,
  weights: AiWeights,
  opponentColors: ColorLike[],
): number {
  let score = 0;
  const player = state.players[state.turn];

  if (move.finishes) score += weights.finish;
  if (move.captures.length > 0) {
    let value = 0;
    for (const id of move.captures) {
      const victim = state.tokens.find((t) => t.id === id);
      value += victim ? 120 + victim.pos * 6 : 120;
    }
    score += weights.capture + value;
  }
  if (move.enters) {
    const onBoard = state.tokens.filter(
      (t) => t.color === player.color && t.pos >= 0 && t.pos < HOME_POS,
    ).length;
    score += weights.enter * (onBoard === 0 ? 1.5 : onBoard >= 3 ? 0.5 : 1);
  }

  // Escaping a threatened square is good; stepping into one is bad.
  const fromThreat = move.from >= 0 ? threatLevel(state, player.color, move.from) : 0;
  const toThreat = move.landsSafe ? 0 : threatLevel(state, player.color, move.to);
  if (fromThreat > 0 && (toThreat === 0 || move.finishes)) {
    score += weights.escapeDanger * fromThreat;
  } else if (toThreat > fromThreat) {
    score -= weights.landingDanger * toThreat;
  }

  if (move.landsSafe) score += weights.safety;
  if (move.formsBlock) score += weights.block;

  // Prefer developing tokens that are already committed to the race.
  score += (move.to / HOME_POS) * 100 * weights.progress;
  if (move.to > RING_END) score += weights.homeStretch * (move.to - RING_END);

  // Discourage leaving a lone token idling next to a packed yard.
  if (move.to <= RING_END && !move.landsSafe) {
    const idx = ringIndexFor(player.color, move.to);
    if (idx !== null) {
      const behind = (idx - 6 + TRACK_LENGTH) % TRACK_LENGTH;
      for (const c of opponentColors) {
        const start = ringIndexFor(c, 0);
        if (start === behind) score -= 8;
      }
    }
  }

  return score + Math.random() * weights.noise;
}

/** Picks the best legal move for the player on turn. */
export function chooseMove(
  state: GameState,
  difficulty: Difficulty,
  moves?: LegalMove[],
): LegalMove | null {
  const options = moves ?? legalMoves(state);
  if (options.length === 0) return null;
  if (options.length === 1) return options[0];

  const weights = WEIGHTS[difficulty];
  const player = state.players[state.turn];
  const opponents = state.players
    .filter((p) => p.id !== player.id)
    .map((p) => p.color);

  let best = options[0];
  let bestScore = -Infinity;
  for (const move of options) {
    const score = scoreMove(state, move, weights, opponents);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}

/** Human readable reasoning, used by the tutorial coach and event feed. */
export function describeMove(state: GameState, move: LegalMove | null): string {
  const name = state.players[state.turn]?.name ?? "That";
  if (!move) return "No chaal could move.";
  if (move.enters) return `${name} uses the six to bring a fresh chaal out.`;
  if (move.finishes) return "That chaal reaches home and earns another roll.";
  if (move.captures.length > 0) return "That chaal captures an opponent and earns another roll.";
  if (move.enters) return "A six lets a fresh chaal enter the ring.";
  if (move.landsSafe) return "Landing on a marked square keeps that chaal safe.";
  return "That chaal travels the furthest useful distance.";
}
