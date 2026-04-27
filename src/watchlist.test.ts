import {
  configureWatchlist,
  resetWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isWatchlisted,
  getWatchlist,
  formatWatchlist,
} from "./watchlist";
import {
  runWatchlistCommand,
  resetWatchlistCommand,
  getCommandOutput,
} from "./watchlistCommand";

beforeEach(() => {
  resetWatchlist();
  resetWatchlistCommand();
});

describe("configureWatchlist", () => {
  it("populates entries from config ports", () => {
    configureWatchlist({ ports: [80, 443, 8080] });
    expect(getWatchlist()).toHaveLength(3);
  });

  it("stores provided label on entries", () => {
    configureWatchlist({ ports: [22], label: "ssh" });
    expect(getWatchlist()[0].label).toBe("ssh");
  });
});

describe("addToWatchlist", () => {
  it("adds a new port", () => {
    addToWatchlist(3000);
    expect(isWatchlisted(3000)).toBe(true);
  });

  it("does not duplicate existing port", () => {
    addToWatchlist(3000);
    addToWatchlist(3000);
    expect(getWatchlist()).toHaveLength(1);
  });
});

describe("removeFromWatchlist", () => {
  it("removes an existing port and returns true", () => {
    addToWatchlist(9090);
    expect(removeFromWatchlist(9090)).toBe(true);
    expect(isWatchlisted(9090)).toBe(false);
  });

  it("returns false when port not present", () => {
    expect(removeFromWatchlist(9999)).toBe(false);
  });
});

describe("formatWatchlist", () => {
  it("returns empty message when no entries", () => {
    expect(formatWatchlist()).toBe("Watchlist is empty.");
  });

  it("includes port numbers in output", () => {
    addToWatchlist(80);
    addToWatchlist(443);
    const output = formatWatchlist();
    expect(output).toContain("port 80");
    expect(output).toContain("port 443");
  });
});

describe("runWatchlistCommand", () => {
  it("configures watchlist from ports option", () => {
    runWatchlistCommand({ ports: [22, 80] });
    expect(isWatchlisted(22)).toBe(true);
    expect(getCommandOutput()[0]).toContain("2 port(s)");
  });

  it("adds and removes ports via options", () => {
    runWatchlistCommand({ add: [8080], remove: [] });
    expect(isWatchlisted(8080)).toBe(true);
    runWatchlistCommand({ remove: [8080] });
    expect(isWatchlisted(8080)).toBe(false);
  });

  it("reports when removed port was not present", () => {
    runWatchlistCommand({ remove: [1234] });
    expect(getCommandOutput().some((l) => l.includes("not in watchlist"))).toBe(true);
  });

  it("lists watchlist when no action flags provided", () => {
    addToWatchlist(5432);
    runWatchlistCommand({ list: true });
    const out = getCommandOutput().join("\n");
    expect(out).toContain("port 5432");
  });
});
