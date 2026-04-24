import * as fs from 'fs';
import * as path from 'path';

export interface PortwatchConfig {
  ports: number[];
  interval: number; // polling interval in milliseconds
  logFile: string;
  alerts: AlertConfig;
}

export interface AlertConfig {
  onOpen: boolean;
  onClose: boolean;
  thresholdMs: number; // alert if port state unchanged beyond this duration
}

const DEFAULT_CONFIG: PortwatchConfig = {
  ports: [],
  interval: 2000,
  logFile: 'portwatch.log',
  alerts: {
    onOpen: true,
    onClose: true,
    thresholdMs: 0,
  },
};

export function loadConfig(configPath?: string): PortwatchConfig {
  const resolvedPath = configPath
    ? path.resolve(configPath)
    : path.resolve(process.cwd(), 'portwatch.config.json');

  if (!fs.existsSync(resolvedPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<PortwatchConfig>;
    return mergeConfig(DEFAULT_CONFIG, parsed);
  } catch (err) {
    console.warn(`[portwatch] Failed to parse config at ${resolvedPath}. Using defaults.`);
    return { ...DEFAULT_CONFIG };
  }
}

function mergeConfig(
  defaults: PortwatchConfig,
  overrides: Partial<PortwatchConfig>
): PortwatchConfig {
  return {
    ...defaults,
    ...overrides,
    alerts: {
      ...defaults.alerts,
      ...(overrides.alerts ?? {}),
    },
  };
}

export function validateConfig(config: PortwatchConfig): string[] {
  const errors: string[] = [];

  if (!Array.isArray(config.ports) || config.ports.length === 0) {
    errors.push('"ports" must be a non-empty array of port numbers.');
  } else {
    config.ports.forEach((p) => {
      if (typeof p !== 'number' || p < 1 || p > 65535) {
        errors.push(`Invalid port number: ${p}. Must be between 1 and 65535.`);
      }
    });
  }

  if (typeof config.interval !== 'number' || config.interval < 500) {
    errors.push('"interval" must be a number >= 500 ms.');
  }

  return errors;
}
