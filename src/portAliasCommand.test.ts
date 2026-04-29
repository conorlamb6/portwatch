import {
  resetAliasCommand,
  runAliasCommand,
  formatAliasList,
  getAliasCommandOutput,
} from "./portAliasCommand";
import { addAlias, getAllAliases } from "./portAlias";

beforeEach(() => {
  resetAliasCommand();
});

describe("formatAliasList", () => {
  it("returns placeholder when no aliases", () => {
    expect(formatAliasList([])).toBe("No aliases configured.");
  });

  it("formats entries correctly", () => {
    const result = formatAliasList([{ port: 3000, alias: "dev-server" }]);
    expect(result).toContain("Port Aliases:");
    expect(result).toContain("3000");
    expect(result).toContain("dev-server");
  });
});

describe("runAliasCommand - add", () => {
  it("adds an alias and returns confirmation", () => {
    const out = runAliasCommand({ action: "add", port: 8080, alias: "api" });
    expect(out).toContain("api");
    expect(out).toContain("8080");
    expect(getAllAliases()).toHaveLength(1);
  });

  it("returns error when port or alias missing", () => {
    const out = runAliasCommand({ action: "add" });
    expect(out).toContain("Error");
  });
});

describe("runAliasCommand - remove", () => {
  it("removes an existing alias", () => {
    addAlias(9000, "metrics");
    const out = runAliasCommand({ action: "remove", port: 9000 });
    expect(out).toContain("removed");
    expect(getAllAliases()).toHaveLength(0);
  });

  it("reports not found when alias does not exist", () => {
    const out = runAliasCommand({ action: "remove", port: 1234 });
    expect(out).toContain("No alias");
  });

  it("returns error when port missing", () => {
    const out = runAliasCommand({ action: "remove" });
    expect(out).toContain("Error");
  });
});

describe("runAliasCommand - list", () => {
  it("lists all aliases", () => {
    addAlias(3000, "frontend");
    addAlias(4000, "backend");
    const out = runAliasCommand({ action: "list" });
    expect(out).toContain("frontend");
    expect(out).toContain("backend");
  });

  it("shows placeholder when empty", () => {
    const out = runAliasCommand({ action: "list" });
    expect(out).toBe("No aliases configured.");
  });
});

describe("runAliasCommand - lookup", () => {
  it("looks up alias by port", () => {
    addAlias(5432, "postgres");
    const out = runAliasCommand({ action: "lookup", port: 5432 });
    expect(out).toContain("postgres");
  });

  it("looks up port by alias", () => {
    addAlias(6379, "redis");
    const out = runAliasCommand({ action: "lookup", alias: "redis" });
    expect(out).toContain("6379");
  });

  it("reports not found for unknown port", () => {
    const out = runAliasCommand({ action: "lookup", port: 9999 });
    expect(out).toContain("No alias");
  });

  it("returns error when neither port nor alias given", () => {
    const out = runAliasCommand({ action: "lookup" });
    expect(out).toContain("Error");
  });
});

describe("getAliasCommandOutput", () => {
  it("returns last command output", () => {
    runAliasCommand({ action: "list" });
    expect(getAliasCommandOutput()).toBe("No aliases configured.");
  });
});
