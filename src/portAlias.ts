/**
 * portAlias.ts
 * Manages user-defined aliases for ports (e.g., 3000 => "dev-server").
 */

const aliasMap: Map<number, string> = new Map();
const reverseMap: Map<string, number> = new Map();

export function resetPortAliases(): void {
  aliasMap.clear();
  reverseMap.clear();
}

export function addAlias(port: number, alias: string): void {
  if (!alias || alias.trim().length === 0) {
    throw new Error("Alias must be a non-empty string");
  }
  if (port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }
  const normalized = alias.trim().toLowerCase();
  aliasMap.set(port, normalized);
  reverseMap.set(normalized, port);
}

export function removeAlias(port: number): boolean {
  const existing = aliasMap.get(port);
  if (existing === undefined) return false;
  aliasMap.delete(port);
  reverseMap.delete(existing);
  return true;
}

export function getAliasForPort(port: number): string | undefined {
  return aliasMap.get(port);
}

export function getPortForAlias(alias: string): number | undefined {
  return reverseMap.get(alias.trim().toLowerCase());
}

export function hasAlias(port: number): boolean {
  return aliasMap.has(port);
}

export function getAllAliases(): Array<{ port: number; alias: string }> {
  return Array.from(aliasMap.entries())
    .map(([port, alias]) => ({ port, alias }))
    .sort((a, b) => a.port - b.port);
}

export function resolvePortDisplay(port: number): string {
  const alias = aliasMap.get(port);
  return alias ? `${port} (${alias})` : `${port}`;
}
