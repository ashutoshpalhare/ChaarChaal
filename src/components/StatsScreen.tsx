/** Statistics, achievements, cosmetic locker and match history. */

import {
  Award,
  Dices,
  History,
  Lock,
  Palette,
  RefreshCw,
  Swords,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Panel,
  SectionHeading,
  StatTile,
} from "../components/ui";
import { COLOR_META } from "../game/board";
import { ACHIEVEMENTS, COSMETICS, isUnlocked } from "../game/progression";
import { formatDuration } from "../game/summary";
import { useApp } from "../state/AppState";
import { cn } from "../utils/cn";

export function StatsScreen() {
  const app = useApp();
  const { profile, settings } = app;
  const unlockedCount = ACHIEVEMENTS.filter((a) => profile.achievements[a.id]).length;
  const winRate =
    profile.stats.matches > 0
      ? Math.round((profile.stats.wins / Math.max(1, profile.stats.wins + profile.stats.losses)) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <SectionHeading
        eyebrow="Statistics"
        title="Your ChaarChal record"
        description="Everything here is computed from the matches finished on this device — nothing is uploaded anywhere."
        icon={<Trophy size={18} />}
        action={
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={14} />}
            onClick={() => {
              if (window.confirm("Clear all local statistics, achievements and match history?")) {
                app.resetProfile();
              }
            }}
          >
            Reset statistics
          </Button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Matches" value={profile.stats.matches} icon={<History size={13} />} />
        <StatTile
          label="Wins"
          value={profile.stats.wins}
          hint={`${winRate}% win rate`}
          icon={<Trophy size={13} />}
        />
        <StatTile
          label="Captures"
          value={profile.stats.captures}
          hint={`${profile.stats.losses} chaals lost`}
          icon={<Swords size={13} />}
        />
        <StatTile
          label="Sixes rolled"
          value={profile.stats.sixes}
          hint={`${profile.stats.rolls} rolls in total`}
          icon={<Dices size={13} />}
        />
        <StatTile
          label="Chaals brought home"
          value={profile.stats.tokensHome}
          icon={<Award size={13} />}
        />
        <StatTile
          label="Fastest win"
          value={profile.stats.fastestWinTurns ? `${profile.stats.fastestWinTurns} turns` : "—"}
          icon={<Zap size={13} />}
        />
        <StatTile
          label="Toughest win"
          value={
            profile.stats.hardestWin ? `${profile.stats.hardestWin} computer` : "—"
          }
          icon={<Trophy size={13} />}
        />
        <StatTile
          label="Achievements"
          value={`${unlockedCount}/${ACHIEVEMENTS.length}`}
          icon={<Award size={13} />}
        />
      </div>

      {/* achievements */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Achievements"
          title="Unlockables earned by playing"
          description="Several achievements also unlock board themes, dice skins and chaal styles."
          icon={<Award size={18} />}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = Boolean(profile.achievements[achievement.id]);
            return (
              <Panel
                key={achievement.id}
                className={cn("p-4", !unlocked && "opacity-60")}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/8 text-lg">
                    {achievement.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-cream">
                      {achievement.name}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/55">
                      {achievement.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {unlocked ? (
                        <Badge tone="success">Unlocked</Badge>
                      ) : (
                        <Badge>
                          <Lock size={10} /> Locked
                        </Badge>
                      )}
                      {achievement.unlocks ? (
                        <Badge tone="gold">Reward: cosmetic</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </section>

      {/* cosmetics */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Locker"
          title="Board themes, dice and chaals"
          description="Pick what you have unlocked. Changes apply immediately across every screen."
          icon={<Palette size={18} />}
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {(
            [
              ["theme", "Board theme", "boardTheme"],
              ["dice", "Dice skin", "diceSkin"],
              ["token", "Chaal style", "tokenStyle"],
            ] as const
          ).map(([kind, title, settingKey]) => (
            <Panel key={kind} className="p-4">
              <p className="text-sm font-semibold text-cream">{title}</p>
              <div className="mt-3 space-y-2">
                {COSMETICS.filter((c) => c.kind === kind).map((cosmetic) => {
                  const unlocked = isUnlocked(cosmetic, profile);
                  const active = settings[settingKey] === cosmetic.id;
                  return (
                    <button
                      key={cosmetic.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => app.updateSettings({ [settingKey]: cosmetic.id })}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        active
                          ? "border-saffron/50 bg-saffron/12"
                          : "border-white/8 bg-black/20 hover:bg-white/6",
                        !unlocked && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <span
                        className="size-6 shrink-0 rounded-md"
                        style={{
                          background:
                            kind === "theme"
                              ? cosmetic.vars["--board-face"] ?? "#fdf8ee"
                              : kind === "dice"
                                ? "linear-gradient(150deg,#ffffff,#e6dcc6)"
                                : "linear-gradient(150deg,#e0384f,#a51f34)",
                          border: "1px solid rgba(0,0,0,0.25)",
                        }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-cream">{cosmetic.name}</span>
                        <span className="block text-[11px] text-white/45">
                          {cosmetic.description}
                        </span>
                      </span>
                      {!unlocked ? <Lock size={13} className="text-white/40" /> : null}
                      {active ? <Badge tone="gold">Equipped</Badge> : null}
                    </button>
                  );
                })}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {/* history */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="History"
          title="Recent matches"
          description="The last 30 matches stored on this device."
          icon={<History size={18} />}
        />
        {profile.history.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No matches yet"
              description="Finish a match and it will appear here with the full ranking."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {profile.history.map((entry) => (
              <Panel key={entry.id} className="flex flex-wrap items-center gap-3 p-3.5">
                <span className="grid size-9 place-items-center rounded-xl bg-saffron/15 text-saffron">
                  <Trophy size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cream">
                    {entry.winner ? `${entry.winner} won` : "Match recorded"} ·{" "}
                    <span className="text-white/45">{entry.players.length} players</span>
                  </p>
                  <p className="text-[11px] text-white/40">
                    {new Date(entry.date).toLocaleString()} · {entry.turns} turns ·{" "}
                    {formatDuration(entry.durationMs)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {entry.players.map((player) => (
                    <span
                      key={player.name + player.color}
                      title={player.name}
                      className="size-4 rounded-full"
                      style={{
                        background: COLOR_META[player.color as keyof typeof COLOR_META]?.base ?? "#888",
                      }}
                    />
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ResetEverythingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const app = useApp();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Erase local data?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} icon={<RefreshCw size={14} />}>
            Keep my data
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              app.resetEverything();
              onClose();
            }}
          >
            Erase everything
          </Button>
        </>
      }
    >
      This removes settings, statistics, achievements, unlocked cosmetics, match history and any
      saved match from this browser. It cannot be undone.
    </Modal>
  );
}
