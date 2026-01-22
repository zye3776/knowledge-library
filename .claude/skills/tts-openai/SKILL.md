---
name: tts-openai
description: Use when user wants natural-sounding speech synthesis, macOS `say` command quality is insufficient, or converting text/documents to audio for listening.
---

# OpenAI TTS

Text-to-speech via OpenAI's API with a `say`-command-like interface.

## When to Use

- User wants to listen to text content (articles, documents, digests)
- macOS `say` command produces robotic/low-quality output
- Converting written content to audio for walks/commutes
- Need high-quality voice synthesis

**Don't use when:** Simple notifications where macOS `say` suffices.

**Requires:** `OPENAI_API_KEY` environment variable.

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

## Chunked Mode (Long Documents)

For long documents, chunked mode generates audio paragraph-by-paragraph with progress tracking and resumable playback:

```bash
./scripts/speak --chunked -f document.txt -d /tmp/audio-output
./scripts/speak --resume -d /tmp/audio-output  # Resume after Ctrl+C
```

## Quick Reference

| Task | Command |
|------|---------|
| Speak text | `./scripts/speak "Hello"` |
| Read file | `./scripts/speak -f file.txt` |
| Save to MP3 | `./scripts/speak -o out.mp3 "Text"` |
| Long document | `./scripts/speak --chunked -f doc.txt -d /tmp/out` |
| Resume playback | `./scripts/speak --resume -d /tmp/out` |
| List voices | `./scripts/speak --list-voices` |
| All options | `./scripts/speak --help` |

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

## Cost

- tts-1: $15/1M chars (~$0.02 per 1,000 words)
- tts-1-hd: $30/1M chars (use `--model tts-1-hd`)
