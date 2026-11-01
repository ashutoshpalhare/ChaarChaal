/** Match summaries: turning a finished GameState into readable results. */

import { HOME_POS } from "./board";
import { rankOf, stepsTravelled, tokensHome } from "./engine";
import type { GameState, MatchResultPlayer } from "./types";

export function buildMatchSummary(state: GameState): MatchResultPlayer[] {
  const rows: MatchResultPlayer[] = state.players.map((player) => {
    const stats = state.stats[player.id] ?? {
      rolls: 0,
      sixes: 0,
      moves: 0,
      captures: 0,
      losses: 0,
      tokensHome: 0,
    };
    return {
      id: player.id,
      name: player.name,
      color: player.color,
      kind: player.kind,
      difficulty: player.difficulty,
      rank: rankOf(state, player.id),
      tokensHome: tokensHome(state, player.color),
      captures: stats.captures,
      losses: stats.losses,
      sixes: stats.sixes,
      rolls: stats.rolls,
      moves: stats.moves,
      steps: stepsTravelled(state, player.color),
    };
  });

  return rows.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.tokensHome !== b.tokensHome) return b.tokensHome - a.tokensHome;
    if (a.steps !== b.steps) return b.steps - a.steps;
    return a.name.localeCompare(b.name);
  });
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function progressLabel(tokensHomeCount: number, steps: number): string {
  const percent = Math.round((steps / (4 * HOME_POS)) * 100);
  return `${tokensHomeCount}/4 home · ${percent}% travelled`;
}
