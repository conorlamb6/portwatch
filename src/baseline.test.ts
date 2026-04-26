import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  resetBaseline,
  captureBaseline,
  getBaseline,
  saveBaselineToFile,
  loadBaselineFromFile,
  diffAgainstBaseline,
} from './baseline';
import { PortEntry } from './scanner';

const samplePorts: PortEntry[] = [
  { port: 3000, protocol: 'tcp', state: 'LISTEN', pid: 100 },
  { port: 8080, protocol: 'tcp', state: 'LISTEN', pid: 200 },
];

beforeEach(() => {
  resetBaseline();
});

test('captureBaseline stores ports and timestamp', () => {
  const b = captureBaseline(samplePorts);
  expect(b.ports).toHaveLength(2);
  expect(b.capturedAt).toBeTruthy();
  expect(getBaseline()).toBe(b);
});

test('getBaseline returns null before capture', () => {
  expect(getBaseline()).toBeNull();
});

test('captureBaseline does not mutate original array', () => {
  const ports = [...samplePorts];
  captureBaseline(ports);
  ports.push({ port: 9999, protocol: 'tcp', state: 'LISTEN', pid: 999 });
  expect(getBaseline()!.ports).toHaveLength(2);
});

test('saveBaselineToFile and loadBaselineFromFile round-trip', () => {
  const b = captureBaseline(samplePorts);
  const tmpFile = path.join(os.tmpdir(), 'portwatch-baseline-test.json');
  saveBaselineToFile(b, tmpFile);
  resetBaseline();
  const loaded = loadBaselineFromFile(tmpFile);
  expect(loaded.ports).toHaveLength(2);
  expect(loaded.capturedAt).toBe(b.capturedAt);
  expect(getBaseline()).toEqual(loaded);
  fs.unlinkSync(tmpFile);
});

test('loadBaselineFromFile throws when file missing', () => {
  expect(() => loadBaselineFromFile('/nonexistent/path.json')).toThrow();
});

test('diffAgainstBaseline detects added ports', () => {
  const b = captureBaseline(samplePorts);
  const current: PortEntry[] = [
    ...samplePorts,
    { port: 5432, protocol: 'tcp', state: 'LISTEN', pid: 300 },
  ];
  const { added, removed } = diffAgainstBaseline(b, current);
  expect(added).toHaveLength(1);
  expect(added[0].port).toBe(5432);
  expect(removed).toHaveLength(0);
});

test('diffAgainstBaseline detects removed ports', () => {
  const b = captureBaseline(samplePorts);
  const current: PortEntry[] = [
    { port: 3000, protocol: 'tcp', state: 'LISTEN', pid: 100 },
  ];
  const { added, removed } = diffAgainstBaseline(b, current);
  expect(removed).toHaveLength(1);
  expect(removed[0].port).toBe(8080);
  expect(added).toHaveLength(0);
});

test('diffAgainstBaseline returns empty diff when unchanged', () => {
  const b = captureBaseline(samplePorts);
  const { added, removed } = diffAgainstBaseline(b, [...samplePorts]);
  expect(added).toHaveLength(0);
  expect(removed).toHaveLength(0);
});
