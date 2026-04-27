// portGroupCommand.ts — CLI command to display and manage port groups

import {
  getAllGroups,
  addPortGroup,
  removePortGroup,
  getGroupForPort,
  PortGroup,
} from "./portGroup";

export interface GroupCommandOptions {
  action: "list" | "add" | "remove" | "lookup";
  name?: string;
  ports?: number[];
  port?: number;
  description?: string;
}

export function formatGroupLine(group: PortGroup): string {
  const portStr = group.ports.join(", ");
  const desc = group.description ? ` — ${group.description}` : "";
  return `[${group.name}]${desc}\n  ports: ${portStr}`;
}

export function formatGroupList(groups: PortGroup[]): string {
  if (groups.length === 0) return "No port groups defined.";
  return groups.map(formatGroupLine).join("\n\n");
}

export function runPortGroupCommand(opts: GroupCommandOptions): string {
  switch (opts.action) {
    case "list": {
      return formatGroupList(getAllGroups());
    }
    case "add": {
      if (!opts.name || !opts.ports || opts.ports.length === 0) {
        return "Error: 'add' requires --name and at least one --port.";
      }
      addPortGroup({ name: opts.name, ports: opts.ports, description: opts.description });
      return `Group '${opts.name}' added with ports: ${opts.ports.join(", ")}.`;
    }
    case "remove": {
      if (!opts.name) return "Error: 'remove' requires --name.";
      const removed = removePortGroup(opts.name);
      return removed
        ? `Group '${opts.name}' removed.`
        : `Group '${opts.name}' not found.`;
    }
    case "lookup": {
      if (opts.port === undefined) return "Error: 'lookup' requires --port.";
      const group = getGroupForPort(opts.port);
      return group
        ? `Port ${opts.port} belongs to group '${group.name}'.`
        : `Port ${opts.port} does not belong to any group.`;
    }
    default:
      return "Unknown action.";
  }
}
