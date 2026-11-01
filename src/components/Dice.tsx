/** Animated dice with selectable skins. */

import type { CSSProperties } from "react";
import { cn } from "../utils/cn";

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const SKINS: Record<string, { face: string; pip: string; edge: string }> = {
  "dice-ivory": { face: "linear-gradient(150deg,#ffffff,#f0e7d4)", pip: "#1b2033", edge: "rgba(0,0,0,0.18)" },
  "dice-rosewood": { face: "linear-gradient(150deg,#a4552a,#6d3417)", pip: "#ffe9cf", edge: "rgba(0,0,0,0.3)" },
  "dice-obsidian": { face: "linear-gradient(150deg,#2b3350,#12162a)", pip: "#f0a92b", edge: "rgba(255,255,255,0.14)" },
  "dice-peacock": { face: "linear-gradient(150deg,#1f9e8f,#12507d)", pip: "#fff8dc", edge: "rgba(255,255,255,0.18)" },
};

export function DiceFace({
  value,
  skin,
  className,
  style,
}: {
  value: number | null;
  skin: string;
  className?: string;
  style?: CSSProperties;
}) {
  const theme = SKINS[skin] ?? SKINS["dice-ivory"];
  const pips = value === null ? [] : (PIPS[value] ?? []);
  return (
    <span
      className={cn("dice", className)}
      style={{ background: theme.face, ...style }}
      role="img"
      aria-label={value === null ? "Dice not rolled" : `Dice showing ${value}`}
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className="dice-pip"
          style={{
            background: pips.includes(index) ? theme.pip : "transparent",
            boxShadow: pips.includes(index) ? "inset 0 -1px 2px rgba(0,0,0,0.35)" : "none",
            gridColumn: (index % 3) + 1,
            gridRow: Math.floor(index / 3) + 1,
          }}
        />
      ))}
    </span>
  );
}

export function DiceButton({
  value,
  rolling,
  onRoll,
  disabled,
  skin,
  label,
}: {
  value: number | null;
  rolling: boolean;
  onRoll: () => void;
  disabled: boolean;
  skin: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "group relative grid place-items-center rounded-2xl p-1 transition-transform",
        disabled ? "cursor-not-allowed opacity-70" : "hover:scale-[1.03] active:scale-95",
      )}
    >
      <DiceFace
        value={value}
        skin={skin}
        className={cn(rolling && "dice-rolling")}
        style={{ width: "min(19vw, 84px)" }}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-x-2 -bottom-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]",
          disabled ? "text-white/30" : "text-saffron",
        )}
      >
        {disabled ? "Waiting" : "Roll"}
      </span>
    </button>
  );
}
