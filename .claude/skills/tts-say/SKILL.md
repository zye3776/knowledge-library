---
name: tts-say
description: Generic text-to-speech skill for audio playback. Converts text to speech using system TTS. Accepts text content with optional voice and rate parameters. Use when you need to read text aloud to the user.
---

# Text-to-Speech (TTS)

Convert text to speech for audio playback using macOS `say` command.

## Input Formats

### Direct text

```
"Your text to speak aloud"
```

### With options

```
text: "Your text to speak"
voice: "Jamie (Premium)"    # optional, default: Jamie (Premium)
rate: 160          # optional, words per minute, default: 160
```

### From file

```
file: /path/to/text/file.txt
voice: Daniel      # optional
rate: 200          # optional
```

## Available Voices (macOS Premium)

**Dynamic Loading:** Run this command to discover available premium voices:

```bash
say -v '?' | grep -E "(Premium)"
```

**Default Voice:** Jamie (Premium)

### If No Premium Voices Found

Download premium voices from System Settings:

1. Open **System Settings** → **Accessibility** → **Spoken Content**
2. Click **System Voice** dropdown → **Manage Voices...**
3. Download desired premium voices (look for "Premium" label)
4. Recommended: Jamie (Premium), Samantha (Premium), Tom (Premium)

### Discovering Voices at Runtime

The skill will dynamically load available premium voices when invoked. Example output:

```
Ava (Premium)      en_US    # Siri voice
Jamie (Premium)      en_US    # Natural, clear
Tom (Premium)      en_US    # Male, professional
```

## Parameters

| Param    | Type   | Default         | Description                                                   |
| -------- | ------ | --------------- | ------------------------------------------------------------- |
| `text`   | string | required\*      | Text content to speak                                         |
| `file`   | string | required\*      | Path to text file to speak                                    |
| `voice`  | string | Jamie (Premium) | Premium voice name (run `say -v '?' \| grep Premium` to list) |
| `rate`   | number | 160             | Words per minute (80-300)                                     |
| `output` | string | -               | Save to audio file instead of playing                         |

\*Either `text` or `file` is required

## Workflow

### Speak text directly

```bash
say -v "Jamie (Premium)" -r 160 "Your text here"
```

### Speak from file

```bash
say -v "Jamie (Premium)" -r 160 -f /path/to/file.txt
```

### Save to audio file

```bash
say -v "Jamie (Premium)" -r 160 -o /tmp/output.aiff "Your text here"
```

## Examples

### Basic usage

```
tts: "Hello, this is a test of the text to speech system."
```

### Custom voice and rate

```
tts:
  text: "This report covers quarterly earnings for the third quarter."
  voice: Daniel
  rate: 160
```

### From file

```
tts:
  file: /tmp/digest.txt
  voice: "Jamie (Premium)"
  rate: 160
```

## Integration

Other skills can invoke TTS by:

1. Preparing text content
2. Optionally saving to a temp file
3. Calling this skill with appropriate parameters

### Example: doc-digest integration

```
# doc-digest prepares voice-friendly text
# Then invokes tts skill:
tts:
  file: /tmp/digest.txt
  voice: "Jamie (Premium)"
  rate: 160
```

## Error Handling

| Error             | Cause                       | Resolution                                                                     |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------ |
| Voice not found   | Premium voice not installed | Download from System Settings → Accessibility → Spoken Content → Manage Voices |
| No premium voices | None installed              | See "If No Premium Voices Found" section above                                 |
| File not found    | Invalid file path           | Verify file exists                                                             |
| Rate out of range | Rate < 80 or > 300          | Use rate between 80-300                                                        |

## Platform Support

Currently macOS only (uses `say` command). Future implementations could support:

- Linux: `espeak`, `festival`
- Windows: SAPI
- Cross-platform: Cloud TTS APIs (Google, AWS, Azure)
