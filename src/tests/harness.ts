/**
 * Minimal test harness. Deliberately dependency-free so the same suite can run
 * inside the app (Diagnostics screen) and from the CLI in CI:
 *
 *   node --experimental-strip-types --no-warnings src/tests/run.ts
 */

export interface TestResult {
  group: string;
  name: string;
  passed: boolean;
  error: string | null;
  durationMs: number;
}

export interface TestCase {
  group: string;
  name: string;
  fn: () => void;
}

const registry: TestCase[] = [];

export function test(group: string, name: string, fn: () => void): void {
  registry.push({ group, name, fn });
}

export function allTests(): TestCase[] {
  return registry;
}

export function runAllTests(): TestResult[] {
  return registry.map((testCase) => {
    const started = Date.now();
    try {
      testCase.fn();
      return {
        group: testCase.group,
        name: testCase.name,
        passed: true,
        error: null,
        durationMs: Date.now() - started,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        group: testCase.group,
        name: testCase.name,
        passed: false,
        error: message,
        durationMs: Date.now() - started,
      };
    }
  });
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function assertEquals(actual: unknown, expected: unknown, message: string): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${message} — expected ${b}, received ${a}`);
}

export function assertThrows(fn: () => void, message: string): void {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(message);
}
