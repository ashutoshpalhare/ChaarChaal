/** Landing screen. */

import {
  ArrowRight,
  Bot,
  Dices,
  GraduationCap,
  WifiOff,
  Palette,
  Play,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { Badge, Button, Panel, SectionHeading } from "../components/ui";
import { COLOR_META } from "../game/board";
import { useApp } from "../state/AppState";

const FEATURES = [
  {
    icon: <Users size={18} />,
    title: "2, 3 or 4 players",
    body: "Pass-and-play on one device, or fill the empty seats with computer opponents.",
  },
  {
    icon: <Bot size={18} />,
    title: "Rule-aware opponents",
    body: "Three difficulty levels that hunt captures, dodge danger and race home — without cheating.",
  },
  {
    icon: <Swords size={18} />,
    title: "Every classic rule",
    body: "Safe squares, blocking pairs, exact home entry, extra turns and the three-six penalty.",
  },
  {
    icon: <Dices size={18} />,
    title: "House rules you control",
    body: "Toggle any rule before a match. The engine enforces it — the interface can never bypass it.",
  },
  {
    icon: <Trophy size={18} />,
    title: "Progress that persists",
    body: "Achievements, statistics, match history and resumable matches stored on your device.",
  },
  {
    icon: <WifiOff size={18} />,
    title: "Offline first",
    body: "No account, no server, no tracking. Works on a plane, in a train, anywhere.",
  },
];

export function HomeScreen() {
  const app = useApp();
  const { profile, session } = app;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      {/* hero */}
      <section className="rise-in grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">
              <ShieldCheck size={12} /> 100% offline
            </Badge>
            <Badge>Indian board-game heritage</Badge>
            <Badge>Engine-tested rules</Badge>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
            The classic <span className="text-gradient-warm">chaupar</span> board,
            <br />
            rebuilt for quick thumbs.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">
            ChaarChal is four chaals, four directions and one die. Bring your tokens out, dodge the
            captures, and walk all four home before anyone else does.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => app.navigate("play")}
              icon={<Play size={18} />}
            >
              Play a match
            </Button>
            <Button size="lg" onClick={() => app.navigate("rules")} icon={<GraduationCap size={18} />}>
              Learn the rules
            </Button>
            {session.hasSaved ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (session.resumeSaved()) app.navigate("game");
                }}
                icon={<ArrowRight size={18} />}
              >
                Resume match
              </Button>
            ) : null}
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {[
              { label: "Matches", value: profile.stats.matches },
              { label: "Wins", value: profile.stats.wins },
              { label: "Captures", value: profile.stats.captures },
            ].map((item) => (
              <div key={item.label} className="panel-quiet rounded-xl px-3 py-2.5">
                <dt className="text-[10px] uppercase tracking-wider text-white/40">{item.label}</dt>
                <dd className="font-display text-xl font-semibold text-cream">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Panel className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lotus via-saffron to-leaf" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron/80">
            The four chaals
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["red", "green", "yellow", "blue"] as const).map((color) => {
              const meta = COLOR_META[color];
              return (
                <div
                  key={color}
                  className="rounded-2xl p-3.5"
                  style={{
                    background: `linear-gradient(150deg, ${meta.base}26, ${meta.dark}12)`,
                    border: `1px solid ${meta.base}44`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-6 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 34% 28%, ${meta.base}, ${meta.dark})`,
                        boxShadow: `0 0 14px ${meta.glow}`,
                      }}
                    />
                    <p className="text-sm font-semibold text-cream">{meta.label}</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">
                    {color === "red"
                      ? "Opens the match from the top-left yard."
                      : color === "green"
                        ? "Starts 13 squares further around the ring."
                        : color === "yellow"
                          ? "Guards the bottom-right corner."
                          : "Holds the bottom-left approach."}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-white/45">
            52 ring squares · 5 coloured run-ins · 57 steps from start to home. Marked squares are
            safe from capture.
          </p>
        </Panel>
      </section>

      {/* features */}
      <section className="mt-16">
        <SectionHeading
          eyebrow="Why ChaarChal"
          title="A complete Ludo, not a mock-up"
          description="Every advertised feature is wired to the game engine and covered by automated tests."
          icon={<Palette size={18} />}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Panel key={feature.title} className="p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-saffron/15 text-saffron">
                {feature.icon}
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-cream">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{feature.body}</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* flow */}
      <section className="mt-14">
        <SectionHeading
          eyebrow="How a match flows"
          title="Three beats, endless rematches"
          icon={<Dices size={18} />}
        />
        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Roll a six",
              body: "A six brings a chaal out of the yard and rolls again.",
            },
            {
              step: "02",
              title: "Walk the ring",
              body: "Travel clockwise, land on marked squares to stay safe, and capture rivals by landing on them.",
            },
            {
              step: "03",
              title: "Bring all four home",
              body: "Turn into your coloured run-in and land exactly on the home triangle.",
            },
          ].map((item) => (
            <Panel key={item.step} className="p-4">
              <p className="font-display text-3xl font-semibold text-white/12">{item.step}</p>
              <h3 className="mt-1 font-display text-base font-semibold text-cream">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{item.body}</p>
            </Panel>
          ))}
        </ol>
      </section>

      <Panel className="mt-12 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-cream">
            Ready for a four-player showdown?
          </h2>
          <p className="mt-1 text-sm text-white/55">
            Local multiplayer, strategic bots and house rules — all in one tap.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => app.navigate("play")} icon={<Play size={18} />}>
          Start playing
        </Button>
      </Panel>
    </div>
  );
}
