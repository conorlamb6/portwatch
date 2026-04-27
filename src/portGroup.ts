// portGroup.ts — Group ports by service category for reporting and filtering

export interface PortGroup {
  name: string;
  ports: number[];
  description?: string;
}

const DEFAULT_GROUPS: PortGroup[] = [
  { name: "web", ports: [80, 443, 8080, 8443, 3000, 4000, 5000], description: "Web servers and dev servers" },
  { name: "database", ports: [3306, 5432, 27017, 6379, 1521, 1433], description: "Database services" },
  { name: "ssh", ports: [22, 2222], description: "SSH services" },
  { name: "mail", ports: [25, 465, 587, 993, 995, 143, 110], description: "Mail services" },
  { name: "dns", ports: [53], description: "DNS services" },
  { name: "ftp", ports: [20, 21], description: "FTP services" },
];

let groups: PortGroup[] = [...DEFAULT_GROUPS];

export function resetPortGroups(): void {
  groups = [...DEFAULT_GROUPS];
}

export function addPortGroup(group: PortGroup): void {
  const existing = groups.findIndex((g) => g.name === group.name);
  if (existing >= 0) {
    groups[existing] = group;
  } else {
    groups.push(group);
  }
}

export function removePortGroup(name: string): boolean {
  const before = groups.length;
  groups = groups.filter((g) => g.name !== name);
  return groups.length < before;
}

export function getGroupForPort(port: number): PortGroup | undefined {
  return groups.find((g) => g.ports.includes(port));
}

export function getGroupByName(name: string): PortGroup | undefined {
  return groups.find((g) => g.name === name);
}

export function getAllGroups(): PortGroup[] {
  return [...groups];
}

export function getPortsForGroup(name: string): number[] {
  return getGroupByName(name)?.ports ?? [];
}

export function labelForPort(port: number): string {
  return getGroupForPort(port)?.name ?? "other";
}
