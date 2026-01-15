#!/bin/bash
#
# OpenAI TTS - A say-command-like interface for OpenAI's Text-to-Speech API.
# This wrapper manages a dedicated virtual environment automatically.
#
# Usage:
#     speak "Hello world"
#     speak -f input.txt
#     speak -v nova -f input.txt
#     speak -o output.mp3 -f input.txt
#     cat file.txt | speak
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="${SCRIPT_DIR}/.venv"
PYTHON_SCRIPT="${SCRIPT_DIR}/speak.py"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Setting up OpenAI TTS environment..." >&2
    python3 -m venv "$VENV_DIR"
    "$VENV_DIR/bin/pip" install --quiet --upgrade pip
    "$VENV_DIR/bin/pip" install --quiet openai
    echo "Setup complete." >&2
fi

# Ensure openai is installed (in case venv exists but package is missing)
if ! "$VENV_DIR/bin/python" -c "import openai" 2>/dev/null; then
    echo "Installing openai package..." >&2
    "$VENV_DIR/bin/pip" install --quiet openai
fi

# Run the Python script with all arguments
exec "$VENV_DIR/bin/python" "$PYTHON_SCRIPT" "$@"
