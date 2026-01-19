---
story_id: "1-1"
story_name: "extract-youtube-transcript"
epic: "epic-1-youtube-content-extraction"
epic_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction"
story_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-1-extract-youtube-transcript.md"
created: "2026-01-19"
status: READY_FOR_DEV
---

# Implementation Plan: Extract YouTube Transcript

## Overview

This story implements the foundational extraction capability for the knowledge-library module. Users provide a YouTube URL and receive the transcript text. The implementation creates a Claude Code skill (`extract-youtube`) that wraps yt-dlp for subtitle extraction with proper error handling.

This is a core building block that all other extraction workflows will depend on.

## Technical Decisions

### Architecture Alignment

- **BMAD Module + Claude Code Skills pattern**: Per architecture.md, this is implemented as a Claude Code Skill (action executor)
- **Direct CLI via Bash**: yt-dlp invoked directly, user must have it installed
- **TypeScript + Bun**: Per CLAUDE.md, all new skills use TypeScript with Bun runtime
- **TDD approach**: Tests written first per project conventions

### Technology Choices

| Choice | Rationale |
|--------|-----------|
| TypeScript + Bun | Project standard for skills (CLAUDE.md) |
| Direct yt-dlp CLI | Simplest approach per NFR11 (minimal dependencies) |
| Bash tool execution | Native Claude Code capability, no extra libraries |
| stdout/stderr capture | Clean separation of output vs errors |

### Trade-offs Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| yt-dlp via Bash | Simple, direct, no wrapper libs | Requires yt-dlp installed | **Selected** - simplest |
| youtube-dl npm package | Pure JS, no system dependency | Abandoned project, less reliable | Rejected |
| pytube via Python | Active project | Adds Python dependency | Rejected |

## Code Structure

### Files to Create

```
.claude/skills/extract-youtube/
├── SKILL.md              # Skill definition (< 500 lines)
├── package.json          # Bun project config
├── tsconfig.json         # TypeScript config
└── scripts/
    ├── extract.ts        # Main extraction script
    └── extract.test.ts   # Tests (required)
```

### Files to Modify

```
None - this is a new skill with no existing files to modify
```

### Folder Structure

```
.claude/skills/
├── tts-openai/           # Existing TTS skill
├── tts-say/              # Existing TTS skill
└── extract-youtube/      # NEW - this implementation
    ├── SKILL.md
    ├── package.json
    ├── tsconfig.json
    └── scripts/
        ├── extract.ts
        └── extract.test.ts
```

## Dependencies

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| None required | yt-dlp uses no auth for public videos | - |

### External Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| bun | latest | Runtime (dev dependency) |
| @types/bun | latest | TypeScript types |

### System Dependencies

| Dependency | Purpose | Install |
|------------|---------|---------|
| yt-dlp | YouTube subtitle extraction | `brew install yt-dlp` or `pip install yt-dlp` |

### Internal Dependencies

- None - this is a foundational skill with no internal dependencies

## Implementation Steps

### Step 1: Create Skill Scaffold

Create the skill folder structure:

```bash
mkdir -p .claude/skills/extract-youtube/scripts
```

Create `package.json`:
```json
{
  "name": "extract-youtube",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "bun test",
    "build": "bun build ./scripts/extract.ts --compile --outfile=./scripts/extract"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

Create `tsconfig.json`:
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

### Step 2: Write Tests First (TDD)

Create `scripts/extract.test.ts` with tests for:

1. **Valid URL extraction** - Returns transcript text
2. **Invalid URL format** - Returns error with clear message
3. **Missing subtitles** - Returns error explaining subtitles unavailable
4. **URL validation** - Rejects non-YouTube URLs

Test structure:
```typescript
import { describe, test, expect } from "bun:test";
import { extractTranscript, validateYouTubeUrl, parseYtDlpError } from "./extract";

describe("validateYouTubeUrl", () => {
  test("accepts valid youtube.com URLs", () => { /* ... */ });
  test("accepts valid youtu.be URLs", () => { /* ... */ });
  test("rejects non-YouTube URLs", () => { /* ... */ });
  test("rejects malformed URLs", () => { /* ... */ });
});

describe("parseYtDlpError", () => {
  test("identifies missing subtitles", () => { /* ... */ });
  test("identifies network errors", () => { /* ... */ });
  test("identifies unavailable video", () => { /* ... */ });
});

