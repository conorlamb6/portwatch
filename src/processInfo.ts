import { execSync } from 'child_process';

export interface ProcessInfo {
  pid: number;
  name: string;
  port: number;
  protocol: string;
}

let processCache: Map<number, ProcessInfo> = new Map();

export function resetProcessInfo(): void {
  processCache = new Map();
}

export function parseLsofLine(line: string): ProcessInfo | null {
  // COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
  const parts = line.trim().split(/\s+/);
  if (parts.length < 9) return null;
  const name = parts[0];
  const pid = parseInt(parts[1], 10);
  const nodeField = parts[8]; // e.g. *:8080 or TCP *:3000 (LISTEN)
  const portMatch = nodeField.match(/(\d+)$/);
  if (!pid || !portMatch) return null;
  const port = parseInt(portMatch[1], 10);
  const protocol = parts[7]?.toLowerCase().includes('udp') ? 'udp' : 'tcp';
  return { pid, name, port, protocol };
}

export function fetchProcessForPort(port: number): ProcessInfo | null {
  if (processCache.has(port)) return processCache.get(port)!;
  try {
    const output = execSync(`lsof -i :${port} -n -P 2>/dev/null`, { encoding: 'utf8' });
    const lines = output.split('\n').slice(1);
    for (const line of lines) {
      const info = parseLsofLine(line);
      if (info && info.port === port) {
        processCache.set(port, info);
        return info;
      }
    }
  } catch {
    // lsof not available or permission denied
  }
  return null;
}

export function enrichWithProcess(ports: number[]): Map<number, ProcessInfo | null> {
  const result = new Map<number, ProcessInfo | null>();
  for (const port of ports) {
    result.set(port, fetchProcessForPort(port));
  }
  return result;
}
