/** About ChaarChal — developer credits, attribution and project information. */

import {
  Bot,
  Code2,
  ExternalLink,
  Globe,
  Info,
  Layers,
  Link2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Badge, Button, GithubIcon, Panel, SectionHeading } from "../components/ui";
import { hrefFor } from "../game/routes";
import { useApp } from "../state/AppState";

const DEVELOPER = {
  name: "Ashutosh Palhare",
  initials: "AP",
  role: "Full Stack Developer",
  github: "https://github.com/ashutoshpalhare",
  portfolio: "https://ashutoshpalhare.github.io/",
  socials: "https://ashutoshpalhare.github.io/BioLinksV2/",
};

const STACK = [
  "React 19",
  "TypeScript (strict)",
  "Vite",
  "Tailwind CSS v4",
  "Lucide icons",
  "Web Audio",
  "localStorage",
  "Vitest-style local suite",
];

const REPOSITORY = "https://github.com/ashutoshpalhare/chaarchal";

export function AboutScreen() {
  const app = useApp();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <SectionHeading
        eyebrow="About"
        title="ChaarChal"
        description="A premium, offline-first take on the Indian Ludo board — built to be genuinely playable, not just pretty."
        icon={<Info size={18} />}
      />

      {/* developer credit */}
      <Panel className="relative mt-6 overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lotus via-saffron to-leaf" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-saffron/80">
          Built &amp; enhanced by
        </p>
        <div className="mt-3 flex flex-wrap items-start gap-5">
          <span
            className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-xl font-semibold text-ink-900"
            style={{ background: "linear-gradient(140deg,#ffd88a,#f0a92b 55%,#e0384f)" }}
            aria-hidden="true"
          >
            {DEVELOPER.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-semibold text-cream">{DEVELOPER.name}</h2>
            <p className="mt-0.5 text-sm text-white/60">{DEVELOPER.role}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
              Ashutosh designed and built ChaarChal end to end — the rules engine, the computer
              opponents, the match orchestration, the interface and the deployment pipeline. The
              game runs entirely in your browser with no server, account or tracking.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => window.open(DEVELOPER.portfolio, "_blank", "noopener,noreferrer")}
                icon={<Globe size={15} />}
              >
                Portfolio
                <ExternalLink size={12} className="opacity-70" />
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(DEVELOPER.github, "_blank", "noopener,noreferrer")}
                icon={<GithubIcon size={15} />}
              >
                GitHub
                <ExternalLink size={12} className="opacity-70" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(DEVELOPER.socials, "_blank", "noopener,noreferrer")}
                icon={<Link2 size={15} />}
              >
                All social profiles
                <ExternalLink size={12} className="opacity-70" />
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      {/* attribution */}
      <Panel className="mt-4 p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-white/8 text-saffron">
            <Layers size={17} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-cream">
              Original creator attribution
            </h2>
            <p className="text-xs text-white/45">Kept separate from the developer credit above.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/60">
          <p>
            ChaarChal is an <strong className="text-cream">original codebase</strong> written for
            this project. It is not a fork, clone or re-skin of another Ludo repository, so there is
            no prior author to credit here. No attribution has been invented.
          </p>
          <p>
            The board geometry, rules engine, computer-opponent strategy, persistence layer,
            interface and artwork were all authored for ChaarChal. Visual assets are drawn with CSS
            and SVG; there are no third-party images, fonts or audio files.
          </p>
          <p>
            If you fork or reuse ChaarChal, please keep this notice and the MIT licence text intact,
            and credit both the original work and your own enhancements separately.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge tone="gold">MIT Licence</Badge>
            <Badge>
              <ShieldCheck size={11} /> No third-party assets
            </Badge>
            <Badge>
              <Code2 size={11} /> Engine/AI/UI separated
            </Badge>
          </div>
        </div>
      </Panel>

      {/* what's inside */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel className="p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-cream">
            <Sparkles size={16} className="text-saffron" /> Feature highlights
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm text-white/60">
            {[
              "Local multiplayer for 2, 3 or 4 players on one device",
              "Human vs computer with Easy, Medium and Hard strategy",
              "Configurable house rules enforced by one authoritative engine",
              "Animated dice, step-by-step chaal movement and capture feedback",
              "Achievements, unlockable themes, dice skins and chaal styles",
              "Resumable matches, statistics and match history",
              "Optional turn timer and tutorial coach",
              "Keyboard shortcuts, reduced-motion mode and screen-reader labels",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-saffron" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-cream">
            <Bot size={16} className="text-saffron" /> How the opponents think
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            The computer evaluates only the moves the engine declares legal. It scores finishing a
            chaal, capturing, escaping a threatened square, landing on a marked square, forming a
            blocking pair and overall progress. Difficulty changes the weighting and how much noise
            is mixed in — Easy blunders on purpose, Hard plays the percentages.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            The dice seed lives inside the game state and is only advanced when a roll happens, so
            the AI can never look ahead at what you are about to roll.
          </p>
        </Panel>
      </div>

      <Panel className="mt-4 p-5">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-cream">
          <Code2 size={16} className="text-saffron" /> Technology
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {STACK.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/65"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(REPOSITORY, "_blank", "noopener,noreferrer")}
            icon={<GithubIcon size={15} />}
          >
            Repository
            <ExternalLink size={12} className="opacity-70" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => app.navigate("diagnostics")}>
            Run the self tests
          </Button>
          <Button size="sm" variant="ghost" onClick={() => app.navigate("rules")}>
            Read the rules
          </Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/40">
          Privacy: ChaarChal stores preferences, statistics, achievements and the current match in
          your browser's local storage. It loads no external fonts, images, scripts or analytics.
          See the{" "}
          <a
            className="text-saffron underline decoration-saffron/40"
            href={hrefFor("settings")}
            onClick={(event) => {
              event.preventDefault();
              app.navigate("settings");
            }}
          >
            settings screen
          </a>{" "}
          for the controls that clear this data.
        </p>
      </Panel>

      <Panel className="mt-4 flex flex-wrap items-center gap-4 p-5">
        <span className="grid size-11 place-items-center rounded-xl bg-saffron/15 text-saffron">
          <User size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-cream">
            Like the game? Star the repository or say hello.
          </p>
          <p className="text-xs text-white/45">
            Feedback, issues and pull requests are welcome through GitHub.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => window.open(DEVELOPER.socials, "_blank", "noopener,noreferrer")}
          icon={<Link2 size={15} />}
        >
          Get in touch
        </Button>
      </Panel>
    </div>
  );
}