describe("extractTranscript", () => {
  test("returns transcript for valid video with subtitles", async () => { /* ... */ });
  test("returns error for video without subtitles", async () => { /* ... */ });
});
```

### Step 3: Implement Core Extraction Logic

Create `scripts/extract.ts`:

**Key functions:**

1. `validateYouTubeUrl(url: string): Result<string, string>`
   - Validate URL format
   - Accept youtube.com and youtu.be formats
   - Return normalized URL or error

2. `extractTranscript(url: string): Promise<Result<string, string>>`
   - Validate URL first
   - Execute yt-dlp with appropriate flags
   - Parse output, handle errors
   - Return transcript text or error

3. `parseYtDlpError(stderr: string): string`
   - Parse yt-dlp error output
   - Return user-friendly error message

**yt-dlp command:**
```bash
yt-dlp --write-auto-sub --sub-lang en --skip-download --print-to-file "%(subtitles)s" - "URL"
```

Alternative approach (simpler):
```bash
yt-dlp --write-sub --write-auto-sub --sub-lang en --skip-download -o "/tmp/yt-%(id)s" "URL"
# Then read the .vtt or .srt file
```

### Step 4: Implement CLI Entry Point

Add CLI handling to `scripts/extract.ts`:

```typescript
// CLI entry point
if (import.meta.main) {
  const url = Bun.argv[2];
  if (!url) {
    console.error("Usage: extract <youtube-url>");
    process.exit(1);
  }

  const result = await extractTranscript(url);
  if (!result.ok) {
    console.error(result.error);
    process.exit(1);
  }

  console.log(result.data);
}
```

### Step 5: Create SKILL.md

Create `.claude/skills/extract-youtube/SKILL.md`:

```markdown
---
name: extract-youtube
description: Extract transcript from YouTube video using yt-dlp
---

# Extract YouTube Transcript

Extracts subtitle/transcript text from a YouTube video URL.

## Usage

\`\`\`bash
.claude/skills/extract-youtube/scripts/extract "https://www.youtube.com/watch?v=VIDEO_ID"
\`\`\`

## Requirements

- yt-dlp must be installed (`brew install yt-dlp` or `pip install yt-dlp`)

## Output

- Success: Transcript text to stdout, exit code 0
- Failure: Error message to stderr, exit code 1

## Error Messages

| Error | Meaning |
|-------|---------|
| "No subtitles available" | Video has no captions/subtitles |
| "Invalid YouTube URL" | URL format not recognized |
| "Video unavailable" | Private, deleted, or region-blocked |
| "Network error" | Could not connect to YouTube |
```

### Step 6: Build and Test

```bash
cd .claude/skills/extract-youtube
bun install
bun test              # Run tests
bun run build         # Create executable
```

### Step 7: Manual Verification

Run verification commands from story:

```bash
# AC1 - Successful extraction
.claude/skills/extract-youtube/scripts/extract "https://www.youtube.com/watch?v=jNQXAC9IVRw"

# AC3 - Invalid URL
.claude/skills/extract-youtube/scripts/extract "not-a-valid-url"
```

## Acceptance Criteria Mapping

| Criteria | Implementation | Verification |
|----------|----------------|--------------|
| AC1: Valid URL with subtitles returns transcript | `extractTranscript()` executes yt-dlp, parses output | Run with known video, check transcript output |
| AC2: No subtitles returns clear error | `parseYtDlpError()` detects subtitle errors | Test with video without captions |
| AC3: Invalid URL returns clear error | `validateYouTubeUrl()` validates format | Test with malformed URLs |
| AC4: Network failure returns actionable error | `parseYtDlpError()` detects network errors | Test with timeout/offline |

## Edge Cases & Error Handling

### Error Scenarios

| Scenario | Handling | User Feedback |
|----------|----------|---------------|
| Invalid URL format | Validate before calling yt-dlp | "Invalid YouTube URL: [url]. Expected format: youtube.com/watch?v=... or youtu.be/..." |
| Video without subtitles | Parse yt-dlp error | "No subtitles available for this video. The video may not have captions enabled." |
| Private/deleted video | Parse yt-dlp error | "Video unavailable: This video may be private, deleted, or region-restricted." |
| Network timeout | Parse yt-dlp error | "Network error: Could not connect to YouTube. Please check your internet connection." |
| yt-dlp not installed | Check for binary | "yt-dlp not found. Install with: brew install yt-dlp" |

### Boundary Conditions

- Empty URL string: Return "Invalid YouTube URL" error
- URL with extra whitespace: Trim before validation
- Very long videos: yt-dlp handles this, no special handling needed
- Non-English subtitles: Fall back to auto-generated if English unavailable

### Recovery Strategies

- No automatic retries (per NFR10)
- User can retry manually with same command
- Failed extractions don't leave partial files (yt-dlp handles cleanup)

## KISS Compliance Checklist

- [x] No premature abstraction - single concrete implementation
- [x] No speculative generality - handles only YouTube URLs as specified
- [x] Direct CLI execution - no wrapper libraries
- [x] Guard clauses for error handling - early returns
- [x] No deep nesting - flat control flow
- [x] Result type for success/failure - discriminated union pattern
- [x] Functions over classes - no state needed
