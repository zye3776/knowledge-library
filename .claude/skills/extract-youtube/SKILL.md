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

| Task               | Command                                              |
| ------------------ | ---------------------------------------------------- |
| Extract transcript | `./scripts/extract "https://youtube.com/watch?v=ID"` |
| Help               | `./scripts/extract --help`                           |

## Supported URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

## Exit Codes

| Code | Meaning                |
| ---- | ---------------------- |
| 0    | Success                |
| 1    | Invalid URL            |
| 2    | No subtitles available |
| 3    | Network error          |
| 4    | Video unavailable      |
| 5    | yt-dlp not found       |
| 6    | Other yt-dlp error     |

## Output

- **Success:** Transcript text to stdout
- **Failure:** Error message to stderr

## Error Handling

The skill provides clear, actionable error messages:

- **Invalid URL**: Lists expected formats
- **No subtitles**: Explains video may lack captions
- **Network error**: Suggests checking connection
- **Video unavailable**: Notes video may be private/deleted
- **yt-dlp not found**: Provides install command
