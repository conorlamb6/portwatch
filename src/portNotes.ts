/**
 * portNotes.ts
 * Attach and manage freeform notes/annotations for ports.
 */

export interface PortNote {
  port: number;
  note: string;
  updatedAt: number;
}

let notes: Map<number, PortNote> = new Map();

export function resetPortNotes(): void {
  notes = new Map();
}

export function addNote(port: number, note: string): PortNote {
  const entry: PortNote = { port, note, updatedAt: Date.now() };
  notes.set(port, entry);
  return entry;
}

export function removeNote(port: number): boolean {
  return notes.delete(port);
}

export function getNoteForPort(port: number): PortNote | undefined {
  return notes.get(port);
}

export function getAllNotes(): PortNote[] {
  return Array.from(notes.values()).sort((a, b) => a.port - b.port);
}

export function hasNote(port: number): boolean {
  return notes.has(port);
}

export function updateNote(port: number, note: string): PortNote | undefined {
  if (!notes.has(port)) return undefined;
  return addNote(port, note);
}

export function searchNotes(query: string): PortNote[] {
  const lower = query.toLowerCase();
  return getAllNotes().filter((n) => n.note.toLowerCase().includes(lower));
}

export function serializeNotes(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const [port, entry] of notes.entries()) {
    out[port] = entry.note;
  }
  return out;
}

export function loadNotesFromRecord(record: Record<number, string>): void {
  resetPortNotes();
  for (const [key, note] of Object.entries(record)) {
    const port = Number(key);
    if (!isNaN(port) && note) {
      addNote(port, note);
    }
  }
}
