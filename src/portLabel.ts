/**
 * portLabel.ts
 * Maps well-known port numbers to human-readable service names.
 */

const WELL_KNOWN_PORTS: Record<number, string> = {
  20: "FTP Data",
  21: "FTP Control",
  22: "SSH",
  23: "Telnet",
  25: "SMTP",
  53: "DNS",
  67: "DHCP Server",
  68: "DHCP Client",
  80: "HTTP",
  110: "POP3",
  143: "IMAP",
  194: "IRC",
  443: "HTTPS",
  465: "SMTPS",
  514: "Syslog",
  587: "SMTP Submission",
  993: "IMAPS",
  995: "POP3S",
  1433: "MSSQL",
  1521: "Oracle DB",
  3000: "Dev Server",
  3306: "MySQL",
  3389: "RDP",
  4200: "Angular Dev",
  5000: "Flask / Dev",
  5432: "PostgreSQL",
  5900: "VNC",
  6379: "Redis",
  8080: "HTTP Alt",
  8443: "HTTPS Alt",
  8888: "Jupyter",
  9200: "Elasticsearch",
  9300: "Elasticsearch Cluster",
  27017: "MongoDB",
  27018: "MongoDB Shard",
};

let customLabels: Record<number, string> = {};

export function resetPortLabels(): void {
  customLabels = {};
}

export function addCustomLabel(port: number, label: string): void {
  if (port < 1 || port > 65535) {
    throw new RangeError(`Port ${port} is out of valid range (1-65535)`);
  }
  customLabels[port] = label;
}

export function removeCustomLabel(port: number): boolean {
  if (port in customLabels) {
    delete customLabels[port];
    return true;
  }
  return false;
}

export function getLabelForPort(port: number): string {
  if (port in customLabels) return customLabels[port];
  if (port in WELL_KNOWN_PORTS) return WELL_KNOWN_PORTS[port];
  return `Port ${port}`;
}

export function isWellKnown(port: number): boolean {
  return port in WELL_KNOWN_PORTS;
}

export function getAllLabels(): Record<number, string> {
  return { ...WELL_KNOWN_PORTS, ...customLabels };
}
