/**
 * ChaarChal — shared domain types.
 *
 * These types describe the *authoritative* game state produced by the engine
 * (src/game/engine.ts). UI components read them but never mutate them directly.
 */

export type Color = "red" | "green" | "yellow" | "blue";

export type PlayerKind = "human" | "ai";

export type Difficulty = "easy" | "medium" | "hard";

export interface PlayerConfig {
  id: string;
  name: string;
  color: Color;
  kind: PlayerKind;
  difficulty: Difficulty;
}

/** House rules. Every toggle is enforced by the engine, never by the UI. */
export interface RuleConfig {
  /** A token needs a 6 to leave its yard. */
  sixToEnter: boolean;
  /** Rolling a 6 grants another roll. */
  extraTurnOnSix: boolean;
  /** Capturing an opponent grants another roll. */
  extraTurnOnCapture: boolean;
  /** Bringing a token home grants another roll. */
  extraTurnOnHome: boolean;
  /** Three sixes in a row forfeit the turn. */
  consecutiveSixPenalty: boolean;
  /** A token must land exactly on the home triangle. */
  exactRollToFinish: boolean;
  /** Marked squares (starts + stars) cannot be captured. */
  safeSquares: boolean;
  /** Two tokens of one colour on a square block opponents from landing. */
  blocking: boolean;
  /** Seconds per turn, 0 disables the timer. */
  turnTimerSeconds: number;
  /** Keep playing after the first player finishes to build a full ranking. */
  playForRankings: boolean;
}

export interface MatchConfig {
  id: string;
  createdAt: number;
  seed: number;
  players: PlayerConfig[];
  rules: RuleConfig;
  tutorial: boolean;
}

/** Token position on its own 57-step private path. -1 = yard, 56 = home. */
export interface Token {
  id: string;
  color: Color;
  slot: number;
  pos: number;
}

export type Phase = "roll" | "move" | "nomove" | "finished";

export type LogKind =
  | "info"
  | "roll"
  | "move"
  | "capture"
  | "home"
  | "penalty"
  | "win";

export interface LogEntry {
  id: number;
  kind: LogKind;
  text: string;
  color: Color | null;
}

export interface PlayerStats {
  rolls: number;
  sixes: number;
  moves: number;
  captures: number;
  losses: number;
  tokensHome: number;
}

export interface MoveRecord {
  tokenId: string;
  color: Color;
  from: number;
  to: number;
  entered: boolean;
  finished: boolean;
  captured: string[];
  extraTurn: boolean;
}

export interface GameState {
  version: number;
  config: MatchConfig;
  players: PlayerConfig[];
  tokens: Token[];
  turn: number;
  phase: Phase;
  dice: number | null;
  sixStreak: number;
  rng: number;
  log: LogEntry[];
  logSeq: number;
  rankings: string[];
  stats: Record<string, PlayerStats>;
  turnCount: number;
  startedAt: number;
  endedAt: number | null;
  lastMove: MoveRecord | null;
}

export interface LegalMove {
  tokenId: string;
  from: number;
  to: number;
  enters: boolean;
  finishes: boolean;
  captures: string[];
  landsSafe: boolean;
  formsBlock: boolean;
  /** Steps travelled, used for animation and AI scoring. */
  distance: number;
}

export interface MatchResultPlayer {
  id: string;
  name: string;
  color: Color;
  kind: PlayerKind;
  difficulty: Difficulty;
  rank: number;
  tokensHome: number;
  captures: number;
  losses: number;
  sixes: number;
  rolls: number;
  moves: number;
  steps: number;
}
