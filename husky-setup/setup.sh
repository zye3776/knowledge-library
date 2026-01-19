#!/bin/bash

# Setup script for Markdown Index Generator with Husky

set -e

echo "🔧 Setting up Markdown Index Generator..."

# Check for required dependencies
if ! command -v bun &> /dev/null; then
  echo "❌ bun not found. Please install Bun first: https://bun.sh"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun add -d husky @anthropic-ai/sdk

# Initialize Husky
echo "🐕 Initializing Husky..."
bunx husky init

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Copy the index generator script
echo "📄 Installing generate-index.ts..."
cp generate-index.ts scripts/generate-index.ts

# Copy the pre-commit hook
echo "📄 Installing pre-commit hook..."
cp pre-commit .husky/pre-commit
chmod +x .husky/pre-commit

# Create watched folders if they don't exist
mkdir -p docs
mkdir -p .claude/rules

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Ensure ANTHROPIC_API_KEY is set in your environment"
echo "  2. Add markdown files to docs/ or .claude/rules/"
echo "  3. Commit your changes - CLAUDE.md indexes will be auto-generated!"
echo ""
echo "Manual usage:"
echo "  bun scripts/generate-index.ts docs/"
echo "  bun scripts/generate-index.ts .claude/rules/"
echo ""
echo "Note: The script only updates the <docs_index> section in CLAUDE.md."
echo "      Other content in CLAUDE.md is preserved."
