import { execSync } from 'child_process';

export interface PortInfo {
  port: number;
  pid: number | null;
  protocol: 'tcp' | 'udp';
  state: string;
  process: string | null;
}

function parseNetstatLine(line: string): PortInfo | null {
  // Match lines like: tcp  0  0  0.0.0.0:8080  0.0.0.0:*  LISTEN  1234/node
  const match = line.match(
    /^(tcp|udp)\s+\d+\s+\d+\s+[\d.:*]+:(\d+)\s+[\d.:*]+\s+(\w+)(?:\s+(\d+)\/(.+))?/
  );
  if (!match) return null;

  const [, protocol, portStr, state, pidStr, processName] = match;
  return {
    port: parseInt(portStr, 10),
    pid: pidStr ? parseInt(pidStr, 10) : null,
    protocol: protocol as 'tcp' | 'udp',
    state: state.toLowerCase(),
    process: processName?.trim() ?? null,
  };
}

export function scanPorts(): PortInfo[] {
  try {
    const output = execSync('netstat -tlnup 2>/dev/null || ss -tlnup 2>/dev/null', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.split('\n').slice(2); // skip header lines
    const results: PortInfo[] = [];

    for (const line of lines) {
      const info = parseNetstatLine(line.trim());
      if (info) results.push(info);
    }

    return results;
  } catch {
    return [];
  }
}

export function filterByPorts(ports: PortInfo[], watchList: number[]): PortInfo[] {
  if (watchList.length === 0) return ports;
  return ports.filter((p) => watchList.includes(p.port));
}

export function getActivePorts(): number[] {
  return scanPorts().map((p) => p.port);
}
