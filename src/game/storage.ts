/**
 * ChaarChal persistence layer.
 *
 * Everything lives in `localStorage` — there is no account, backend or API.
 * Every read is validated; a corrupted or outdated payload is discarded and
 * reported instead of crashing the game.
 */

import { validateState } from "./engine";
import type { GameState, MatchResultPlayer } from "./types";

const NAMESPACE = "chaarchal";
const SCHEMA = 1;

export type StorageKey = "settings" | "profile" | "match";

export interface StorageResult<T> {
  value: T;
  corrupted: boolean;
  available: boolean;
}

function fullKey(key: StorageKey): string {
  return `${NAMESPACE}.${key}.v${SCHEMA}`;
}

export function storageAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const probe = `${NAMESPACE}.probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readJSON<T>(key: StorageKey, fallback: T, guard: (raw: unknown) => raw is T): StorageResult<T> {
  if (!storageAvailable()) return { value: fallback, corrupted: false, available: false };
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return { value: fallback, corrupted: false, available: true };
    const parsed: unknown = JSON.parse(raw);
    if (!guard(parsed)) return { value: fallback, corrupted: true, available: true };
    return { value: parsed, corrupted: false, available: true };
  } catch {
    return { value: fallback, corrupted: true, available: true };
  }
}

export function writeJSON(key: StorageKey, value: unknown): boolean {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: StorageKey): boolean {
  if (!storageAvailable()) return false;
  try {
    window.localStorage.removeItem(fullKey(key));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ guards */

export interface AppSettings {
  sound: boolean;
  volume: number;
  haptics: boolean;
  reducedMotion: "system" | "on" | "off";
  showCoach: boolean;
  autoMoveSingle: boolean;
  confirmQuit: boolean;
  showLegalTargets: boolean;
  boardTheme: string;
  diceSkin: string;
  tokenStyle: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  sound: true,
  volume: 0.6,
  haptics: true,
  reducedMotion: "system",
  showCoach: true,
  autoMoveSingle: true,
  confirmQuit: true,
  showLegalTargets: true,
  boardTheme: "classic",
  diceSkin: "ivory",
  tokenStyle: "classic",
};

export function isSettings(raw: unknown): raw is AppSettings {
  if (!raw || typeof raw !== "object") return false;
  const s = raw as Partial<AppSettings>;
  return (
    typeof s.sound === "boolean" &&
    typeof s.volume === "number" &&
    Number.isFinite(s.volume) &&
    s.volume >= 0 &&
    s.volume <= 1 &&
    typeof s.haptics === "boolean" &&
    (s.reducedMotion === "system" || s.reducedMotion === "on" || s.reducedMotion === "off") &&
    typeof s.boardTheme === "string" &&
    typeof s.diceSkin === "string" &&
    typeof s.tokenStyle === "string"
  );
}

export interface MatchHistoryEntry {
  id: string;
  date: number;
  players: { name: string; color: string; kind: string }[];
  winner: string | null;
  turns: number;
  durationMs: number;
  results: MatchResultPlayer[];
}

export interface Profile {
  stats: {
    matches: number;
    wins: number;
    losses: number;
    captures: number;
    sixes: number;
    tokensHome: number;
    rolls: number;
    fastestWinTurns: number | null;
    hardestWin: string | null;
  };
  achievements: Record<string, number>;
  unlocked: string[];
  history: MatchHistoryEntry[];
  updatedAt: number;
}

export const EMPTY_PROFILE: Profile = {
  stats: {
    matches: 0,
    wins: 0,
    losses: 0,
    captures: 0,
    sixes: 0,
    tokensHome: 0,
    rolls: 0,
    fastestWinTurns: null,
    hardestWin: null,
  },
  achievements: {},
  unlocked: [],
  history: [],
  updatedAt: 0,
};

export function isProfile(raw: unknown): raw is Profile {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Partial<Profile>;
  if (!p.stats || typeof p.stats !== "object") return false;
  if (typeof p.stats.matches !== "number") return false;
  if (typeof p.stats.wins !== "number") return false;
  if (!Array.isArray(p.history)) return false;
  if (!p.achievements || typeof p.achievements !== "object") return false;
  return true;
}

export function isGameState(raw: unknown): raw is GameState {
  return validateState(raw);
}

/* ------------------------------------------------------------ convenience */

export function loadSettings(): StorageResult<AppSettings> {
  const result = readJSON("settings", DEFAULT_SETTINGS, isSettings);
  return { ...result, value: { ...DEFAULT_SETTINGS, ...result.value } };
}

export function loadProfile(): StorageResult<Profile> {
  const result = readJSON("profile", EMPTY_PROFILE, isProfile);
  return {
    ...result,
    value: {
      ...EMPTY_PROFILE,
      ...result.value,
      stats: { ...EMPTY_PROFILE.stats, ...result.value.stats },
      achievements: { ...result.value.achievements },
      unlocked: [...result.value.unlocked],
      history: [...result.value.history].slice(0, 30),
    },
  };
}

export function loadMatch(): StorageResult<GameState | null> {
  return readJSON<GameState | null>("match", null, isGameState);
}

export function saveMatch(state: GameState | null): boolean {
  if (!state) return removeKey("match");
  return writeJSON("match", state);
}

export function clearAllLocalData(): boolean {
  return removeKey("settings") && removeKey("profile") && removeKey("match");
}
