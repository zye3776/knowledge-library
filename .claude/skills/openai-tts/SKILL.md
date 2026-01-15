---
name: openai-tts
description: High-quality text-to-speech using OpenAI's TTS API. Use when user wants natural-sounding speech synthesis, or when macOS `say` command quality is insufficient. Requires OPENAI_API_KEY environment variable.
---

# OpenAI TTS

High-quality text-to-speech using OpenAI's TTS API via a `say`-command-like interface.

## Setup

```bash
# Install dependencies (first time only)
npm install

# Set API key in .env file or environment
echo "OPENAI_API_KEY=your-key-here" > .env
# or
export OPENAI_API_KEY="your-key-here"
```

## Usage

The `scripts/speak.ts` script mimics the macOS `say` command:

```bash
# Speak text directly
npx tsx scripts/speak.ts "Hello world"

# Read from file (like say -f)
npx tsx scripts/speak.ts -f /tmp/digest.txt

# Choose voice (like say -v)
npx tsx scripts/speak.ts -v nova -f /tmp/digest.txt

# Save to file instead of playing (like say -o)
npx tsx scripts/speak.ts -o output.mp3 -f /tmp/digest.txt

# Pipe from stdin
cat /tmp/digest.txt | npx tsx scripts/speak.ts

# List available voices
npx tsx scripts/speak.ts --list-voices
```

## Voices

| Voice | Description |
|-------|-------------|
| alloy | Neutral, balanced |
| echo | Warm, conversational |
| fable | Expressive, British accent |
| nova | Friendly, natural (default) |
| onyx | Deep, authoritative |
| shimmer | Soft, gentle |

## Models

| Model | Quality | Cost |
|-------|---------|------|
| tts-1 | Good (default) | $15 / 1M chars |
| tts-1-hd | Premium | $30 / 1M chars |

Use `--model tts-1-hd` for higher quality when needed.

## Examples

Basic playback:
```bash
npx tsx scripts/speak.ts -f /tmp/digest.txt
```

British-style voice:
```bash
npx tsx scripts/speak.ts -v fable -f /tmp/digest.txt
```

Save for later:
```bash
npx tsx scripts/speak.ts -v nova -o /tmp/output.mp3 -f /tmp/digest.txt
```

## Cost Estimate

- ~300 words ≈ 1,500 characters
- 1 hour/day usage ≈ $0.70/month (tts-1)
