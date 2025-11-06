#!/bin/bash

# Claude Code Model Manager - Demo Script

echo "=== Claude Code Model Manager Demo ==="
echo ""

# Show help
echo "1. Showing help command:"
node src/cli.js --help
echo ""
echo "----------------------------------------"
echo ""

# Add first model
echo "2. Adding 'dev' configuration:"
node src/cli.js add --name dev --token sk-ant-dev-token --base-url https://api.anthropic.com --description "Development environment"
echo ""
echo "----------------------------------------"
echo ""

# Add second model
echo "3. Adding 'production' configuration:"
node src/cli.js add --name production --token sk-ant-prod-token --base-url https://api.anthropic.com --description "Production environment"
echo ""
echo "----------------------------------------"
echo ""

# List models
echo "4. Listing all configurations:"
node src/cli.js list
echo ""
echo "----------------------------------------"
echo ""

# Switch to dev
echo "5. Switching to 'dev' model:"
node src/cli.js switch dev
echo ""
echo "----------------------------------------"
echo ""

# Show current
echo "6. Showing current configuration:"
node src/cli.js current
echo ""
echo "----------------------------------------"
echo ""

# Switch to production
echo "7. Switching to 'production' model:"
node src/cli.js switch production
echo ""
echo "----------------------------------------"
echo ""

# Test direct run (this will fail if claude is not installed, but shows the feature)
echo "8. Testing direct run (launches claude with current model):"
node src/cli.js 2>&1 | head -5
echo ""
echo "----------------------------------------"
echo ""

# Show history
echo "9. Showing change history:"
node src/cli.js history
echo ""
echo "----------------------------------------"
echo ""

# Remove dev model
echo "10. Removing 'dev' model:"
echo "y" | node src/cli.js remove dev 2>&1 | grep -E "✓|Model|Cancelled" || echo "Removed successfully"
echo ""
echo "----------------------------------------"
echo ""

# List remaining models
echo "11. Listing remaining configurations:"
node src/cli.js list
echo ""
echo "----------------------------------------"
echo ""

echo "=== Demo Complete ==="
echo ""
echo "Your configuration files are stored at:"
echo "  Mac/Linux: ~/.config/claude-model-manager/"
echo "  Windows: %APPDATA%/claude-model-manager/"
