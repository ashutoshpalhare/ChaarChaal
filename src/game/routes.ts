/**
 * Hash based routing. GitHub Pages serves static files only, so ChaarChal uses
 * the fragment for navigation — every URL works from any sub-path and no
 * server rewrites are required.
 */

export type RouteId =
  | "home"
  | "play"
  | "game"
  | "rules"
  | "stats"
  | "settings"
  | "about"
  | "diagnostics";

export interface Route {
  id: RouteId;
  label: string;
  title: string;
  inNav: boolean;
}

export const routes: Route[] = [
  { id: "home", label: "Home", title: "ChaarChal", inNav: true },
  { id: "play", label: "Play", title: "Set up a match", inNav: true },
  { id: "game", label: "Board", title: "ChaarChal", inNav: false },
  { id: "rules", label: "Rules", title: "How to play", inNav: true },
  { id: "stats", label: "Statistics", title: "Your record", inNav: true },
  { id: "settings", label: "Settings", title: "Settings", inNav: true },
  { id: "about", label: "About", title: "About ChaarChal", inNav: true },
  { id: "diagnostics", label: "Diagnostics", title: "Self tests", inNav: false },
];

export function hrefFor(id: RouteId): string {
  return `#/${id}`;
}

export function routeFor(id: RouteId): Route {
  return routes.find((r) => r.id === id) ?? routes[0];
}

/** Reads a location hash and returns the matching route id. */
export function parseHash(hash: string): RouteId {
  const clean = hash.replace(/^#\/?/, "").split(/[?/]/)[0].trim().toLowerCase();
  const match = routes.find((r) => r.id === clean);
  return match ? match.id : "home";
}

export function currentRoute(): RouteId {
  if (typeof window === "undefined") return "home";
  return parseHash(window.location.hash);
}
