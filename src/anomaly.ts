import { getHistory } from './history';
import { getBaseline } from './baseline';
import { PortEntry } from './scanner';

export interface AnomalyResult {
  port: number;
  protocol: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

let anomalyThreshold = 3;

export function configureAnomaly(threshold: number): void {
  anomalyThreshold = threshold;
}

export function resetAnomaly(): void {
  anomalyThreshold = 3;
}

export function detectNewPort(entry: PortEntry): AnomalyResult | null {
  const baseline = getBaseline();
  if (!baseline) return null;

  const inBaseline = baseline.ports.some(
    (b) => b.port === entry.port && b.protocol === entry.protocol
  );

  if (!inBaseline) {
    return {
      port: entry.port,
      protocol: entry.protocol,
      reason: `Port ${entry.port}/${entry.protocol} not present in baseline`,
      severity: 'high',
    };
  }

  return null;
}

export function detectFrequencySpike(port: number): AnomalyResult | null {
  const history = getHistory();
  const recent = history.filter(
    (e) => e.port === port && Date.now() - new Date(e.timestamp).getTime() < 60_000
  );

  if (recent.length >= anomalyThreshold) {
    return {
      port,
      protocol: recent[0]?.protocol ?? 'tcp',
      reason: `Port ${port} opened/closed ${recent.length} times in the last 60s`,
      severity: recent.length >= anomalyThreshold * 2 ? 'high' : 'medium',
    };
  }

  return null;
}

export function analyzeEntries(entries: PortEntry[]): AnomalyResult[] {
  const results: AnomalyResult[] = [];

  for (const entry of entries) {
    const newPort = detectNewPort(entry);
    if (newPort) results.push(newPort);

    const spike = detectFrequencySpike(entry.port);
    if (spike) results.push(spike);
  }

  return results;
}

export function formatAnomalyResult(result: AnomalyResult): string {
  const tag = `[ANOMALY:${result.severity.toUpperCase()}]`;
  return `${tag} port=${result.port} proto=${result.protocol} — ${result.reason}`;
}
