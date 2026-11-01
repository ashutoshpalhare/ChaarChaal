/** Settings: audio, haptics, motion, gameplay aids, cosmetics and local data. */

import { useState } from "react";
import {
  Accessibility,
  Dices,
  HardDriveDownload,
  Keyboard,
  Palette,
  ShieldCheck,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";
import { ResetEverythingDialog } from "../components/StatsScreen";
import {
  Badge,
  Button,
  Panel,
  SectionHeading,
  Segmented,
  Toggle,
} from "../components/ui";
import { useApp } from "../state/AppState";
import type { AppSettings } from "../game/storage";

export function SettingsScreen() {
  const app = useApp();
  const { settings, storage, profile } = app;
  const [resetOpen, setResetOpen] = useState(false);

  const set = (patch: Partial<AppSettings>) => app.updateSettings(patch);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <SectionHeading
        eyebrow="Settings"
        title="Preferences"
        description="Stored in this browser only. Nothing is synced, tracked or uploaded."
        icon={<Sparkles size={18} />}
      />

      <Panel className="mt-5 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-cream">
          <Volume2 size={16} className="text-saffron" /> Audio
        </p>
        <div className="mt-2 divide-y divide-white/5">
          <Toggle
            label="Sound effects"
            description="Dice, moves, captures and victory chimes synthesised in the browser."
            checked={settings.sound}
            onChange={(sound) => set({ sound })}
          />
          <div className="px-3 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-cream">Volume</p>
                <p className="mt-0.5 text-xs text-white/50">
                  {Math.round(settings.volume * 100)}%
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.volume * 100)}
                onChange={(event) => set({ volume: Number(event.target.value) / 100 })}
                aria-label="Volume"
                className="h-2 w-40 cursor-pointer appearance-none rounded-full bg-white/12 accent-saffron"
                style={{ accentColor: "#f0a92b" }}
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => app.playSound("capture")}
                icon={<Dices size={14} />}
              >
                Test sound
              </Button>
            </div>
          </div>
          <Toggle
            label="Haptic feedback"
            description="A short vibration on supported devices when you roll or capture."
            checked={settings.haptics}
            onChange={(haptics) => set({ haptics })}
          />
        </div>
      </Panel>

      <Panel className="mt-4 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-cream">
          <Accessibility size={16} className="text-saffron" /> Motion & accessibility
        </p>
        <div className="mt-2">
          <p className="px-3 pt-3 text-sm font-medium text-cream">Animation</p>
          <Segmented
            className="mt-2"
            label="Animation preference"
            value={settings.reducedMotion}
            onChange={(reducedMotion) => set({ reducedMotion })}
            options={[
              { value: "system", label: "Follow system" },
              { value: "off", label: "Full motion" },
              { value: "on", label: "Reduced" },
            ]}
          />
          <p className="px-3 pt-1 text-[11px] text-white/40">
            Reduced motion removes the dice tumble and walks chaals instantly.
          </p>
          <div className="mt-2 divide-y divide-white/5">
            <Toggle
              label="Show legal destinations"
              description="Highlight the square each chaal would land on."
              checked={settings.showLegalTargets}
              onChange={(showLegalTargets) => set({ showLegalTargets })}
            />
            <Toggle
              label="Auto-play a forced move"
              description="When only one chaal can move, play it automatically."
              checked={settings.autoMoveSingle}
              onChange={(autoMoveSingle) => set({ autoMoveSingle })}
            />
            <Toggle
              label="Tutorial coach"
              description="Contextual hints while a match is running."
              checked={settings.showCoach}
              onChange={(showCoach) => set({ showCoach })}
            />
            <Toggle
              label="Confirm before quitting"
              description="Ask before discarding a match in progress."
              checked={settings.confirmQuit}
              onChange={(confirmQuit) => set({ confirmQuit })}
            />
          </div>
        </div>
      </Panel>

      <Panel className="mt-4 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-cream">
          <Palette size={16} className="text-saffron" /> Cosmetics
        </p>
        <p className="mt-1 text-xs text-white/50">
          Board themes, dice skins and chaal styles unlock through achievements on the Statistics
          screen.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Button size="sm" onClick={() => app.navigate("stats")}>
            Open the locker
          </Button>
          <Button size="sm" variant="ghost" onClick={() => set({ boardTheme: "theme-classic", diceSkin: "dice-ivory", tokenStyle: "token-classic" })}>
            Reset cosmetics
          </Button>
        </div>
      </Panel>

      <Panel className="mt-4 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-cream">
          <ShieldCheck size={16} className="text-saffron" /> Local data & privacy
        </p>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/60">
          <p>
            ChaarChal has no account, no backend and no analytics. Settings, statistics,
            achievements and the match in progress are kept in this browser's{" "}
            <code className="rounded bg-white/10 px-1 text-xs">localStorage</code> under the{" "}
            <code className="rounded bg-white/10 px-1 text-xs">chaarchal.*</code> keys.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge tone={storage.available ? "success" : "danger"}>
              <HardDriveDownload size={11} />
              {storage.available ? "Storage available" : "Storage blocked"}
            </Badge>
            {storage.corrupted ? <Badge tone="danger">Recovered from a corrupt save</Badge> : null}
            <Badge>{profile.history.length} matches stored</Badge>
            {app.session.hasSaved ? <Badge tone="gold">Match in progress saved</Badge> : null}
          </div>
          {!storage.available ? (
            <p className="rounded-xl border border-lotus/30 bg-lotus/10 p-3 text-xs text-lotus">
              This browser is blocking local storage (private mode or a strict privacy setting).
              You can still play — preferences simply will not be remembered between visits.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 size={14} />}
              onClick={() => app.resetProfile()}
            >
              Clear statistics
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={() => setResetOpen(true)}
            >
              Erase all local data
            </Button>
          </div>
        </div>
      </Panel>

      <Panel className="mt-4 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-cream">
          <Keyboard size={16} className="text-saffron" /> Keyboard shortcuts
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-white/60">
          {[
            ["R or Space", "Roll the dice"],
            ["1 – 4", "Move the chaal in that slot"],
            ["Esc", "Pause the match"],
            ["Tab", "Move focus between chaals that can move"],
          ].map(([key, description]) => (
            <li key={key} className="flex items-center gap-3">
              <kbd className="min-w-20 rounded-md border border-white/12 bg-black/30 px-2 py-1 text-center text-xs text-cream">
                {key}
              </kbd>
              <span>{description}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <ResetEverythingDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
