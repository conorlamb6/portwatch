import { buildTrendReport, formatTrendReport, configureTrendWindow } from './trend';
import { loadHistoryFromFile } from './history';
import { serializeReport } from './output';
import * as fs from 'fs';
import * as path from 'path';

export interface TrendCommandOptions {
  windowMin?: number;
  historyFile?: string;
  json?: boolean;
  output?: string;
}

export async function runTrendCommand(options: TrendCommandOptions = {}): Promise<void> {
  const windowMin = options.windowMin ?? 60;
  const windowMs = windowMin * 60 * 1000;

  configureTrendWindow(windowMs);

  if (options.historyFile) {
    const resolved = path.resolve(options.historyFile);
    if (!fs.existsSync(resolved)) {
      console.error(`History file not found: ${resolved}`);
      process.exit(1);
    }
    loadHistoryFromFile(resolved);
  }

  const report = buildTrendReport(windowMs);

  if (options.json) {
    const serialized = serializeReport(report as unknown as Parameters<typeof serializeReport>[0], 'json');
    if (options.output) {
      fs.writeFileSync(path.resolve(options.output), serialized, 'utf-8');
      console.log(`Trend report written to ${options.output}`);
    } else {
      console.log(serialized);
    }
    return;
  }

  const formatted = formatTrendReport(report);

  if (options.output) {
    fs.writeFileSync(path.resolve(options.output), formatted, 'utf-8');
    console.log(`Trend report written to ${options.output}`);
  } else {
    console.log(formatted);
  }
}
