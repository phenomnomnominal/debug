# [@phenomnomnominal/debug](https://github.com/phenomnomnominal/debug/)

[![npm version](https://img.shields.io/npm/v/@phenomnomnominal/debug.svg)](https://www.npmjs.com/package/@phenomnomnominal/debug)

**`debug`** is a super lazy way to add debug logging!

## Usage

```typescript
import { debug } from '@phenomnomnominal/debug';

debug({ enabled: true });
```

## Options

```typescript
export type DebugOptions = {
  enabled: boolean; // Enable debug logging
  time: boolean; // Enable function execution time logging
  values: boolean; // Enable argument and return value logging
  logPath: string; // Disable stdout logging and print to file at this path
  header: string; // Header name for the initial debug log
  include: DebugIncludes; // RegExp to match node_modules paths that should be included in the logs
  ignore: DebugIgnores; // RegExp to match local paths that should be ignored from the logs
  logger: DebugLogger; // Custom logger implementation (Maybe you want to send it via HTTP 🤷‍♂️)
};
```
