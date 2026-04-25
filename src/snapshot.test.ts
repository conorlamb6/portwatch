import {
  resetSnapshots,
  createSnapshot,
  getSnapshots,
  getLatestSnapshot,
  diffSnapshots,
  pruneSnapshots,
  snapshotCount,
} from './snapshot';
import { PortEntry } from './scanner';

const makePort = (port: number, protocol = 'tcp'): PortEntry => ({
  port,
  protocol,
  state: 'LISTEN',
  pid: 1000 + port,
});

beforeEach(() => {
  resetSnapshots();
});

describe('createSnapshot', () => {
  it('stores and returns a snapshot with a timestamp', () => {
    const ports = [makePort(3000), makePort(8080)];
    const snap = createSnapshot(ports);
    expect(snap.ports).toHaveLength(2);
    expect(snap.timestamp).toBeLessThanOrEqual(Date.now());
    expect(snapshotCount()).toBe(1);
  });

  it('does not mutate the original ports array', () => {
    const ports = [makePort(3000)];
    const snap = createSnapshot(ports);
    ports.push(makePort(4000));
    expect(snap.ports).toHaveLength(1);
  });
});

describe('getLatestSnapshot', () => {
  it('returns null when no snapshots exist', () => {
    expect(getLatestSnapshot()).toBeNull();
  });

  it('returns the most recently added snapshot', () => {
    createSnapshot([makePort(3000)]);
    const latest = createSnapshot([makePort(8080)]);
    expect(getLatestSnapshot()).toEqual(latest);
  });
});

describe('diffSnapshots', () => {
  it('detects newly opened ports', () => {
    const prev = createSnapshot([makePort(3000)]);
    const next = createSnapshot([makePort(3000), makePort(8080)]);
    const diff = diffSnapshots(prev, next);
    expect(diff.opened).toHaveLength(1);
    expect(diff.opened[0].port).toBe(8080);
    expect(diff.closed).toHaveLength(0);
  });

  it('detects closed ports', () => {
    const prev = createSnapshot([makePort(3000), makePort(8080)]);
    const next = createSnapshot([makePort(3000)]);
    const diff = diffSnapshots(prev, next);
    expect(diff.closed).toHaveLength(1);
    expect(diff.closed[0].port).toBe(8080);
    expect(diff.opened).toHaveLength(0);
  });

  it('returns empty diff when snapshots are identical', () => {
    const ports = [makePort(3000)];
    const prev = createSnapshot(ports);
    const next = createSnapshot(ports);
    const diff = diffSnapshots(prev, next);
    expect(diff.opened).toHaveLength(0);
    expect(diff.closed).toHaveLength(0);
  });
});

describe('pruneSnapshots', () => {
  it('removes snapshots older than maxAge', async () => {
    createSnapshot([makePort(3000)]);
    await new Promise((r) => setTimeout(r, 20));
    createSnapshot([makePort(8080)]);
    pruneSnapshots(10);
    expect(snapshotCount()).toBe(1);
    expect(getSnapshots()[0].ports[0].port).toBe(8080);
  });
});
