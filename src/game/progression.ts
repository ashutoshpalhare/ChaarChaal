/**
 * ChaarChal progression: achievements and unlockable cosmetics.
 * Everything is computed locally from the player's own match results.
 */

import type { Profile } from "./storage";
import type { Difficulty, MatchResultPlayer } from "./types";

export interface AchievementContext {
  won: boolean;
  isHuman: boolean;
  captures: number;
  sixes: number;
  losses: number;
  turns: number;
  tokensHome: number;
  aiOpponents: number;
  hardestDifficulty: Difficulty | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocks?: string;
  check: (profile: Profile, ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-match",
    name: "Pehla Chaal",
    description: "Finish your first match.",
    icon: "🎲",
    unlocks: "theme-marigold",
    check: (_p, c) => c.isHuman,
  },
  {
    id: "first-win",
    name: "Ghar Wapasi",
    description: "Win a match.",
    icon: "🏆",
    unlocks: "dice-rosewood",
    check: (_p, c) => c.isHuman && c.won,
  },
  {
    id: "first-blood",
    name: "Pehla Khoon",
    description: "Capture an opponent's chaal.",
    icon: "⚔️",
    check: (_p, c) => c.isHuman && c.captures > 0,
  },
  {
    id: "hunter",
    name: "Shikari",
    description: "Capture 25 chaals in total.",
    icon: "🏹",
    unlocks: "token-gem",
    check: (p, c) => c.isHuman && p.stats.captures + c.captures >= 25,
  },
  {
    id: "sixer",
    name: "Chhakka",
    description: "Roll 50 sixes in total.",
    icon: "6️⃣",
    unlocks: "theme-midnight",
    check: (p, c) => c.isHuman && p.stats.sixes + c.sixes >= 50,
  },
  {
    id: "untouchable",
    name: "Achhoot Chaal",
    description: "Win a match without losing a single chaal.",
    icon: "🛡️",
    unlocks: "token-crown",
    check: (_p, c) => c.isHuman && c.won && c.losses === 0,
  },
  {
    id: "sprinter",
    name: "Tez Raftar",
    description: "Win a match in under 60 turns.",
    icon: "⚡",
    unlocks: "theme-royal",
    check: (_p, c) => c.isHuman && c.won && c.turns > 0 && c.turns < 60,
  },
  {
    id: "giant-slayer",
    name: "Bade Khiladi",
    description: "Beat a Hard computer opponent.",
    icon: "🧠",
    unlocks: "dice-obsidian",
    check: (_p, c) => c.isHuman && c.won && c.hardestDifficulty === "hard",
  },
  {
    id: "full-house",
    name: "Chaar Chowkdi",
    description: "Win a 4-player match.",
    icon: "🎪",
    check: (_p, c) => c.isHuman && c.won && c.aiOpponents + 1 >= 4,
  },
  {
    id: "veteran",
    name: "Khaas Khiladi",
    description: "Play 10 matches.",
    icon: "🎖️",
    unlocks: "dice-peacock",
    check: (p, c) => c.isHuman && p.stats.matches + 1 >= 10,
  },
];

export interface Cosmetic {
  id: string;
  kind: "theme" | "dice" | "token";
  name: string;
  description: string;
  unlockedByDefault: boolean;
  requiredBy?: string;
  /** CSS custom-property overrides applied to the board wrapper. */
  vars: Record<string, string>;
}

