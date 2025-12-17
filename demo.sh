#!/bin/bash

# Claude Code Model Manager - Demo Script

echo "=== Claude Code Model Manager Demo ==="
echo ""

# Show help
echo "1. Showing help command:"
cm --help
echo ""
echo "----------------------------------------"
echo ""

# Add first model
echo "2. Adding 'dev' configuration:"
cm add --name dev --token sk-ant-dev-token --base-url https://api.anthropic.com --description "Development environment"
echo ""
echo "----------------------------------------"
echo ""

# Add second model
echo "3. Adding 'production' configuration:"
cm add --name production --token sk-ant-prod-token --base-url https://api.anthropic.com --description "Production environment"
echo ""
echo "----------------------------------------"
echo ""

# List models
echo "4. Listing all configurations:"
cm list
echo ""
echo "----------------------------------------"
echo ""

# Use dev model (switches and attempts to launch claude)
echo "5. Using 'dev' model (switches and launches claude):"
echo "   Note: This will fail if claude is not installed"
cm use dev 2>&1 | head -3 || echo "   (Command failed as expected - claude not installed)"
echo ""
echo "----------------------------------------"
echo ""

# Show current
echo "6. Showing current configuration:"
cm current
echo ""
echo "----------------------------------------"
echo ""

# Use production model
echo "7. Using 'production' model (switches and attempts to launch claude):"
cm use production 2>&1 | head -3 || echo "   (Command failed as expected - claude not installed)"
echo ""
echo "----------------------------------------"
echo ""

# Test direct run (this will fail if claude is not installed, but shows the feature)
echo "8. Testing direct run (launches claude with current model):"
cm 2>&1 | head -5
echo ""
echo "----------------------------------------"
echo ""

# Show history
echo "9. Showing change history:"
cm history
echo ""
echo "----------------------------------------"
echo ""

# Remove dev model
echo "10. Removing 'dev' model:"
echo "y" | cm remove dev 2>&1 | grep -E "✓|Model|Cancelled" || echo "Removed successfully"
echo ""
echo "----------------------------------------"
echo ""

# List remaining models
echo "11. Listing remaining configurations:"
cm list
echo ""
echo "----------------------------------------"
echo ""

echo "=== Demo Complete ==="
echo ""
echo "Your configuration files are stored at:"
echo "  Mac/Linux: ~/.config/claude-model-manager/"
echo "  Windows: %APPDATA%/claude-model-manager/"
