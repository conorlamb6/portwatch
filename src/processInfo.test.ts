import {
  parseLsofLine,
  enrichWithProcess,
  resetProcessInfo,
  ProcessInfo,
} from './processInfo';

beforeEach(() => {
  resetProcessInfo();
});

describe('parseLsofLine', () => {
  it('parses a valid lsof line', () => {
    const line =
      'node      1234 user   22u  IPv4 0x1234      0t0  TCP *:3000 (LISTEN)';
    const result = parseLsofLine(line);
    expect(result).not.toBeNull();
    expect(result!.pid).toBe(1234);
    expect(result!.name).toBe('node');
    expect(result!.port).toBe(3000);
    expect(result!.protocol).toBe('tcp');
  });

  it('returns null for short lines', () => {
    expect(parseLsofLine('node 1234 user')).toBeNull();
  });

  it('returns null when no port found', () => {
    const line = 'node      1234 user   22u  IPv4 0x1234      0t0  TCP noport';
    expect(parseLsofLine(line)).toBeNull();
  });

  it('detects udp protocol', () => {
    const line =
      'avahi     5678 user   12u  IPv4 0xabcd      0t0  UDP *:5353';
    const result = parseLsofLine(line);
    expect(result?.protocol).toBe('udp');
  });
});

describe('enrichWithProcess', () => {
  it('returns a map with null for ports when lsof unavailable', () => {
    // In test environment lsof may not return results for arbitrary ports
    const result = enrichWithProcess([19999, 19998]);
    expect(result.has(19999)).toBe(true);
    expect(result.has(19998)).toBe(true);
    // Values may be null in CI
    expect(result.get(19999) === null || typeof result.get(19999) === 'object').toBe(true);
  });

  it('returns empty map for empty input', () => {
    const result = enrichWithProcess([]);
    expect(result.size).toBe(0);
  });
});
