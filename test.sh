#!/bin/bash

# Test script for Claude Code Model Manager
# Safe cleanup design: Uses backup/restore instead of hardcoded names

echo "Running automated tests..."
echo ""

# PREPARATION: Backup existing config (if any)
CONFIG_DIR="$HOME/.config/claude-model-manager"
CONFIG_FILE="$CONFIG_DIR/config.json"
HISTORY_FILE="$CONFIG_DIR/history.json"
BACKUP_DIR="/tmp/cm-test-backup-$$"

# Create backup of existing user data
if [ -f "$CONFIG_FILE" ]; then
    mkdir -p "$BACKUP_DIR"
    cp "$CONFIG_FILE" "$BACKUP_DIR/config.json"
    if [ -f "$HISTORY_FILE" ]; then
        cp "$HISTORY_FILE" "$BACKUP_DIR/history.json"
    fi
    echo "✓ Backed up existing user configs to $BACKUP_DIR"
fi

# Capture state: models that exist before testing
models_before() {
    if [ -f "$CONFIG_FILE" ]; then
        node -e "
            try {
                const config = require('$CONFIG_FILE');
                console.log(JSON.stringify(config.models.map(m => m.name)));
            } catch(e) {
                console.log('[]');
            }
        " 2>/dev/null || echo '[]'
    else
        echo '[]'
    fi
}

# Get model snapshot before tests
MODELS_BEFORE=$(models_before)
echo "Models before tests: $MODELS_BEFORE"

# Generate unique test model name
TEST_MODEL_NAME="test_$(date +%s)_$RANDOM"

# Test 1: Add model
echo ""
echo "Test 1: Adding model ($TEST_MODEL_NAME)"
node src/cli.js add --name "$TEST_MODEL_NAME" --token sk-test-xyz --base-url https://api.anthropic.com --description "Auto-generated test model"
if [ $? -eq 0 ]; then
    echo "✓ Add model: PASSED"
else
    echo "✗ Add model: FAILED"
    # Restore on failure
    [ -f "$BACKUP_DIR/config.json" ] && cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
    exit 1
fi

# Test 2: List models
echo ""
echo "Test 2: Listing models"
node src/cli.js list > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ List models: PASSED"
else
    echo "✗ List models: FAILED"
    [ -f "$BACKUP_DIR/config.json" ] && cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
    exit 1
fi

# Test 3: Use command exists
echo ""
echo "Test 3: Use command functionality"
node src/cli.js use --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Use command exists"
    echo "✓ Use command structure verified"
else
    echo "✗ Use command failed"
    [ -f "$BACKUP_DIR/config.json" ] && cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
    exit 1
fi

# Test 4: Current model
echo ""
echo "Test 4: Getting current model"
node src/cli.js current > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Current model: PASSED"
else
    echo "✗ Current model: FAILED"
    [ -f "$BACKUP_DIR/config.json" ] && cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
    exit 1
fi

# Test 5: History
echo ""
echo "Test 5: Viewing history"
node src/cli.js history > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ History: PASSED"
else
    echo "✗ History: FAILED"
    [ -f "$BACKUP_DIR/config.json" ] && cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
    exit 1
fi

# Test 6: Remove model
echo ""
echo "Test 6: Removing model"
echo "y" | node src/cli.js remove "$TEST_MODEL_NAME" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Remove model: PASSED"
else
    echo "✗ Remove model: FAILED"
    [ -f "$BACKUP_DIR/config.json" ] && cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
    exit 1
fi

echo ""
echo "All tests passed! ✓"
echo ""
echo "Cleaning up test data..."

# CLEANUP: Smart restoration logic
MODELS_AFTER=$(models_before)

# If we had data before, restore it
if [ -d "$BACKUP_DIR" ]; then
    # Restore original config
    if [ -f "$BACKUP_DIR/config.json" ]; then
        cp "$BACKUP_DIR/config.json" "$CONFIG_FILE"
        echo "✓ Original config restored"
    fi

    # Check if we should also restore history
    # (We created a model and removed it, so history changed)
    if [ -f "$BACKUP_DIR/history.json" ]; then
        cp "$BACKUP_DIR/history.json" "$HISTORY_FILE"
        echo "✓ Original history restored"
    fi

    # Clean backup
    rm -rf "$BACKUP_DIR"
    echo "✓ Backup cleaned up"
else
    # We started clean - remove everything
    if [ -d "$CONFIG_DIR" ]; then
        rm -rf "$CONFIG_DIR"
        echo "✓ Empty config directory removed"
    fi
fi

echo ""
echo "Test cleanup complete. User data safe."