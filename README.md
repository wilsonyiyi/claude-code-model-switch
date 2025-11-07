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
- ✅ Direct claude launcher (run `cc` to launch claude with current model)
- ✅ Automatic `--dangerously-skip-permissions` flag for seamless file access

## Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **claude** CLI tool (optional, for direct launching) - [Installation guide](https://docs.anthropic.com/claude-cli)

### Install Globally (Recommended)

Global installation allows you to use `cc` from anywhere:

```bash
npm install -g @wilson_janet/claude-code-model-switch
```

After installation, the `cc` command will be available globally.

### Install Locally

Local installation installs the tool in your current project:

```bash
npm install @wilson_janet/claude-code-model-switch
```

Then use it via:
```bash
npx cc
# or
node src/cli.js
```

### Verify Installation

```bash
cc --version

cc --help
```

### Post-Installation

1. **Add your first model configuration:**
   ```bash
   cc add --name my-config --token YOUR_TOKEN --base-url https://api.anthropic.com --description "My config"
   ```

2. **Start using claude with your model:**
   ```bash
   cc
   ```

## Usage Examples

### Quick Start - Run claude with current model

```bash
# Simply run cc directly - it will launch claude with your current model
cc
```

When you run `cc` without any arguments:
- ✅ If you have configured models and a current model is selected → launches `claude` with that model's configuration
- ✅ Automatically sets `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` environment variables
- ✅ Automatically adds `--dangerously-skip-permissions` flag for seamless file access
- ✅ Shows helpful error if no models configured or no model selected

### Add a new model configuration

```bash
# Command line mode
cc add --name my-config --token sk-ant-xxxxx --base-url https://api.anthropic.com --description "My Claude config"

# Interactive mode (prompts for inputs)
cc interactive
```

### List all configurations

```bash
cc list
```

### Switch to a configuration

```bash
# Switch to specific model
cc switch my-config

# Interactive selection (shows list to choose from)
cc switch
```

### Show current configuration

```bash
cc current
```

### Remove a configuration

```bash
cc remove my-config
```

### Show change history

```bash
# Show last 20 changes (default)
cc history

# Show last 50 changes
cc history --limit 50
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
| `interactive` | Interactive mode menu | - |

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
cc interactive
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
cc add --name dev --token sk-dev-xxx --base-url https://api.anthropic.com --description "Development"

# Staging environment
cc add --name staging --token sk-staging-xxx --base-url https://api.anthropic.com --description "Staging"

# Production environment
cc add --name production --token sk-prod-xxx --base-url https://api.anthropic.com --description "Production"

# Switch between environments easily
cc switch dev
cc switch staging
cc switch production
```

### Using with Different API Endpoints

```bash
# Main Anthropic API
cc add --name claude-pro --token sk-ant-xxx --base-url https://api.anthropic.com

# Custom endpoint (if applicable)
cc add --name custom --token sk-ant-xxx --base-url https://custom.endpoint.com
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

Use `cc list` to see all available configurations.

## License

MIT
