---
name: 'step-01-init'
description: 'Initialize workflow and collect YouTube URL from user'
---

# Step 1: Initialize

## STEP GOAL

Validate prerequisites and collect YouTube URL from the user.

## MANDATORY SEQUENCE

### 1. Check Prerequisites

<prerequisites>
Verify the following before proceeding:

1. **Extract skill exists**: Check that `.claude/skills/extract-youtube/scripts/extract` is present
2. **Libraries folder**: Check that `libraries/` folder exists at project root (create if missing)

If extract skill is missing:
- HALT with message: "Extract skill not found. Please build it first: `cd .claude/skills/extract-youtube && bun install && bun run build`"
</prerequisites>

### 2. Prompt for YouTube URL

<user_input>
Ask the user:

**Please provide the YouTube URL you want to extract:**

Expected formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`
</user_input>

### 3. Validate URL Format

<validation>
Perform basic URL validation:

1. URL must start with `https://` or `http://`
2. URL must contain `youtube.com` or `youtu.be`
3. URL must contain a video ID pattern

If validation fails:
- Display: "Invalid YouTube URL format. Please provide a valid YouTube video URL."
- Return to step 2 to prompt again
</validation>

### 4. Store URL and Proceed

<proceed>
Store the validated URL for use in subsequent steps.

**URL accepted.** Proceeding to extraction...

Auto-advance to: `step-02-extract.md`
</proceed>
