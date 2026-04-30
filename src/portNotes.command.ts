import { addNote, removeNote, getNoteForPort, getAllNotes, removeAllNotes } from './portNotes';

type NoteCommandAction = 'add' | 'remove' | 'get' | 'list' | 'clear';

export interface NoteCommandOptions {
  action: NoteCommandAction;
  port?: number;
  note?: string;
}

let lastOutput = '';

export function resetNoteCommand(): void {
  lastOutput = '';
}

export function formatNoteEntry(port: number, note: string): string {
  return `  port ${port}: ${note}`;
}

export function formatNoteList(notes: Record<number, string>): string {
  const entries = Object.entries(notes);
  if (entries.length === 0) return 'No notes recorded.';
  const lines = entries
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([port, note]) => formatNoteEntry(Number(port), note));
  return `Port Notes:\n${lines.join('\n')}`;
}

export function getNoteCommandOutput(opts: NoteCommandOptions): string {
  const { action, port, note } = opts;

  switch (action) {
    case 'add': {
      if (port === undefined || !note) return 'Error: port and note are required for add.';
      addNote(port, note);
      return `Note added for port ${port}.`;
    }
    case 'remove': {
      if (port === undefined) return 'Error: port is required for remove.';
      removeNote(port);
      return `Note removed for port ${port}.`;
    }
    case 'get': {
      if (port === undefined) return 'Error: port is required for get.';
      const found = getNoteForPort(port);
      return found ? formatNoteEntry(port, found) : `No note found for port ${port}.`;
    }
    case 'list': {
      const all = getAllNotes();
      return formatNoteList(all);
    }
    case 'clear': {
      removeAllNotes();
      return 'All notes cleared.';
    }
    default:
      return `Unknown action: ${action}`;
  }
}

export function runNoteCommand(opts: NoteCommandOptions): void {
  lastOutput = getNoteCommandOutput(opts);
  console.log(lastOutput);
}

export function getLastNoteOutput(): string {
  return lastOutput;
}
