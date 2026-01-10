# AGENTS.md

This file provides guidance for agentic coding assistants working in this repository.

## Development Commands

```bash
# Build TypeScript to dist/
npm run build

# Watch mode for development
npm run dev

# Run the CLI
npm start
# or
node dist/cli.js

# Run tests (shell scripts)
bash test.sh
bash demo.sh
```

No automated test framework is configured. Tests are manual shell scripts in the root directory.

## Code Style

### Module System
- **TypeScript ESM**: All files use ES modules (`type: "module"` in package.json)
- **Import extensions**: Always use `.js` extensions in imports (even for TypeScript files)
- **Default exports**: Use default exports for classes and main command functions
- **Type imports**: Use `import type { ... }` for type-only imports

```typescript
import ModelManager from './modelManager.js';
import type { Model } from './types.js';
```

### TypeScript Configuration
- **Strict mode**: Enabled (`strict: true` in tsconfig.json)
- **Target**: ES2022 with NodeNext module resolution
- **All types**: Everything must be fully typed, no `any`
- **Interface over type**: Use `interface` for objects, `type` for unions/primitives

### Naming Conventions
- **Classes**: PascalCase (`ModelManager`, `ConfigManager`)
- **Functions/methods**: camelCase (`addModel`, `listModels`)
- **Constants**: UPPER_SNAKE_CASE (`PROVIDERS`, `CLAUDE_DEFAULT_MODELS`)
- **Files**: camelCase (`modelManager.ts`, `configManager.ts`)

### Error Handling
- **Try-catch**: All async operations wrapped in try-catch
- **Error type checking**: Always use `instanceof Error` before accessing error.message
- **Error propagation**: Lower layers throw errors, CLI layer catches and displays with chalk
- **Exit codes**: `process.exit(1)` on error in command files

```typescript
try {
  await operation();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`Error: ${message}`));
  process.exit(1);
}
```

### Classes vs Functions
- **Classes**: Use for stateful managers (`ModelManager`, `ConfigManager`)
- **Functions**: Use for stateless operations (command files, utility functions)
- **Command files**: Export a single default async function that handles the command

### Output Formatting
- **chalk**: Use for all terminal output
- **Success**: `chalk.green('✓ ...')` or `chalk.bold(...)`
- **Error**: `chalk.red('Error: ...')`
- **Info**: `chalk.blue(...)`
- **Dim**: `chalk.gray(...)` for secondary info

### Async Patterns
- **Always async**: All file I/O and async operations use `async/await`
- **No callbacks**: Never use callbacks
- **fs-extra**: Use `fs-extra` for file operations (returns promises)

### Architecture
- **Three layers**: CLI (cli.ts) → Business Logic (modelManager.ts) → Storage (configManager.ts)
- **Separation of concerns**: Each layer has a single responsibility
- **Dependency injection**: Pass ModelManager instance to commands, don't import directly in commands

### Imports
- **Third-party imports**: Group at top of file
- **Local imports**: After third-party, grouped by type
- **Type imports**: Use `import type` for type-only imports
- **JSON imports**: Use `createRequire` for JSON in ESM

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { createRequire } from 'module';

import ModelManager from './modelManager.js';
import type { AddCommandOptions } from './types.js';
```

### Comments
- **Minimal comments**: Only comment complex logic that isn't self-evident
- **No docstrings**: Don't add JSDoc unless absolutely necessary

### File Organization
- **src/commands/**: Individual command files (add, list, remove, etc.)
- **src/utils/**: Utility functions (claudeLauncher, interactiveHelpers)
- **src/types.ts**: All type definitions in one file
- **src/cli.ts**: Main entry point, commander setup
- **src/modelManager.ts**: Business logic class
- **src/configManager.ts**: Storage layer class

### Environment Variables
- **Model config**: Check `ANTHROPIC_DEFAULT_OPUS_MODEL`, `ANTHROPIC_DEFAULT_SONNET_MODEL`, `ANTHROPIC_DEFAULT_HAIKU_MODEL` for overrides
- **Platform**: Config dir uses OS-specific paths (`~/.config/` on macOS/Linux, `%APPDATA%` on Windows)

### Node.js Version
- **Minimum**: Node.js >= 18.0.0
- **ESM**: Modern Node.js features available

### Code Patterns to Avoid
- No `any` types
- No `console.log` for errors (use `console.error` with chalk)
- No callbacks
- No CommonJS (`require`, `module.exports`)
- No inline types in functions (define in types.ts)
