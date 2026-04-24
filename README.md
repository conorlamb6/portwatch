# portwatch

A lightweight CLI that monitors and logs port activity on your local machine with configurable alerts.

## Installation

```bash
npm install -g portwatch
```

## Usage

Start monitoring all ports with default settings:

```bash
portwatch start
```

Watch a specific port and trigger an alert when activity is detected:

```bash
portwatch watch --port 8080 --alert
```

Log activity to a file:

```bash
portwatch start --output activity.log
```

### Options

| Flag | Description |
|------|-------------|
| `--port <number>` | Target a specific port to monitor |
| `--alert` | Enable desktop notifications on activity |
| `--output <file>` | Write logs to a file |
| `--interval <ms>` | Polling interval in milliseconds (default: 1000) |

### Example Output

```
[12:04:31] PORT 8080  OPEN    PID 3421  node
[12:04:35] PORT 3306  OPEN    PID 1102  mysqld
[12:04:40] PORT 8080  CLOSED
```

## Requirements

- Node.js v16 or higher
- macOS, Linux, or Windows (WSL recommended)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)