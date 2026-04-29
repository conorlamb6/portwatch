/**
 * portScoreCommand.ts
 * CLI command handler for displaying port risk scores.
 */

import { getHistory } from './history';
import { computeAllScores, PortScore, PortScoreInput } from './portScore';
import { isWatchlisted } from './watchlist';

function aggregateInputs(): PortScoreInput[] {
  const entries = getHistory();
  const map = new Map<string, PortScoreInput>();

  for (const entry of entries) {
    const key = `${entry.port}:${entry.protocol}`;
    if (!map.has(key)) {
      map.set(key, {
        port: entry.port,
        protocol: entry.protocol,
        openCount: 0,
        closeCount: 0,
        anomalyCount: 0,
        isNew: entry.isNew ?? false,
      });
    }
    const agg = map.get(key)!;
    if (entry.event === 'open') agg.openCount++;
    if (entry.event === 'close') agg.closeCount++;
    if (entry.anomaly) agg.anomalyCount++;
    if (entry.isNew) agg.isNew = true;
  }

  return Array.from(map.values());
}

export function formatScoreLine(score: PortScore): string {
  const levelTag = `[${score.level.toUpperCase()}]`.padEnd(10);
  const portStr = `${score.port}/${score.protocol}`.padEnd(12);
  const scoreStr = `score=${score.score}`.padEnd(10);
  const reasons = score.reasons.join(', ') || 'none';
  return `${levelTag} ${portStr} ${scoreStr} reasons: ${reasons}`;
}

export function formatScoreReport(scores: PortScore[]): string {
  if (scores.length === 0) return 'No port score data available.';
  const lines = ['Port Risk Scores', '='.repeat(60)];
  for (const s of scores) {
    lines.push(formatScoreLine(s));
  }
  return lines.join('\n');
}

export function runPortScoreCommand(args: string[] = []): string {
  const onlyHigh = args.includes('--high');
  const inputs = aggregateInputs();
  let scores = computeAllScores(inputs);

  if (onlyHigh) {
    scores = scores.filter(s => s.level === 'high' || s.level === 'critical');
  }

  return formatScoreReport(scores);
}
