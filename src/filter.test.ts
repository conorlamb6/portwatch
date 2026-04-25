import {
  applyFilter,
  configureFilter,
  matchesPortList,
  matchesPortRange,
  matchesProtocol,
  matchesState,
  resetFilter,
  type PortEntry,
} from './filter';

const sampleEntries: PortEntry[] = [
  { port: 80, protocol: 'tcp', state: 'LISTEN', pid: 100, process: 'nginx' },
  { port: 443, protocol: 'tcp', state: 'LISTEN', pid: 101, process: 'nginx' },
  { port: 3000, protocol: 'tcp', state: 'ESTABLISHED', pid: 200, process: 'node' },
  { port: 5353, protocol: 'udp', state: 'LISTEN', pid: 300, process: 'mdns' },
  { port: 8080, protocol: 'tcp', state: 'CLOSE_WAIT', pid: 400, process: 'java' },
];

beforeEach(() => {
  resetFilter();
});

describe('matchesPortList', () => {
  it('returns true when port is in list', () => {
    expect(matchesPortList(sampleEntries[0], [80, 443])).toBe(true);
  });

  it('returns false when port is not in list', () => {
    expect(matchesPortList(sampleEntries[2], [80, 443])).toBe(false);
  });
});

describe('matchesPortRange', () => {
  it('returns true when port is within range', () => {
    expect(matchesPortRange(sampleEntries[2], { min: 1024, max: 9999 })).toBe(true);
  });

  it('returns false when port is outside range', () => {
    expect(matchesPortRange(sampleEntries[0], { min: 1024, max: 9999 })).toBe(false);
  });
});

describe('matchesProtocol', () => {
  it('returns true for matching protocol', () => {
    expect(matchesProtocol(sampleEntries[0], 'tcp')).toBe(true);
  });

  it('returns false for non-matching protocol', () => {
    expect(matchesProtocol(sampleEntries[3], 'tcp')).toBe(false);
  });

  it('returns true for protocol "all"', () => {
    expect(matchesProtocol(sampleEntries[3], 'all')).toBe(true);
  });
});

describe('matchesState', () => {
  it('returns true for matching state', () => {
    expect(matchesState(sampleEntries[0], ['LISTEN'])).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(matchesState(sampleEntries[0], ['listen'])).toBe(true);
  });

  it('returns false for non-matching state', () => {
    expect(matchesState(sampleEntries[2], ['LISTEN'])).toBe(false);
  });
});

describe('applyFilter', () => {
  it('returns all entries when no options provided', () => {
    expect(applyFilter(sampleEntries, {})).toHaveLength(sampleEntries.length);
  });

  it('filters by specific ports', () => {
    const result = applyFilter(sampleEntries, { ports: [80, 443] });
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.port)).toEqual([80, 443]);
  });

  it('filters by protocol', () => {
    const result = applyFilter(sampleEntries, { protocol: 'udp' });
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(5353);
  });

  it('excludes specified ports', () => {
    const result = applyFilter(sampleEntries, { excludePorts: [80, 443] });
    expect(result.map((e) => e.port)).not.toContain(80);
    expect(result.map((e) => e.port)).not.toContain(443);
  });

  it('uses activeFilter when no options passed', () => {
    configureFilter({ states: ['ESTABLISHED'] });
    const result = applyFilter(sampleEntries);
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(3000);
  });

  it('filters by port range', () => {
    const result = applyFilter(sampleEntries, { portRange: { min: 400, max: 5000 } });
    expect(result.map((e) => e.port)).toEqual([443, 3000]);
  });
});
