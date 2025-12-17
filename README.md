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
- ✅ Direct claude launcher (run `cm` to launch claude with current model)
- ✅ Automatic `--dangerously-skip-permissions` flag for seamless file access

## Installation

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **claude** CLI tool (optional, for direct launching) - [Installation guide](https://docs.anthropic.com/claude-cli)

### Install Globally (Recommended)

```bash
npm install -g @wilson_janet/claude-code-model-switch

# Verify installation
cm --version
```

## Quick Start

1. **Add your first model configuration:**

   ```bash
   cm add -n my-config -t YOUR_TOKEN -b https://api.anthropic.com -d "My config"
   ```

2. **Run claude with your model:**

   ```bash
   cm
   ```

## Advanced Model Configuration

You can optionally specify default models for each Claude model tier:

```bash
cm add -n production \
  -t sk-ant-xxx \
  -b https://api.anthropic.com \
  -d "Production environment" \
  --opus-model claude-opus-4-5-20251101 \
  --sonnet-model claude-sonnet-4-5-20250929 \
  --haiku-model claude-haiku-4-5-20251001
```

These optional model configurations will be passed to Claude Code as environment variables:
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`

If not specified, Claude Code will use its official default values.

## Common Commands

| Command | Description | Example |
|---------|-------------|---------|
| `cm` | Launch claude with current model | `cm` |
| `cm add` | Add new model config | `cm add -n dev -t sk-ant-xxx -b https://api.anthropic.com` |
| `cm update [name]` | Update model config (interactive if no name) | `cm update dev -n "dev-new" -d "Updated"` |
| `cm use [name]` | Switch model and launch Claude (interactive if no name) | `cm use` or `cm use dev` |
| `cm current` | Show current model | `cm current` |
| `cm history` | Show change history | `cm history -l 20` |
| `cm interactive` | Menu-driven mode | `cm interactive` |

## Examples

### Managing Multiple Environments

```bash
# Add different environments
cm add -n dev -t sk-dev-xxx -b https://api.anthropic.com -d "Development"
cm add -n staging -t sk-staging-xxx -b https://api.anthropic.com -d "Staging"
cm add -n production -t sk-prod-xxx -b https://api.anthropic.com -d "Production"

# Switch between them
cm use dev
cm use production

# Update a model
cm update dev -n staging -d "Moved to staging"
```

### Interactive Mode

For a user-friendly menu interface:

```bash
cm interactive
```

Interactive mode now supports configuring default models per tier when adding a new model. Select "Add a new model" and you can optionally set default models for Opus, Sonnet, and Haiku.

In addition to adding, interactive mode also supports updating model configurations (Update a model), allowing you to modify model names, descriptions, tokens, base URLs, and default configurations for each model tier.

## Safety Notes

- API tokens are stored in plain text in your local config file
- Configurations are stored locally at:
  - **macOS/Linux**: `~/.config/claude-model-manager/`
  - **Windows**: `%APPDATA%\claude-model-manager\`
- Keep your config directory secure

## Development

For developers who want to contribute or understand the technical details, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## License

MIT
