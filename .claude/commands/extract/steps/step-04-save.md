---
name: 'step-04-save'
description: 'Save transcript with metadata to knowledge library'
---

# Step 4: Save to Library

## STEP GOAL

Save the approved transcript with metadata to the knowledge library folder structure.

## MANDATORY SEQUENCE

### 1. Generate Slug from URL

<slug_generation>
Extract the video ID from the YouTube URL to use as the slug:

**URL patterns:**
- `https://www.youtube.com/watch?v=VIDEO_ID` -> `VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID` -> `VIDEO_ID`
- `https://youtu.be/VIDEO_ID` -> `VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID` -> `VIDEO_ID`

The slug is the VIDEO_ID portion of the URL.
</slug_generation>

### 2. Create Library Folder Structure

<folder_creation>
Create the content library folder if it doesn't exist:

```
libraries/{slug}/
```

Example: `libraries/jNQXAC9IVRw/`
</folder_creation>

### 3. Save Transcript with Metadata

<save_transcript>
Create `libraries/{slug}/transcript.md` with YAML frontmatter:

```markdown
---
source_url: "{youtube_url}"
source_type: youtube
slug: "{slug}"
extracted_at: "{ISO_8601_timestamp}"
stage: extracted
---

# Transcript

{transcript_content}
```

**Frontmatter fields:**
- `source_url`: The original YouTube URL
- `source_type`: Always "youtube" for this workflow
- `slug`: The video ID used as folder name
- `extracted_at`: ISO 8601 timestamp (e.g., "2026-02-01T10:30:00Z")
- `stage`: Pipeline stage, starts as "extracted"

**Note:** Use single metadata location (transcript.md frontmatter) per KISS principle. No separate metadata.yaml file.
</save_transcript>

### 4. Display Completion Confirmation

<completion>
Display success message with file paths:

---
## Extraction Complete

**Transcript saved successfully!**

**Library Entry:**
- Folder: `libraries/{slug}/`
- Transcript: `libraries/{slug}/transcript.md`

**Metadata:**
- Source: {youtube_url}
- Extracted: {timestamp}
- Stage: extracted

**Next steps:**
- View: Open `libraries/{slug}/transcript.md` to read the transcript
- Refine: Run content refinement to remove noise (sponsors, ads, visual refs)
- Listen: Convert to audio with TTS for walking/commuting

---

Workflow complete. Thank you for using the extraction workflow!
</completion>

## Error Handling

<errors>
If file creation fails:
- Display: "Failed to save transcript: {error_message}"
- Present menu:
  - **[R]etry** - Try saving again
  - **[X]Exit** - Exit without saving

Do not leave partial files - clean up on failure if any files were created.
</errors>
