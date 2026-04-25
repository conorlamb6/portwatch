/**
 * filter.ts
 * Provides filtering utilities for port events and snapshots
 * based on configurable criteria such as port ranges, protocols, and states.
 */

export type Protocol = 'tcp' | 'udp' | 'all';

export interface FilterOptions {
  ports?: number[];
  portRange?: { min: number; max: number };
  protocol?: Protocol;
  states?: string[];
  excludePorts?: number[];
}

export interface PortEntry {
  port: number;
  protocol: string;
  state: string;
  pid?: number;
  process?: string;
}

let activeFilter: FilterOptions = {};

export function configureFilter(options: FilterOptions): void {
  activeFilter = { ...options };
}

export function resetFilter(): void {
  activeFilter = {};
}

export function matchesPortList(entry: PortEntry, ports: number[]): boolean {
  return ports.includes(entry.port);
}

export function matchesPortRange(
  entry: PortEntry,
  range: { min: number; max: number }
): boolean {
  return entry.port >= range.min && entry.port <= range.max;
}

export function matchesProtocol(entry: PortEntry, protocol: Protocol): boolean {
  if (protocol === 'all') return true;
  return entry.protocol.toLowerCase() === protocol.toLowerCase();
}

export function matchesState(entry: PortEntry, states: string[]): boolean {
  return states.map((s) => s.toUpperCase()).includes(entry.state.toUpperCase());
}

export function applyFilter(
  entries: PortEntry[],
  options: FilterOptions = activeFilter
): PortEntry[] {
  return entries.filter((entry) => {
    if (options.excludePorts && options.excludePorts.includes(entry.port)) {
      return false;
    }
    if (options.ports && options.ports.length > 0) {
      if (!matchesPortList(entry, options.ports)) return false;
    }
    if (options.portRange) {
      if (!matchesPortRange(entry, options.portRange)) return false;
    }
    if (options.protocol && options.protocol !== 'all') {
      if (!matchesProtocol(entry, options.protocol)) return false;
    }
    if (options.states && options.states.length > 0) {
      if (!matchesState(entry, options.states)) return false;
    }
    return true;
  });
}
