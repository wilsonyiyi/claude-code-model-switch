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

```bash
npm install -g @wilson_janet/claude-code-model-switch

# Verify installation
cc --version
```

## Quick Start

1. **Add your first model configuration:**

   ```bash
   cc add -n my-config -t YOUR_TOKEN -b https://api.anthropic.com -d "My config"
   ```

2. **Run claude with your model:**

   ```bash
   cc
   ```

## Advanced Model Configuration

You can optionally specify default models for each Claude model tier:

```bash
cc add -n production \
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
| `cc` | Launch claude with current model | `cc` |
| `cc add` | Add new model config | `cc add -n dev -t sk-ant-xxx -b https://api.anthropic.com` |
| `cc switch [name]` | Switch model (interactive if no name) | `cc switch` or `cc switch dev` |
| `cc current` | Show current model | `cc current` |
| `cc history` | Show change history | `cc history -l 20` |
| `cc interactive` | Menu-driven mode | `cc interactive` |

## Examples

### Managing Multiple Environments

```bash
# Add different environments
cc add -n dev -t sk-dev-xxx -b https://api.anthropic.com -d "Development"
cc add -n staging -t sk-staging-xxx -b https://api.anthropic.com -d "Staging"
cc add -n production -t sk-prod-xxx -b https://api.anthropic.com -d "Production"

# Switch between them
cc switch dev
cc switch production
```

### Interactive Mode

For a user-friendly menu interface:

```bash
cc interactive
```

Interactive mode now supports configuring default models per tier when adding a new model. Select "Add a new model" and you can optionally set default models for Opus, Sonnet, and Haiku.

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
