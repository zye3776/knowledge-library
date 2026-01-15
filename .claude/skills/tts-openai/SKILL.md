---
name: tts-openai
description: High-quality text-to-speech using OpenAI's TTS API. Use when user wants natural-sounding speech synthesis, or when macOS `say` command quality is insufficient. Requires OPENAI_API_KEY environment variable.
---

# OpenAI TTS

High-quality text-to-speech using OpenAI's TTS API via a `say`-command-like interface. Built with TypeScript + Bun for zero-dependency execution.

## Setup

```bash
# Navigate to skill directory
cd .claude/skills/tts-openai

# Install dependencies and build
bun install
bun run build

# Set API key (in Claude settings or environment)
export OPENAI_API_KEY="your-key-here"
```

The `bun run build` command creates a standalone executable at `scripts/speak` that requires no runtime dependencies.

## Basic Usage

```bash
# Speak text directly
./scripts/speak "Hello world"

# Read from file
./scripts/speak -f /path/to/file.txt

# Choose voice
./scripts/speak -v fable "Test message"

# Save to file instead of playing
./scripts/speak -o output.mp3 "Save this"

# Pipe from stdin
cat file.txt | ./scripts/speak

# List available voices
./scripts/speak --list-voices
```

## Chunked Playback (Long Documents)

For long documents, use chunked mode to generate and play audio paragraph-by-paragraph with progress tracking:

```bash
# Generate and play with progress bar
./scripts/speak --chunked -f document.txt -d /tmp/audio-output

# Generate only (don't play)
./scripts/speak --chunked --generate-only -f document.txt -d /tmp/audio-output

# Resume playback from where you left off
./scripts/speak --resume -d /tmp/audio-output

# Check playback status
./scripts/speak --status -d /tmp/audio-output

# Stop currently playing audio
./scripts/speak --stop
```

Chunked mode features:
- Splits text into paragraphs automatically
- Shows visual progress bar with time remaining
- Saves playback state (can resume after interruption)
- Ctrl+C pauses gracefully (use `--resume` to continue)

## CLI Options

| Option | Description |
|--------|-------------|
| `-f, --file <file>` | Read text from file |
| `-v, --voice <voice>` | Voice to use (default: nova) |
| `-o, --output <file>` | Save audio to file |
| `--model <model>` | Model to use (tts-1 or tts-1-hd) |
| `--list-voices` | List available voices |
| `--chunked` | Enable paragraph-by-paragraph mode |
| `-d, --dir <dir>` | Output directory for chunked audio |
| `--generate-only` | Only generate audio, don't play |
| `--resume` | Resume playback from last position |
| `--status` | Show playback status |
| `--stop` | Stop currently playing audio |

## Voices

| Voice   | Description                 |
| ------- | --------------------------- |
| alloy   | Neutral, balanced           |
| echo    | Warm, conversational        |
| fable   | Expressive, British accent  |
| nova    | Friendly, natural (default) |
| onyx    | Deep, authoritative         |
| shimmer | Soft, gentle                |

## Models

| Model    | Quality        | Cost           |
| -------- | -------------- | -------------- |
| tts-1    | Good (default) | $15 / 1M chars |
| tts-1-hd | Premium        | $30 / 1M chars |

Use `--model tts-1-hd` for higher quality when needed.

## Examples

Basic playback:
```bash
./scripts/speak -f /tmp/digest.txt
```

British-style voice:
```bash
./scripts/speak -v fable -f /tmp/digest.txt
```

Save for later:
```bash
./scripts/speak -v nova -o /tmp/output.mp3 -f /tmp/digest.txt
```

Long document with progress:
```bash
./scripts/speak --chunked -f /tmp/long-article.txt -d /tmp/article-audio
```

Resume interrupted playback:
```bash
./scripts/speak --resume -d /tmp/article-audio
```

## Cost Estimate

- ~300 words = ~1,500 characters
- 1 hour/day usage = ~$0.70/month (tts-1)
