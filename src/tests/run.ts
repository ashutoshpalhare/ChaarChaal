/**
 * CLI entry point so CI can run the exact same suite the app runs.
 *
 *   node --experimental-strip-types --no-warnings src/tests/run.ts
 */

import { runAllTests } from "./harness";
import "./engine.test";
import "./game.test";
import "./ui.test";

const results = runAllTests();
const failed = results.filter((r) => !r.passed);

for (const result of results) {
  const status = result.passed ? "PASS" : "FAIL";
  const line = `${status}  ${result.group} › ${result.name}`;
  if (result.passed) {
    console.log(line);
  } else {
    console.log(`${line}\n      ${result.error ?? "unknown error"}`);
  }
}

console.log(`\n${results.length - failed.length}/${results.length} tests passed`);

if (failed.length > 0) {
  process.exitCode = 1;
}
