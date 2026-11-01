/**
 * Render smoke test — renders every route to a string to catch runtime errors
 * in the component tree (missing imports, undefined variables, bad props).
 *
 *   esbuild --bundle src/tests/smoke.tsx --outfile=dist-smoke.mjs \
 *     --format=esm --platform=node --external:react-dom/server \
 *     --jsx=automatic && node dist-smoke.mjs
 */

import { renderToString } from "react-dom/server";
import "./engine.test";
import "./game.test";
import "./ui.test";
import App from "../App";
import type { RouteId } from "../game/routes";
import { allTests } from "./harness";

const noop = (): undefined => undefined;
const media = {
  matches: false,
  media: "",
  onchange: null,
  addListener: noop,
  removeListener: noop,
  addEventListener: noop,
  removeEventListener: noop,
  dispatchEvent: () => false,
};

const globals = globalThis as unknown as Record<string, unknown>;

if (typeof globals.window === "undefined") {
  globals.window = {
    location: { hash: "" },
    matchMedia: () => media,
    addEventListener: noop,
    removeEventListener: noop,
    scrollTo: noop,
  };
}
if (typeof globals.matchMedia === "undefined") globals.matchMedia = () => media;
if (typeof globals.navigator === "undefined") globals.navigator = { vibrate: () => true };
if (typeof globals.document === "undefined") {
  globals.document = {
    title: "",
    body: { style: {} as unknown as CSSStyleDeclaration },
    addEventListener: noop,
    removeEventListener: noop,
  };
}

const ROUTES: RouteId[] = [
  "home",
  "play",
  "game",
  "rules",
  "stats",
  "settings",
  "about",
  "diagnostics",
];

let failures = 0;

for (const route of ROUTES) {
  (globals.window as { location: { hash: string } }).location.hash = `#/${route}`;
  try {
    const html = renderToString(<App />);
    if (!html.includes("ChaarChal")) throw new Error("rendered markup is missing the app shell");
    if (html.length < 2000) throw new Error(`suspiciously small markup (${html.length} bytes)`);
    console.log(`PASS  render › ${route} (${html.length} bytes)`);
  } catch (error) {
    failures += 1;
    console.log(`FAIL  render › ${route}\n      ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (allTests().length === 0) {
  failures += 1;
  console.log("FAIL  render › test suite registered no tests");
} else {
  console.log(`PASS  render › ${allTests().length} unit tests registered`);
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed`);
  process.exitCode = 1;
} else {
  console.log("\nAll render smoke checks passed");
}
