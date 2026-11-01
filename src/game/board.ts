/**
 * ChaarChal board geometry.
 *
 * The board is the classic 15x15 Ludo grid. The shared ring ("chal") has 52
 * squares; every player then turns into its own 5-square home column and the
 * home triangle. A token therefore walks 57 squares from its start square to
 * home.
 */

import type { Color } from "./types";

export const GRID = 15;
export const TRACK_LENGTH = 52;
/** Highest private-path index that still sits on the shared ring. */
export const RING_END = 50;
export const HOME_POS = 56;
export const TOKENS_PER_PLAYER = 4;

export interface Cell {
  x: number;
  y: number;
}

/** Shared ring, clockwise, index 0 is Red's start square. */
export const TRACK: Cell[] = [
  { x: 1, y: 6 },
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 5, y: 6 },
  { x: 6, y: 5 },
  { x: 6, y: 4 },
  { x: 6, y: 3 },
  { x: 6, y: 2 },
  { x: 6, y: 1 },
  { x: 6, y: 0 },
  { x: 7, y: 0 },
  { x: 8, y: 0 },
  { x: 8, y: 1 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 8, y: 5 },
  { x: 9, y: 6 },
  { x: 10, y: 6 },
  { x: 11, y: 6 },
  { x: 12, y: 6 },
  { x: 13, y: 6 },
  { x: 14, y: 6 },
  { x: 14, y: 7 },
  { x: 14, y: 8 },
  { x: 13, y: 8 },
  { x: 12, y: 8 },
  { x: 11, y: 8 },
  { x: 10, y: 8 },
  { x: 9, y: 8 },
  { x: 8, y: 9 },
  { x: 8, y: 10 },
  { x: 8, y: 11 },
  { x: 8, y: 12 },
  { x: 8, y: 13 },
  { x: 8, y: 14 },
  { x: 7, y: 14 },
  { x: 6, y: 14 },
  { x: 6, y: 13 },
  { x: 6, y: 12 },
  { x: 6, y: 11 },
  { x: 6, y: 10 },
  { x: 6, y: 9 },
  { x: 5, y: 8 },
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 },
  { x: 1, y: 8 },
  { x: 0, y: 8 },
  { x: 0, y: 7 },
  { x: 0, y: 6 },
];

if (TRACK.length !== TRACK_LENGTH) {
  throw new Error("ChaarChal: ring geometry mismatch");
}

export const COLORS: Color[] = ["red", "green", "yellow", "blue"];

/** Ring index of each colour's start square (evenly spaced, 13 apart). */
export const START_INDEX: Record<Color, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/** Ring index of the square just before a colour turns into its home column. */
export const HOME_ENTRY_INDEX: Record<Color, number> = {
  red: 50,
  green: 11,
  yellow: 24,
  blue: 37,
};

/** The five home-column squares of each colour, in walking order. */
export const HOME_COLUMN: Record<Color, Cell[]> = {
  red: [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
  ],
  green: [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
  ],
  yellow: [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
  ],
  blue: [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
  ],
};

/** Start squares + star squares. Nobody can be captured here. */
export const SAFE_RING_INDEXES: number[] = [0, 8, 13, 21, 26, 34, 39, 47];

const SAFE_SET = new Set(SAFE_RING_INDEXES);

