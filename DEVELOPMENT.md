# Development Guide

This guide covers the technical details, architecture, and development patterns for the Claude Code Model Manager.

## Architecture Overview

The project follows a clean 3-layer architecture:

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
- Platform-aware config directory resolution
- Manages two files:
  - `config.json`: Model configurations and current selection
  - `history.json`: Change history (max 100 entries)
- Auto-initializes directories and files on first use

## Data Models

### Configuration File Structure

**config.json:**
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

**history.json:**
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

## File Structure

```
src/
├── cli.js           # Main entry point, command handling
├── modelManager.js  # Business logic for model operations
├── configManager.js # Low-level file I/O and configuration management
└── utils/
    ├── constants.js # Configuration constants
    └── platform.js  # Platform-specific logic
```

## Development Patterns

### Error Handling
- Try-catch blocks wrap async operations
- Errors displayed in red with `chalk`
- Graceful handling of missing files/directories
- Exit codes: 0 for success, 1 for errors

### Async/Await
All async operations use `await` with try-catch blocks:
```javascript
async function operation() {
  try {
    await someAsyncOperation();
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
```

### Module Pattern
CommonJS with explicit `require` and `module.exports`:
```javascript
const fs = require('fs-extra');

function someFunction() {
  // implementation
}

module.exports = { someFunction };
```

## Platform Support

Config directory locations:
- **macOS/Linux**: `~/.config/claude-model-manager/`
- **Windows**: `%APPDATA%\claude-model-manager\`

Platform detection via Node.js `os.platform()`.

## Testing

### test.sh
Automated test script covering:
- Add model
- List models
- Switch model
- Get current model
- View history
- Remove model
- Auto-cleanup of test data

### demo.sh
Demonstration script showing:
- All major commands
- Interactive workflows
- Multiple model scenarios

Run tests:
```bash
bash test.sh
```

## Key Implementation Features

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

## Dependencies

- **commander**: CLI argument parsing
- **chalk**: Terminal coloring
- **inquirer**: Interactive prompts
- **dotenv**: Environment variable management
- **fs-extra**: Enhanced file system operations

## Development Setup

```bash
# Clone and install
git clone <repository>
cd claude-code-model-switch
npm install

# Run the tool
node src/cli.js
# or
npm start
```

## Contributing

When making changes:
1. Follow the existing code patterns
2. Maintain the 3-layer architecture
3. Add tests for new functionality
4. Document user-facing changes in README.md
5. Document technical changes in this file

## Notes

- API tokens are stored in plain text in local config files
- History auto-trims to last 100 entries
- All timestamps stored in ISO 8601 format
- No external API calls - purely local configuration management
- The `claude` binary must be installed separately for direct launch feature