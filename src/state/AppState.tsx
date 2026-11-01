/**
 * Global app state: settings, player profile, navigation and the live match.
 * Everything is persisted to localStorage and validated on read.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { achievementsFromMatch, cosmeticsUnlockedBy, type Achievement } from "../game/progression";
import { currentRoute, type RouteId } from "../game/routes";
import { configureAudio, playSound, primeAudio, vibrate } from "../game/sound";
import { buildMatchSummary } from "../game/summary";
import {
  DEFAULT_SETTINGS,
  EMPTY_PROFILE,
  clearAllLocalData,
  loadProfile,
  loadSettings,
  writeJSON,
  type AppSettings,
  type MatchHistoryEntry,
  type Profile,
} from "../game/storage";
import type { GameState } from "../game/types";
import { useGameSession, type GameSession } from "../hooks/useGameSession";

export type SoundName = "roll" | "land" | "capture" | "home" | "win" | "error";

interface AppStateValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  profile: Profile;
  lastUnlocked: Achievement[];
  clearLastUnlocked: () => void;
  resetProfile: () => void;
  storage: { available: boolean; corrupted: boolean };
  resetEverything: () => void;
  route: RouteId;
  navigate: (route: RouteId) => void;
  session: GameSession;
  playSound: (name: SoundName) => void;
  audioPrimed: boolean;
  primeAudio: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [storage, setStorage] = useState({ available: true, corrupted: false });
  const [route, setRoute] = useState<RouteId>(() => currentRoute());
  const [lastUnlocked, setLastUnlocked] = useState<Achievement[]>([]);
  const [audioPrimed, setAudioPrimed] = useState(false);

  const profileRef = useRef(profile);
  profileRef.current = profile;

  /* ------------------------------------------------------------ bootstrap */

  useEffect(() => {
    const storedSettings = loadSettings();
    const storedProfile = loadProfile();
    setSettings(storedSettings.value);
    setProfile(storedProfile.value);
    setStorage({
      available: storedSettings.available && storedProfile.available,
      corrupted: storedSettings.corrupted || storedProfile.corrupted,
    });
  }, []);

  useEffect(() => {
    configureAudio(settings.sound, settings.volume);
  }, [settings.sound, settings.volume]);

  useEffect(() => {
    const onHashChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next: RouteId) => {
    const target = `#/${next}`;
    if (window.location.hash === target) {
      setRoute(next);
      return;
    }
    window.location.hash = target;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const playSoundFn = useCallback((name: SoundName) => {
    playSound(name);
  }, []);

  const prime = useCallback(() => {
    primeAudio();
    setAudioPrimed(true);
  }, []);

  /* --------------------------------------------------------- match records */

  const onMatchComplete = useCallback(
    (state: GameState) => {
      const results = buildMatchSummary(state);
      const humans = results.filter((r) => r.kind === "human");
      const previous = profileRef.current;
      const stats = { ...previous.stats };
      stats.matches += 1;
      for (const row of humans) {
        if (row.rank === 1) stats.wins += 1;
        else stats.losses += 1;
        stats.captures += row.captures;
        stats.sixes += row.sixes;
        stats.tokensHome += row.tokensHome;
        stats.rolls += row.rolls;
      }
      const humanWon = humans.some((r) => r.rank === 1);
      if (humanWon) {
        const turns = results.reduce((max, r) => Math.max(max, r.moves), 0);
        if (stats.fastestWinTurns === null || turns < stats.fastestWinTurns) {
          stats.fastestWinTurns = turns;
        }
        const difficulties = results.filter((r) => r.kind === "ai").map((r) => r.difficulty);
        if (difficulties.includes("hard")) stats.hardestWin = "hard";
        else if (difficulties.includes("medium") && stats.hardestWin !== "hard") {
          stats.hardestWin = "medium";
        }
      }

      const { unlocked } = achievementsFromMatch(previous, results);
      const achievements = { ...previous.achievements };
      for (const achievement of unlocked) achievements[achievement.id] = Date.now();
      const unlockedCosmetics = cosmeticsUnlockedBy(unlocked);
      const mergedUnlocks = Array.from(new Set([...previous.unlocked, ...unlockedCosmetics]));

      const entry: MatchHistoryEntry = {
        id: state.config.id,
        date: Date.now(),
        players: state.players.map((p) => ({
          name: p.name,
          color: p.color,
          kind: p.kind,
        })),
        winner: results[0]?.name ?? null,
        turns: state.turnCount,
        durationMs: (state.endedAt ?? Date.now()) - state.startedAt,
        results,
      };

      const nextProfile: Profile = {
        stats,
        achievements,
        unlocked: mergedUnlocks,
        history: [entry, ...previous.history].slice(0, 30),
        updatedAt: Date.now(),
      };
      profileRef.current = nextProfile;
      setProfile(nextProfile);
      setLastUnlocked(unlocked);
      writeJSON("profile", nextProfile);
      if (unlocked.length > 0 && settings.haptics) vibrate([12, 60, 12]);
    },
    [settings.haptics],
  );

  const session = useGameSession(settings, {
    playSound: playSoundFn,
    onMatchComplete,
  });

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeJSON("settings", next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    writeJSON("settings", DEFAULT_SETTINGS);
  }, []);

  const resetProfile = useCallback(() => {
    profileRef.current = EMPTY_PROFILE;
    setProfile(EMPTY_PROFILE);
    writeJSON("profile", EMPTY_PROFILE);
    setLastUnlocked([]);
  }, []);

  const resetEverything = useCallback(() => {
    const ok = clearAllLocalData();
    setStorage((s) => ({ ...s, available: ok ? s.available : false }));
    profileRef.current = EMPTY_PROFILE;
    setProfile(EMPTY_PROFILE);
    setSettings(DEFAULT_SETTINGS);
    setLastUnlocked([]);
    session.quit();
  }, [session]);

  const value = useMemo<AppStateValue>(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      profile,
      lastUnlocked,
      clearLastUnlocked: () => setLastUnlocked([]),
      resetProfile,
      storage,
      resetEverything,
      route,
      navigate,
      session,
      playSound: playSoundFn,
      audioPrimed,
      primeAudio: prime,
    }),
    [
      settings,
      updateSettings,
      resetSettings,
      profile,
      lastUnlocked,
      resetProfile,
      storage,
      resetEverything,
      route,
      navigate,
      session,
      playSoundFn,
      audioPrimed,
      prime,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateValue {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useApp must be used inside <AppStateProvider>");
  return context;
}
