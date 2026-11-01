/**
 * ChaarChal rules engine — the single source of truth for gameplay.
 *
 * Every exported function is pure: it takes state and returns new state.
 * The UI can only express intent (`rollDice`, `applyMove`, `endTurn`) and the
 * engine re-validates each request, so it is impossible for a component to
 * bypass a rule.
 */

import {
  HOME_POS,
  RING_END,
  TOKENS_PER_PLAYER,
  isSafeRingIndex,
  ringIndexFor,
} from "./board";
import { nextDie } from "./rng";
import type {
  Color,
  GameState,
  LegalMove,
  LogEntry,
  LogKind,
  MatchConfig,
  MoveRecord,
  PlayerConfig,
  PlayerStats,
  RuleConfig,
  Token,
} from "./types";

export const STATE_VERSION = 1;
export const MAX_LOG = 60;

export const DEFAULT_RULES: RuleConfig = {
  sixToEnter: true,
  extraTurnOnSix: true,
  extraTurnOnCapture: true,
  extraTurnOnHome: true,
  consecutiveSixPenalty: true,
  exactRollToFinish: true,
  safeSquares: true,
  blocking: true,
  turnTimerSeconds: 0,
  playForRankings: false,
};

export function createPlayer(
  name: string,
  color: Color,
  kind: PlayerConfig["kind"],
  difficulty: PlayerConfig["difficulty"] = "medium",
): PlayerConfig {
  return {
    id: `${color}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    color,
    kind,
    difficulty,
  };
}

function emptyStats(): PlayerStats {
  return { rolls: 0, sixes: 0, moves: 0, captures: 0, losses: 0, tokensHome: 0 };
}

function pushLog(
  state: GameState,
  kind: LogKind,
  text: string,
  color: Color | null,
): GameState {
  const entry: LogEntry = { id: state.logSeq + 1, kind, text, color };
  const log = [...state.log, entry];
  if (log.length > MAX_LOG) log.splice(0, log.length - MAX_LOG);
  return { ...state, log, logSeq: entry.id };
}

export function createMatch(config: MatchConfig): GameState {
  const tokens: Token[] = [];
  for (const player of config.players) {
    for (let slot = 0; slot < TOKENS_PER_PLAYER; slot += 1) {
      tokens.push({ id: `${player.color}-${slot}`, color: player.color, slot, pos: -1 });
    }
  }
  const stats: Record<string, PlayerStats> = {};
  for (const player of config.players) stats[player.id] = emptyStats();

  const state: GameState = {
    version: STATE_VERSION,
    config,
    players: config.players,
    tokens,
    turn: 0,
    phase: "roll",
    dice: null,
    sixStreak: 0,
    rng: config.seed || 1,
    log: [],
    logSeq: 0,
    rankings: [],
    stats,
    turnCount: 0,
    startedAt: config.createdAt,
    endedAt: null,
    lastMove: null,
  };
  return pushLog(
    state,
    "info",
    `${config.players[0].name} opens the match. Roll a 6 to bring a chaal out.`,
    config.players[0].color,
  );
}

/* ------------------------------------------------------------------ queries */

export function currentPlayer(state: GameState): PlayerConfig {
  return state.players[state.turn];
}

export function tokensOf(state: GameState, color: Color): Token[] {
  return state.tokens.filter((t) => t.color === color);
}

export function tokensHome(state: GameState, color: Color): number {
  return tokensOf(state, color).filter((t) => t.pos === HOME_POS).length;
}

export function stepsTravelled(state: GameState, color: Color): number {
  return tokensOf(state, color).reduce(
    (sum, t) => sum + (t.pos < 0 ? 0 : t.pos),
    0,
  );
}

export function hasFinished(state: GameState, playerId: string): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;
  return tokensHome(state, player.color) === TOKENS_PER_PLAYER;
}

export function activePlayers(state: GameState): PlayerConfig[] {
  return state.players.filter((p) => !hasFinished(state, p.id));
}

function occupantsOnRing(state: GameState, ringIndex: number): Token[] {
  const out: Token[] = [];
  for (const token of state.tokens) {
    if (token.pos < 0 || token.pos > RING_END) continue;
    const idx = ringIndexFor(token.color, token.pos);
    if (idx === ringIndex) out.push(token);
  }
  return out;
}

export function isPositionSafe(state: GameState, color: Color, pos: number): boolean {
  if (!state.config.rules.safeSquares) return false;
  if (pos > RING_END) return true; // own home column
  const idx = ringIndexFor(color, pos);
  return idx !== null && isSafeRingIndex(idx);
}

function capturesAt(state: GameState, color: Color, pos: number): string[] {
  if (pos > RING_END) return [];
  const idx = ringIndexFor(color, pos);
  if (idx === null) return [];
  if (state.config.rules.safeSquares && isSafeRingIndex(idx)) return [];
  return occupantsOnRing(state, idx)
    .filter((t) => t.color !== color)
    .map((t) => t.id);
}

function canLand(state: GameState, color: Color, pos: number): boolean {
  if (pos > RING_END) return true;
  const idx = ringIndexFor(color, pos);
  if (idx === null) return true;
  if (!state.config.rules.blocking) return true;
  const others = occupantsOnRing(state, idx).filter((t) => t.color !== color);
  const byColor = new Map<Color, number>();
  for (const token of others) {
    byColor.set(token.color, (byColor.get(token.color) ?? 0) + 1);
  }
  for (const count of byColor.values()) {
    if (count >= 2) return false;
  }
  return true;
}

function formsBlock(state: GameState, color: Color, pos: number, tokenId: string): boolean {
  if (pos > RING_END) return false;
  const idx = ringIndexFor(color, pos);
  if (idx === null) return false;
  const own = occupantsOnRing(state, idx).filter(
    (t) => t.color === color && t.id !== tokenId,
  );
  return own.length >= 1;
}

/** All legal moves for the player on turn. Empty unless a dice is pending. */
export function legalMoves(state: GameState): LegalMove[] {
  if (state.phase !== "move" || state.dice === null) return [];
  const player = state.players[state.turn];
  const dice = state.dice;
  const rules = state.config.rules;
  const moves: LegalMove[] = [];

  for (const token of state.tokens) {
    if (token.color !== player.color) continue;
    if (token.pos === HOME_POS) continue;

    if (token.pos < 0) {
      if (rules.sixToEnter && dice !== 6) continue;
      if (!canLand(state, player.color, 0)) continue;
      moves.push({
        tokenId: token.id,
        from: -1,
        to: 0,
        enters: true,
        finishes: false,
        captures: capturesAt(state, player.color, 0),
        landsSafe: isPositionSafe(state, player.color, 0),
        formsBlock: formsBlock(state, player.color, 0, token.id),
        distance: 1,
      });
      continue;
    }

    let to = token.pos + dice;
    if (to > HOME_POS) {
      if (rules.exactRollToFinish) continue;
      to = HOME_POS;
    }
    if (!canLand(state, player.color, to)) continue;
    moves.push({
      tokenId: token.id,
      from: token.pos,
      to,
      enters: false,
      finishes: to === HOME_POS,
      captures: capturesAt(state, player.color, to),
      landsSafe: isPositionSafe(state, player.color, to),
      formsBlock: formsBlock(state, player.color, to, token.id),
      distance: to - token.pos,
    });
  }
  return moves;
}

/* ------------------------------------------------------------------ actions */

/** Rolls the dice for the player on turn. No-ops unless the phase is `roll`. */
export function rollDice(state: GameState): GameState {
  if (state.phase !== "roll" || state.endedAt !== null) return state;
  const [value, rng] = nextDie(state.rng);
  const player = state.players[state.turn];
  const stats = { ...state.stats, [player.id]: { ...state.stats[player.id] } };
  stats[player.id].rolls += 1;
  if (value === 6) stats[player.id].sixes += 1;

  let next: GameState = {
    ...state,
    rng,
    dice: value,
    stats,
    turnCount: state.turnCount + 1,
    sixStreak: value === 6 ? state.sixStreak + 1 : 0,
    lastMove: null,
  };
  next = pushLog(
    next,
    "roll",
    `${player.name} rolled ${value === 6 ? "a six!" : value}`,
    player.color,
  );

  const forfeited =
    value === 6 && next.sixStreak >= 3 && state.config.rules.consecutiveSixPenalty;

  if (forfeited) {
    next = pushLog(
      next,
      "penalty",
      `Three sixes in a row — ${player.name} loses the turn.`,
      player.color,
    );
    return { ...next, phase: "nomove", dice: value };
  }

  const moves = legalMoves({ ...next, phase: "move" });
  if (moves.length === 0) {
    return pushLog(
      { ...next, phase: "nomove" },
      "info",
      `No legal chaal for ${player.name}.`,
      player.color,
    );
  }
  return { ...next, phase: "move" };
}

/** Applies a token move. Re-validates the move, so illegal input is ignored. */
export function applyMove(state: GameState, tokenId: string): GameState {
  if (state.phase !== "move") return state;
  const move = legalMoves(state).find((m) => m.tokenId === tokenId);
  if (!move) return state;

  const player = state.players[state.turn];
  const rules = state.config.rules;

  const tokens = state.tokens.map((token) => {
    if (token.id === tokenId) return { ...token, pos: move.to };
    if (move.captures.includes(token.id)) return { ...token, pos: -1 };
    return token;
  });

  const stats = { ...state.stats, [player.id]: { ...state.stats[player.id] } };
  stats[player.id].moves += 1;
  stats[player.id].captures += move.captures.length;
  stats[player.id].tokensHome = tokens.filter(
    (t) => t.color === player.color && t.pos === HOME_POS,
  ).length;
  for (const victimId of move.captures) {
    const victim = state.tokens.find((t) => t.id === victimId);
    if (!victim) continue;
    const victimPlayer = state.players.find((p) => p.color === victim.color);
    if (!victimPlayer) continue;
    stats[victimPlayer.id] = {
      ...state.stats[victimPlayer.id],
      losses: state.stats[victimPlayer.id].losses + 1,
    };
  }

  let next: GameState = { ...state, tokens, stats };

  if (move.enters) {
    next = pushLog(next, "move", `${player.name} brings a chaal onto the board.`, player.color);
  } else if (move.finishes) {
    next = pushLog(next, "home", `${player.name} sends a chaal home!`, player.color);
  } else {
    next = pushLog(next, "move", `${player.name} advances a chaal by ${move.distance}.`, player.color);
  }

  if (move.captures.length > 0) {
    const victims = move.captures
      .map((id) => state.tokens.find((t) => t.id === id))
      .filter((t): t is Token => Boolean(t));
    const names = victims
      .map((v) => state.players.find((p) => p.color === v.color)?.name ?? "A chaal")
      .join(", ");
    next = pushLog(next, "capture", `${player.name} captures ${names}!`, player.color);
  }

  const justFinished = tokensHome(next, player.color) === TOKENS_PER_PLAYER;

  // A player who just brought their last chaal home never rolls again.
  const extraTurn =
    !justFinished &&
    ((rules.extraTurnOnSix && state.dice === 6) ||
      (rules.extraTurnOnCapture && move.captures.length > 0) ||
      (rules.extraTurnOnHome && move.finishes));

  const record: MoveRecord = {
    tokenId,
    color: player.color,
    from: move.from,
    to: move.to,
    entered: move.enters,
    finished: move.finishes,
    captured: move.captures,
    extraTurn,
  };
  next = { ...next, lastMove: record };

  if (justFinished && !next.rankings.includes(player.id)) {
    next = pushLog(
      next,
      "win",
      `${player.name} brought all four chaals home!`,
      player.color,
    );
    next = { ...next, rankings: [...next.rankings, player.id] };
  }

  const remaining = activePlayers(next);
  const matchOver = rules.playForRankings
    ? remaining.length <= 1
    : next.rankings.length > 0;

  if (matchOver) {
    const ordered = [...next.rankings];
    if (ordered.length < next.players.length) {
      for (const p of next.players) {
        if (!ordered.includes(p.id)) ordered.push(p.id);
      }
      ordered.sort((a, b) => {
        const rankA = next.rankings.indexOf(a);
        const rankB = next.rankings.indexOf(b);
        if (rankA !== rankB) {
          if (rankA === -1) return 1;
          if (rankB === -1) return -1;
          return rankA - rankB;
        }
        const pa = next.players.find((p) => p.id === a);
        const pb = next.players.find((p) => p.id === b);
        if (!pa || !pb) return 0;
        return (
          tokensHome(next, pb.color) - tokensHome(next, pa.color) ||
          stepsTravelled(next, pb.color) - stepsTravelled(next, pa.color)
        );
      });
    }
    return {
      ...next,
      phase: "finished",
      endedAt: Date.now(),
      rankings: ordered,
      dice: null,
    };
  }

  if (extraTurn) {
    return { ...next, phase: "roll", dice: null };
  }
  return endTurn(next);
}

/** Passes the turn to the next player who still has chaals on the board. */
export function endTurn(state: GameState): GameState {
  if (state.phase === "finished") return state;
  const total = state.players.length;
  let cursor = state.turn;
  for (let step = 1; step <= total; step += 1) {
    const candidate = (state.turn + step) % total;
    if (!hasFinished(state, state.players[candidate].id)) {
      cursor = candidate;
      break;
    }
  }
  const nextPlayer = state.players[cursor];
  return pushLog(
    {
      ...state,
      turn: cursor,
      phase: "roll",
      dice: null,
      sixStreak: 0,
    },
    "info",
    `${nextPlayer.name}'s turn.`,
    nextPlayer.color,
  );
}

