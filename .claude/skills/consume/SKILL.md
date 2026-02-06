---
name: consume
description: Convert library content to audio via TTS for screen-free consumption.
---

# Consume

Convert a library item's transcript to audio using OpenAI TTS.

**Usage:** `/consume {slug} [-v voice]`

## When to Use

- User wants to listen to a library item as audio
- Converting transcript or refined content to speech
- Preparing content for screen-free consumption (walks, commutes)

**Requires:** `OPENAI_API_KEY` environment variable.

## Setup

Ensure tts-openai skill is built:

```bash
cd .claude/skills/tts-openai
bun install
bun run build
```

## Instructions

<instructions>

### Step 1: Parse Arguments

1. The user provides `{slug}` as a positional argument
2. Optional: `-v {voice}` to select a TTS voice (default: `nova`)
3. If no slug provided, list available library items from `libraries/` and report error:
   ```
   Error: No slug provided.
   Usage: /consume {slug} [-v voice]
   Available items: {list directory names in libraries/}
   ```
4. If `-v {voice}` is provided, validate against the allowed voices:
   `alloy`, `echo`, `fable`, `nova`, `onyx`, `shimmer`
5. If the voice is invalid, report error and stop:
   ```
   Error: Invalid voice '{voice}'.
   Valid voices: alloy, echo, fable, nova, onyx, shimmer
   ```
6. If no `-v` argument, default to `nova`

### Step 2: Check API Key

1. Check that `OPENAI_API_KEY` environment variable is set
2. If not set, report error and stop:
   ```
   Error: OPENAI_API_KEY environment variable is not set.

   Setup:
   1. Get an API key from https://platform.openai.com/api-keys
   2. Set it in your environment: export OPENAI_API_KEY="your-key-here"
   3. Or add it to your Claude Code settings
   ```

### Step 3: Locate Content File

1. Check if `libraries/{slug}/` directory exists. If not, report error:
   ```
   Error: Library item not found: libraries/{slug}/
   ```
2. Look for content file in priority order:
   - `libraries/{slug}/refined.md` (preferred - noise removed)
   - `libraries/{slug}/transcript.md` (fallback - raw extraction)
3. If neither exists, report error:
   ```
   Error: No content file found in libraries/{slug}/
   Expected: refined.md or transcript.md
   ```
4. Note which file was selected for the output message

### Step 4: Check for Existing Audio

1. If `libraries/{slug}/audio.mp3` already exists, log a warning:
   ```
   Warning: Overwriting existing audio.mp3
   ```
2. Proceed with generation (no interactive prompt)

### Step 5: Generate Audio

1. Run the tts-openai skill with the selected voice:
   ```bash
   .claude/skills/tts-openai/scripts/speak -v {voice} -f libraries/{slug}/{content_file} -o libraries/{slug}/audio.mp3
   ```
2. If the command fails, report the error and stop
3. Verify `libraries/{slug}/audio.mp3` was created

### Step 6: Update Metadata

1. Read existing `libraries/{slug}/metadata.yaml` (create if it does not exist)
2. Add or update the following fields:
   - `stage: consumed`
   - `audio_generated_at: "{ISO 8601 timestamp}"` (e.g., `"2026-02-06T10:30:00.000Z"`)
   - `audio_file: audio.mp3`
   - `tts_voice: {voice}` (the voice used, e.g., `nova`, `echo`, etc.)
3. Write back the updated metadata.yaml, preserving existing fields

### Step 7: Report Success

Output a summary:
```
Audio generated successfully.
  Source: libraries/{slug}/{content_file}
  Output: libraries/{slug}/audio.mp3
  Voice: {voice}
  Metadata updated: stage → consumed
```

</instructions>

## Error Handling

| Condition | Action |
|-----------|--------|
| No slug argument | List available items, report error |
| Invalid voice name | List valid voices, report error |
| OPENAI_API_KEY not set | Show setup instructions |
| Library item not found | Report missing directory |
| No content file | Report expected files |
| TTS generation fails | Report error from tts-openai |
| audio.mp3 exists | Warn and overwrite |

## Voices

| Voice   | Description                |
|---------|----------------------------|
| alloy   | Neutral, balanced          |
| echo    | Warm, conversational       |
| fable   | Expressive, British accent |
| nova    | Friendly, natural (default)|
| onyx    | Deep, authoritative        |
| shimmer | Soft, gentle               |

## Examples

```bash
# Convert with default voice (nova)
/consume best-to-do-list-apps-for-2026

# Convert with a specific voice
/consume best-to-do-list-apps-for-2026 -v echo

# Output:
# Audio generated successfully.
#   Source: libraries/best-to-do-list-apps-for-2026/transcript.md
#   Output: libraries/best-to-do-list-apps-for-2026/audio.mp3
#   Voice: echo
#   Metadata updated: stage → consumed
```
