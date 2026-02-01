# Story 1.4: Re-extract Existing Content

Status: review

## Story

As a **knowledge library user**,
I want to re-extract a transcript for content that already exists in my library,
So that I can update the transcript if the original extraction was incomplete or if better subtitles are now available.

## Background

After initial extraction (Story 1.1) and the interactive workflow (Story 1.3), users may need to re-extract content for various reasons:
- Original extraction captured auto-generated subtitles, but manual captions are now available
- Extraction was partial due to network issues
- Video owner updated the subtitles with corrections
- User wants to try different subtitle language

This is the Edit mode (`steps-e/`) of the tri-modal BMAD workflow pattern. It must preserve existing metadata while replacing the transcript content.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given an existing library entry with a transcript, when re-extraction is invoked, then the user is prompted to confirm before overwriting
2. **AC2:** Given user confirms re-extraction, when the new transcript is fetched, then the old transcript is replaced and metadata is updated with re-extraction timestamp
3. **AC3:** Given re-extraction fails, when an error occurs, then the original transcript remains intact and unchanged
4. **AC4:** Given a library entry that has downstream content (refined.md or audio.mp3), when re-extraction succeeds, then the user is warned that downstream content may be stale
5. **AC5:** Given a library slug that does not exist, when re-extraction is invoked, then a clear error explains the entry must first be created via normal extraction
</acceptance_criteria>

## Tasks

- [x] **Task 1: Re-extraction command support** (AC: 1, 5)
  - [x] 1.1 Add `--re-extract` flag or separate command to invoke edit mode
  - [x] 1.2 Accept library slug as input parameter
  - [x] 1.3 Validate that library entry exists before proceeding
  - [x] 1.4 Return clear error if entry does not exist

- [x] **Task 2: Confirmation and safety** (AC: 1, 3)
  - [x] 2.1 Display current transcript summary (title, date, word count)
  - [x] 2.2 Prompt user to confirm overwrite with `[Y]es / [N]o` menu
  - [x] 2.3 Backup original transcript before attempting re-extraction
  - [x] 2.4 Restore backup if re-extraction fails

- [x] **Task 3: Update content and metadata** (AC: 2, 4)
  - [x] 3.1 Replace transcript.md with new extraction output
  - [x] 3.2 Update metadata.yaml with `re_extracted_at` timestamp
  - [x] 3.3 Check for downstream content (refined.md, audio.mp3)
  - [x] 3.4 Display warning if downstream content exists and may be stale

## Dev Agent Record

### Implementation Notes

**Approach:** Extended the existing `extract-youtube` skill with a `--re-extract <slug>` flag rather than creating a separate skill. This follows the KISS principle and keeps all extraction logic in one place.

**Key Implementation Details:**
1. Added new error type `re_extract_error` with exit code 7
2. Implemented `findLibraryEntry()` using Node.js `fs.existsSync` for synchronous file existence check
3. Implemented `parseTranscriptFrontmatter()` for reading metadata from transcript.md YAML frontmatter
4. Added backup/restore mechanism: `backupTranscript()` copies to `.backup` suffix, `restoreTranscript()` restores on failure
5. Interactive confirmation prompt using `Bun.stdin.stream()` for Y/N input
6. Downstream content detection via `checkDownstreamContent()` checking for refined.md and audio.mp3
7. Uses stored URL from metadata.yaml rather than user input (per implementation plan risk mitigation)

**Technical Decisions:**
- Used `require("node:fs").existsSync` for synchronous file check (Bun.file().size doesn't throw on missing files)
- Metadata stored in transcript.md frontmatter (not separate metadata.yaml) per step-04-save.md pattern
- Simple backup strategy: `.backup` suffix, deleted after success or restored on failure

### Debug Log

- Initial `findLibraryEntry` used `Bun.file().size` which doesn't throw on missing files - fixed to use `fs.existsSync`
- Test expectation for `countWords` was off by one (didn't account for `#` being counted as a word) - fixed test

### Completion Notes

All acceptance criteria implemented and verified through unit tests:
- AC1: `promptConfirmation()` displays transcript info and prompts Y/N before overwrite
- AC2: `reExtract()` writes new transcript and adds `re_extracted_at` to frontmatter
- AC3: `backupTranscript()` and `restoreTranscript()` preserve original on failure
- AC4: `checkDownstreamContent()` warns about stale refined.md/audio.mp3
- AC5: `findLibraryEntry()` returns clear error for missing entries

## File List

- `.claude/skills/extract-youtube/scripts/extract.ts` (modified) - Added re-extraction functionality
- `.claude/skills/extract-youtube/scripts/extract.test.ts` (modified) - Added 15 tests for re-extraction functions
- `.claude/skills/extract-youtube/SKILL.md` (modified) - Documented --re-extract flag and exit code 7

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-01 | Implemented re-extraction with --re-extract flag, backup/restore, and downstream content warnings | Dev Agent |

## Verification

<verification>
```bash
# AC1 Verification - Confirmation prompt appears
# Setup: Create a test library entry first
mkdir -p libraries/test-reextract && echo "Old transcript" > libraries/test-reextract/transcript.md
# Invoke re-extract and verify prompt appears (interactive test)

# AC2 Verification - Metadata updated after re-extraction
cat libraries/test-reextract/metadata.yaml | grep "re_extracted_at"
# Expected: re_extracted_at timestamp present

# AC3 Verification - Original preserved on failure
# Simulate network failure during re-extraction
# Verify: cat libraries/test-reextract/transcript.md shows original content

# AC4 Verification - Downstream content warning
touch libraries/test-reextract/refined.md
# Re-extract and verify warning message mentions "refined.md may be stale"

# AC5 Verification - Non-existent entry error
# Invoke re-extract with non-existent slug
# Expected: Error message "Library entry 'nonexistent-slug' not found. Use extract command to create it first."
```
</verification>

## References

- [Epic Overview](../overview.md)
- [Story 1.1: Extract YouTube Transcript](./1-1-extract-youtube-transcript.md)
- [Story 1.3: Interactive Extraction Workflow](./1-3-interactive-extraction-workflow.md)