export const COSMETICS: Cosmetic[] = [
  {
    id: "theme-classic",
    kind: "theme",
    name: "Classic Ivory",
    description: "The timeless Chaupar board.",
    unlockedByDefault: true,
    vars: {
      "--board-face": "#fdf8ee",
      "--board-line": "#e3d5ba",
      "--board-frame": "#b6202f",
      "--board-cell": "rgba(255,255,255,0.72)",
      "--board-accent": "#b37405",
    },
  },
  {
    id: "theme-marigold",
    kind: "theme",
    name: "Marigold Diwali",
    description: "Warm festival hues.",
    unlockedByDefault: false,
    requiredBy: "first-match",
    vars: {
      "--board-face": "#fff6e2",
      "--board-line": "#f0d69a",
      "--board-frame": "#c9741a",
      "--board-cell": "rgba(255,255,255,0.78)",
      "--board-accent": "#a96a05",
    },
  },
  {
    id: "theme-royal",
    kind: "theme",
    name: "Royal Indigo",
    description: "Court of the Maharaja.",
    unlockedByDefault: false,
    requiredBy: "sprinter",
    vars: {
      "--board-face": "#f2f1fb",
      "--board-line": "#d3d0ea",
      "--board-frame": "#3b2f8f",
      "--board-cell": "rgba(255,255,255,0.82)",
      "--board-accent": "#3b2f8f",
    },
  },
  {
    id: "theme-midnight",
    kind: "theme",
    name: "Midnight Chaupar",
    description: "A board for late-night duels.",
    unlockedByDefault: false,
    requiredBy: "sixer",
    vars: {
      "--board-face": "#1b2033",
      "--board-line": "#39415c",
      "--board-frame": "#0f1322",
      "--board-cell": "rgba(255,255,255,0.07)",
      "--board-accent": "#f0a92b",
    },
  },
  {
    id: "dice-ivory",
    kind: "dice",
    name: "Ivory",
    description: "Carved bone dice.",
    unlockedByDefault: true,
    vars: {},
  },
  {
    id: "dice-rosewood",
    kind: "dice",
    name: "Rosewood",
    description: "Polished wooden pips.",
    unlockedByDefault: false,
    requiredBy: "first-win",
    vars: {},
  },
  {
    id: "dice-obsidian",
    kind: "dice",
    name: "Obsidian",
    description: "Stone-cold finish.",
    unlockedByDefault: false,
    requiredBy: "giant-slayer",
    vars: {},
  },
  {
    id: "dice-peacock",
    kind: "dice",
    name: "Peacock",
    description: "Iridescent enamel.",
    unlockedByDefault: false,
    requiredBy: "veteran",
    vars: {},
  },
  {
    id: "token-classic",
    kind: "token",
    name: "Classic Chaal",
    description: "The traditional pawn.",
    unlockedByDefault: true,
    vars: {},
  },
  {
    id: "token-gem",
    kind: "token",
    name: "Gemstone",
    description: "Faceted jewel pawns.",
    unlockedByDefault: false,
    requiredBy: "hunter",
    vars: {},
  },
  {
    id: "token-crown",
    kind: "token",
    name: "Crowned",
    description: "For kings of the board.",
    unlockedByDefault: false,
    requiredBy: "untouchable",
    vars: {},
  },
];

export const COSMETIC_BY_ID = new Map(COSMETICS.map((c) => [c.id, c]));

export function isUnlocked(cosmetic: Cosmetic, profile: Profile): boolean {
  if (cosmetic.unlockedByDefault) return true;
  if (profile.unlocked.includes(cosmetic.id)) return true;
  if (cosmetic.requiredBy && profile.achievements[cosmetic.requiredBy]) return true;
  return false;
}

export function achievementsFromMatch(
  profile: Profile,
  results: MatchResultPlayer[],
): { unlocked: Achievement[]; contexts: AchievementContext[] } {
  const humans = results.filter((r) => r.kind === "human");
  const aiOpponents = results.filter((r) => r.kind === "ai").length;
  const hardestDifficulty = results
    .filter((r) => r.kind === "ai")
    .reduce<Difficulty | null>((acc, r) => {
      if (r.difficulty === "hard") return "hard";
      if (r.difficulty === "medium" && acc !== "hard") return "medium";
      return acc;
    }, null);

  const contexts: AchievementContext[] = humans.map((r) => ({
    won: r.rank === 1,
    isHuman: true,
    captures: r.captures,
    sixes: r.sixes,
    losses: r.losses,
    turns: r.moves,
    tokensHome: r.tokensHome,
    aiOpponents,
    hardestDifficulty,
  }));

  const unlocked: Achievement[] = [];
  for (const achievement of ACHIEVEMENTS) {
    const already = Boolean(profile.achievements[achievement.id]);
    if (already) continue;
    const hit = contexts.some((ctx) => achievement.check(profile, ctx));
    if (hit) unlocked.push(achievement);
  }
  return { unlocked, contexts };
}

export function cosmeticsUnlockedBy(achievements: Achievement[]): string[] {
  return achievements
    .map((a) => a.unlocks)
    .filter((id): id is string => Boolean(id));
}

