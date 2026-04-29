import { HistoryEntry } from './history';

export interface HeatmapCell {
  port: number;
  hour: number;
  count: number;
}

export interface PortHeatmap {
  cells: HeatmapCell[];
  ports: number[];
  hours: number[];
}

let heatmapData: HeatmapCell[] = [];

export function resetHeatmap(): void {
  heatmapData = [];
}

export function buildHeatmap(entries: HistoryEntry[]): PortHeatmap {
  const cellMap = new Map<string, HeatmapCell>();

  for (const entry of entries) {
    const hour = new Date(entry.timestamp).getHours();
    const port = entry.port;
    const key = `${port}:${hour}`;

    if (!cellMap.has(key)) {
      cellMap.set(key, { port, hour, count: 0 });
    }
    cellMap.get(key)!.count += 1;
  }

  const cells = Array.from(cellMap.values());
  const ports = [...new Set(cells.map(c => c.port))].sort((a, b) => a - b);
  const hours = [...new Set(cells.map(c => c.hour))].sort((a, b) => a - b);

  heatmapData = cells;
  return { cells, ports, hours };
}

export function formatHeatmap(heatmap: PortHeatmap): string {
  if (heatmap.ports.length === 0) return 'No heatmap data available.';

  const SYMBOLS = [' ', '░', '▒', '▓', '█'];
  const maxCount = Math.max(...heatmap.cells.map(c => c.count), 1);

  const header = '     ' + heatmap.hours.map(h => String(h).padStart(3)).join('');
  const rows = heatmap.ports.map(port => {
    const label = String(port).padStart(5);
    const cells = heatmap.hours.map(hour => {
      const cell = heatmap.cells.find(c => c.port === port && c.hour === hour);
      const count = cell ? cell.count : 0;
      const idx = Math.min(Math.floor((count / maxCount) * (SYMBOLS.length - 1)), SYMBOLS.length - 1);
      return `  ${SYMBOLS[idx]}`;
    });
    return label + cells.join('');
  });

  return [header, ...rows].join('\n');
}

export function getHotPorts(heatmap: PortHeatmap, topN = 5): number[] {
  const totals = new Map<number, number>();
  for (const cell of heatmap.cells) {
    totals.set(cell.port, (totals.get(cell.port) ?? 0) + cell.count);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([port]) => port);
}
