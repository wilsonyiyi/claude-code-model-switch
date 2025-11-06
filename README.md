# Claude Code Model Manager

A CLI tool to manage multiple Claude Code model configurations with easy switching.

> **中文文档**: [README-zh.md](./README-zh.md) | **Chinese Documentation**: [README-zh.md](./README-zh.md)

## Features

- ✅ Multiple model configuration management
- ✅ Quick model switching
- ✅ Configuration change history
- ✅ Cross-platform support (Windows, Mac, Linux)
- ✅ Local data storage
- ✅ Track last selected model
- ✅ Interactive mode available
- ✅ Direct claude launcher (run `claude-model` to launch claude with current model)
- ✅ Automatic `--dangerously-skip-permissions` flag for seamless file access

## Installation

```bash
npm install -g .
```

Or install locally:

```bash
npm install .
```

## Usage Examples

### Quick Start - Run claude with current model

```bash
# Simply run claude-model directly - it will launch claude with your current model
claude-model
```

When you run `claude-model` without any arguments:
- ✅ If you have configured models and a current model is selected → launches `claude` with that model's configuration
- ✅ Automatically sets `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` environment variables
- ✅ Automatically adds `--dangerously-skip-permissions` flag for seamless file access
- ✅ Shows helpful error if no models configured or no model selected

### Add a new model configuration

```bash
# Command line mode
claude-model add --name my-config --token sk-ant-xxxxx --base-url https://api.anthropic.com --description "My Claude config"

# Interactive mode (prompts for inputs)
claude-model interactive
```

### List all configurations

```bash
claude-model list
```

### Switch to a configuration

```bash
# Switch to specific model
claude-model switch my-config

# Interactive selection (shows list to choose from)
claude-model switch
```

### Show current configuration

```bash
claude-model current
```

### Remove a configuration

```bash
claude-model remove my-config
```

### Show change history

```bash
# Show last 20 changes (default)
claude-model history

# Show last 50 changes
claude-model history --limit 50
```

## Commands Reference

| Command | Description | Options |
|---------|-------------|---------|
| `add` | Add a new model configuration | `-n, --name`, `-t, --token`, `-b, --base-url`, `-d, --description` |
| `list` | List all configurations | - |
| `switch` | Switch to a configuration | `[name]` (optional, enables interactive mode) |
| `current` | Show current configuration | - |
| `remove` | Remove a configuration | `<name>` (required) |
| `history` | Show configuration change history | `-l, --limit <number>` |
| `interactive` / `i` | Interactive mode menu | - |

## Configuration File Structure

Your model configurations are stored in JSON format:

**config.json:**
```json
{
  "models": [
    {
      "id": "1640995200000",
      "name": "my-config",
      "token": "sk-ant-xxxxx",
      "baseUrl": "https://api.anthropic.com",
      "description": "My Claude config",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastUsed": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "currentModel": "my-config",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**history.json:**
```json
{
  "changes": [
    {
      "id": 1640995200000,
      "timestamp": "2024-01-01T12:00:00.000Z",
      "action": "switch",
      "modelName": "my-config",
      "details": "Switched to model: my-config"
    }
  ]
}
```

## Interactive Mode

Launch interactive mode for a guided experience:

```bash
claude-model interactive
# or
claude-model i
```

Interactive mode provides:
- Menu-driven interface
- Easy model switching
- Safe removal with confirmation prompts

## Data Storage Location

Configurations are stored locally in:

- **macOS/Linux**: `~/.config/claude-model-manager/`
- **Windows**: `%APPDATA%\claude-model-manager\`

## Use Cases

### Managing Multiple Environments

```bash
# Development environment
claude-model add --name dev --token sk-dev-xxx --base-url https://api.anthropic.com --description "Development"

# Staging environment
claude-model add --name staging --token sk-staging-xxx --base-url https://api.anthropic.com --description "Staging"

# Production environment
claude-model add --name production --token sk-prod-xxx --base-url https://api.anthropic.com --description "Production"

# Switch between environments easily
claude-model switch dev
claude-model switch staging
claude-model switch production
```

### Using with Different API Endpoints

```bash
# Main Anthropic API
claude-model add --name claude-pro --token sk-ant-xxx --base-url https://api.anthropic.com

# Custom endpoint (if applicable)
claude-model add --name custom --token sk-ant-xxx --base-url https://custom.endpoint.com
```

## Safety Notes

- API tokens are stored in plain text in your local config file
- Ensure your device has proper file permissions set
- Keep your config directory secure
- Consider using environment variables for sensitive tokens in shared environments

## Troubleshooting

### Config file not found

The tool will automatically create the config directory and files on first run.

### Permission errors

Ensure you have write permissions to your home directory and config location.

### Model not found

Use `claude-model list` to see all available configurations.

## License

MIT
