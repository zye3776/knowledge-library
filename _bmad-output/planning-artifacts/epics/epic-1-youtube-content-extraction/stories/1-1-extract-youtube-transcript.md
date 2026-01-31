# Story 1.1: Extract YouTube Transcript

Status: done

## Story

As a **knowledge library user**,
I want to extract a transcript from a YouTube video,
So that I can save the spoken content to my knowledge library for later use.

## Background

This is the foundational story that enables all extraction functionality. Users provide a YouTube URL and receive the transcript text. This story focuses on the core extraction capability without workflow orchestration.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a valid YouTube URL with available subtitles, when extraction is invoked, then the transcript text is returned successfully
2. **AC2:** Given a YouTube URL without available subtitles, when extraction is invoked, then a clear error message explains subtitles are unavailable
3. **AC3:** Given an invalid or malformed URL, when extraction is invoked, then a clear error message explains the URL format is invalid
4. **AC4:** Given a network failure during extraction, when the system cannot reach YouTube, then an actionable error message is displayed
</acceptance_criteria>

## Tasks

- [x] **Task 1: Core extraction capability** (AC: 1)
  - [x] 1.1 Accept YouTube URL as input
  - [x] 1.2 Invoke yt-dlp to extract subtitles
  - [x] 1.3 Return transcript text content

- [x] **Task 2: Error handling** (AC: 2, 3, 4)
  - [x] 2.1 Detect missing subtitles and return clear message
  - [x] 2.2 Validate URL format before extraction
  - [x] 2.3 Handle network failures gracefully

## Verification

<verification>
```bash
# AC1 Verification - Successful extraction (use a short CC-licensed video with subtitles)
.claude/skills/extract-youtube/scripts/extract "https://www.youtube.com/watch?v=jNQXAC9IVRw"; echo "Exit code: $?"
# Expected: Transcript text output, Exit code: 0

# AC1 Verification - Output file exists
test -f /tmp/extract-test-output.txt && echo "PASS"
# Expected: PASS

# AC2 Verification - No subtitles (video without captions)
.claude/skills/extract-youtube/scripts/extract "https://www.youtube.com/watch?v=VIDEO_WITHOUT_SUBS" 2>&1 | grep -i "subtitle\|caption"
# Expected: Error message containing "subtitle" or "caption" unavailable

# AC3 Verification - Invalid URL
.claude/skills/extract-youtube/scripts/extract "not-a-valid-url" 2>&1 | grep -i "invalid\|url\|format"; echo "Exit code: $?"
# Expected: Error message about invalid URL, Exit code: non-zero

# AC4 Verification - Network failure simulation
timeout 1 .claude/skills/extract-youtube/scripts/extract "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>&1 | grep -i "network\|connect\|timeout"
# Expected: Error message about network/connectivity
```
</verification>

## References

- [Epic Overview](../overview.md)
