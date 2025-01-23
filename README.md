# configate-trace

A CLI tool to trace the source file for each property in a configate configuration setup.

## Installation

Install globally:
```bash
npm install -g configate-trace
```

Or as a project dependency:
```bash
npm install configate-trace
```

## Usage

### Basic Usage

```bash
configate-trace
```

This will:
1. Look for config files in the `./config` directory
2. Use 'development' as the default environment
3. Show which config file each property comes from

### Command Line Options

```bash
configate-trace [options]

Options:
  -p, --path <path>         Config directory path (default: "./config")
  -e, --environment <env>   Environment name (default: "development")
  -f, --format <format>     Output format: text/json (default: "text")
  -v, --verbose            Show detailed loading information
```

### Examples

Using a different config directory:
```bash
configate-trace -p ./my-config
```

Using production environment:
```bash
configate-trace -e production
```

Output in JSON format:
```bash
configate-trace -f json
```

Show verbose loading information:
```bash
configate-trace -v
```

### Configuration Files

The tool looks for configuration files in the following order:
1. `default.{ext}`
2. `{environment}.{ext}`
3. `local.{ext}`
4. `local-{environment}.{ext}`
5. `custom-environment-variables.{ext}`

Where `.{ext}` can be:
- `.json`
- `.js`
- `.ts`

Later files override values from earlier files.

### Environment Variables

Use `custom-environment-variables.json` to map environment variables to configuration properties:

```json
{
  "database": {
    "password": "DB_PASSWORD",
    "host": "DB_HOST"
  },
  "logging": {
    "level": "LOG_LEVEL"
  }
}
```

Then set environment variables:
```bash
DB_PASSWORD=secret DB_HOST=localhost LOG_LEVEL=debug configate-trace -v
```

### Output Formats

#### Text Format (default)
```
Configuration Property Sources:
==============================

default:
  database.host
  database.port

development:
  logging.level

local:
  database.password
```

#### JSON Format
```json
{
  "database.host": {
    "value": "localhost",
    "source": "development"
  },
  "database.port": {
    "value": 5432,
    "source": "default"
  }
}
```

## Requirements

- Node.js ≥ 14
- Supports TypeScript configuration files out of the box

## License

ISC 