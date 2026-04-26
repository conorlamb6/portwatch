/**
 * baselineCommand.ts
 * CLI sub-command handlers for baseline management:
 *   portwatch baseline capture
 *   portwatch baseline compare
 *   portwatch baseline show
 */

import * as path from 'path';
import {
  captureBaseline,
  saveBaselineToFile,
  loadBaselineFromFile,
  diffAgainstBaseline,
  Baseline,
} from './baseline';
import { getActivePorts } from './scanner';

const DEFAULT_BASELINE_PATH = path.resolve(process.cwd(), '.portwatch-baseline.json');

export interface BaselineCommandOptions {
  file?: string;
}

export async function runCaptureBaseline(opts: BaselineCommandOptions = {}): Promise<void> {
  const filePath = opts.file ?? DEFAULT_BASELINE_PATH;
  const ports = await getActivePorts();
  const baseline = captureBaseline(ports);
  saveBaselineToFile(baseline, filePath);
  console.log(`Baseline captured: ${ports.length} port(s) saved to ${filePath}`);
}

export async function runCompareBaseline(opts: BaselineCommandOptions = {}): Promise<void> {
  const filePath = opts.file ?? DEFAULT_BASELINE_PATH;
  const baseline: Baseline = loadBaselineFromFile(filePath);
  const current = await getActivePorts();
  const { added, removed } = diffAgainstBaseline(baseline, current);

  if (added.length === 0 && removed.length === 0) {
    console.log('No changes detected since baseline.');
    return;
  }

  if (added.length > 0) {
    console.log(`New ports (${added.length}):`);
    added.forEach((p) => console.log(`  + ${p.protocol}:${p.port} (pid ${p.pid ?? 'unknown'})`));
  }

  if (removed.length > 0) {
    console.log(`Removed ports (${removed.length}):`);
    removed.forEach((p) => console.log(`  - ${p.protocol}:${p.port} (pid ${p.pid ?? 'unknown'})`));
  }
}

export function runShowBaseline(opts: BaselineCommandOptions = {}): void {
  const filePath = opts.file ?? DEFAULT_BASELINE_PATH;
  const baseline: Baseline = loadBaselineFromFile(filePath);
  console.log(`Baseline captured at: ${baseline.capturedAt}`);
  console.log(`Ports (${baseline.ports.length}):`);
  baseline.ports.forEach((p) =>
    console.log(`  ${p.protocol}:${p.port}  state=${p.state}  pid=${p.pid ?? 'unknown'}`)
  );
}
