/** Rules guide and interactive tutorial walkthrough. */

import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Dices,
  GraduationCap,
  Info,
  ShieldCheck,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { Board } from "../components/Board";
import { Badge, Button, Panel, SectionHeading } from "../components/ui";
import { COLOR_META } from "../game/board";
import { demoLegalMoves, makeDemoState } from "../game/demo";
import type { RuleConfig } from "../game/types";
import { useApp } from "../state/AppState";

const RULES: { title: string; icon: React.ReactNode; body: string }[] = [
  {
    title: "The board",
    icon: <BookOpen size={16} />,
    body: "A 15×15 grid with four yards, a 52-square ring, five coloured run-ins and the home triangle in the centre. Each chaal walks 57 squares from its own start to home.",
  },
  {
    title: "Rolling a six to start",
    icon: <Dices size={16} />,
    body: "A chaal leaves its yard only on a six, and that six immediately grants another roll. House rules can relax this.",
  },
  {
    title: "Moving",
    icon: <Target size={16} />,
    body: "Move one chaal exactly the number rolled, clockwise around the ring. If no chaal can legally use the roll, the turn passes.",
  },
  {
    title: "Safe squares",
    icon: <ShieldCheck size={16} />,
    body: "The four start squares and the four star squares are marked. Chaals sitting there can never be captured.",
  },
  {
    title: "Capturing",
    icon: <Swords size={16} />,
    body: "Land on a lone opponent chaal and it goes straight back to its yard. A capture earns you another roll.",
  },
  {
    title: "Blocking pairs",
    icon: <ShieldCheck size={16} />,
    body: "Two chaals of the same colour on one square form a wall that opponents may not land on.",
  },
  {
    title: "The run-in and home",
    icon: <Trophy size={16} />,
    body: "After 50 ring squares a chaal turns into its own coloured run-in. You must land exactly on the home triangle — overshooting is not allowed.",
  },
  {
    title: "Three sixes",
    icon: <Info size={16} />,
    body: "Roll three sixes in a row and you lose the turn — the classic penalty for getting too lucky.",
  },
  {
    title: "Winning",
    icon: <Trophy size={16} />,
    body: "The first player to bring all four chaals home wins. Turn on “Play for full rankings” to keep going for second and third place.",
  },
];

const TUTORIAL: { title: string; body: string; rules?: Partial<RuleConfig> }[] = [
  {
    title: "Step 1 — meet your chaals",
    body: "Each player has four chaals in a coloured yard. Nothing can touch them while they rest there.",
  },
  {
    title: "Step 2 — bring a chaal out",
    body: "Roll a six to place a chaal on your start square (the coloured one with the arrow). A six always rolls again.",
    rules: { sixToEnter: true },
  },
  {
    title: "Step 3 — walk the ring",
    body: "Every roll moves one chaal clockwise. Glowing squares preview where a chaal would land before you commit.",
  },
  {
    title: "Step 4 — stay safe, strike hard",
    body: "Star and start squares protect you. Land on a lone rival anywhere else and it walks back to its yard.",
    rules: { safeSquares: true, blocking: true },
  },
  {
    title: "Step 5 — race home",
    body: "After the full lap your chaal enters its coloured run-in and needs the exact roll to reach the home triangle.",
  },
];

export function RulesScreen() {
  const app = useApp();
  const [step, setStep] = useState(0);
  const [demoSeed, setDemoSeed] = useState(21);
  const demo = useMemo(() => makeDemoState(demoSeed, 12 + step * 3), [demoSeed, step]);
  const demoMoves = demoLegalMoves(demo);
  const lesson = TUTORIAL[step];
  const isLast = step === TUTORIAL.length - 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <SectionHeading
        eyebrow="Rules"
        title="How to play ChaarChal"
        description="The classic Indian Ludo rules, plus the house-rule switches the engine supports."
        icon={<BookOpen size={18} />}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {RULES.map((rule) => (
            <Panel key={rule.title} className="p-4">
              <span className="grid size-9 place-items-center rounded-xl bg-white/8 text-saffron">
                {rule.icon}
              </span>
              <h3 className="mt-2.5 font-display text-base font-semibold text-cream">
                {rule.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{rule.body}</p>
            </Panel>
          ))}
        </div>

        {/* interactive walkthrough */}
        <Panel className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron/80">
            Interactive walkthrough
          </p>
          <div className="mt-3">
            <Board
              state={demo}
              moves={demoMoves}
              anim={null}
              onTokenClick={() => undefined}
              showTargets={demoMoves.length > 0}
              tokenStyleId={app.settings.tokenStyle}
              activeColor={demoMoves.length > 0 ? demo.players[demo.turn].color : null}
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-base font-semibold text-cream">{lesson.title}</p>
              <Badge>
                {step + 1} / {TUTORIAL.length}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/60">{lesson.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                icon={<ChevronLeft size={14} />}
              >
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => setStep((s) => Math.min(TUTORIAL.length - 1, s + 1))}
                disabled={isLast}
                icon={<ChevronRight size={14} />}
              >
                Next
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDemoSeed((s) => s + 7)}
                icon={<Dices size={14} />}
              >
                Shuffle demo board
              </Button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/40">
              The demo board is a real match state — the same engine validation runs underneath.
            </p>
            <Button
              className="mt-3"
              variant="primary"
              full
              onClick={() => app.navigate("play")}
              icon={<GraduationCap size={16} />}
            >
              Practise with the coach
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6 p-5">
        <h2 className="font-display text-lg font-semibold text-cream">Colour reference</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(["red", "green", "yellow", "blue"] as const).map((color) => {
            const meta = COLOR_META[color];
            return (
              <div
                key={color}
                className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-black/20 p-3"
              >
                <span
                  className="size-5 rounded-full"
                  style={{ background: `radial-gradient(circle at 34% 28%, ${meta.base}, ${meta.dark})` }}
                />
                <span className="text-sm text-cream">{meta.label}</span>
                <Check size={13} className="ml-auto text-leaf" />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
