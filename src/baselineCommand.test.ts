import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { resetBaseline, captureBaseline, saveBaselineToFile } from './baseline';
import {
  runCaptureBaseline,
  runCompareBaseline,
  runShowBaseline,
} from './baselineCommand';
import * as scanner from './scanner';
import { PortEntry } from './scanner';

const tmpFile = path.join(os.tmpdir(), 'portwatch-baseline-cmd-test.json');

const mockPorts: PortEntry[] = [
  { port: 3000, protocol: 'tcp', state: 'LISTEN', pid: 1 },
  { port: 4000, protocol: 'tcp', state: 'LISTEN', pid: 2 },
];

beforeEach(() => {
  resetBaseline();
  jest.spyOn(scanner, 'getActivePorts').mockResolvedValue(mockPorts);
});

afterEach(() => {
  jest.restoreAllMocks();
  if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
});

test('runCaptureBaseline writes file and logs output', async () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runCaptureBaseline({ file: tmpFile });
  expect(fs.existsSync(tmpFile)).toBe(true);
  const saved = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
  expect(saved.ports).toHaveLength(2);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Baseline captured'));
  consoleSpy.mockRestore();
});

test('runCompareBaseline reports no changes when identical', async () => {
  const baseline = captureBaseline(mockPorts);
  saveBaselineToFile(baseline, tmpFile);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runCompareBaseline({ file: tmpFile });
  expect(consoleSpy).toHaveBeenCalledWith('No changes detected since baseline.');
  consoleSpy.mockRestore();
});

test('runCompareBaseline reports added ports', async () => {
  const baseline = captureBaseline([mockPorts[0]]);
  saveBaselineToFile(baseline, tmpFile);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runCompareBaseline({ file: tmpFile });
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('New ports'));
  consoleSpy.mockRestore();
});

test('runCompareBaseline reports removed ports', async () => {
  const baseline = captureBaseline([...mockPorts, { port: 9999, protocol: 'tcp', state: 'LISTEN', pid: 9 }]);
  saveBaselineToFile(baseline, tmpFile);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await runCompareBaseline({ file: tmpFile });
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Removed ports'));
  consoleSpy.mockRestore();
});

test('runShowBaseline prints baseline details', () => {
  const baseline = captureBaseline(mockPorts);
  saveBaselineToFile(baseline, tmpFile);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  runShowBaseline({ file: tmpFile });
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Baseline captured at'));
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Ports (2)'));
  consoleSpy.mockRestore();
});

test('runShowBaseline throws when no baseline file exists', () => {
  expect(() => runShowBaseline({ file: '/no/such/file.json' })).toThrow();
});
