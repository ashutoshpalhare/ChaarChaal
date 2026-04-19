import { describe, expect, it } from 'vitest';
import { exportToCsv } from '../utils/storage';
import { INITIAL_TASKITEMS } from '../data/seed';

describe('ChaarChaal CSV exporter', () => {
  it('serializes header and all seeded rows cleanly', () => {
    const csv = exportToCsv(INITIAL_TASKITEMS);
    const lines = csv.trim().split('\n');
    expect(lines[0]).toContain('id,title,category,status');
    expect(lines.length).toBe(INITIAL_TASKITEMS.length + 1);
  });
});

      <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-zinc-200">New section</h3>
        <p className="mt-1 text-xs text-zinc-400">Added in recent update</p>
      
      <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-sm font-medium text-zinc-200">New section</h3>
        <p className="mt-1 text-xs text-zinc-400">Added in recent update</p>
      </section>
</section>
// ChaarChaal update
// ChaarChaal update
