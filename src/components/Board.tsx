/** The ChaarChal board: 15x15 grid, four yards, ring, home columns and chaals. */

import { useMemo } from "react";
import type { CSSProperties } from "react";
import {
  COLORS,
  COLOR_META,
  HOME_COLUMN,
  SAFE_RING_INDEXES,
  START_INDEX,
  TRACK,
  YARD_RECT,
  tokenCenter,
  type Cell,
} from "../game/board";
import type { Color, GameState, LegalMove } from "../game/types";
import type { AnimState } from "../hooks/useGameSession";
import { cn } from "../utils/cn";

const CELL = 100 / 15;
const START_OWNER: Record<number, Color> = {
  [START_INDEX.red]: "red",
  [START_INDEX.green]: "green",
  [START_INDEX.yellow]: "yellow",
  [START_INDEX.blue]: "blue",
};

function place(cell: Cell): CSSProperties {
  return {
    left: `${cell.x * CELL}%`,
    top: `${cell.y * CELL}%`,
    width: `${CELL}%`,
    height: `${CELL}%`,
  };
}

function tokenStyle(cell: Cell, size: number): CSSProperties {
  const width = CELL * size;
  return {
    left: `${cell.x * CELL - width / 2}%`,
    top: `${cell.y * CELL - width / 2}%`,
    width: `${width}%`,
    height: `${width}%`,
  };
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="size-[58%]" aria-hidden="true">
      <path
        d="M12 2.6l2.6 6.1 6.6.6-5 4.4 1.5 6.5L12 16.9 6.3 20.2l1.5-6.5-5-4.4 6.6-.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Arrow({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[46%]" aria-hidden="true">
      <path d="M6 8l6 8 6-8z" fill={color} opacity="0.55" />
    </svg>
  );
}

export interface BoardProps {
  state: GameState;
  moves: LegalMove[];
  anim: AnimState | null;
  onTokenClick: (tokenId: string) => void;
  showTargets: boolean;
  tokenStyleId: string;
  activeColor: Color | null;
}

