---
name: 'step-02-extract'
description: 'Invoke extract-youtube skill to fetch transcript'
---

# Step 2: Extract Transcript

## STEP GOAL

Run the extract-youtube skill to fetch the transcript from the provided YouTube URL.

## MANDATORY SEQUENCE

### 1. Invoke Extract Skill

<extraction>
Execute the extract-youtube skill:

```bash
.claude/skills/extract-youtube/scripts/extract "{url}"
```

Where `{url}` is the YouTube URL collected in step-01-init.

Capture:
- **stdout**: The transcript text (on success)
- **stderr**: Error messages (on failure)
- **exit code**: Status indicator
</extraction>

### 2. Handle Exit Codes

<exit_codes>
| Exit Code | Meaning | Action |
|-----------|---------|--------|
| 0 | Success | Store transcript, proceed to step 03 |
| 1 | Invalid URL | Show error, offer retry |
| 2 | No subtitles available | Show error, offer retry with different URL |
| 3 | Network error | Show error, suggest checking connection |
| 4 | Video unavailable | Show error, video may be private/deleted |
| 5 | yt-dlp not found | HALT, show install instructions |
| 6 | Other yt-dlp error | Show error details, offer retry |
</exit_codes>

### 3. On Success (Exit Code 0)

<success>
Store the transcript text for use in the review step.

Display brief confirmation:
**Transcript extracted successfully!**
- Length: {character_count} characters
- Lines: {line_count} lines

Proceeding to review...

Auto-advance to: `step-03-review.md`
</success>

### 4. On Failure (Non-zero Exit Code)

<failure>
Display the error message from stderr with context.

Present error menu:

**Extraction failed:** {error_message}

What would you like to do?
- **[R]etry** - Try again with the same URL
- **[N]ew URL** - Enter a different YouTube URL
- **[X]Exit** - Exit the workflow

Wait for user selection before proceeding.

Menu actions:
- **[R]etry**: Re-run extraction (go back to step 2.1)
- **[N]ew URL**: Return to step-01-init.md for new URL input
- **[X]Exit**: Exit workflow cleanly without saving
</failure>
