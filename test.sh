#!/bin/bash

# Test script for Claude Code Model Manager

echo "Running automated tests..."
echo ""

# Test 1: Add model
echo "Test 1: Adding model"
cc add --name test1 --token sk-test-1 --base-url https://api.anthropic.com --description "Test model 1"
if [ $? -eq 0 ]; then
    echo "✓ Add model: PASSED"
else
    echo "✗ Add model: FAILED"
    exit 1
fi
echo ""

# Test 2: List models
echo "Test 2: Listing models"
cc list > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ List models: PASSED"
else
    echo "✗ List models: FAILED"
    exit 1
fi
echo ""

# Test 3: Switch model
echo "Test 3: Switching model"
cc switch test1 > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Switch model: PASSED"
else
    echo "✗ Switch model: FAILED"
    exit 1
fi
echo ""

# Test 4: Current model
echo "Test 4: Getting current model"
cc current > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Current model: PASSED"
else
    echo "✗ Current model: FAILED"
    exit 1
fi
echo ""

# Test 5: History
echo "Test 5: Viewing history"
cc history > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ History: PASSED"
else
    echo "✗ History: FAILED"
    exit 1
fi
echo ""

# Test 6: Remove model
echo "Test 6: Removing model"
echo "y" | cc remove test1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Remove model: PASSED"
else
    echo "✗ Remove model: FAILED"
    exit 1
fi
echo ""

echo "All tests passed! ✓"
echo ""
echo "Cleaning up test data..."
rm -rf ~/.config/claude-model-manager
