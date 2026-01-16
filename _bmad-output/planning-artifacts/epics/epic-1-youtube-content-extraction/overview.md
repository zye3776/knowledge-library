# Epic 1: YouTube Content Extraction

**Author:** Claude Opus 4.5
**Date:** 2026-01-15

---

## Overview

Users can extract transcripts from YouTube videos and save them to their knowledge library. This epic delivers the foundational extraction capability that enables all downstream processing.

### Objectives

1. Enable users to extract transcripts from YouTube videos via URL
2. Save extracted content with proper metadata for future reference
3. Provide interactive guided workflow for extraction
4. Support re-extraction and validation of existing content

### Scope

<constraints>
**In Scope:**
- YouTube video transcript extraction
- Metadata preservation (title, URL, timestamps)
- Interactive extraction workflow
- Edit mode for re-extraction
- Validate mode for quality checks

**Out of Scope:**
- Other video platforms (Vimeo, etc.)
- Audio-only content extraction
- Batch extraction of multiple URLs
- Automatic subtitle generation for videos without subtitles
</constraints>

---

## Stories Summary

| Story | Title | Priority | Dependencies |
|-------|-------|----------|--------------|
| 1.1 | Extract YouTube Transcript | P0 | None |
| 1.2 | Save Extracted Content with Metadata | P0 | 1.1 |
| 1.3 | Interactive Extraction Workflow | P0 | 1.1, 1.2 |
| 1.4 | Re-extract Existing Content | P1 | 1.3 |
| 1.5 | Validate Extracted Transcript | P1 | 1.3 |

---

## Non-Functional Requirements

<nfr>
### Reliability
- Clear error messages when extraction fails (network, no subtitles, invalid URL)
- Error messages include suggested actions for resolution
- Partial failures do not corrupt existing library content
- System fails gracefully without requiring manual cleanup

### Integration
- Integrates with yt-dlp for transcript extraction
- No version constraints on yt-dlp - use whatever is installed
- Integration failures reported clearly with actionable guidance

### Simplicity
- Implementation prioritizes simplicity over edge case handling
- No automatic retry logic - user initiates retries manually
</nfr>

---

## Risks and Mitigations

<risks>
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| yt-dlp not installed on user system | H | M | Clear error message with installation instructions |
| YouTube API changes break extraction | M | L | yt-dlp handles this; users update yt-dlp |
| Video has no subtitles | M | M | Clear message explaining limitation |
| Network failures during extraction | M | M | Actionable error with retry guidance |
</risks>

---

## Dependencies

<dependencies>
### Epic Dependencies
- None (this is the foundation epic)

### External Dependencies
- yt-dlp (YouTube transcript extraction)
</dependencies>

---

## Requirements Traceability

| FR | Description |
|----|-------------|
| FR1 | User can provide a YouTube video URL as input |
| FR2 | System can extract transcript/subtitles via yt-dlp |
| FR3 | System can detect when video has no subtitles and notify user |
| FR4 | System can preserve video metadata (title, source URL) |
| FR14 | System can save processed content as Markdown files |
| FR15 | System can organize content in project folder structure |
| FR17 | System can store content metadata for future retrieval |
| FR23 | System can guide user through workflow via interactive prompts |
| FR24 | System can display processing status and completion notifications |

---

## References

- [Epics Index](../index.md)
