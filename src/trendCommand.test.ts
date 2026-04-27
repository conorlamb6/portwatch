import { runTrendCommand, resetTrendCommand } from './trendCommand';
import * as historyModule from './history';
import * as trendModule from './trend';

const mockHistory = [
  { port: 3000, protocol: 'tcp', state: 'LISTEN', pid: 101, timestamp: Date.now() - 5000, type: 'open' },
  { port: 3000, protocol: 'tcp', state: 'LISTEN', pid: 101, timestamp: Date.now() - 3000, type: 'close' },
  { port: 8080, protocol: 'tcp', state: 'LISTEN', pid: 202, timestamp: Date.now() - 2000, type: 'open' },
];

beforeEach(() => {
  resetTrendCommand();
  jest.restoreAllMocks();
});

describe('runTrendCommand', () => {
  it('returns formatted trend report by default', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue(mockHistory as any);
    const result = runTrendCommand();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns JSON when json option is true', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue(mockHistory as any);
    const result = runTrendCommand({ json: true });
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(typeof parsed).toBe('object');
  });

  it('filters by port when port option is provided', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue(mockHistory as any);
    const buildSpy = jest.spyOn(trendModule, 'buildTrendReport');
    runTrendCommand({ port: 3000 });
    const passedEvents = buildSpy.mock.calls[0][0];
    expect(passedEvents.every((e: any) => e.port === 3000)).toBe(true);
  });

  it('uses all events when no port filter is specified', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue(mockHistory as any);
    const buildSpy = jest.spyOn(trendModule, 'buildTrendReport');
    runTrendCommand();
    const passedEvents = buildSpy.mock.calls[0][0];
    expect(passedEvents.length).toBe(mockHistory.length);
  });

  it('configures trend window based on windowMinutes option', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue([]);
    const configureSpy = jest.spyOn(trendModule, 'configureTrendWindow');
    runTrendCommand({ windowMinutes: 30 });
    expect(configureSpy).toHaveBeenCalledWith(30 * 60 * 1000);
  });

  it('defaults to 60 minute window', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue([]);
    const configureSpy = jest.spyOn(trendModule, 'configureTrendWindow');
    runTrendCommand();
    expect(configureSpy).toHaveBeenCalledWith(60 * 60 * 1000);
  });

  it('handles empty history gracefully', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue([]);
    expect(() => runTrendCommand()).not.toThrow();
  });

  it('returns valid JSON array when json option is true and history is empty', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue([]);
    const result = runTrendCommand({ json: true });
    expect(() => JSON.parse(result)).not.toThrow();
    const parsed = JSON.parse(result);
    expect(typeof parsed).toBe('object');
  });

  it('does not include events from other ports when port filter is applied', () => {
    jest.spyOn(historyModule, 'getHistory').mockReturnValue(mockHistory as any);
    const buildSpy = jest.spyOn(trendModule, 'buildTrendReport');
    runTrendCommand({ port: 8080 });
    const passedEvents = buildSpy.mock.calls[0][0];
    expect(passedEvents.some((e: any) => e.port === 3000)).toBe(false);
  });
});
