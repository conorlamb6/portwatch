/**
 * baselineFormat.ts
 * Utilities for formatting baseline diffs into human-readable
 * or machine-readable (JSON) strings for use in reports and logs.
 */

import { Baseline, diffAgainstBaseline } from './baseline';
import { PortEntry } from './scanner';

export interface BaselineDiffResult {
  capturedAt: string;
  comparedAt: string;
  added: PortEntry[];
  removed: PortEntry[];
  unchanged: number;
}

export function buildBaselineDiff(
  baseline: Baseline,
  current: PortEntry[]
): BaselineDiffResult {
  const { added, removed } = diffAgainstBaseline(baseline, current);
  const unchanged = current.length - added.length;
  return {
    capturedAt: baseline.capturedAt,
    comparedAt: new Date().toISOString(),
    added,
    removed,
    unchanged: Math.max(0, unchanged),
  };
}

export function formatBaselineDiff(diff: BaselineDiffResult): string {
  const lines: string[] = [];
  lines.push(`Baseline : ${diff.capturedAt}`);
  lines.push(`Compared : ${diff.comparedAt}`);
  lines.push(`Unchanged: ${diff.unchanged}`);

  if (diff.added.length > 0) {
    lines.push(`Added (${diff.added.length}):`);
    diff.added.forEach((p) =>
      lines.push(`  + [${p.protocol.toUpperCase()}] :${p.port}  pid=${p.pid ?? '-'}`)
    );
  }

  if (diff.removed.length > 0) {
    lines.push(`Removed (${diff.removed.length}):`);
    diff.removed.forEach((p) =>
      lines.push(`  - [${p.protocol.toUpperCase()}] :${p.port}  pid=${p.pid ?? '-'}`)
    );
  }

  if (diff.added.length === 0 && diff.removed.length === 0) {
    lines.push('No changes detected.');
  }

  return lines.join('\n');
}

export function serializeBaselineDiff(diff: BaselineDiffResult): string {
  return JSON.stringify(diff, null, 2);
}
