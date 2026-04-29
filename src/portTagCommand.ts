// portTagCommand.ts — CLI command handler for port tag management

import {
  addTag,
  removeTag,
  getTagsForPort,
  getPortsForTag,
  getAllPortTags,
  resetPortTags as _reset,
} from './portTag';

export interface TagCommandOptions {
  action: 'add' | 'remove' | 'list' | 'search';
  port?: number;
  tag?: string;
}

export function formatTagLine(port: number, tags: string[]): string {
  return `  Port ${port}: ${tags.length > 0 ? tags.join(', ') : '(no tags)'}`;
}

export function formatTagList(): string {
  const entries = getAllPortTags();
  if (entries.length === 0) return 'No port tags configured.';
  const lines = entries.map(e => formatTagLine(e.port, e.tags));
  return `Port Tags:\n${lines.join('\n')}`;
}

export function runTagCommand(options: TagCommandOptions): string {
  const { action, port, tag } = options;

  if (action === 'list') {
    return formatTagList();
  }

  if (action === 'search') {
    if (!tag) return 'Error: --tag is required for search.';
    const ports = getPortsForTag(tag);
    if (ports.length === 0) return `No ports tagged with "${tag}".`;
    return `Ports tagged "${tag}":\n${ports.map(p => `  ${p}`).join('\n')}`;
  }

  if (action === 'add') {
    if (port === undefined) return 'Error: --port is required for add.';
    if (!tag) return 'Error: --tag is required for add.';
    addTag(port, tag);
    return `Tag "${tag}" added to port ${port}.`;
  }

  if (action === 'remove') {
    if (port === undefined) return 'Error: --port is required for remove.';
    if (!tag) return 'Error: --tag is required for remove.';
    const removed = removeTag(port, tag);
    return removed
      ? `Tag "${tag}" removed from port ${port}.`
      : `Tag "${tag}" not found on port ${port}.`;
  }

  return `Unknown action: ${action}`;
}

export function resetTagCommand(): void {
  _reset();
}
