---
name: library
description: Browse and access previously processed content in the knowledge library.
---

# Library

Browse, view, and manage previously processed content items.

**Usage:** `/library`

## When to Use

- User wants to see what content has been processed
- Browsing previously extracted/refined/consumed items
- Finding file paths for existing content
- Checking processing status of library items

## Instructions

<instructions>

### Step 1: Scan Library

1. List all directories in `libraries/`
2. For each directory, read `metadata.yaml` (skip items without metadata, log warning)
3. Determine status for each item:
   - Has `audio.mp3` -> status: `audio`
   - Has `refined.md` (stage: refined) -> status: `refined`
   - Has `transcript.md` only -> status: `extracted`
4. Sort items by most recent timestamp (newest first)
5. If no items found, display:
   ```
   Knowledge Library is empty.

   Get started:
     /pipeline {youtube-url}  - Full pipeline from URL to audio
     /extract-youtube         - Extract a transcript only
   ```

### Step 2: Display Library List

Display items in a table:
```
=== Knowledge Library ===

| # | Title                              | Status    | Date       |
|---|-----------------------------------|-----------|------------|
| 1 | Understanding Async JavaScript     | audio     | 2026-01-15 |
| 2 | Redis Internals Deep Dive         | refined   | 2026-01-14 |
| 3 | TypeScript Best Practices         | extracted | 2026-01-16 |

[#] Select item  [X] Exit
```

Wait for user input.

### Step 3: Display Item Details

When the user selects an item by number:

1. Read `libraries/{slug}/metadata.yaml`
2. Check which files exist: `transcript.md`, `refined.md`, `audio.mp3`
3. Display item details:

```
=== {title} ===

Source: {source_url}
Status: {status}
Extracted: {extracted_at}
Refined: {refined_at or "Not yet"}
Audio: {audio_generated_at or "Not yet"}

Files:
  - transcript.md ({word_count} words)
  - refined.md ({word_count} words) [if exists]
  - audio.mp3 [if exists]

Actions:
  [T] View transcript
  [R] View refined content [if exists]
  [P] Play audio path [if exists]
  [Re] Re-run a pipeline stage
  [B] Back to list
```

### Step 4: Handle Item Actions

1. **[T] View transcript:** Display contents of `libraries/{slug}/transcript.md`
2. **[R] View refined:** Display contents of `libraries/{slug}/refined.md`
3. **[P] Play audio path:** Print the full path: `libraries/{slug}/audio.mp3`
4. **[Re] Re-run stage:** Present re-run menu (see Step 5)
5. **[B] Back:** Return to library list (Step 2)

### Step 5: Re-run Pipeline Stage

When the user selects re-run:

1. Display available stages with prerequisite checks:
   ```
   === Re-run Stage: {title} ===

   Which stage would you like to re-run?
   [E] Extract - Re-fetch transcript from YouTube
   [R] Refine - Re-process with current refinement rules
   [C] Consume - Regenerate audio from current content
   [X] Cancel

   Note: Re-running a stage will overwrite existing output.
   ```

2. **[E] Extract:**
   - Prerequisite: `source_url` in metadata. If missing: `Error: No source_url in metadata. Cannot re-extract.`
   - Warn: "This will overwrite transcript.md. Proceed? [Y/N]"
   - Invoke: `/extract-youtube` with the stored source_url, then save to the existing slug location
   - Update metadata: `extracted_at` with new timestamp

3. **[R] Refine:**
   - Prerequisite: `transcript.md` exists. If missing: `Error: No transcript.md found. Extract first.`
   - Warn: "This will overwrite refined.md. Proceed? [Y/N]"
   - Invoke: `/refine {slug}`
   - Metadata updated by refine skill

4. **[C] Consume:**
   - Prerequisite: `transcript.md` or `refined.md` exists. If neither: `Error: No content file found.`
   - Warn: "This will overwrite audio.mp3. Proceed? [Y/N]"
   - Invoke: `/consume {slug}`
   - Metadata updated by consume skill

5. After re-run completes, return to item details (Step 3)

</instructions>

## Error Handling

| Condition | Action |
|-----------|--------|
| Empty library | Show friendly message with getting-started instructions |
| Missing metadata.yaml | Skip item with warning |
| Invalid item number | Report error, show list again |
| Missing prerequisite for re-run | Show prerequisite error |
| Stage re-run fails | Report error, return to item details |

## Examples

```bash
# Browse the library
/library

# Output:
# === Knowledge Library ===
# | # | Title                          | Status | Date       |
# |---|-------------------------------|--------|------------|
# | 1 | Best To-Do List Apps for 2026  | extracted | 2026-02-05 |
#
# [#] Select item  [X] Exit
```
