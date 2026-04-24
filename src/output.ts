import * as fs from 'fs';
import * as path from 'path';
import { Report, formatReport } from './reporter';

export type OutputFormat = 'text' | 'json';

export interface OutputOptions {
  format: OutputFormat;
  filePath?: string;
}

export function serializeReport(report: Report, format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }
  return formatReport(report);
}

export function writeReportToFile(
  report: Report,
  options: OutputOptions
): void {
  const content = serializeReport(report, options.format);

  if (!options.filePath) {
    throw new Error('filePath is required to write report to file');
  }

  const dir = path.dirname(options.filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(options.filePath, content, 'utf-8');
}

export function printReport(report: Report, format: OutputFormat): void {
  const content = serializeReport(report, format);
  process.stdout.write(content + '\n');
}

export function resolveOutputPath(
  baseDir: string,
  format: OutputFormat
): string {
  const ext = format === 'json' ? 'json' : 'txt';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(baseDir, `portwatch-report-${timestamp}.${ext}`);
}
