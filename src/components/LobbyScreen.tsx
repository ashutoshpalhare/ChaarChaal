/** Match setup: quick match, pass-and-play seats, computer opponents and house rules. */

import { useMemo, useState } from "react";
import {
  Bot,
  ChevronDown,
  Dices,
  GraduationCap,
  Play,
  RotateCw,
  Settings2,
  Shuffle,
  Users,
} from "lucide-react";
import { Badge, Button, Panel, SectionHeading, Segmented, Toggle } from "../components/ui";
import { COLORS, COLOR_META } from "../game/board";
import { DEFAULT_RULES } from "../game/engine";
import { randomSeed } from "../game/rng";
import type {
  Color,
  Difficulty,
  MatchConfig,
  PlayerConfig,
  PlayerKind,
  RuleConfig,
} from "../game/types";
import { useApp } from "../state/AppState";
import { cn } from "../utils/cn";

const AI_NAMES = ["Meera", "Vikram", "Aarti", "Kabir", "Ishita", "Rohan"];

interface Seat {
  name: string;
  kind: PlayerKind;
  difficulty: Difficulty;
}

const DEFAULT_SEATS: Seat[] = [
  { name: "You", kind: "human", difficulty: "medium" },
  { name: AI_NAMES[0], kind: "ai", difficulty: "medium" },
  { name: AI_NAMES[1], kind: "human", difficulty: "medium" },
  { name: AI_NAMES[2], kind: "ai", difficulty: "medium" },
];

