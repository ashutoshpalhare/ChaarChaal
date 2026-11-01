/** In-app diagnostics: runs the full engine test suite in the browser. */

import { useMemo, useState } from "react";
import { CheckCircle2, FlaskConical, Play, XCircle } from "lucide-react";
import { Badge, Button, Panel, SectionHeading, StatTile } from "../components/ui";
import { runAllTests } from "../tests/harness";
import "../tests/engine.test";
import "../tests/game.test";
import "../tests/ui.test";

export function DiagnosticsScreen() {
  const [runs, setRuns] = useState(0);
  const results = useMemo(() => runAllTests(), [runs]);
  const passed = results.filter((r) => r.passed).length;
  const groups = Array.from(new Set(results.map((r) => r.group)));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6">
      <SectionHeading
        eyebrow="Diagnostics"
        title="Self tests"
        description="The same suite that runs in CI: dice probabilities, legal moves, captures, safe squares, extra turns, penalties, home entry, win conditions, AI decisions and full simulated matches."
        icon={<FlaskConical size={18} />}
        action={
          <Button size="sm" variant="primary" onClick={() => setRuns((r) => r + 1)} icon={<Play size={14} />}>
            Run again
          </Button>
        }
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatTile label="Tests passed" value={`${passed}/${results.length}`} icon={<CheckCircle2 size={13} />} />
        <StatTile label="Failures" value={results.length - passed} icon={<XCircle size={13} />} />
        <StatTile label="Suites" value={groups.length} />
      </div>

      {results.length - passed > 0 ? (
        <Panel className="mt-4 border-lotus/40 p-4">
          <p className="text-sm font-semibold text-lotus">Failing tests</p>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            {results
              .filter((r) => !r.passed)
              .map((r) => (
                <li key={`${r.group}-${r.name}`}>
                  <span className="text-lotus">{r.group} › {r.name}</span>
                  <span className="block text-xs text-white/45">{r.error}</span>
                </li>
              ))}
          </ul>
        </Panel>
      ) : (
        <Panel className="mt-4 p-4">
          <Badge tone="success">
            <CheckCircle2 size={12} /> All green
          </Badge>
          <p className="mt-2 text-sm text-white/60">
            Every rule the interface relies on has been verified in this browser session.
          </p>
        </Panel>
      )}

      <Panel className="mt-4 p-4">
        <p className="text-sm font-semibold text-cream">Full log</p>
        <ul className="thin-scroll mt-3 max-h-[26rem] space-y-1 overflow-y-auto pr-2 font-mono text-xs">
          {results.map((result) => (
            <li key={`${result.group}-${result.name}`} className="flex gap-2">
              <span className={result.passed ? "text-leaf" : "text-lotus"}>
                {result.passed ? "PASS" : "FAIL"}
              </span>
              <span className="text-white/45">{result.durationMs}ms</span>
              <span className="text-white/70">
                {result.group} › {result.name}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
