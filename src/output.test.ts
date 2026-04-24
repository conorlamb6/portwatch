import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { serializeReport, writeReportToFile, resolveOutputPath } from './output';
import { Report } from './reporter';

const mockReport: Report = {
  generatedAt: '2024-01-01T00:00:00.000Z',
  durationMs: 5000,
  entries: [],
  summary: {
    totalEvents: 2,
    openedPorts: [3000],
    closedPorts: [8080],
    alertsFired: 1,
  },
};

describe('serializeReport', () => {
  it('returns valid JSON string for json format', () => {
    const result = serializeReport(mockReport, 'json');
    const parsed = JSON.parse(result);
    expect(parsed.generatedAt).toBe(mockReport.generatedAt);
    expect(parsed.summary.totalEvents).toBe(2);
  });

  it('returns human-readable text for text format', () => {
    const result = serializeReport(mockReport, 'text');
    expect(result).toContain('PortWatch Report');
    expect(result).toContain('3000');
  });
});

describe('writeReportToFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portwatch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes a text report to file', () => {
    const filePath = path.join(tmpDir, 'report.txt');
    writeReportToFile(mockReport, { format: 'text', filePath });
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('PortWatch Report');
  });

  it('writes a json report to file', () => {
    const filePath = path.join(tmpDir, 'report.json');
    writeReportToFile(mockReport, { format: 'json', filePath });
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(parsed.durationMs).toBe(5000);
  });

  it('throws if filePath is not provided', () => {
    expect(() => writeReportToFile(mockReport, { format: 'text' })).toThrow();
  });
});

describe('resolveOutputPath', () => {
  it('generates a .json path for json format', () => {
    const p = resolveOutputPath('/tmp', 'json');
    expect(p).toMatch(/\.json$/);
    expect(p).toContain('portwatch-report-');
  });

  it('generates a .txt path for text format', () => {
    const p = resolveOutputPath('/tmp', 'text');
    expect(p).toMatch(/\.txt$/);
  });
});
