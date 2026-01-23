---
story_id: "1-1"
story_name: "extract-youtube-transcript"
epic: "epic-1-youtube-content-extraction"
epic_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction"
story_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-1-extract-youtube-transcript.md"
created: "2026-01-23"
status: READY_FOR_DEV
---

# Implementation Plan: Extract YouTube Transcript

## Overview

Create the `extract-youtube` skill - a TypeScript + Bun CLI tool that wraps yt-dlp to extract transcripts from YouTube videos. This is the foundational extraction capability that all downstream workflows depend on.

**Deliverable:** A skill that accepts a YouTube URL and outputs plain text transcript to stdout.

## Architecture Alignment

| Decision | Implementation | Source |
|----------|----------------|--------|
| External service | Direct yt-dlp CLI via Bun shell | core-architectural-decisions.md |
| Output format | Plain text to stdout | KISS: caller handles file saving |
| Error handling | Discriminated union Result type | KISS-principle-agent-guide.md |
| Skill pattern | Mirror `tts-openai` structure | CLAUDE.md |
| Runtime | TypeScript + Bun | CLAUDE.md |

## Files to Create

```
.claude/skills/extract-youtube/
├── SKILL.md              # Skill documentation
├── package.json          # Project config (no runtime deps)
├── tsconfig.json         # TypeScript config
├── .gitignore            # Ignore node_modules, build artifacts
└── scripts/
    ├── extract.ts        # Main implementation
    └── extract.test.ts   # Test suite
```

## Dependencies

### System Requirements

| Dependency | Purpose | Install |
|------------|---------|---------|
| yt-dlp | YouTube subtitle extraction | `brew install yt-dlp` |
| bun | Runtime | Pre-installed in project |

### Package Dependencies

```json
{
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

No runtime dependencies - uses Bun's built-in shell for subprocess execution.

## Implementation Steps

### Step 1: Create Skill Scaffold

**Goal:** Set up project structure matching `tts-openai` pattern.

**package.json:**
```json
{
  "name": "extract-youtube",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "bun build scripts/extract.ts --compile --outfile scripts/extract",
    "test": "bun test",
    "test:watch": "bun test --watch"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  },
  "include": ["scripts/**/*.ts"]
}
```

**.gitignore:**
```
node_modules/
scripts/extract
*.log
```

---

### Step 2: Write Tests (TDD)

**Goal:** Define expected behavior before implementation.

**File:** `scripts/extract.test.ts`

**Test Categories:**

1. **URL Validation**
   - Accepts `youtube.com/watch?v=ID` format
   - Accepts `youtu.be/ID` format
   - Accepts `youtube.com/shorts/ID` format
   - Rejects non-YouTube URLs
   - Rejects malformed URLs
   - Extracts video ID correctly

2. **VTT Parsing**
   - Strips WEBVTT header
   - Removes timestamp lines
   - Removes position markers
   - Deduplicates repeated lines (auto-subs quirk)
   - Preserves paragraph structure

3. **Error Parsing**
   - Identifies "no subtitles" from yt-dlp output
   - Identifies network errors
   - Identifies unavailable video errors

4. **Integration** (requires yt-dlp)
   - Extracts transcript from known video with CC
   - Returns error for video without CC

---

### Step 3: Implement Core Types

**File:** `scripts/extract.ts`

```typescript
// Discriminated union Result type (KISS pattern)
type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// Specific error types for better handling
type ExtractionError =
  | { type: "invalid_url"; message: string }
  | { type: "no_subtitles"; message: string }
  | { type: "network_error"; message: string }
  | { type: "video_unavailable"; message: string }
  | { type: "yt_dlp_not_found"; message: string }
  | { type: "yt_dlp_error"; message: string; details: string };

