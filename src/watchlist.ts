/**
 * watchlist.ts
 * Manages a set of ports to watch closely, triggering priority alerts
 * when activity is detected on any watchlisted port.
 */

export interface WatchlistConfig {
  ports: number[];
  label?: string;
}

export interface WatchlistEntry {
  port: number;
  label: string;
  addedAt: number;
}

let watchlistEntries: WatchlistEntry[] = [];
let watchlistLabel = "watchlist";

export function configureWatchlist(config: WatchlistConfig): void {
  watchlistLabel = config.label ?? "watchlist";
  watchlistEntries = config.ports.map((port) => ({
    port,
    label: watchlistLabel,
    addedAt: Date.now(),
  }));
}

export function resetWatchlist(): void {
  watchlistEntries = [];
  watchlistLabel = "watchlist";
}

export function addToWatchlist(port: number): void {
  if (!watchlistEntries.some((e) => e.port === port)) {
    watchlistEntries.push({ port, label: watchlistLabel, addedAt: Date.now() });
  }
}

export function removeFromWatchlist(port: number): boolean {
  const before = watchlistEntries.length;
  watchlistEntries = watchlistEntries.filter((e) => e.port !== port);
  return watchlistEntries.length < before;
}

export function isWatchlisted(port: number): boolean {
  return watchlistEntries.some((e) => e.port === port);
}

export function getWatchlist(): WatchlistEntry[] {
  return [...watchlistEntries];
}

export function formatWatchlist(): string {
  if (watchlistEntries.length === 0) {
    return "Watchlist is empty.";
  }
  const lines = watchlistEntries.map(
    (e) =>
      `  port ${e.port} — added ${new Date(e.addedAt).toISOString()} [${e.label}]`
  );
  return `Watchlisted ports (${watchlistEntries.length}):\n${lines.join("\n")}`;
}
