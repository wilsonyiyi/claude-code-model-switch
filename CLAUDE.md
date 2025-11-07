# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
npm install

# Run the CLI tool
npm start
# or
node src/cli.js
# or
cc (after global install)

# Run tests
bash test.sh

# Run demo
bash demo.sh
```

## Project Overview

**Claude Code Model Manager** - A Node.js CLI tool for managing multiple Claude Code model configurations with easy switching.

- **Main entry**: `src/cli.js`
- **Version**: 1.0.1
- **Node requirement**: >=18.0.0
- **Binary**: `cc`

## Code Architecture

This is a simple 3-layer architecture:

### Layer 1: CLI Interface (`src/cli.js`)
- Uses Commander.js for command-line parsing
- Handles user interaction (both command-line and interactive modes)
- Manages launching the `claude` command with appropriate environment variables
- **Key feature**: When run with no arguments, automatically launches `claude` with the current model configuration
- Wraps business logic with error handling and colored output

### Layer 2: Business Logic (`src/modelManager.js`)
- Manages model operations: add, list, switch, remove, update
- Tracks current model selection
- Formats output for display
- Records all changes to history via ConfigManager
- No direct file I/O - delegates to ConfigManager

### Layer 3: Storage Layer (`src/configManager.js`)
- Low-level JSON file management
- Platform-aware config directory resolution:
  - macOS/Linux: `~/.config/claude-model-manager/`
  - Windows: `%APPDATA%\claude-model-manager\`
- Manages two files:
  - `config.json`: Model configurations and current selection
  - `history.json`: Change history (max 100 entries)
- Auto-initializes directories and files on first use

## Core Commands

| Command | Description | Example |
|---------|-------------|---------|
| `add` | Add new model config | `cc add -n dev -t sk-ant-xxx -b https://api.anthropic.com` |
| `list` | List all models | `cc list` |
| `switch` | Switch model (interactive if no name) | `cc switch` or `cc switch dev` |
| `current` | Show current model | `cc current` |
| `remove` | Remove model (with confirmation) | `cc remove dev` |
| `history` | Show change history | `cc history -l 20` |
| `interactive` | Menu-driven mode | `cc interactive` |
| *(no args)* | Launch claude with current model | `cc` |

## Data Model

**config.json** structure:
```json
{
  "models": [
    {
      "id": "timestamp",
      "name": "config-name",
      "token": "sk-ant-...",
      "baseUrl": "https://api.anthropic.com",
      "description": "optional",
      "createdAt": "ISO-date",
      "lastUsed": "ISO-date | null",
      "updatedAt": "ISO-date"
    }
  ],
  "currentModel": "config-name | null",
  "createdAt": "ISO-date"
}
```

**history.json** structure:
```json
{
  "changes": [
    {
      "id": "timestamp",
      "timestamp": "ISO-date",
      "action": "add|remove|switch|update",
      "modelName": "config-name",
      "details": "human-readable description"
    }
  ]
}
```

## Key Implementation Details

### Automatic Claude Launch
When invoked without arguments (`cc` with no args):
1. Checks if models exist and one is selected
2. Sets environment variables: `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL`
3. Launches `claude --dangerously-skip-permissions` with inherited stdio
4. Includes error handling for missing `claude` command

### Interactive Mode

- Uses `inquirer` for prompts (dynamic ESM import to avoid CJS conflicts)
- Switch command: interactive if no model name provided
- Remove command: includes confirmation prompt
- Full interactive mode: menu-driven experience via `interactive` command

### Error Handling

- Try-catch blocks wrap async operations
- Errors displayed in red with `chalk`
- Graceful handling of missing files/directories
- Exit codes: 0 for success, 1 for errors

## Dependencies

- **commander**: CLI argument parsing
- **chalk**: Terminal coloring
- **inquirer**: Interactive prompts
- **dotenv**: Environment variable management
- **fs-extra**: Enhanced file system operations

## Testing

**`test.sh`**: Automated test script covering:
- Add model
- List models
- Switch model
- Get current model
- View history
- Remove model
- Auto-cleanup of test data

**`demo.sh`**: Demonstration script showing:
- All major commands
- Interactive workflows
- Multiple model scenarios

## Development Patterns

- **Async/await**: All async operations use `await` with try-catch
- **Module pattern**: CommonJS with explicit `require` and `module.exports`
- **Error propagation**: Lower layers throw errors, upper layers catch and display
- **No tests directory**: Tests are shell scripts in the root
- **No TypeScript**: Pure JavaScript (Node.js >=18)

## Common Tasks

### Add a new model:
```bash
cc add -n production -t sk-ant-xxx -b https://api.anthropic.com -d "Production config"
```

### Switch models interactively:
```bash
cc switch
```

### Launch claude with current model:
```bash
cc
```

### View change history:
```bash
cc history -l 50
```

### Run all tests:
```bash
bash test.sh
```

## Notes

- API tokens are stored in plain text in local config files
- History auto-trims to last 100 entries
- All timestamps stored in ISO 8601 format
- No external API calls - purely local configuration management
- The `claude` binary must be installed separately for direct launch feature
