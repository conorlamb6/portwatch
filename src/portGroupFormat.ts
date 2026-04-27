// portGroupFormat.ts — Format port group data for reports and summaries

import { PortGroup, getAllGroups, getGroupForPort } from "./portGroup";

export interface GroupedPortEntry {
  port: number;
  group: string;
}

export function groupPorts(ports: number[]): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const port of ports) {
    const group = getGroupForPort(port)?.name ?? "other";
    if (!result[group]) result[group] = [];
    result[group].push(port);
  }
  return result;
}

export function formatGroupedPorts(grouped: Record<string, number[]>): string {
  const lines: string[] = [];
  for (const [group, ports] of Object.entries(grouped).sort()) {
    lines.push(`  ${group}: ${ports.sort((a, b) => a - b).join(", ")}`);
  }
  return lines.length > 0 ? lines.join("\n") : "  (none)";
}

export function buildGroupSummary(ports: number[]): string {
  const grouped = groupPorts(ports);
  const total = ports.length;
  const groupCount = Object.keys(grouped).length;
  const header = `Port Group Summary (${total} active port${total !== 1 ? "s" : ""}, ${groupCount} group${groupCount !== 1 ? "s" : ""})`;
  return `${header}\n${formatGroupedPorts(grouped)}`;
}

export function toGroupedEntries(ports: number[]): GroupedPortEntry[] {
  return ports.map((port) => ({
    port,
    group: getGroupForPort(port)?.name ?? "other",
  }));
}

export function serializeGroupedPorts(grouped: Record<string, number[]>): string {
  return JSON.stringify(grouped, null, 2);
}
