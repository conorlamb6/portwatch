import { runCli } from './cli';
import * as config from './config';
import * as monitor from './monitor';
import * as alerts from './alerts';
import * as logger from './logger';

jest.mock('./config');
jest.mock('./monitor');
jest.mock('./alerts');
jest.mock('./logger');
jest.mock('./output', () => ({ resolveOutputPath: (p: string) => p }));

const mockLoadConfig = config.loadConfig as jest.Mock;
const mockMergeConfig = config.mergeConfig as jest.Mock;
const mockValidateConfig = config.validateConfig as jest.Mock;
const mockPoll = monitor.poll as jest.Mock;
const mockConfigureAlerts = alerts.configureAlerts as jest.Mock;
const mockInitLogger = logger.initLogger as jest.Mock;
const mockCloseLogger = logger.closeLogger as jest.Mock;

const baseConfig = { interval: 2000, ports: [], logPath: null, jsonOutput: false, color: true };

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadConfig.mockReturnValue({});
  mockMergeConfig.mockReturnValue(baseConfig);
  mockValidateConfig.mockReturnValue(baseConfig);
  mockPoll.mockResolvedValue(undefined);
});

describe('cli', () => {
  it('starts polling with default config when no options provided', async () => {
    runCli(['node', 'portwatch']);
    await Promise.resolve();
    expect(mockMergeConfig).toHaveBeenCalledWith({}, {});
    expect(mockValidateConfig).toHaveBeenCalled();
    expect(mockPoll).toHaveBeenCalledWith(baseConfig);
  });

  it('loads config file when --config is provided', async () => {
    mockLoadConfig.mockReturnValue({ interval: 5000 });
    mockMergeConfig.mockReturnValue({ ...baseConfig, interval: 5000 });
    mockValidateConfig.mockReturnValue({ ...baseConfig, interval: 5000 });

    runCli(['node', 'portwatch', '--config', 'portwatch.json']);
    await Promise.resolve();
    expect(mockLoadConfig).toHaveBeenCalledWith('portwatch.json');
  });

  it('passes ports from --ports flag to config', async () => {
    runCli(['node', 'portwatch', '--ports', '3000,8080']);
    await Promise.resolve();
    expect(mockMergeConfig).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ ports: [3000, 8080] })
    );
  });

  it('initializes logger when --log is provided', async () => {
    const configWithLog = { ...baseConfig, logPath: '/tmp/portwatch.log' };
    mockMergeConfig.mockReturnValue(configWithLog);
    mockValidateConfig.mockReturnValue(configWithLog);

    runCli(['node', 'portwatch', '--log', '/tmp/portwatch.log']);
    await Promise.resolve();
    expect(mockInitLogger).toHaveBeenCalledWith('/tmp/portwatch.log');
  });

  it('configures alerts with resolved config', async () => {
    runCli(['node', 'portwatch']);
    await Promise.resolve();
    expect(mockConfigureAlerts).toHaveBeenCalledWith(baseConfig);
  });

  it('exits with error when validateConfig throws', async () => {
    mockValidateConfig.mockImplementation(() => { throw new Error('Invalid config'); });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => runCli(['node', 'portwatch'])).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith('Error:', 'Invalid config');
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
