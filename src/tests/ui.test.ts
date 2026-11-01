/** Presentation-layer tests: routing helpers, formatting and match summaries. */

import { HOME_POS } from "../game/board";
import { DEFAULT_RULES, createMatch, rankOf } from "../game/engine";
import { buildMatchSummary } from "../game/summary";
import { routes, hrefFor, parseHash } from "../game/routes";
import type { Color, PlayerConfig } from "../game/types";
import { assert, assertEquals, test } from "./harness";

function human(name: string, color: Color): PlayerConfig {
  return { id: `${color}-p`, name, color, kind: "human", difficulty: "medium" };
}

test("routes", "every route resolves and round-trips", () => {
  for (const route of routes) {
    const href = hrefFor(route.id);
    assertEquals(href.startsWith("#/"), true, `${route.id} uses a hash URL`);
    assertEquals(parseHash(href), route.id, `${route.id} round-trips`);
  }
  assertEquals(parseHash(""), "home", "empty hash falls back to home");
  assertEquals(parseHash("#/unknown"), "home", "unknown hash falls back to home");
  assertEquals(parseHash("#/play?x=1"), "play", "query strings are ignored");
});

test("summary", "builds a ranked summary for every player", () => {
  const players = [human("Ashu", "red"), human("Riya", "green"), human("Dev", "yellow")];
  let state = createMatch({
    id: "s1",
    createdAt: 0,
    seed: 99,
    players,
    rules: { ...DEFAULT_RULES, playForRankings: true },
    tutorial: false,
  });
  // Finish the red player's chaals.
  state = {
    ...state,
    tokens: state.tokens.map((t) => (t.color === "red" ? { ...t, pos: HOME_POS } : t)),
    rankings: [players[0].id],
    phase: "finished",
    endedAt: 5000,
  };
  const summary = buildMatchSummary(state);
  assertEquals(summary.length, 3, "one row per player");
  assertEquals(summary[0].rank, 1, "winner first");
  assertEquals(summary[0].name, "Ashu", "winner name");
  assertEquals(summary[0].tokensHome, 4, "winner chaals home");
  assert(summary[1].rank > summary[1 - 1].rank, "ranks are ordered");
  assertEquals(rankOf(state, players[0].id), 1, "rankOf helper agrees");
});

test("summary", "breaks ties by progress", () => {
  const players = [human("Ashu", "red"), human("Riya", "green")];
  let state = createMatch({
    id: "s2",
    createdAt: 0,
    seed: 7,
    players,
    rules: { ...DEFAULT_RULES },
    tutorial: false,
  });
  state = {
    ...state,
    tokens: state.tokens.map((t) => (t.color === "red" ? { ...t, pos: 30 } : { ...t, pos: 10 })),
    rankings: [],
    phase: "finished",
    endedAt: 1000,
  };
  const summary = buildMatchSummary(state);
  assertEquals(summary[0].color, "red", "further chaal ranks first");
});
