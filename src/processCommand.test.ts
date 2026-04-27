import { formatProcessInfo, formatProcessTable, runProcessCommand } from './processCommand';
import { ProcessInfo } from './processInfo';

const mockInfo: ProcessInfo = {
  pid: 4242,
  name: 'nginx',
  port: 80,
  protocol: 'tcp',
};

describe('formatProcessInfo', () => {
  it('formats a process info entry', () => {
    const result = formatProcessInfo(mockInfo);
    expect(result).toBe('Port 80 → PID 4242 (nginx) [TCP]');
  });
});

describe('formatProcessTable', () => {
  it('includes header row', () => {
    const map = new Map<number, ProcessInfo | null>([[80, mockInfo]]);
    const output = formatProcessTable(map);
    expect(output).toContain('PORT\tPID\tNAME\tPROTOCOL');
  });

  it('renders process row', () => {
    const map = new Map<number, ProcessInfo | null>([[80, mockInfo]]);
    const output = formatProcessTable(map);
    expect(output).toContain('80\t4242\tnginx\tTCP');
  });

  it('renders dash row for null process', () => {
    const map = new Map<number, ProcessInfo | null>([[9999, null]]);
    const output = formatProcessTable(map);
    expect(output).toContain('9999\t-\t-\t-');
  });
});

describe('runProcessCommand', () => {
  it('returns message when no ports given', () => {
    expect(runProcessCommand({})).toBe('No ports specified.');
  });

  it('returns empty json object when no ports and json=true', () => {
    expect(runProcessCommand({ json: true })).toBe('{}');
  });

  it('returns table string for port list', () => {
    const result = runProcessCommand({ ports: [19999] });
    expect(typeof result).toBe('string');
    expect(result).toContain('PORT');
  });

  it('returns json string when json=true', () => {
    const result = runProcessCommand({ ports: [19999], json: true });
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
