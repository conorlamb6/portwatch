import { ProcessInfo } from './processInfo';

export interface ProcessSummary {
  port: number;
  pid: number | null;
  name: string | null;
  protocol: string | null;
  resolved: boolean;
}

export function toProcessSummary(port: number, info: ProcessInfo | null): ProcessSummary {
  if (!info) {
    return { port, pid: null, name: null, protocol: null, resolved: false };
  }
  return {
    port: info.port,
    pid: info.pid,
    name: info.name,
    protocol: info.protocol,
    resolved: true,
  };
}

export function formatProcessSummaryLine(summary: ProcessSummary): string {
  if (!summary.resolved) {
    return `[${summary.port}] unknown process`;
  }
  return `[${summary.port}] ${summary.name} (pid=${summary.pid}, ${summary.protocol})`;
}

export function buildProcessSummaries(
  entries: Map<number, ProcessInfo | null>
): ProcessSummary[] {
  const summaries: ProcessSummary[] = [];
  for (const [port, info] of entries) {
    summaries.push(toProcessSummary(port, info));
  }
  return summaries.sort((a, b) => a.port - b.port);
}

export function formatProcessSummaries(summaries: ProcessSummary[]): string {
  if (summaries.length === 0) return 'No process data available.';
  return summaries.map(formatProcessSummaryLine).join('\n');
}
