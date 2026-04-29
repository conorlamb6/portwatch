// portTag.ts — Assign and manage user-defined tags for ports

export interface PortTag {
  port: number;
  tags: string[];
}

let tagMap: Map<number, Set<string>> = new Map();

export function resetPortTags(): void {
  tagMap = new Map();
}

export function addTag(port: number, tag: string): void {
  if (!tagMap.has(port)) {
    tagMap.set(port, new Set());
  }
  tagMap.get(port)!.add(tag.trim().toLowerCase());
}

export function removeTag(port: number, tag: string): boolean {
  const tags = tagMap.get(port);
  if (!tags) return false;
  const removed = tags.delete(tag.trim().toLowerCase());
  if (tags.size === 0) tagMap.delete(port);
  return removed;
}

export function getTagsForPort(port: number): string[] {
  return Array.from(tagMap.get(port) ?? []);
}

export function getPortsForTag(tag: string): number[] {
  const normalized = tag.trim().toLowerCase();
  const result: number[] = [];
  for (const [port, tags] of tagMap.entries()) {
    if (tags.has(normalized)) result.push(port);
  }
  return result.sort((a, b) => a - b);
}

export function hasTag(port: number, tag: string): boolean {
  return tagMap.get(port)?.has(tag.trim().toLowerCase()) ?? false;
}

export function getAllPortTags(): PortTag[] {
  return Array.from(tagMap.entries()).map(([port, tags]) => ({
    port,
    tags: Array.from(tags).sort(),
  }));
}

export function serializePortTags(): string {
  return JSON.stringify(getAllPortTags(), null, 2);
}

export function loadPortTagsFromJson(json: string): void {
  const entries: PortTag[] = JSON.parse(json);
  resetPortTags();
  for (const { port, tags } of entries) {
    for (const tag of tags) {
      addTag(port, tag);
    }
  }
}
