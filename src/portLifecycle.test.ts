import {
  resetLifecycle,
  recordPortOpen,
  recordPortClose,
  getOpenPorts,
  getClosedPorts,
  getAllLifecycleEntries,
  formatLifecycleEntry,
} from './portLifecycle';
import {
  getLifecycleEntries,
  sortByDuration,
  formatLifecycleReport,
  runLifecycleCommand,
} from './portLifecycleCommand';

beforeEach(() => resetLifecycle());

describe('recordPortOpen', () => {
  it('adds a new open entry', () => {
    recordPortOpen(8080, 'tcp', 1000);
    expect(getOpenPorts()).toHaveLength(1);
    expect(getOpenPorts()[0]).toMatchObject({ port: 8080, protocol: 'tcp', openedAt: 1000 });
  });

  it('does not duplicate if port already open', () => {
    recordPortOpen(8080, 'tcp', 1000);
    recordPortOpen(8080, 'tcp', 2000);
    expect(getOpenPorts()).toHaveLength(1);
  });
});

describe('recordPortClose', () => {
  it('moves entry to closed with duration', () => {
    recordPortOpen(3000, 'tcp', 1000);
    const closed = recordPortClose(3000, 'tcp', 4000);
    expect(closed).toBeDefined();
    expect(closed!.durationMs).toBe(3000);
    expect(getOpenPorts()).toHaveLength(0);
    expect(getClosedPorts()).toHaveLength(1);
  });

  it('returns undefined for unknown port', () => {
    const result = recordPortClose(9999, 'tcp', 5000);
    expect(result).toBeUndefined();
  });
});

describe('getAllLifecycleEntries', () => {
  it('returns both open and closed entries', () => {
    recordPortOpen(80, 'tcp', 100);
    recordPortOpen(443, 'tcp', 200);
    recordPortClose(80, 'tcp', 500);
    expect(getAllLifecycleEntries()).toHaveLength(2);
  });
});

describe('formatLifecycleEntry', () => {
  it('formats open entry', () => {
    recordPortOpen(8080, 'tcp', 0);
    const entry = getOpenPorts()[0];
    expect(formatLifecycleEntry(entry)).toContain('[OPEN]');
    expect(formatLifecycleEntry(entry)).toContain('8080/tcp');
  });

  it('formats closed entry with duration', () => {
    recordPortOpen(8080, 'tcp', 0);
    const closed = recordPortClose(8080, 'tcp', 2000)!;
    const line = formatLifecycleEntry(closed);
    expect(line).toContain('[CLOSED]');
    expect(line).toContain('2000ms');
  });
});

describe('runLifecycleCommand', () => {
  it('returns no-data message when empty', () => {
    expect(runLifecycleCommand()).toBe('No lifecycle data available.');
  });

  it('filters open only', () => {
    recordPortOpen(80, 'tcp', 100);
    recordPortOpen(443, 'tcp', 200);
    recordPortClose(80, 'tcp', 500);
    const output = runLifecycleCommand({ filter: 'open' });
    expect(output).toContain('443/tcp');
    expect(output).not.toContain('80/tcp');
  });

  it('sorts by duration descending', () => {
    recordPortOpen(80, 'tcp', 0);
    recordPortOpen(443, 'tcp', 0);
    recordPortClose(80, 'tcp', 5000);
    recordPortClose(443, 'tcp', 1000);
    const entries = sortByDuration(getLifecycleEntries('closed'));
    expect(entries[0].port).toBe(80);
  });
});
