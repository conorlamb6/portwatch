import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, validateConfig, PortwatchConfig } from './config';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('loadConfig', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns default config when no file exists', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const config = loadConfig('/non/existent/path.json');
    expect(config.interval).toBe(2000);
    expect(config.ports).toEqual([]);
    expect(config.alerts.onOpen).toBe(true);
  });

  it('merges file config with defaults', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ ports: [3000, 8080], interval: 5000 })
    );
    const config = loadConfig('/some/config.json');
    expect(config.ports).toEqual([3000, 8080]);
    expect(config.interval).toBe(5000);
    expect(config.logFile).toBe('portwatch.log'); // default preserved
  });

  it('returns defaults on malformed JSON', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('{ invalid json }');
    const config = loadConfig('/bad/config.json');
    expect(config.ports).toEqual([]);
  });

  it('deep merges alert config', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ alerts: { onClose: false } })
    );
    const config = loadConfig('/some/config.json');
    expect(config.alerts.onOpen).toBe(true);  // default preserved
    expect(config.alerts.onClose).toBe(false); // overridden
  });
});

describe('validateConfig', () => {
  const base: PortwatchConfig = {
    ports: [3000],
    interval: 2000,
    logFile: 'portwatch.log',
    alerts: { onOpen: true, onClose: true, thresholdMs: 0 },
  };

  it('returns no errors for valid config', () => {
    expect(validateConfig(base)).toHaveLength(0);
  });

  it('errors on empty ports array', () => {
    const errors = validateConfig({ ...base, ports: [] });
    expect(errors.some((e) => e.includes('ports'))).toBe(true);
  });

  it('errors on invalid port number', () => {
    const errors = validateConfig({ ...base, ports: [99999] });
    expect(errors.some((e) => e.includes('99999'))).toBe(true);
  });

  it('errors on interval below 500ms', () => {
    const errors = validateConfig({ ...base, interval: 100 });
    expect(errors.some((e) => e.includes('interval'))).toBe(true);
  });
});
