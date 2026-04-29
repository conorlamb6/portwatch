/**
 * portConflictCommand.ts
 * CLI command handler for the port-conflict subcommand.
 */

import { getActivePorts } from './scanner';
import {
  analyzeConflicts,
  configureExpectedProcesses,
  formatConflictReport,
  ConflictEntry,
} from './portConflict';
import { loadConfig } from './config';

export interface ConflictCommandOptions {
  json?: boolean;
  configPath?: string;
}

let lastOutput = '';

export function resetConflictCommand(): void {
  lastOutput = '';
}

export function getConflictOutput(): string {
  return lastOutput;
}

export async function runConflictCommand(
  options: ConflictCommandOptions = {}
): Promise<void> {
  const config = loadConfig(options.configPath);

  if (config.expectedProcesses) {
    configureExpectedProcesses(config.expectedProcesses as Record<number, string>);
  }

  const entries = await getActivePorts();
  const conflicts: ConflictEntry[] = analyzeConflicts(entries);

  if (options.json) {
    lastOutput = JSON.stringify(conflicts, null, 2);
  } else {
    lastOutput = formatConflictReport(conflicts);
  }

  process.stdout.write(lastOutput + '\n');
}
