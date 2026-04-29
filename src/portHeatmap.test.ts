import {
  resetHeatmap,
  buildHeatmap,
  formatHeatmap,
  getHotPorts,
} from './portHeatmap';
import { HistoryEntry } from './history';

function makeEntry(port: number, hour: number): HistoryEntry {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return { port, timestamp: d.toISOString(), protocol: 'tcp', event: 'open' };
}

beforeEach(() => resetHeatmap());

describe('buildHeatmap', () => {
  it('returns empty heatmap for no entries', () => {
    const hm = buildHeatmap([]);
    expect(hm.cells).toHaveLength(0);
    expect(hm.ports).toHaveLength(0);
    expect(hm.hours).toHaveLength(0);
  });

  it('aggregates counts by port and hour', () => {
    const entries = [
      makeEntry(3000, 10),
      makeEntry(3000, 10),
      makeEntry(3000, 14),
      makeEntry(8080, 10),
    ];
    const hm = buildHeatmap(entries);
    const cell3000_10 = hm.cells.find(c => c.port === 3000 && c.hour === 10);
    expect(cell3000_10?.count).toBe(2);
    const cell3000_14 = hm.cells.find(c => c.port === 3000 && c.hour === 14);
    expect(cell3000_14?.count).toBe(1);
    const cell8080_10 = hm.cells.find(c => c.port === 8080 && c.hour === 10);
    expect(cell8080_10?.count).toBe(1);
  });

  it('collects unique ports and hours', () => {
    const entries = [makeEntry(443, 8), makeEntry(80, 8), makeEntry(443, 9)];
    const hm = buildHeatmap(entries);
    expect(hm.ports).toEqual([80, 443]);
    expect(hm.hours).toEqual([8, 9]);
  });
});

describe('formatHeatmap', () => {
  it('returns fallback message for empty heatmap', () => {
    const hm = buildHeatmap([]);
    expect(formatHeatmap(hm)).toBe('No heatmap data available.');
  });

  it('returns a multi-line string with port labels', () => {
    const entries = [makeEntry(3000, 12), makeEntry(8080, 12)];
    const hm = buildHeatmap(entries);
    const output = formatHeatmap(hm);
    expect(output).toContain('3000');
    expect(output).toContain('8080');
    expect(output.split('\n').length).toBeGreaterThan(1);
  });
});

describe('getHotPorts', () => {
  it('returns ports sorted by total activity', () => {
    const entries = [
      makeEntry(3000, 10),
      makeEntry(3000, 11),
      makeEntry(3000, 12),
      makeEntry(8080, 10),
      makeEntry(8080, 11),
      makeEntry(443, 10),
    ];
    const hm = buildHeatmap(entries);
    const hot = getHotPorts(hm, 2);
    expect(hot[0]).toBe(3000);
    expect(hot[1]).toBe(8080);
  });

  it('respects topN limit', () => {
    const entries = [makeEntry(80, 1), makeEntry(443, 2), makeEntry(8080, 3)];
    const hm = buildHeatmap(entries);
    expect(getHotPorts(hm, 2)).toHaveLength(2);
  });
});
