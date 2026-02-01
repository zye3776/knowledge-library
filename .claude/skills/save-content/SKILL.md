---
name: save-content
description: Save extracted transcripts with metadata to the knowledge library folder structure.
---

# Save Content

Save YouTube transcripts and metadata to the knowledge library for later retrieval and processing.

## When to Use

- After extracting a transcript with extract-youtube skill
- User wants to persist content to the library
- Building knowledge library entries from video content

## Setup

```bash
cd .claude/skills/save-content
bun install
bun run build
```

## Quick Reference

| Task         | Command                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| Save content | `./scripts/save --url "https://youtube.com/..." --title "Video Title" --transcript "..."` |
| Help         | `./scripts/save --help`                                                                   |

## CLI Options

| Option          | Description                  | Required |
| --------------- | ---------------------------- | -------- |
| `--url`         | YouTube video URL            | Yes      |
| `--title`       | Original video title         | Yes      |
| `--transcript`  | Transcript text content      | Yes      |
| `--help`, `-h`  | Show help message            | No       |

## Output Structure

```
libraries/{slug}/
  transcript.md     # Raw transcript text
  metadata.yaml     # Source URL, title, extraction timestamp
```

### Slug Generation

The slug is generated from the video title:
- Lowercase conversion
- Special characters removed
- Spaces become hyphens
- Multiple hyphens collapsed
- Max 100 characters

Example: `"What's Up? (2024) - Full Episode!"` becomes `whats-up-2024-full-episode`

### Metadata Format

```yaml
source_url: "https://youtube.com/watch?v=..."
title: "Original Video Title"
extracted_at: "2026-02-01T10:30:00Z"
```

## Exit Codes

| Code | Meaning                |
| ---- | ---------------------- |
| 0    | Success                |
| 1    | Invalid arguments      |
| 2    | Save operation failed  |

## Programmatic Usage

```typescript
import { saveContent, generateSlug } from "./scripts/save.ts";

// Generate a URL-safe slug
const slug = generateSlug("My Video Title");
// Returns: "my-video-title"

// Save transcript with metadata
const result = await saveContent(
  {
    transcript: "Hello world...",
    url: "https://youtube.com/watch?v=abc",
    title: "My Video Title",
  },
  "/path/to/libraries"
);

if (result.ok) {
  console.log(`Saved to: ${result.data.slug}/`);
  console.log(`Transcript: ${result.data.transcriptPath}`);
  console.log(`Metadata: ${result.data.metadataPath}`);
} else {
  console.error(result.error);
}
```

## Error Handling

The skill provides clear error messages:

- **Empty transcript/URL/title**: Validation errors with field name
- **Invalid slug**: Title must contain alphanumeric characters
- **File system errors**: Reports specific path that failed

## Integration with extract-youtube

Typical workflow:

```bash
# Extract transcript
transcript=$(.claude/skills/extract-youtube/scripts/extract "https://youtube.com/watch?v=abc")

# Save to library
.claude/skills/save-content/scripts/save \
  --url "https://youtube.com/watch?v=abc" \
  --title "Video Title" \
  --transcript "$transcript"
```
