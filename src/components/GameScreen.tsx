/** In-match screen: board, dice, players, event feed, coach and overlays. */

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Crown,
  Dices,
  Home as HomeIcon,
  Info,
  Keyboard,
  Lightbulb,
  LogOut,
  Pause,
  RotateCcw,
  Sparkles,
  Swords,
  Timer,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Board } from "../components/Board";
import { DiceButton } from "../components/Dice";
import { Badge, Button, Modal, Panel, Progress } from "../components/ui";
import { COLOR_META } from "../game/board";
import { chooseMove, describeMove } from "../game/ai";
import { currentPlayer, progressOf, tokensHome } from "../game/engine";
import type { GameState, LegalMove } from "../game/types";
import { buildMatchSummary, formatDuration } from "../game/summary";
import { useApp } from "../state/AppState";
import { cn } from "../utils/cn";

export function GameScreen() {
  const app = useApp();
  const { session, settings } = app;
  const state = session.state;
  const [pauseOpen, setPauseOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [rolling, setRolling] = useState(false);

  const activePlayer = state ? currentPlayer(state) : null;
  const isHumanTurn = activePlayer?.kind === "human";
  const canRoll = state?.phase === "roll" && isHumanTurn && !session.paused;
  const canMove = state?.phase === "move" && isHumanTurn && !session.paused;

  const rollNow = () => {
    if (!canRoll) return;
    setRolling(true);
    session.roll();
    window.setTimeout(() => setRolling(false), 700);
  };

  /* keyboard: R / Space to roll, 1-4 to pick a chaal, Esc to pause */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "Escape") {
        if (state && state.phase !== "finished") setPauseOpen((v) => !v);
        return;
      }
      if (event.key === "r" || event.key === "R" || event.key === " ") {
        if (canRoll) {
          event.preventDefault();
          rollNow();
        }
        return;
      }
      const numeric = Number.parseInt(event.key, 10);
      if (numeric >= 1 && numeric <= 4 && canMove) {
        const color = activePlayer?.color;
        if (!color) return;
        session.select(`${color}-${numeric - 1}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!state || !activePlayer) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Panel className="p-8">
          <p className="font-display text-lg text-cream">No match in progress</p>
          <p className="mt-2 text-sm text-white/60">
            Start a new match from the lobby — local multiplayer or against the computer.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="primary" onClick={() => app.navigate("play")} icon={<Dices size={16} />}>
              Set up a match
            </Button>
            <Button onClick={() => app.navigate("home")} icon={<HomeIcon size={16} />}>
              Home
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  const finished = state.phase === "finished";
  const summary = buildMatchSummary(state);
  const coach = state.config.tutorial && settings.showCoach ? coachText(state, session.moves) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-16 pt-4 sm:px-5">
      {/* top bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (finished ? app.navigate("home") : setPauseOpen(true))}
          icon={<ArrowLeft size={16} />}
        >
          {finished ? "Exit" : "Menu"}
        </Button>
        <div className="flex items-center gap-2">
          {state.config.rules.turnTimerSeconds > 0 && !finished ? (
            <Badge tone={session.timerLeft <= 5 ? "danger" : "neutral"}>
              <Timer size={12} /> {session.timerLeft}s
            </Badge>
          ) : null}
          <Badge>
            Turn {state.turnCount}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            aria-label={settings.sound ? "Mute sound" : "Unmute sound"}
            onClick={() => app.updateSettings({ sound: !settings.sound })}
          >
            {settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </Button>
          {!finished ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Pause match"
              onClick={() => setPauseOpen(true)}
            >
              <Pause size={16} />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_336px]">
        <div>
          {/* active player strip */}
          <Panel className="mb-3 flex items-center gap-3 p-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-900"
              style={{ background: COLOR_META[activePlayer.color].base }}
            >
              {activePlayer.kind === "ai" ? <Bot size={18} /> : <Users size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cream">
                {activePlayer.name}
                <span className="ml-2 text-xs font-normal text-white/45">
                  {activePlayer.kind === "ai" ? `${activePlayer.difficulty} computer` : "human"}
                </span>
              </p>
              <p className="text-xs text-white/55">{statusText(state, session.moves)}</p>
            </div>
            <DiceButton
              value={state.dice}
              rolling={rolling || (state.phase === "roll" && activePlayer.kind === "ai")}
              onRoll={rollNow}
              disabled={!canRoll}
              skin={settings.diceSkin}
              label={
                canRoll
                  ? `Roll the dice for ${activePlayer.name}`
                  : `Dice showing ${state.dice ?? "nothing"}`
              }
            />
          </Panel>

          <div className="mx-auto w-full max-w-[min(92vw,600px)]">
            <Board
              state={state}
              moves={session.moves}
              anim={session.anim}
              onTokenClick={session.select}
              showTargets={settings.showLegalTargets && canMove}
              tokenStyleId={settings.tokenStyle}
              activeColor={canMove ? activePlayer.color : null}
            />
          </div>

          {coach ? (
            <Panel className="mt-3 flex gap-3 p-3.5">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-saffron/15 text-saffron">
                <Lightbulb size={16} />
              </span>
              <div className="text-sm text-white/70">
                <p className="font-medium text-cream">Coach</p>
                <p className="mt-0.5 leading-relaxed">{coach}</p>
              </div>
            </Panel>
          ) : null}
        </div>

        {/* side rail */}
        <aside className="flex flex-col gap-3">
          {state.players.map((player, index) => {
            const meta = COLOR_META[player.color];
            const active = index === state.turn;
            const home = tokensHome(state, player.color);
            return (
              <div
                key={player.id}
                className={cn(
                  "rounded-2xl border p-3 transition-all",
                  active
                    ? "border-white/25 bg-white/10 shadow-lg"
                    : "border-white/8 bg-black/20",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-3.5 rounded-full"
                    style={{ background: meta.base, boxShadow: `0 0 12px ${meta.glow}` }}
                  />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-cream">
                    {player.name}
                  </p>
                  {player.kind === "ai" ? (
                    <span className="text-[10px] uppercase tracking-wider text-white/40">
                      {player.difficulty}
                    </span>
                  ) : null}
                  {state.rankings.includes(player.id) ? (
                    <Badge tone="gold">
                      <Trophy size={11} /> #{state.rankings.indexOf(player.id) + 1}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
                  <span>{home}/4 home</span>
                  <span>
                    <Swords size={10} className="mr-1 inline" />
                    {state.stats[player.id]?.captures ?? 0} captures
                  </span>
                </div>
                <div className="mt-1.5">
                  <Progress value={progressOf(state, player.color)} color={meta.base} />
                </div>
              </div>
            );
          })}

          <Panel className="p-3">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              <Info size={12} /> Match feed
            </p>
            <ul className="thin-scroll max-h-56 space-y-1.5 overflow-y-auto pr-1 text-xs">
              {[...state.log].reverse().map((entry) => (
                <li key={entry.id} className="flex gap-2">
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{
                      background: entry.color ? COLOR_META[entry.color].base : "rgba(255,255,255,0.25)",
                    }}
                  />
                  <span
                    className={cn(
                      "leading-relaxed",
                      entry.kind === "capture"
                        ? "text-lotus"
                        : entry.kind === "home" || entry.kind === "win"
                          ? "text-saffron"
                          : entry.kind === "penalty"
                            ? "text-white/80"
                            : "text-white/55",
                    )}
                  >
                    {entry.text}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="panel-quiet flex items-center gap-2 rounded-xl p-3 text-[11px] text-white/45">
            <Keyboard size={14} />
            <span>
              <kbd className="rounded bg-white/10 px-1">R</kbd> roll ·{" "}
              <kbd className="rounded bg-white/10 px-1">1-4</kbd> pick chaal ·{" "}
              <kbd className="rounded bg-white/10 px-1">Esc</kbd> pause
            </span>
          </div>
        </aside>
      </div>

      {/* ---------------------------------------------------------- overlays */}
      <Modal
        open={pauseOpen && !finished}
        onClose={() => setPauseOpen(false)}
        title="Match paused"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuitOpen(true)} icon={<LogOut size={15} />}>
              Quit match
            </Button>
            <Button onClick={() => setPauseOpen(false)}>Keep playing</Button>
            <Button variant="primary" onClick={() => app.navigate("rules")} icon={<Info size={15} />}>
              Rules
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <p>Your match is saved automatically on this device.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setPauseOpen(false); session.restart(); }} icon={<RotateCcw size={14} />}>
              Restart this match
            </Button>
            <Button size="sm" onClick={() => app.navigate("settings")} icon={<Sparkles size={14} />}>
              Settings
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title="Quit this match?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuitOpen(false)}>
              Stay
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setQuitOpen(false);
                setPauseOpen(false);
                session.quit();
                app.navigate("play");
              }}
            >
              Quit and discard
            </Button>
          </>
        }
      >
        The current match will be removed from this device. Statistics are only recorded for
        finished matches.
      </Modal>

      <Modal
        open={finished}
        onClose={() => app.navigate("home")}
        title="Match complete"
        closeLabel="Back to home"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-saffron/20 text-saffron">
              <Crown size={20} />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-cream">
                {summary[0]?.name} wins!
              </p>
              <p className="text-xs text-white/50">
                {formatDuration((state.endedAt ?? Date.now()) - state.startedAt)} ·{" "}
                {state.turnCount} turns
              </p>
            </div>
          </div>

          <ol className="space-y-1.5">
            {summary.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm"
              >
                <span className="w-5 text-center font-display text-white/50">{row.rank}</span>
                <span
                  className="size-3 rounded-full"
                  style={{ background: COLOR_META[row.color].base }}
                />
                <span className="min-w-0 flex-1 truncate text-cream">{row.name}</span>
                <span className="text-[11px] text-white/45">
                  {row.tokensHome}/4 · {row.captures} caps
                </span>
              </li>
            ))}
          </ol>

          {app.lastUnlocked.length > 0 ? (
            <div className="rounded-xl border border-saffron/25 bg-saffron/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-saffron">
                Achievements unlocked
              </p>
              <ul className="mt-1.5 space-y-1 text-sm text-cream">
                {app.lastUnlocked.map((achievement) => (
                  <li key={achievement.id}>
                    <span className="mr-1.5">{achievement.icon}</span>
                    {achievement.name}
                    <span className="text-white/50"> — {achievement.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                app.clearLastUnlocked();
                session.restart();
              }}
              icon={<RotateCcw size={14} />}
            >
              Rematch
            </Button>
            <Button
              size="sm"
              onClick={() => {
                app.clearLastUnlocked();
                session.quit();
                app.navigate("play");
              }}
            >
              New match
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                app.clearLastUnlocked();
                app.navigate("stats");
              }}
            >
              Statistics
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function statusText(state: GameState, moves: LegalMove[]): string {
  if (state.phase === "finished") return "Match complete.";
  if (state.phase === "roll") return "Roll the dice.";
  if (state.phase === "nomove") return "No legal chaal — passing the turn.";
  if (moves.length === 1) return "One legal chaal — tap the glowing token.";
  return `${moves.length} chaals can move — pick one.`;
}

function coachText(state: GameState, moves: LegalMove[]): string {
  if (state.phase === "roll") {
    return "Tap the dice (or press R). You need a six to bring a chaal out of its yard.";
  }
  if (state.phase === "nomove") {
    return "No chaal can use that roll, so the turn passes automatically.";
  }
  const best = chooseMove(state, "hard", moves.length ? moves : undefined);
  return `${describeMove(state, best)} Glowing squares show where each chaal would land.`;
}