interface ExtractionResult {
  transcript: string;
  videoId: string;
}
```

---

### Step 4: Implement URL Validation

**Function:** `validateYouTubeUrl(url: string): Result<{ url: string; videoId: string }, ExtractionError>`

**Accepted formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

**Implementation approach:**
```typescript
function validateYouTubeUrl(url: string): Result<{ url: string; videoId: string }, ExtractionError> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, error: { type: "invalid_url", message: "URL cannot be empty" } };
  }

  // Regex patterns for YouTube URL formats
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      return { ok: true, data: { url: trimmed, videoId: match[1] } };
    }
  }

  return {
    ok: false,
    error: {
      type: "invalid_url",
      message: `Invalid YouTube URL: "${trimmed}"\n\nExpected formats:\n  - https://www.youtube.com/watch?v=VIDEO_ID\n  - https://youtu.be/VIDEO_ID\n  - https://youtube.com/shorts/VIDEO_ID`,
    },
  };
}
```

---

### Step 5: Implement yt-dlp Execution

**Function:** `runYtDlp(url: string): Promise<Result<string, ExtractionError>>`

**yt-dlp command:**
```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download -o "/tmp/yt-extract-%(id)s" "URL"
```

**Implementation approach:**
```typescript
async function runYtDlp(url: string): Promise<Result<string, ExtractionError>> {
  const tmpDir = `/tmp/yt-extract-${Date.now()}`;

  try {
    // Check if yt-dlp exists
    const whichResult = await Bun.$`which yt-dlp`.quiet();
    if (whichResult.exitCode !== 0) {
      return {
        ok: false,
        error: {
          type: "yt_dlp_not_found",
          message: "yt-dlp not found.\n\nInstall with: brew install yt-dlp",
        },
      };
    }

    // Run yt-dlp
    const result = await Bun.$`yt-dlp --write-auto-sub --sub-lang en --skip-download -o "${tmpDir}/%(id)s" ${url}`.quiet();

    if (result.exitCode !== 0) {
      return parseYtDlpError(result.stderr.toString());
    }

    // Find and read the subtitle file
    const files = await Array.fromAsync(new Bun.Glob("*.vtt").scan(tmpDir));
    if (files.length === 0) {
      // Try .srt as fallback
      const srtFiles = await Array.fromAsync(new Bun.Glob("*.srt").scan(tmpDir));
      if (srtFiles.length === 0) {
        return {
          ok: false,
          error: {
            type: "no_subtitles",
            message: "No subtitles available for this video.\n\nThe video may not have captions enabled.",
          },
        };
      }
      // Parse SRT
      const content = await Bun.file(`${tmpDir}/${srtFiles[0]}`).text();
      return { ok: true, data: parseSrt(content) };
    }

    // Parse VTT
    const content = await Bun.file(`${tmpDir}/${files[0]}`).text();
    return { ok: true, data: parseVtt(content) };

  } finally {
    // Cleanup temp files
    await Bun.$`rm -rf ${tmpDir}`.quiet();
  }
}
```

---

### Step 6: Implement VTT/SRT Parsing

**Functions:** `parseVtt(content: string): string` and `parseSrt(content: string): string`

**VTT format example:**
```
WEBVTT
Kind: captions
Language: en

00:00:00.000 --> 00:00:02.500
Hello and welcome to this video

00:00:02.500 --> 00:00:05.000
Hello and welcome to this video
Today we'll be discussing
```

**Implementation approach:**
```typescript
function parseVtt(content: string): string {
  const lines = content.split("\n");
  const textLines: string[] = [];
  let lastLine = "";

  for (const line of lines) {
    // Skip header, timing lines, and position markers
    if (
      line.startsWith("WEBVTT") ||
      line.startsWith("Kind:") ||
      line.startsWith("Language:") ||
      line.includes("-->") ||
      line.match(/^[\d:.]+$/) ||
      line.match(/^position:/) ||
      line.match(/^align:/) ||
      line.trim() === ""
    ) {
      continue;
    }

    // Strip HTML tags (sometimes present in subtitles)
    const cleaned = line.replace(/<[^>]+>/g, "").trim();

    // Deduplicate consecutive identical lines (auto-sub quirk)
    if (cleaned && cleaned !== lastLine) {
      textLines.push(cleaned);
      lastLine = cleaned;
    }
  }

  return textLines.join("\n");
}

function parseSrt(content: string): string {
  const lines = content.split("\n");
  const textLines: string[] = [];
  let lastLine = "";

  for (const line of lines) {
    // Skip sequence numbers, timing lines, and empty lines
    if (
      line.match(/^\d+$/) ||
      line.includes("-->") ||
      line.trim() === ""
    ) {
      continue;
    }

    const cleaned = line.replace(/<[^>]+>/g, "").trim();
    if (cleaned && cleaned !== lastLine) {
      textLines.push(cleaned);
      lastLine = cleaned;
    }
  }

  return textLines.join("\n");
}
```

---

### Step 7: Implement Error Parsing

**Function:** `parseYtDlpError(stderr: string): Result<never, ExtractionError>`

**Implementation:**
```typescript
function parseYtDlpError(stderr: string): Result<never, ExtractionError> {
  const err = stderr.toLowerCase();

  if (err.includes("no subtitles") || err.includes("no automatic captions")) {
    return {
      ok: false,
      error: {
        type: "no_subtitles",
        message: "No subtitles available for this video.\n\nThe video may not have captions enabled, or auto-generated captions are disabled.",
      },
    };
  }

  if (err.includes("video unavailable") || err.includes("private video") || err.includes("this video is not available")) {
    return {
      ok: false,
      error: {
        type: "video_unavailable",
        message: "Video unavailable.\n\nThe video may be private, deleted, or region-restricted.",
      },
    };
  }

  if (err.includes("unable to download") || err.includes("network") || err.includes("connection")) {
    return {
      ok: false,
      error: {
        type: "network_error",
        message: "Network error.\n\nCould not connect to YouTube. Please check your internet connection.",
      },
    };
  }

  return {
    ok: false,
    error: {
      type: "yt_dlp_error",
      message: "yt-dlp extraction failed.",
      details: stderr,
    },
  };
}
```

---

### Step 8: Implement Main Function & CLI

**Function:** `extractTranscript(url: string): Promise<Result<ExtractionResult, ExtractionError>>`

**CLI Entry:**
```typescript
async function extractTranscript(url: string): Promise<Result<ExtractionResult, ExtractionError>> {
  // Validate URL
  const urlResult = validateYouTubeUrl(url);
  if (!urlResult.ok) return urlResult;

  // Extract transcript
  const extractResult = await runYtDlp(urlResult.data.url);
  if (!extractResult.ok) return extractResult;

  return {
    ok: true,
    data: {
      transcript: extractResult.data,
      videoId: urlResult.data.videoId,
    },
  };
}

