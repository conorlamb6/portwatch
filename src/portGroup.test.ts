import {
  resetPortGroups,
  addPortGroup,
  removePortGroup,
  getGroupForPort,
  getGroupByName,
  getAllGroups,
  getPortsForGroup,
  labelForPort,
} from "./portGroup";

beforeEach(() => {
  resetPortGroups();
});

describe("getGroupForPort", () => {
  it("returns the group for a known port", () => {
    expect(getGroupForPort(80)?.name).toBe("web");
    expect(getGroupForPort(5432)?.name).toBe("database");
  });

  it("returns undefined for an unknown port", () => {
    expect(getGroupForPort(9999)).toBeUndefined();
  });
});

describe("addPortGroup", () => {
  it("adds a new group", () => {
    addPortGroup({ name: "custom", ports: [9000, 9001] });
    expect(getGroupByName("custom")?.ports).toContain(9000);
  });

  it("replaces an existing group with the same name", () => {
    addPortGroup({ name: "web", ports: [9999] });
    expect(getGroupByName("web")?.ports).toEqual([9999]);
  });
});

describe("removePortGroup", () => {
  it("removes an existing group and returns true", () => {
    expect(removePortGroup("ssh")).toBe(true);
    expect(getGroupByName("ssh")).toBeUndefined();
  });

  it("returns false for a non-existent group", () => {
    expect(removePortGroup("nonexistent")).toBe(false);
  });
});

describe("getPortsForGroup", () => {
  it("returns ports for a known group", () => {
    expect(getPortsForGroup("dns")).toContain(53);
  });

  it("returns empty array for unknown group", () => {
    expect(getPortsForGroup("unknown")).toEqual([]);
  });
});

describe("labelForPort", () => {
  it("returns group name for a known port", () => {
    expect(labelForPort(22)).toBe("ssh");
  });

  it("returns 'other' for an unknown port", () => {
    expect(labelForPort(12345)).toBe("other");
  });
});

describe("getAllGroups", () => {
  it("returns a copy of all groups", () => {
    const all = getAllGroups();
    expect(all.length).toBeGreaterThan(0);
    all.push({ name: "injected", ports: [] });
    expect(getGroupByName("injected")).toBeUndefined();
  });
});
