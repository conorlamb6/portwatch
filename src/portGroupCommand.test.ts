import { resetPortGroups } from "./portGroup";
import { runPortGroupCommand, formatGroupLine, formatGroupList } from "./portGroupCommand";

beforeEach(() => {
  resetPortGroups();
});

describe("formatGroupLine", () => {
  it("formats a group with description", () => {
    const line = formatGroupLine({ name: "web", ports: [80, 443], description: "Web" });
    expect(line).toContain("[web]");
    expect(line).toContain("80, 443");
    expect(line).toContain("Web");
  });

  it("formats a group without description", () => {
    const line = formatGroupLine({ name: "custom", ports: [9000] });
    expect(line).toContain("[custom]");
    expect(line).not.toContain("—");
  });
});

describe("formatGroupList", () => {
  it("returns a message when no groups exist", () => {
    expect(formatGroupList([])).toBe("No port groups defined.");
  });

  it("formats multiple groups", () => {
    const result = formatGroupList([
      { name: "a", ports: [1] },
      { name: "b", ports: [2] },
    ]);
    expect(result).toContain("[a]");
    expect(result).toContain("[b]");
  });
});

describe("runPortGroupCommand list", () => {
  it("lists all groups", () => {
    const out = runPortGroupCommand({ action: "list" });
    expect(out).toContain("[web]");
    expect(out).toContain("[database]");
  });
});

describe("runPortGroupCommand add", () => {
  it("adds a new group", () => {
    const out = runPortGroupCommand({ action: "add", name: "custom", ports: [9000] });
    expect(out).toContain("custom");
    expect(out).toContain("9000");
  });

  it("returns error if name missing", () => {
    const out = runPortGroupCommand({ action: "add", ports: [9000] });
    expect(out).toContain("Error");
  });
});

describe("runPortGroupCommand remove", () => {
  it("removes an existing group", () => {
    const out = runPortGroupCommand({ action: "remove", name: "ssh" });
    expect(out).toContain("removed");
  });

  it("reports not found for missing group", () => {
    const out = runPortGroupCommand({ action: "remove", name: "ghost" });
    expect(out).toContain("not found");
  });
});

describe("runPortGroupCommand lookup", () => {
  it("finds a group for a known port", () => {
    const out = runPortGroupCommand({ action: "lookup", port: 5432 });
    expect(out).toContain("database");
  });

  it("reports no group for unknown port", () => {
    const out = runPortGroupCommand({ action: "lookup", port: 19999 });
    expect(out).toContain("does not belong");
  });

  it("returns error if port missing", () => {
    const out = runPortGroupCommand({ action: "lookup" });
    expect(out).toContain("Error");
  });
});