export function isSafeRingIndex(index: number): boolean {
  return SAFE_SET.has(((index % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH);
}

export function ringIndexFor(color: Color, pos: number): number | null {
  if (pos < 0 || pos > RING_END) return null;
  return (START_INDEX[color] + pos) % TRACK_LENGTH;
}

/** Yard (base) resting slots, in board coordinates (cell centres). */
export const YARD_SLOTS: Record<Color, Cell[]> = {
  red: [
    { x: 1.75, y: 1.75 },
    { x: 4.25, y: 1.75 },
    { x: 1.75, y: 4.25 },
    { x: 4.25, y: 4.25 },
  ],
  green: [
    { x: 10.75, y: 1.75 },
    { x: 13.25, y: 1.75 },
    { x: 10.75, y: 4.25 },
    { x: 13.25, y: 4.25 },
  ],
  yellow: [
    { x: 10.75, y: 10.75 },
    { x: 13.25, y: 10.75 },
    { x: 10.75, y: 13.25 },
    { x: 13.25, y: 13.25 },
  ],
  blue: [
    { x: 1.75, y: 10.75 },
    { x: 4.25, y: 10.75 },
    { x: 1.75, y: 13.25 },
    { x: 4.25, y: 13.25 },
  ],
};

/** Where finished tokens rest inside the centre triangle. */
export const HOME_SLOTS: Record<Color, Cell[]> = {
  red: [
    { x: 6.6, y: 6.9 },
    { x: 6.6, y: 7.3 },
    { x: 6.6, y: 7.7 },
    { x: 6.6, y: 8.1 },
  ],
  green: [
    { x: 6.9, y: 6.6 },
    { x: 7.3, y: 6.6 },
    { x: 7.7, y: 6.6 },
    { x: 8.1, y: 6.6 },
  ],
  yellow: [
    { x: 8.4, y: 6.9 },
    { x: 8.4, y: 7.3 },
    { x: 8.4, y: 7.7 },
    { x: 8.4, y: 8.1 },
  ],
  blue: [
    { x: 6.9, y: 8.4 },
    { x: 7.3, y: 8.4 },
    { x: 7.7, y: 8.4 },
    { x: 8.1, y: 8.4 },
  ],
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const YARD_RECT: Record<Color, Rect> = {
  red: { x: 0, y: 0, w: 6, h: 6 },
  green: { x: 9, y: 0, w: 6, h: 6 },
  yellow: { x: 9, y: 9, w: 6, h: 6 },
  blue: { x: 0, y: 9, w: 6, h: 6 },
};

/** Absolute board cell for a private-path position (or yard / home slot). */
export function cellFor(color: Color, pos: number, slot: number): Cell {
  if (pos < 0) return YARD_SLOTS[color][slot % TOKENS_PER_PLAYER];
  if (pos > HOME_POS) return HOME_SLOTS[color][slot % TOKENS_PER_PLAYER];
  if (pos === HOME_POS) return HOME_SLOTS[color][slot % TOKENS_PER_PLAYER];
  if (pos <= RING_END) {
    const idx = ringIndexFor(color, pos);
    return TRACK[idx === null ? 0 : idx];
  }
  return HOME_COLUMN[color][pos - RING_END - 1];
}

export function ringCellFor(index: number): Cell {
  return TRACK[((index % TRACK_LENGTH) + TRACK_LENGTH) % TRACK_LENGTH];
}

/** Centre point (in cell units) of a ring square — used for token placement. */
export function ringCenter(index: number): Cell {
  const cell = ringCellFor(index);
  return { x: cell.x + 0.5, y: cell.y + 0.5 };
}

/** Centre point of any token position: yard slot, ring square, home column or home. */
export function tokenCenter(color: Color, pos: number, slot: number): Cell {
  if (pos < 0) return YARD_SLOTS[color][slot % TOKENS_PER_PLAYER];
  if (pos === HOME_POS) return HOME_SLOTS[color][slot % TOKENS_PER_PLAYER];
  if (pos <= RING_END) {
    const index = ringIndexFor(color, pos);
    return index === null ? YARD_SLOTS[color][slot % TOKENS_PER_PLAYER] : ringCenter(index);
  }
  const cell = HOME_COLUMN[color][pos - RING_END - 1];
  return { x: cell.x + 0.5, y: cell.y + 0.5 };
}


export const COLOR_META: Record<
  Color,
  { label: string; base: string; dark: string; light: string; glow: string; text: string }
> = {
  red: {
    label: "Laal",
    base: "#e0384f",
    dark: "#a51f34",
    light: "#ffdfe3",
    glow: "rgba(224,56,79,0.45)",
    text: "#7c1424",
  },
  green: {
    label: "Hara",
    base: "#1f9e56",
    dark: "#116b39",
    light: "#d8f7e5",
    glow: "rgba(31,158,86,0.45)",
    text: "#0b5a2c",
  },
  yellow: {
    label: "Peela",
    base: "#eda515",
    dark: "#b37405",
    light: "#fff3d4",
    glow: "rgba(237,165,21,0.45)",
    text: "#8a5a02",
  },
  blue: {
    label: "Neela",
    base: "#2a72d6",
    dark: "#1a4b95",
    light: "#dbe9ff",
    glow: "rgba(42,114,214,0.45)",
    text: "#17407e",
  },
};

