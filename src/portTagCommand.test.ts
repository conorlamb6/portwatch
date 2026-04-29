import {
  resetTagCommand,
  runTagCommand,
  formatTagLine,
  formatTagList,
} from './portTagCommand';
import { addTag } from './portTag';

beforeEach(() => resetTagCommand());

describe('formatTagLine', () => {
  it('formats a port with tags', () => {
    expect(formatTagLine(80, ['web', 'public'])).toBe('  Port 80: web, public');
  });

  it('shows placeholder when no tags', () => {
    expect(formatTagLine(9000, [])).toBe('  Port 9000: (no tags)');
  });
});

describe('formatTagList', () => {
  it('returns message when no tags exist', () => {
    expect(formatTagList()).toBe('No port tags configured.');
  });

  it('lists all tagged ports', () => {
    addTag(80, 'web');
    addTag(5432, 'db');
    const output = formatTagList();
    expect(output).toContain('Port 80');
    expect(output).toContain('Port 5432');
  });
});

describe('runTagCommand — add', () => {
  it('adds a tag and confirms', () => {
    const result = runTagCommand({ action: 'add', port: 8080, tag: 'dev' });
    expect(result).toBe('Tag "dev" added to port 8080.');
  });

  it('returns error if port missing', () => {
    const result = runTagCommand({ action: 'add', tag: 'web' });
    expect(result).toMatch(/port is required/);
  });

  it('returns error if tag missing', () => {
    const result = runTagCommand({ action: 'add', port: 80 });
    expect(result).toMatch(/tag is required/);
  });
});

describe('runTagCommand — remove', () => {
  it('removes an existing tag', () => {
    addTag(3000, 'api');
    const result = runTagCommand({ action: 'remove', port: 3000, tag: 'api' });
    expect(result).toBe('Tag "api" removed from port 3000.');
  });

  it('reports when tag not found', () => {
    const result = runTagCommand({ action: 'remove', port: 3000, tag: 'missing' });
    expect(result).toMatch(/not found/);
  });
});

describe('runTagCommand — search', () => {
  it('finds ports by tag', () => {
    addTag(80, 'web');
    addTag(443, 'web');
    const result = runTagCommand({ action: 'search', tag: 'web' });
    expect(result).toContain('80');
    expect(result).toContain('443');
  });

  it('returns message when no ports match', () => {
    const result = runTagCommand({ action: 'search', tag: 'ghost' });
    expect(result).toMatch(/No ports tagged/);
  });

  it('returns error if tag missing', () => {
    const result = runTagCommand({ action: 'search' });
    expect(result).toMatch(/tag is required/);
  });
});

describe('runTagCommand — list', () => {
  it('lists all tags', () => {
    addTag(22, 'ssh');
    const result = runTagCommand({ action: 'list' });
    expect(result).toContain('Port 22');
    expect(result).toContain('ssh');
  });
});

describe('runTagCommand — unknown action', () => {
  it('returns unknown action message', () => {
    const result = runTagCommand({ action: 'unknown' as any });
    expect(result).toMatch(/Unknown action/);
  });
});
