/**
 * useGameSession — the orchestration layer between the React UI and the pure
 * game engine. It owns animation timing, AI turns, the turn timer, sound
 * feedback and persistence. It never implements a rule: every change goes
 * through `rollDice` / `applyMove` / `endTurn`.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { chooseMove } from "../game/ai";
import { applyMove, createMatch, endTurn, legalMoves, rollDice } from "../game/engine";
import { vibrate } from "../game/sound";
import { loadMatch, removeKey, saveMatch } from "../game/storage";
import type { GameState, LegalMove, MatchConfig } from "../game/types";
import type { AppSettings } from "../game/storage";

export interface AnimState {
  tokenId: string;
  pos: number;
}

export interface GameSession {
  state: GameState | null;
  moves: LegalMove[];
  anim: AnimState | null;
  paused: boolean;
  setPaused: (value: boolean) => void;
  timerLeft: number;
  hasSaved: boolean;
  start: (config: MatchConfig) => void;
  resumeSaved: () => boolean;
  discardSaved: () => void;
  roll: () => void;
  select: (tokenId: string) => void;
  pass: () => void;
  restart: () => void;
  quit: () => void;
}

const STEP_MS = 95;
const AI_THINK_MS = 620;
const NOTICE_MS = 900;

export function useGameSession(
  settings: AppSettings,
  options: {
    playSound: (name: "roll" | "land" | "capture" | "home" | "win" | "error") => void;
    onMatchComplete: (state: GameState) => void;
  },
): GameSession {
  const [state, setState] = useState<GameState | null>(null);
  const [anim, setAnim] = useState<AnimState | null>(null);
  const [paused, setPaused] = useState(false);
  const [timerLeft, setTimerLeft] = useState(0);
  const [hasSaved, setHasSaved] = useState(false);

  const ref = useRef<GameState | null>(null);
  const timers = useRef<number[]>([]);
  const busy = useRef(false);
  const completed = useRef<string | null>(null);
  const settingsRef = useRef(settings);
  const soundRef = useRef(options.playSound);
  const completeRef = useRef(options.onMatchComplete);

  settingsRef.current = settings;
  soundRef.current = options.playSound;
  completeRef.current = options.onMatchComplete;

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const commit = useCallback((updater: (current: GameState) => GameState) => {
    if (!ref.current) return;
    const next = updater(ref.current);
    ref.current = next;
    setState(next);
  }, []);

  /* ------------------------------------------------------------- lifecycle */

  useEffect(() => {
    const stored = loadMatch();
    if (stored.value && stored.value.phase !== "finished") {
      ref.current = stored.value;
      setState(stored.value);
      setHasSaved(true);
    }
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (!state) return;
    if (state.phase === "finished") {
      removeKey("match");
      setHasSaved(false);
      if (completed.current !== state.config.id) {
        completed.current = state.config.id;
        soundRef.current("win");
        completeRef.current(state);
      }
      return;
    }
    const ok = saveMatch(state);
    setHasSaved(ok);
  }, [state]);

  const reducedMotion = useCallback(() => {
    const mode = settingsRef.current.reducedMotion;
    if (mode === "on") return true;
    if (mode === "off") return false;
    return typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /* ---------------------------------------------------------------- actions */

  const doRoll = useCallback(() => {
    if (busy.current) return;
    const current = ref.current;
    if (!current || current.phase !== "roll" || paused) return;
    busy.current = true;
    soundRef.current("roll");
    if (settingsRef.current.haptics) vibrate(12);
    // Short tumble so the dice animation is visible before the value lands.
    timers.current.push(
      window.setTimeout(() => {
        commit(rollDice);
        busy.current = false;
      }, reducedMotion() ? 0 : 260),
    );
  }, [commit, paused, reducedMotion]);

  const doPass = useCallback(() => {
    commit((current) => endTurn(current));
  }, [commit]);

  const playMove = useCallback(
    (tokenId: string) => {
      const current = ref.current;
      if (!current || current.phase !== "move" || busy.current) return;
      const move = legalMoves(current).find((m) => m.tokenId === tokenId);
      if (!move) {
        soundRef.current("error");
        return;
      }
      busy.current = true;

      const finish = () => {
        setAnim(null);
        commit((latest) => applyMove(latest, tokenId));
        if (move.finishes) soundRef.current("home");
        else if (move.captures.length > 0) soundRef.current("capture");
        else soundRef.current("land");
        if (settingsRef.current.haptics) {
          vibrate(move.captures.length > 0 ? [18, 40, 24] : 14);
        }
        busy.current = false;
      };

      if (reducedMotion() || move.from < 0 || move.distance <= 1) {
        finish();
        return;
      }

      const steps: number[] = [];
      for (let pos = move.from; pos <= move.to; pos += 1) steps.push(pos);
      setAnim({ tokenId: move.tokenId, pos: steps[0] });
      steps.forEach((pos, index) => {
        timers.current.push(
          window.setTimeout(
            () => setAnim({ tokenId: move.tokenId, pos }),
            index * STEP_MS,
          ),
        );
      });
      timers.current.push(window.setTimeout(finish, steps.length * STEP_MS + 40));
    },
    [commit, reducedMotion],
  );

  const start = useCallback(
    (config: MatchConfig) => {
      clearTimers();
      busy.current = false;
      completed.current = null;
      setAnim(null);
      setPaused(false);
      const fresh = createMatch(config);
      ref.current = fresh;
      setState(fresh);
    },
    [clearTimers],
  );

  const restart = useCallback(() => {
    const current = ref.current;
    if (!current) return;
    start({
      ...current.config,
      id: `${current.config.id}-r${Date.now().toString(36)}`,
      createdAt: Date.now(),
      seed: (Date.now() % 2147483647) || 1,
    });
  }, [start]);

  const quit = useCallback(() => {
    clearTimers();
    busy.current = false;
    ref.current = null;
    setState(null);
    setAnim(null);
    setPaused(false);
    removeKey("match");
    setHasSaved(false);
  }, [clearTimers]);

  const discardSaved = useCallback(() => {
    removeKey("match");
    setHasSaved(false);
    ref.current = null;
    setState(null);
  }, []);

  const resumeSaved = useCallback(() => {
    const stored = loadMatch();
    if (!stored.value || stored.value.phase === "finished") {
      removeKey("match");
      setHasSaved(false);
      return false;
    }
    ref.current = stored.value;
    setState(stored.value);
    setPaused(false);
    return true;
  }, []);

  /* ------------------------------------------------------------- AI + QoL */

  useEffect(() => {
    if (!state || paused || state.phase === "finished" || anim) return;
    const player = state.players[state.turn];

    if (player.kind === "ai") {
      const delay = state.phase === "roll" ? AI_THINK_MS : AI_THINK_MS * 0.7;
      const id = window.setTimeout(() => {
        const current = ref.current;
        if (!current) return;
        if (current.phase === "roll") {
          doRoll();
        } else if (current.phase === "move") {
          const pick = chooseMove(current, player.difficulty);
          if (pick) playMove(pick.tokenId);
        } else if (current.phase === "nomove") {
          doPass();
        }
      }, delay);
      return () => window.clearTimeout(id);
    }

    if (state.phase === "nomove") {
      const id = window.setTimeout(() => doPass(), NOTICE_MS);
      return () => window.clearTimeout(id);
    }

    if (state.phase === "move" && settingsRef.current.autoMoveSingle) {
      const moves = legalMoves(state);
      if (moves.length === 1) {
        const id = window.setTimeout(() => playMove(moves[0].tokenId), NOTICE_MS);
        return () => window.clearTimeout(id);
      }
    }
    return undefined;
  }, [state, paused, anim, doRoll, doPass, playMove]);

  /* ------------------------------------------------------------ turn timer */

  useEffect(() => {
    if (!state || paused || state.phase === "finished" || anim) return;
    const limit = state.config.rules.turnTimerSeconds;
    if (!limit) {
      setTimerLeft(0);
      return;
    }
    const deadline = Date.now() + limit * 1000;
    setTimerLeft(limit);
    const interval = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimerLeft(left);
      if (left > 0) return;
      window.clearInterval(interval);
      const current = ref.current;
      if (!current) return;
      if (current.phase === "roll") doRoll();
      else if (current.phase === "move") {
        const moves = legalMoves(current);
        if (moves.length > 0) playMove(moves[0].tokenId);
      } else if (current.phase === "nomove") doPass();
    }, 250);
    return () => window.clearInterval(interval);
  }, [state, paused, anim, doRoll, doPass, playMove]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const moves = state && state.phase === "move" ? legalMoves(state) : [];

  return {
    state,
    moves,
    anim,
    paused,
    setPaused,
    timerLeft,
    hasSaved,
    start,
    resumeSaved,
    discardSaved,
    roll: doRoll,
    select: playMove,
    pass: doPass,
    restart,
    quit,
  };
}