/* ------------------------------------------------------------- match result */

export function winnerOf(state: GameState): PlayerConfig | null {
  if (state.rankings.length === 0) return null;
  return state.players.find((p) => p.id === state.rankings[0]) ?? null;
}

export function rankOf(state: GameState, playerId: string): number {
  const index = state.rankings.indexOf(playerId);
  return index === -1 ? state.rankings.length + 1 : index + 1;
}

export function progressOf(state: GameState, color: Color): number {
  const total = TOKENS_PER_PLAYER * HOME_POS;
  return Math.round((stepsTravelled(state, color) / total) * 100);
}

export function validateState(state: unknown): state is GameState {
  if (!state || typeof state !== "object") return false;
  const s = state as GameState;
  if (s.version !== STATE_VERSION) return false;
  if (!Array.isArray(s.players) || s.players.length < 2 || s.players.length > 4) return false;
  if (!Array.isArray(s.tokens)) return false;
  if (s.tokens.length !== s.players.length * TOKENS_PER_PLAYER) return false;
  if (typeof s.turn !== "number" || s.turn < 0 || s.turn >= s.players.length) return false;
  if (typeof s.rng !== "number" || !Number.isFinite(s.rng)) return false;
  const phases = ["roll", "move", "nomove", "finished"];
  if (!phases.includes(s.phase)) return false;
  const colors = new Set(s.players.map((p) => p.color));
  if (colors.size !== s.players.length) return false;
  for (const token of s.tokens) {
    if (!token || typeof token.pos !== "number") return false;
    if (token.pos < -1 || token.pos > HOME_POS) return false;
    if (!colors.has(token.color)) return false;
  }
  if (typeof s.config !== "object" || s.config === null) return false;
  if (!Array.isArray(s.config.players) || s.config.players.length !== s.players.length) {
    return false;
  }
  if (typeof s.config.rules !== "object" || s.config.rules === null) return false;
  return true;
}