// CLI entry point
if (import.meta.main) {
  const url = Bun.argv[2];

  if (!url || url === "--help" || url === "-h") {
    console.log(`Usage: extract <youtube-url>

Extract transcript from a YouTube video.

Examples:
  extract "https://www.youtube.com/watch?v=jNQXAC9IVRw"
  extract "https://youtu.be/jNQXAC9IVRw"

Exit codes:
  0 - Success
  1 - Invalid URL
  2 - No subtitles available
  3 - Network error
  4 - Video unavailable
  5 - yt-dlp not found
  6 - Other yt-dlp error`);
    process.exit(0);
  }

  const result = await extractTranscript(url);

  if (!result.ok) {
    console.error(result.error.message);
    const exitCodes: Record<ExtractionError["type"], number> = {
      invalid_url: 1,
      no_subtitles: 2,
      network_error: 3,
      video_unavailable: 4,
      yt_dlp_not_found: 5,
      yt_dlp_error: 6,
    };
    process.exit(exitCodes[result.error.type]);
  }

  console.log(result.data.transcript);
}

// Export for testing
export { extractTranscript, validateYouTubeUrl, parseVtt, parseSrt, parseYtDlpError };
```

---

### Step 9: Create SKILL.md

**File:** `.claude/skills/extract-youtube/SKILL.md`

```markdown
---
name: extract-youtube
description: Extract transcripts from YouTube videos via yt-dlp for knowledge library ingestion.
---

# Extract YouTube Transcript

Extract subtitles/transcripts from YouTube videos using yt-dlp.

## When to Use

- User provides a YouTube URL to extract content from
- Building knowledge library entries from video content
- Need text version of spoken video content

**Requires:** yt-dlp installed (`brew install yt-dlp`)

## Setup

```bash
cd .claude/skills/extract-youtube
bun install
bun run build
```

## Quick Reference

| Task | Command |
|------|---------|
| Extract transcript | `./scripts/extract "https://youtube.com/watch?v=ID"` |
| Help | `./scripts/extract --help` |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Invalid URL |
| 2 | No subtitles available |
| 3 | Network error |
| 4 | Video unavailable |
| 5 | yt-dlp not found |
| 6 | Other yt-dlp error |

## Output

- **Success:** Transcript text to stdout
- **Failure:** Error message to stderr
```

---

## Acceptance Criteria Mapping

| AC | Requirement | Implementation | Verification |
|----|-------------|----------------|--------------|
| AC1 | Valid URL with subtitles returns transcript | `extractTranscript()` → `runYtDlp()` → `parseVtt()` | `./scripts/extract "https://youtube.com/watch?v=jNQXAC9IVRw"` |
| AC2 | No subtitles returns clear error | `parseYtDlpError()` detects subtitle errors | Test with video without CC |
| AC3 | Invalid URL returns clear error | `validateYouTubeUrl()` validates format | `./scripts/extract "not-a-url"` |
| AC4 | Network failure returns actionable error | `parseYtDlpError()` detects network errors | Disconnect network, run command |

## Verification Commands

```bash
# Build
cd .claude/skills/extract-youtube && bun install && bun run build

# Run tests
bun test

# AC1 - Successful extraction (Me at the zoo - first YouTube video)
./scripts/extract "https://www.youtube.com/watch?v=jNQXAC9IVRw"
echo "Exit code: $?"
# Expected: Transcript text, exit code 0

# AC3 - Invalid URL
./scripts/extract "not-a-url" 2>&1
echo "Exit code: $?"
# Expected: Error about invalid URL format, exit code 1

# AC2 - No subtitles (manual: find video without CC)
# Expected: "No subtitles available" message, exit code 2

# AC4 - Network error (manual: disconnect network)
# Expected: "Network error" message, exit code 3
```

## KISS Compliance

- [x] No runtime dependencies beyond Bun builtins
- [x] Single responsibility: URL in → transcript text out
- [x] Discriminated union Result type
- [x] Guard clauses for early returns
- [x] No speculative features
- [x] Functions over classes (no state needed)
- [x] Tests written before implementation (TDD)

## Notes for Implementer

1. **Start with tests** - Write `extract.test.ts` first covering URL validation and VTT parsing
2. **Use Bun shell** - `Bun.$` for subprocess execution
3. **VTT deduplication** - Auto-generated subs repeat lines, must dedupe
4. **Temp file cleanup** - Always clean up `/tmp/yt-extract-*` directories
5. **Error messages** - User-friendly, include actionable guidance
6. **Keep simple** - This skill just extracts text, workflow handles file saving
