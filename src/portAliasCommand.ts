/**
 * portAliasCommand.ts
 * CLI command handler for managing port aliases.
 */

import {
  addAlias,
  removeAlias,
  getAllAliases,
  getAliasForPort,
  getPortForAlias,
  resetPortAliases,
} from "./portAlias";

export type AliasCommandAction = "add" | "remove" | "list" | "lookup";

export interface AliasCommandOptions {
  action: AliasCommandAction;
  port?: number;
  alias?: string;
}

let lastOutput = "";

export function resetAliasCommand(): void {
  resetPortAliases();
  lastOutput = "";
}

export function formatAliasList(entries: Array<{ port: number; alias: string }>): string {
  if (entries.length === 0) return "No aliases configured.";
  const lines = entries.map((e) => `  ${String(e.port).padEnd(6)} => ${e.alias}`);
  return ["Port Aliases:", ...lines].join("\n");
}

export function runAliasCommand(opts: AliasCommandOptions): string {
  switch (opts.action) {
    case "add": {
      if (opts.port === undefined || !opts.alias) {
        lastOutput = "Error: 'add' requires both --port and --alias.";
        break;
      }
      addAlias(opts.port, opts.alias);
      lastOutput = `Alias '${opts.alias.trim().toLowerCase()}' added for port ${opts.port}.`;
      break;
    }
    case "remove": {
      if (opts.port === undefined) {
        lastOutput = "Error: 'remove' requires --port.";
        break;
      }
      const removed = removeAlias(opts.port);
      lastOutput = removed
        ? `Alias removed for port ${opts.port}.`
        : `No alias found for port ${opts.port}.`;
      break;
    }
    case "list": {
      lastOutput = formatAliasList(getAllAliases());
      break;
    }
    case "lookup": {
      if (opts.port !== undefined) {
        const alias = getAliasForPort(opts.port);
        lastOutput = alias ? `Port ${opts.port} => ${alias}` : `No alias for port ${opts.port}.`;
      } else if (opts.alias) {
        const port = getPortForAlias(opts.alias);
        lastOutput = port !== undefined ? `Alias '${opts.alias}' => port ${port}` : `No port for alias '${opts.alias}'.`;
      } else {
        lastOutput = "Error: 'lookup' requires --port or --alias.";
      }
      break;
    }
    default:
      lastOutput = `Unknown action: ${opts.action}`;
  }
  return lastOutput;
}

export function getAliasCommandOutput(): string {
  return lastOutput;
}
