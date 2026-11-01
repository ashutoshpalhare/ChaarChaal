/**
 * ChaarChal — application shell.
 * Hash routing keeps every screen working when the site is served from a
 * GitHub Pages sub-path.
 */

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  Dices,
  Home as HomeIcon,
  Info,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
} from "lucide-react";
import { AboutScreen } from "./components/AboutScreen";
import { DiagnosticsScreen } from "./components/DiagnosticsScreen";
import { GameScreen } from "./components/GameScreen";
import { HomeScreen } from "./components/HomeScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { RulesScreen } from "./components/RulesScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { StatsScreen } from "./components/StatsScreen";
import { GithubIcon, Logo } from "./components/ui";
import { COSMETIC_BY_ID } from "./game/progression";
import { hrefFor, routes, type RouteId } from "./game/routes";
import { AppStateProvider, useApp } from "./state/AppState";
import { cn } from "./utils/cn";

const NAV: { id: RouteId; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <HomeIcon size={15} /> },
  { id: "play", label: "Play", icon: <Dices size={15} /> },
  { id: "rules", label: "Rules", icon: <BookOpen size={15} /> },
  { id: "stats", label: "Statistics", icon: <BarChart3 size={15} /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon size={15} /> },
  { id: "about", label: "About", icon: <Info size={15} /> },
];

const REPOSITORY = "https://github.com/ashutoshpalhare/chaarchal";
const PORTFOLIO = "https://ashutoshpalhare.github.io/";

function Shell() {
  const app = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const { route, settings, storage } = app;

  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  const prime = app.primeAudio;
  useEffect(() => {
    const unlock = () => prime();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [prime]);

  const themeVars = useMemo(() => {
    const cosmetic = COSMETIC_BY_ID.get(settings.boardTheme);
    return (cosmetic?.vars ?? {}) as Record<string, string>;
  }, [settings.boardTheme]);

  const reduceMotion =
    settings.reducedMotion === "on" ||
    (settings.reducedMotion === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const title = routes.find((r) => r.id === route)?.title ?? "ChaarChal";
  useEffect(() => {
    document.title = route === "home" ? "ChaarChal — Indian Ludo" : `${title} · ChaarChal`;
  }, [title, route]);

  return (
    <div
      className={cn("app-shell min-h-screen", reduceMotion && "reduce-motion")}
      style={themeVars}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-saffron focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/8 bg-ink-900/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a
            href={hrefFor("home")}
            onClick={(event) => {
              event.preventDefault();
              app.navigate("home");
            }}
            aria-label="ChaarChal home"
          >
            <Logo size={38} />
          </a>

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={hrefFor(item.id)}
                onClick={(event) => {
                  event.preventDefault();
                  app.navigate(item.id);
                }}
                aria-current={route === item.id ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  route === item.id
                    ? "bg-white/10 text-cream"
                    : "text-white/55 hover:bg-white/6 hover:text-white",
                )}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {app.session.state && app.session.state.phase !== "finished" ? (
              <a
                href={hrefFor("game")}
                onClick={(event) => {
                  event.preventDefault();
                  app.navigate("game");
                }}
                className="hidden rounded-lg bg-saffron/90 px-3 py-2 text-xs font-semibold text-ink-900 transition-transform hover:scale-[1.03] sm:block"
              >
                Back to board
              </a>
            ) : null}
            <button
              type="button"
              className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav aria-label="Mobile" className="border-t border-white/8 bg-ink-800/95 px-4 py-2 md:hidden">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={hrefFor(item.id)}
                onClick={(event) => {
                  event.preventDefault();
                  app.navigate(item.id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                  route === item.id ? "bg-white/10 text-cream" : "text-white/60",
                )}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      {!storage.available ? (
        <p className="border-b border-lotus/30 bg-lotus/12 px-4 py-2 text-center text-xs text-lotus">
          Local storage is blocked in this browser — the game still works, but preferences and saved
          matches will not persist.
        </p>
      ) : null}

      <main id="main">{renderRoute(route)}</main>

      <footer className="border-t border-white/8 bg-ink-900/70">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size={40} />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
              ChaarChal is a premium, offline-first Indian Ludo board game. Four chaals, four
              directions, one die — no account, no server, no tracking.
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-white/35">
              <ShieldCheck size={13} /> All data stays in your browser
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Navigate
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.id}>
                  <a
                    href={hrefFor(item.id)}
                    onClick={(event) => {
                      event.preventDefault();
                      app.navigate(item.id);
                    }}
                    className="text-white/60 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Project
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={REPOSITORY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white/60 transition-colors hover:text-cream"
                >
                  <GithubIcon size={13} /> GitHub repository
                </a>
              </li>
              <li>
                <a
                  href={hrefFor("settings")}
                  onClick={(event) => {
                    event.preventDefault();
                    app.navigate("settings");
                  }}
                  className="text-white/60 transition-colors hover:text-cream"
                >
                  Privacy &amp; local data
                </a>
              </li>
              <li>
                <a
                  href={hrefFor("diagnostics")}
                  onClick={(event) => {
                    event.preventDefault();
                    app.navigate("diagnostics");
                  }}
                  className="text-white/60 transition-colors hover:text-cream"
                >
                  Self tests
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              Built &amp; enhanced by{" "}
              <a
                href={PORTFOLIO}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-saffron hover:underline"
              >
                Ashutosh Palhare
              </a>
              . ChaarChal is an original implementation released under the MIT licence — no prior
              author is claimed or omitted.
            </p>
            <p>© {new Date().getFullYear()} ChaarChal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function renderRoute(route: RouteId) {
  switch (route) {
    case "play":
      return <LobbyScreen />;
    case "game":
      return <GameScreen />;
    case "rules":
      return <RulesScreen />;
    case "stats":
      return <StatsScreen />;
    case "settings":
      return <SettingsScreen />;
    case "about":
      return <AboutScreen />;
    case "diagnostics":
      return <DiagnosticsScreen />;
    case "home":
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
