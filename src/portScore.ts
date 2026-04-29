/**
 * portScore.ts
 * Computes a risk score for ports based on activity patterns,
 * anomaly flags, watchlist membership, and frequency.
 */

import { isWatchlisted } from './watchlist';
import { isWellKnown } from './portLabel';

export interface PortScoreInput {
  port: number;
  protocol: string;
  openCount: number;
  closeCount: number;
  anomalyCount: number;
  isNew: boolean;
}

export interface PortScore {
  port: number;
  protocol: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
}

let scoreWeights = {
  watchlisted: 40,
  anomaly: 20,
  newPort: 15,
  unknownPort: 10,
  frequencyBonus: 5,
};

export function configureScoreWeights(overrides: Partial<typeof scoreWeights>): void {
  scoreWeights = { ...scoreWeights, ...overrides };
}

export function resetScoreWeights(): void {
  scoreWeights = {
    watchlisted: 40,
    anomaly: 20,
    newPort: 15,
    unknownPort: 10,
    frequencyBonus: 5,
  };
}

export function scoreToLevel(score: number): PortScore['level'] {
  if (score >= 70) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 20) return 'medium';
  return 'low';
}

export function computePortScore(input: PortScoreInput): PortScore {
  let score = 0;
  const reasons: string[] = [];

  if (isWatchlisted(input.port)) {
    score += scoreWeights.watchlisted;
    reasons.push('watchlisted');
  }

  if (input.anomalyCount > 0) {
    const anomalyScore = Math.min(input.anomalyCount * scoreWeights.anomaly, 60);
    score += anomalyScore;
    reasons.push(`${input.anomalyCount} anomaly event(s)`);
  }

  if (input.isNew) {
    score += scoreWeights.newPort;
    reasons.push('newly observed port');
  }

  if (!isWellKnown(input.port)) {
    score += scoreWeights.unknownPort;
    reasons.push('non-well-known port');
  }

  const totalEvents = input.openCount + input.closeCount;
  if (totalEvents > 10) {
    score += scoreWeights.frequencyBonus;
    reasons.push('high activity frequency');
  }

  score = Math.min(score, 100);

  return {
    port: input.port,
    protocol: input.protocol,
    score,
    level: scoreToLevel(score),
    reasons,
  };
}

export function computeAllScores(inputs: PortScoreInput[]): PortScore[] {
  return inputs
    .map(computePortScore)
    .sort((a, b) => b.score - a.score);
}
