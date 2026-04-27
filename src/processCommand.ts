import { fetchProcessForPort, enrichWithProcess, ProcessInfo } from './processInfo';

export interface ProcessCommandOptions {
  ports?: number[];
  json?: boolean;
}

export function formatProcessInfo(info: ProcessInfo): string {
  return `Port ${info.port} → PID ${info.pid} (${info.name}) [${info.protocol.toUpperCase()}]`;
}

export function formatProcessTable(entries: Map<number, ProcessInfo | null>): string {
  const lines: string[] = ['PORT\tPID\tNAME\tPROTOCOL'];
  for (const [port, info] of entries) {
    if (info) {
      lines.push(`${port}\t${info.pid}\t${info.name}\t${info.protocol.toUpperCase()}`);
    } else {
      lines.push(`${port}\t-\t-\t-`);
    }
  }
  return lines.join('\n');
}

export function runProcessCommand(options: ProcessCommandOptions = {}): string {
  const { ports = [], json = false } = options;

  if (ports.length === 0) {
    return json ? '{}' : 'No ports specified.';
  }

  const results = enrichWithProcess(ports);

  if (json) {
    const obj: Record<number, ProcessInfo | null> = {};
    for (const [port, info] of results) {
      obj[port] = info;
    }
    return JSON.stringify(obj, null, 2);
  }

  return formatProcessTable(results);
}
