import { filterByPorts, getActivePorts, PortInfo, scanPorts } from './scanner';

describe('filterByPorts', () => {
  const mockPorts: PortInfo[] = [
    { port: 3000, pid: 100, protocol: 'tcp', state: 'listen', process: 'node' },
    { port: 5432, pid: 200, protocol: 'tcp', state: 'listen', process: 'postgres' },
    { port: 8080, pid: 300, protocol: 'tcp', state: 'listen', process: 'java' },
  ];

  it('returns all ports when watchList is empty', () => {
    const result = filterByPorts(mockPorts, []);
    expect(result).toHaveLength(3);
  });

  it('filters to only watched ports', () => {
    const result = filterByPorts(mockPorts, [3000, 8080]);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.port)).toEqual([3000, 8080]);
  });

  it('returns empty array when no ports match', () => {
    const result = filterByPorts(mockPorts, [9999]);
    expect(result).toHaveLength(0);
  });

  it('returns correct process name for matched port', () => {
    const result = filterByPorts(mockPorts, [5432]);
    expect(result[0].process).toBe('postgres');
    expect(result[0].pid).toBe(200);
  });
});

describe('scanPorts', () => {
  it('returns an array', () => {
    const result = scanPorts();
    expect(Array.isArray(result)).toBe(true);
  });

  it('each entry has required fields', () => {
    const result = scanPorts();
    for (const entry of result) {
      expect(typeof entry.port).toBe('number');
      expect(['tcp', 'udp']).toContain(entry.protocol);
      expect(typeof entry.state).toBe('string');
    }
  });
});

describe('getActivePorts', () => {
  it('returns an array of numbers', () => {
    const result = getActivePorts();
    expect(Array.isArray(result)).toBe(true);
    result.forEach((p) => expect(typeof p).toBe('number'));
  });
});
