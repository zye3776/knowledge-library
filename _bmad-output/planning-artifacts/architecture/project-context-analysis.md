# Project Context Analysis

## Requirements Overview

**Functional Requirements:**
24 requirements across 6 categories defining a content extraction and transformation pipeline:
- **Extraction:** YouTube URL input → yt-dlp transcript extraction with metadata preservation
- **Processing:** Noise removal (sponsors, ads, unexplained visuals) while preserving technical terminology
- **Consumption:** TTS generation via OpenAI API with configurable voice preferences
- **Storage:** Markdown-based knowledge library with folder organization
- **Configuration:** YAML config file in project folder for preferences and defaults
- **Interaction:** Interactive CLI with guided prompts (no complex flags for basic use)

**Non-Functional Requirements:**
11 requirements emphasizing simplicity and reliability:
- Clear, actionable error messages (NFR1-2, NFR7)
- Graceful failure without corruption or manual cleanup (NFR3-4)
- Minimal dependencies - only yt-dlp and OpenAI TTS (NFR11)
- No automatic retry logic - user initiates retries (NFR10)
- Simplicity over edge case handling (NFR9)

**Scale & Complexity:**

- Primary domain: CLI tool / Backend processing
- Complexity level: Low
- Estimated architectural components: 4-5 (Extraction, Processing, TTS, Storage, CLI Interface)

## Technical Constraints & Dependencies

| Constraint | Implication |
|------------|-------------|
| yt-dlp dependency | Must handle videos without subtitles gracefully |
| OpenAI TTS API | Requires API key management, network connectivity |
| Self-contained project folder | All config, output, and library files in one location |
| Interactive-first design | Optimize for guided UX, defer scriptable mode to post-MVP |
| Context isolation | Extraction processes fork to keep main CLI clean |

## Cross-Cutting Concerns Identified

1. **Error handling strategy** - Consistent pattern needed across extraction, processing, and TTS phases
2. **File organization** - Predictable folder structure for raw content, processed content, and audio output
3. **Configuration loading** - Single config file read at startup, applied across all phases
4. **Metadata preservation** - Title, source URL tracked from extraction through storage
