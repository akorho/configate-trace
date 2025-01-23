# Configate Trace Implementation Guide

## Overview
Build a CLI tool that traces the source file for each property in a configate configuration setup.

## Configuration File Order
Files checked in order, with later files overriding earlier ones:
1. default.{ext}
2. {environment}.{ext}
3. local.{ext}
4. local-{environment}.{ext}
5. custom-environment-variables.{ext}

Where `.{ext}` is `.json`, `.ts`, or `.js`

## CLI Interface
```bash
configate-trace [options]

Options:
  -p, --path <path>           Config directory path (default: "./config")
  -e, --environment <env>     Environment name (default: "development") 
  -f, --format <format>       Output format: text/json (default: "text")
  -v, --verbose              Show detailed loading information
```

## Output Formats

Text output:
```
Configuration Property Sources:
==============================

default:
  auth.timeout
  database.host
  database.port

development:
  database.host
  logging.level
```

JSON output:
```json
{
  "auth.timeout": {
    "value": 3600,
    "source": "default"
  },
  "database.host": {
    "value": "localhost",
    "source": "development"
  }
}
```

## Technical Requirements
1. NodeJS package with global CLI installation
2. Support Node.js ≥ 14
3. Required dependencies:
   - commander: CLI framework
   - chalk: Terminal coloring
   - typescript (for .ts files)
4. Handle file loading errors gracefully
5. Support deep property merging
6. Property paths in dot notation for nested objects
7. Support for TypeScript config files through ts-node
8. Handle JavaScript module exports (CommonJS and ESM)

## Implementation Steps
1. Set up package infrastructure
   - Initialize npm package
   - Configure CLI entry point
   - Set up dependencies
   - Configure for global installation

2. Core functionality
   - Config file discovery
   - File loading with format support
   - Config merging with source tracking
   - CLI interface
   - Output formatting
   - Error handling
   - Verbose logging

3. TypeScript support
   - Add ts-node integration
   - Handle both .ts and .js transpilation
   - Support type definitions in config

4. Testing
   - Different file formats
   - Merge order
   - Nested properties
   - Source tracking
   - Error cases
   - CLI options

5. Documentation and distribution
   - Usage documentation
   - Examples
   - Publish to npm

## Project Structure
```
configate-trace/
├── bin/           # CLI entry point
├── src/           # Core implementation
├── package.json   # Package definition
└── README.md      # Documentation
```