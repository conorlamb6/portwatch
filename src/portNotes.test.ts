import {
  resetPortNotes,
  addNote,
  removeNote,
  getNoteForPort,
  getAllNotes,
  hasNote,
  updateNote,
  searchNotes,
  serializeNotes,
  loadNotesFromRecord,
} from "./portNotes";

beforeEach(() => {
  resetPortNotes();
});

describe("addNote", () => {
  it("adds a note for a port", () => {
    const note = addNote(8080, "main web server");
    expect(note.port).toBe(8080);
    expect(note.note).toBe("main web server");
    expect(note.updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it("overwrites an existing note", () => {
    addNote(8080, "old note");
    addNote(8080, "new note");
    expect(getNoteForPort(8080)?.note).toBe("new note");
  });
});

describe("removeNote", () => {
  it("removes an existing note", () => {
    addNote(3000, "dev server");
    expect(removeNote(3000)).toBe(true);
    expect(hasNote(3000)).toBe(false);
  });

  it("returns false when note does not exist", () => {
    expect(removeNote(9999)).toBe(false);
  });
});

describe("getAllNotes", () => {
  it("returns all notes sorted by port", () => {
    addNote(5000, "service A");
    addNote(3000, "service B");
    const all = getAllNotes();
    expect(all.map((n) => n.port)).toEqual([3000, 5000]);
  });

  it("returns empty array when no notes", () => {
    expect(getAllNotes()).toEqual([]);
  });
});

describe("updateNote", () => {
  it("updates an existing note", () => {
    addNote(443, "https");
    const updated = updateNote(443, "secure https traffic");
    expect(updated?.note).toBe("secure https traffic");
  });

  it("returns undefined if port has no note", () => {
    expect(updateNote(1234, "something")).toBeUndefined();
  });
});

describe("searchNotes", () => {
  it("finds notes matching query", () => {
    addNote(80, "http traffic");
    addNote(443, "https secure");
    addNote(22, "ssh access");
    const results = searchNotes("http");
    expect(results.map((n) => n.port)).toContain(80);
    expect(results.map((n) => n.port)).toContain(443);
    expect(results.map((n) => n.port)).not.toContain(22);
  });
});

describe("serializeNotes / loadNotesFromRecord", () => {
  it("round-trips notes through serialization", () => {
    addNote(8080, "web");
    addNote(5432, "postgres");
    const serialized = serializeNotes();
    resetPortNotes();
    loadNotesFromRecord(serialized);
    expect(getNoteForPort(8080)?.note).toBe("web");
    expect(getNoteForPort(5432)?.note).toBe("postgres");
  });

  it("ignores invalid keys during load", () => {
    loadNotesFromRecord({ NaN: "bad", 80: "ok" } as any);
    expect(getAllNotes().length).toBe(1);
  });
});