export function LobbyScreen() {
  const app = useApp();
  const { session } = app;
  const [count, setCount] = useState(2);
  const [seats, setSeats] = useState<Seat[]>(DEFAULT_SEATS);
  const [rotation, setRotation] = useState(0);
  const [rules, setRules] = useState<RuleConfig>({ ...DEFAULT_RULES, turnTimerSeconds: 0 });
  const [showRules, setShowRules] = useState(false);
  const [tutorial, setTutorial] = useState(false);

  const seatColors = useMemo(
    () => Array.from({ length: 4 }, (_, i) => COLORS[(i + rotation) % 4]),
    [rotation],
  );

  const players: PlayerConfig[] = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const seat = seats[index];
        const color = seatColors[index];
        return {
          id: `${color}-${index}-${Date.now().toString(36)}`,
          name: seat.name.trim() || (seat.kind === "ai" ? AI_NAMES[index] : `Player ${index + 1}`),
          color,
          kind: seat.kind,
          difficulty: seat.difficulty,
        };
      }),
    [count, seats, seatColors],
  );

  const humans = players.filter((p) => p.kind === "human").length;

  const buildConfig = (configPlayers: PlayerConfig[], configRules: RuleConfig): MatchConfig => ({
    id: `match-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    seed: randomSeed(),
    players: configPlayers,
    rules: configRules,
    tutorial,
  });

  const startMatch = () => {
    session.start(buildConfig(players, rules));
    app.navigate("game");
  };

  const quickMatch = (difficulty: Difficulty) => {
    const config = buildConfig(
      [
        {
          id: `red-quick-${Date.now().toString(36)}`,
          name: "You",
          color: "red",
          kind: "human",
          difficulty: "medium",
        },
        {
          id: `green-quick-${Date.now().toString(36)}`,
          name: AI_NAMES[0],
          color: "green",
          kind: "ai",
          difficulty,
        },
      ],
      { ...DEFAULT_RULES },
    );
    session.start(config);
    app.navigate("game");
  };

  const updateSeat = (index: number, patch: Partial<Seat>) => {
    setSeats((current) => current.map((seat, i) => (i === index ? { ...seat, ...patch } : seat)));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <SectionHeading
        eyebrow="Lobby"
        title="Set up a ChaarChal match"
        description="Pass-and-play on one device, or take on rule-aware computer opponents. Every rule below is enforced by the game engine."
        icon={<Dices size={18} />}
      />

      {session.hasSaved ? (
        <Panel className="mt-5 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium text-cream">A match is already in progress</p>
            <p className="text-xs text-white/50">
              Pick up exactly where you left off — the board is stored on this device.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (session.resumeSaved()) app.navigate("game");
              }}
            >
              Resume match
            </Button>
            <Button size="sm" variant="ghost" onClick={session.discardSaved}>
              Discard
            </Button>
          </div>
        </Panel>
      ) : null}

      {/* quick match */}
      <Panel className="mt-5 p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron/80">
          Quick match
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => quickMatch("medium")} icon={<Play size={16} />}>
            Play vs computer
          </Button>
          <Button onClick={() => quickMatch("easy")}>Easy bot</Button>
          <Button onClick={() => quickMatch("hard")}>Hard bot</Button>
          <Button
            onClick={() => {
              setCount(2);
              setSeats((s) => s.map((seat, i) => (i === 1 ? { ...seat, kind: "human", name: "Friend" } : seat)));
              setTutorial(true);
            }}
            icon={<GraduationCap size={16} />}
          >
            Learn with the coach
          </Button>
        </div>
      </Panel>

      {/* seats */}
      <Panel className="mt-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Players
          </p>
          <div className="flex items-center gap-2">
            <Segmented
              label="Number of players"
              value={count}
              onChange={setCount}
              options={[
                { value: 2, label: "2 players", hint: "duel" },
                { value: 3, label: "3 players", hint: "triangle" },
                { value: 4, label: "4 players", hint: "classic" },
              ]}
            />
            <Button
              size="sm"
              variant="ghost"
              aria-label="Rotate colours and turn order"
              onClick={() => setRotation((r) => (r + 1) % 4)}
              icon={<Shuffle size={14} />}
            >
              Colours
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {players.map((player, index) => {
            const meta = COLOR_META[player.color];
            const seat = seats[index];
            return (
              <div
                key={player.color + index}
                className="rounded-2xl border border-white/8 bg-black/25 p-3.5"
                style={{ boxShadow: `inset 3px 0 0 ${meta.base}` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-4 rounded-full"
                    style={{ background: meta.base, boxShadow: `0 0 10px ${meta.glow}` }}
                  />
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Seat {index + 1}
                  </p>
                  {index === 0 ? <Badge tone="gold">opens the match</Badge> : null}
                </div>
                <input
                  value={seat.name}
                  onChange={(event) => updateSeat(index, { name: event.target.value.slice(0, 14) })}
                  aria-label={`Name for seat ${index + 1}`}
                  className="mt-2.5 w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-cream outline-none transition-colors focus:border-saffron/60"
                  placeholder={`Player ${index + 1}`}
                />
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <Segmented
                    label={`Seat ${index + 1} type`}
                    value={seat.kind}
                    onChange={(kind: PlayerKind) => updateSeat(index, { kind })}
                    options={[
                      { value: "human", label: "Human" },
                      { value: "ai", label: "Computer" },
                    ]}
                  />
                  <Segmented
                    label={`Seat ${index + 1} difficulty`}
                    value={seat.difficulty}
                    onChange={(difficulty: Difficulty) => updateSeat(index, { difficulty })}
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ]}
                  />
                </div>
                {seat.kind === "ai" ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
                    <Bot size={12} /> Rule-aware bot — it never peeks at future rolls.
                  </p>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/40">
                    <Users size={12} /> Pass the device when this seat is on turn.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={startMatch}
            icon={<Play size={18} />}
            disabled={players.length < 2}
          >
            Start {count}-player match
          </Button>
          <span className="text-xs text-white/45">
            {humans} human{humans === 1 ? "" : "s"} · {count - humans} computer
            {count - humans === 1 ? "" : "s"}
          </span>
        </div>
      </Panel>

      {/* house rules */}
      <Panel className="mt-4 p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setShowRules((v) => !v)}
          aria-expanded={showRules}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-white/8 text-saffron">
              <Settings2 size={17} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-cream">House rules</span>
              <span className="block text-xs text-white/45">
                Tune the classic rules — the engine enforces every switch.
              </span>
            </span>
          </span>
          <ChevronDown
            size={18}
            className={cn("text-white/40 transition-transform", showRules && "rotate-180")}
          />
        </button>

        {showRules ? (
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            <Toggle
              label="Six to enter"
              description="A chaal needs a 6 to leave its yard."
              checked={rules.sixToEnter}
              onChange={(sixToEnter) => setRules((r) => ({ ...r, sixToEnter }))}
            />
            <Toggle
              label="Extra roll on a six"
              description="Rolling a 6 grants another turn."
              checked={rules.extraTurnOnSix}
              onChange={(extraTurnOnSix) => setRules((r) => ({ ...r, extraTurnOnSix }))}
            />
            <Toggle
              label="Extra roll on capture"
              description="Capturing an opponent grants another turn."
              checked={rules.extraTurnOnCapture}
              onChange={(extraTurnOnCapture) => setRules((r) => ({ ...r, extraTurnOnCapture }))}
            />
            <Toggle
              label="Extra roll on reaching home"
              description="Bringing a chaal home grants another turn."
              checked={rules.extraTurnOnHome}
              onChange={(extraTurnOnHome) => setRules((r) => ({ ...r, extraTurnOnHome }))}
            />
            <Toggle
              label="Three sixes forfeit the turn"
              description="Classic penalty for a third consecutive six."
              checked={rules.consecutiveSixPenalty}
              onChange={(consecutiveSixPenalty) => setRules((r) => ({ ...r, consecutiveSixPenalty }))}
            />
            <Toggle
              label="Exact roll to finish"
              description="A chaal must land exactly on the home triangle."
              checked={rules.exactRollToFinish}
              onChange={(exactRollToFinish) => setRules((r) => ({ ...r, exactRollToFinish }))}
            />
            <Toggle
              label="Safe squares"
              description="Start and star squares protect chaals from capture."
              checked={rules.safeSquares}
              onChange={(safeSquares) => setRules((r) => ({ ...r, safeSquares }))}
            />
            <Toggle
              label="Blocking pairs"
              description="Two chaals of one colour block opponents from landing."
              checked={rules.blocking}
              onChange={(blocking) => setRules((r) => ({ ...r, blocking }))}
            />
            <Toggle
              label="Play for full rankings"
              description="Keep going until all but one player has finished."
              checked={rules.playForRankings}
              onChange={(playForRankings) => setRules((r) => ({ ...r, playForRankings }))}
            />
            <Toggle
              label="Turn on the tutorial coach"
              description="Contextual hints during the match."
              checked={tutorial}
              onChange={setTutorial}
            />
            <div className="sm:col-span-2">
              <p className="mt-2 px-3 text-sm font-medium text-cream">Turn timer</p>
              <Segmented
                className="mt-2"
                label="Turn timer"
                value={rules.turnTimerSeconds}
                onChange={(turnTimerSeconds) => setRules((r) => ({ ...r, turnTimerSeconds }))}
                options={[
                  { value: 0, label: "Off" },
                  { value: 15, label: "15s" },
                  { value: 30, label: "30s" },
                  { value: 60, label: "60s" },
                ]}
              />
            </div>
            <div className="sm:col-span-2 mt-2 flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRules({ ...DEFAULT_RULES })}
                icon={<RotateCw size={14} />}
              >
                Reset to classic rules
              </Button>
            </div>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

export type { Color };
