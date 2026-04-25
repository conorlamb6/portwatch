import * as fs from 'fs';
import * as path from 'path';
import {
  resetHistory,
  recordHistoryEntry,
  getHistory,
  filterHistory,
  loadHistoryFromFile,
  saveHistoryToFile,
  HistoryEntry,
} from './history';

const sampleEntry: HistoryEntry = {
  timestamp: '2024-01-01T00:00:00.000Z',
  port: 3000,
  protocol: 'tcp',
  state: 'LISTEN',
  pid: 1234,
  process: 'node',
  event: 'opened',
};

beforeEach(() => {
  resetHistory();
});

describe('recordHistoryEntry / getHistory', () => {
  it('should start with empty entries', () => {
    const h = getHistory();
    expect(h.entries).toHaveLength(0);
  });

  it('should record an entry and return it', () => {
    recordHistoryEntry(sampleEntry);
    const h = getHistory();
    expect(h.entries).toHaveLength(1);
    expect(h.entries[0].port).toBe(3000);
  });

  it('should update updatedAt on record', () => {
    const before = getHistory().updatedAt;
    recordHistoryEntry(sampleEntry);
    const after = getHistory().updatedAt;
    expect(after >= before).toBe(true);
  });
});

describe('filterHistory', () => {
  const entries: HistoryEntry[] = [
    { ...sampleEntry, port: 3000, event: 'opened', timestamp: '2024-01-01T00:00:00.000Z' },
    { ...sampleEntry, port: 4000, event: 'closed', timestamp: '2024-06-01T00:00:00.000Z' },
    { ...sampleEntry, port: 3000, event: 'closed', timestamp: '2024-12-01T00:00:00.000Z' },
  ];

  it('should filter by port', () => {
    const result = filterHistory(entries, 3000);
    expect(result).toHaveLength(2);
  });

  it('should filter by event', () => {
    const result = filterHistory(entries, undefined, 'closed');
    expect(result).toHaveLength(2);
  });

  it('should filter by since date', () => {
    const since = new Date('2024-06-01T00:00:00.000Z');
    const result = filterHistory(entries, undefined, undefined, since);
    expect(result).toHaveLength(2);
  });
});

describe('saveHistoryToFile / loadHistoryFromFile', () => {
  const tmpPath = path.join(__dirname, '__tmp_history_test__.json');

  afterEach(() => {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    resetHistory();
  });

  it('should save and reload history', () => {
    recordHistoryEntry(sampleEntry);
    saveHistoryToFile(tmpPath);
    resetHistory();
    expect(getHistory().entries).toHaveLength(0);
    const loaded = loadHistoryFromFile(tmpPath);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.entries[0].port).toBe(3000);
  });
});
