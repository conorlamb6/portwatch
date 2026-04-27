/**
 * watchlistCommand.ts
 * CLI command handler for managing and displaying the port watchlist.
 */

import {
  configureWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  formatWatchlist,
  resetWatchlist,
} from "./watchlist";

export interface WatchlistCommandOptions {
  add?: number[];
  remove?: number[];
  list?: boolean;
  ports?: number[];
  label?: string;
}

let commandOutput: string[] = [];

export function resetWatchlistCommand(): void {
  commandOutput = [];
  resetWatchlist();
}

export function getCommandOutput(): string[] {
  return [...commandOutput];
}

export function runWatchlistCommand(opts: WatchlistCommandOptions): void {
  if (opts.ports && opts.ports.length > 0) {
    configureWatchlist({ ports: opts.ports, label: opts.label });
    commandOutput.push(`Watchlist configured with ${opts.ports.length} port(s).`);
  }

  if (opts.add) {
    for (const port of opts.add) {
      addToWatchlist(port);
      commandOutput.push(`Added port ${port} to watchlist.`);
    }
  }

  if (opts.remove) {
    for (const port of opts.remove) {
      const removed = removeFromWatchlist(port);
      commandOutput.push(
        removed
          ? `Removed port ${port} from watchlist.`
          : `Port ${port} was not in watchlist.`
      );
    }
  }

  if (opts.list || (!opts.add && !opts.remove && !opts.ports)) {
    const entries = getWatchlist();
    commandOutput.push(formatWatchlist());
    if (entries.length > 0) {
      commandOutput.push(`Total: ${entries.length} port(s) watched.`);
    }
  }
}