export function Board({
  state,
  moves,
  anim,
  onTokenClick,
  showTargets,
  tokenStyleId,
  activeColor,
}: BoardProps) {
  const moveMap = useMemo(() => new Map(moves.map((m) => [m.tokenId, m])), [moves]);

  const grouped = useMemo(() => {
    const groups = new Map<string, { color: Color; slot: number; id: string; pos: number }[]>();
    for (const token of state.tokens) {
      const pos = anim && anim.tokenId === token.id ? anim.pos : token.pos;
      const cell = tokenCenter(token.color, pos, token.slot);
      const key = `${cell.x.toFixed(2)}:${cell.y.toFixed(2)}`;
      const bucket = groups.get(key) ?? [];
      bucket.push({ color: token.color, slot: token.slot, id: token.id, pos });
      groups.set(key, bucket);
    }
    return groups;
  }, [state.tokens, anim]);

  return (
    <div className="board-frame">
      <div className="board-face" role="img" aria-label="ChaarChal board">
        {/* -------------------------------------------------------- yards */}
        {COLORS.map((color) => {
          const rect = YARD_RECT[color];
          const meta = COLOR_META[color];
          return (
            <div
              key={`yard-${color}`}
              className="board-yard"
              style={{
                left: `${rect.x * CELL}%`,
                top: `${rect.y * CELL}%`,
                width: `${rect.w * CELL}%`,
                height: `${rect.h * CELL}%`,
                background: `linear-gradient(150deg, ${meta.base}, ${meta.dark})`,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.16)",
              }}
            >
              <div className="board-yard-inner">
                {[0, 1, 2, 3].map((slot) => (
                  <span
                    key={slot}
                    className="board-yard-slot"
                    style={{ background: `${meta.base}22`, boxShadow: `inset 0 0 0 2px ${meta.base}55` }}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* -------------------------------------------------- home columns */}
        {COLORS.map((color) =>
          HOME_COLUMN[color].map((cell, index) => {
            const meta = COLOR_META[color];
            const isLast = index === HOME_COLUMN[color].length - 1;
            return (
              <div
                key={`home-${color}-${index}`}
                className="board-cell board-cell-home"
                style={{
                  ...place({ x: cell.x, y: cell.y }),
                  background: isLast
                    ? `linear-gradient(140deg, ${meta.base}, ${meta.dark})`
                    : `${meta.base}${index === 0 ? "ee" : "cc"}`,
                }}
              />
            );
          }),
        )}

        {/* ---------------------------------------------------------- ring */}
        {TRACK.map((cell, index) => {
          const owner = START_OWNER[index];
          const isSafe = SAFE_RING_INDEXES.includes(index);
          const meta = owner ? COLOR_META[owner] : null;
          const background = meta
            ? `linear-gradient(140deg, ${meta.base}, ${meta.dark})`
            : "var(--board-cell)";
          return (
            <div
              key={`ring-${index}`}
              className="board-cell board-cell-ring"
              style={{ ...place(cell), background }}
            >
              {meta ? (
                <span className="grid size-full place-items-center text-white">
                  <Arrow color="#ffffff" />
                </span>
              ) : isSafe ? (
                <span
                  className="grid size-full place-items-center"
                  style={{ color: "var(--board-accent)" }}
                >
                  <Star />
                </span>
              ) : null}
            </div>
          );
        })}

        {/* -------------------------------------------------------- centre */}
        <div className="board-centre">
          {(
            [
              ["red", "polygon(0 0, 0 100%, 50% 50%)"],
              ["green", "polygon(0 0, 100% 0, 50% 50%)"],
              ["yellow", "polygon(100% 0, 100% 100%, 50% 50%)"],
              ["blue", "polygon(0 100%, 100% 100%, 50% 50%)"],
            ] as [Color, string][]
          ).map(([color, clip]) => (
            <div
              key={`centre-${color}`}
              className="board-centre-triangle"
              style={{
                clipPath: clip,
                background: `linear-gradient(140deg, ${COLOR_META[color].base}, ${COLOR_META[color].dark})`,
              }}
            />
          ))}
          <div className="absolute inset-[38%] rounded-full bg-cream/90 shadow-inner" />
        </div>

        {/* ----------------------------------------------------- move targets */}
        {showTargets && activeColor
          ? moves.map((move) => {
              const meta = COLOR_META[activeColor];
              const cell =
                move.to < 0
                  ? tokenCenter(activeColor, 0, 0)
                  : tokenCenter(activeColor, move.to, 0);
              return (
                <div
                  key={`target-${move.tokenId}`}
                  className="board-target"
                  aria-hidden="true"
                  style={{
                    left: `${cell.x * CELL - CELL / 2}%`,
                    top: `${cell.y * CELL - CELL / 2}%`,
                    width: `${CELL}%`,
                    height: `${CELL}%`,
                    border: `2px solid ${meta.base}`,
                    background: `${meta.base}33`,
                    boxShadow: `0 0 0 3px ${meta.base}22`,
                    borderRadius: move.to === 56 ? "999px" : "4px",
                    zIndex: 20,
                  }}
                />
              );
            })
          : null}

        {/* --------------------------------------------------------- chaals */}
        {state.tokens.map((token) => {
          const pos = anim && anim.tokenId === token.id ? anim.pos : token.pos;
          const base = tokenCenter(token.color, pos, token.slot);
          const cell = tokenCenter(token.color, token.pos, token.slot);
          const stackKey = `${cell.x.toFixed(2)}:${cell.y.toFixed(2)}`;
          const stack = grouped.get(stackKey) ?? [token];
          const stackIndex = stack.findIndex((t) => t.id === token.id);
          const crowded = stack.length > 1;
          const offset = crowded ? (stackIndex - (stack.length - 1) / 2) * 0.26 : 0;
          const size = crowded ? 0.62 : 0.82;
          const meta = COLOR_META[token.color];
          const move = moveMap.get(token.id);
          const movable = Boolean(move);
          const isAnimating = anim?.tokenId === token.id;
          const home = token.pos === 56;

          return (
            <button
              key={token.id}
              type="button"
              onClick={() => movable && onTokenClick(token.id)}
              tabIndex={movable ? 0 : -1}
              aria-disabled={!movable}
              aria-label={describeToken(token.color, token.slot, pos, home, move)}
              className={cn(
                "token",
                movable && "token-movable",
                isAnimating && "token-animating",
              )}
              style={{
                ...tokenStyle({ x: base.x + offset, y: base.y + offset * 0.4 }, size),
                background: `radial-gradient(circle at 34% 28%, ${meta.base}, ${meta.dark})`,
                zIndex: isAnimating ? 45 : movable ? 30 : 12,
                outline: movable ? `2px solid ${meta.light}` : "none",
                outlineOffset: movable ? 1 : 0,
              }}
            >
              {tokenStyleId === "token-gem" ? (
                <span className="token-gem" />
              ) : tokenStyleId === "token-crown" ? (
                <span className="token-crown" />
              ) : (
                <span className="token-cap" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function describeToken(
  color: Color,
  slot: number,
  pos: number,
  home: boolean,
  move?: LegalMove,
): string {
  const name = `${COLOR_META[color].label} chaal ${slot + 1}`;
  if (home) return `${name}, already home`;
  if (pos < 0) return move ? `${name} in the yard, can enter the board` : `${name} in the yard`;
  const remaining = 56 - pos;
  if (move) {
    if (move.finishes) return `${name}, ${remaining} from home — move to finish`;
    if (move.captures.length > 0) return `${name}, ${remaining} from home — move to capture`;
    return `${name}, ${remaining} from home — move available`;
  }
  return `${name}, ${remaining} from home`;
}
