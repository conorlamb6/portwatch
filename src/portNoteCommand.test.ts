import {
  resetNoteCommand,
  formatNoteEntry,
  formatNoteList,
  getNoteCommandOutput,
  getLastNoteOutput,
  runNoteCommand,
} from './portNotes.command';
import { resetPortNotes } from './portNotes';

beforeEach(() => {
  resetPortNotes();
  resetNoteCommand();
});

describe('formatNoteEntry', () => {
  it('formats a single note entry', () => {
    expect(formatNoteEntry(8080, 'dev server')).toBe('  port 8080: dev server');
  });
});

describe('formatNoteList', () => {
  it('returns empty message when no notes', () => {
    expect(formatNoteList({})).toBe('No notes recorded.');
  });

  it('formats multiple notes sorted by port', () => {
    const result = formatNoteList({ 9000: 'proxy', 3000: 'frontend' });
    expect(result).toContain('Port Notes:');
    expect(result.indexOf('3000')).toBeLessThan(result.indexOf('9000'));
  });
});

describe('getNoteCommandOutput', () => {
  it('adds a note for a port', () => {
    const out = getNoteCommandOutput({ action: 'add', port: 3000, note: 'react app' });
    expect(out).toBe('Note added for port 3000.');
  });

  it('returns error if port missing on add', () => {
    const out = getNoteCommandOutput({ action: 'add', note: 'oops' });
    expect(out).toContain('Error:');
  });

  it('removes a note', () => {
    getNoteCommandOutput({ action: 'add', port: 4000, note: 'test' });
    const out = getNoteCommandOutput({ action: 'remove', port: 4000 });
    expect(out).toBe('Note removed for port 4000.');
  });

  it('returns error if port missing on remove', () => {
    const out = getNoteCommandOutput({ action: 'remove' });
    expect(out).toContain('Error:');
  });

  it('gets a note for a port', () => {
    getNoteCommandOutput({ action: 'add', port: 5000, note: 'api server' });
    const out = getNoteCommandOutput({ action: 'get', port: 5000 });
    expect(out).toContain('api server');
  });

  it('returns not found message for missing port on get', () => {
    const out = getNoteCommandOutput({ action: 'get', port: 9999 });
    expect(out).toContain('No note found');
  });

  it('lists all notes', () => {
    getNoteCommandOutput({ action: 'add', port: 3000, note: 'frontend' });
    getNoteCommandOutput({ action: 'add', port: 8080, note: 'backend' });
    const out = getNoteCommandOutput({ action: 'list' });
    expect(out).toContain('3000');
    expect(out).toContain('8080');
  });

  it('clears all notes', () => {
    getNoteCommandOutput({ action: 'add', port: 3000, note: 'temp' });
    const out = getNoteCommandOutput({ action: 'clear' });
    expect(out).toBe('All notes cleared.');
    expect(getNoteCommandOutput({ action: 'list' })).toBe('No notes recorded.');
  });

  it('handles unknown action', () => {
    const out = getNoteCommandOutput({ action: 'unknown' as any });
    expect(out).toContain('Unknown action');
  });
});

describe('runNoteCommand', () => {
  it('stores output accessible via getLastNoteOutput', () => {
    runNoteCommand({ action: 'add', port: 7000, note: 'websocket' });
    expect(getLastNoteOutput()).toBe('Note added for port 7000.');
  });
});
