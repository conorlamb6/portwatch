import { Command } from 'commander';
import { loadConfig, mergeConfig, validateConfig } from './config';
import { poll } from './monitor';
import { configureAlerts } from './alerts';
import { initLogger, closeLogger } from './logger';
import { resolveOutputPath } from './output';

const program = new Command();

program
  .name('portwatch')
  .description('Monitor and log port activity on your local machine')
  .version('1.0.0');

program
  .option('-c, --config <path>', 'path to config file')
  .option('-p, --ports <ports>', 'comma-separated list of ports to watch', (val) =>
    val.split(',').map(Number)
  )
  .option('-i, --interval <ms>', 'polling interval in milliseconds', parseInt)
  .option('-o, --output <path>', 'output file path for reports')
  .option('--log <path>', 'log file path')
  .option('--alert-threshold <n>', 'alert when port count exceeds threshold', parseInt)
  .option('--json', 'output report as JSON')
  .option('--no-color', 'disable colored output');

program.action(async (options) => {
  try {
    const fileConfig = options.config ? loadConfig(options.config) : {};

    const cliOverrides: Record<string, unknown> = {};
    if (options.ports) cliOverrides.ports = options.ports;
    if (options.interval) cliOverrides.interval = options.interval;
    if (options.output) cliOverrides.outputPath = resolveOutputPath(options.output);
    if (options.log) cliOverrides.logPath = options.log;
    if (options.alertThreshold) cliOverrides.alertThreshold = options.alertThreshold;
    if (options.json) cliOverrides.jsonOutput = true;
    if (options.noColor) cliOverrides.color = false;

    const config = validateConfig(mergeConfig(fileConfig, cliOverrides));

    if (config.logPath) {
      initLogger(config.logPath);
    }

    configureAlerts(config);

    console.log(`portwatch started — interval: ${config.interval}ms`);
    if (config.ports && config.ports.length > 0) {
      console.log(`Watching ports: ${config.ports.join(', ')}`);
    } else {
      console.log('Watching all active ports');
    }

    process.on('SIGINT', () => {
      console.log('\nShutting down portwatch...');
      closeLogger();
      process.exit(0);
    });

    await poll(config);
  } catch (err) {
    console.error('Error:', (err as Error).message);
    process.exit(1);
  }
});

export function runCli(argv: string[] = process.argv): void {
  program.parse(argv);
}

if (require.main === module) {
  runCli();
}
