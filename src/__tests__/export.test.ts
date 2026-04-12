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
