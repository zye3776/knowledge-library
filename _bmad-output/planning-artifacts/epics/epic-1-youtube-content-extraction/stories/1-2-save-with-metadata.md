# Story 1.2: Save Extracted Content with Metadata

Status: review

## Story

As a **knowledge library user**,
I want to save extracted transcripts with proper metadata,
So that I can organize and retrieve my content later with full source attribution.

## Background

After extracting a YouTube transcript (Story 1.1), users need to persist the content to their knowledge library. This includes the transcript text plus metadata like video title, source URL, and extraction timestamp. The content must be saved in a consistent folder structure that supports future retrieval and processing.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given an extracted transcript and YouTube URL, when save is invoked, then the transcript is saved as a markdown file in the library folder
2. **AC2:** Given an extracted transcript, when save is invoked, then a metadata file is created alongside the transcript containing source URL, video title, and extraction timestamp
3. **AC3:** Given a video title with special characters, when save is invoked, then the folder slug is created using URL-safe characters only
4. **AC4:** Given the library folder does not exist, when save is invoked for the first time, then the folder structure is created automatically
5. **AC5:** Given content already exists for a video URL, when save is invoked again, then the existing content is overwritten with new extraction
</acceptance_criteria>

## Tasks

- [x] **Task 1: Create library folder structure** (AC: 4)
  - [x] 1.1 Create libraries folder if not exists
  - [x] 1.2 Generate URL-safe slug from video title
  - [x] 1.3 Create content subfolder using slug

- [x] **Task 2: Save transcript content** (AC: 1, 5)
  - [x] 2.1 Accept transcript text and video metadata as input
  - [x] 2.2 Write transcript to markdown file
  - [x] 2.3 Handle overwrite case for re-extraction

- [x] **Task 3: Save metadata** (AC: 2, 3)
  - [x] 3.1 Capture source URL
  - [x] 3.2 Capture video title
  - [x] 3.3 Capture extraction timestamp
  - [x] 3.4 Write metadata to YAML file

## Verification

<verification>
```bash
# AC1 Verification - Transcript saved as markdown
test -f libraries/test-video/transcript.md && echo "PASS"
# Expected: PASS

# AC2 Verification - Metadata file exists with required fields
grep -c "source_url:" libraries/test-video/metadata.yaml && \
grep -c "title:" libraries/test-video/metadata.yaml && \
grep -c "extracted_at:" libraries/test-video/metadata.yaml
# Expected: 1 for each field

# AC3 Verification - Slug is URL-safe
ls libraries/ | grep -E "^[a-z0-9-]+$" | head -1
# Expected: Folder name with only lowercase letters, numbers, and hyphens

# AC4 Verification - Folder creation
rm -rf libraries/ac4-test && \
.claude/skills/save-content/scripts/save --url "https://youtube.com/watch?v=test" --title "AC4 Test" --transcript "Test content" && \
test -d libraries/ac4-test && echo "PASS"
# Expected: PASS

# AC5 Verification - Overwrite existing content
echo "old content" > libraries/overwrite-test/transcript.md && \
.claude/skills/save-content/scripts/save --url "https://youtube.com/watch?v=test" --title "Overwrite Test" --transcript "new content" && \
grep -c "new content" libraries/overwrite-test/transcript.md
# Expected: 1
```
</verification>

## References

- [Epic Overview](../overview.md)

## Dev Agent Record

### Implementation Plan

Created the `save-content` skill following the implementation plan with TDD approach:
1. Phase 1: Skill scaffold (package.json, tsconfig.json, .gitignore)
2. Phase 2: Core functions with tests (generateSlug, saveContent)
3. Phase 3: CLI integration with argument parsing
4. Phase 4: SKILL.md documentation and build

### Debug Log

- Fixed Biome lint issues: unused imports, non-null assertions, control character regex
- Added biome-ignore comment for legitimate non-ASCII character stripping regex
- All 34 tests pass, linting clean

### Completion Notes

- Implemented save-content skill with TypeScript + Bun
- generateSlug function handles: lowercase, special chars, emojis, multiple hyphens, truncation to 100 chars
- saveContent function creates folder structure, writes transcript.md and metadata.yaml
- CLI accepts --url, --title, --transcript flags with proper validation
- Overwrite behavior implemented (silent overwrite per AC5)
- All acceptance criteria verified with CLI tests

## File List

**Created:**
- .claude/skills/save-content/package.json
- .claude/skills/save-content/tsconfig.json
- .claude/skills/save-content/.gitignore
- .claude/skills/save-content/SKILL.md
- .claude/skills/save-content/scripts/save.ts
- .claude/skills/save-content/scripts/save.test.ts
- .claude/skills/save-content/scripts/save (compiled binary)

**Modified:**
- _bmad-output/implementation-artifacts/sprint-status.yaml (status: in-progress -> review)

## Change Log

| Date | Change |
|------|--------|
| 2026-02-01 | Implemented save-content skill with all acceptance criteria satisfied |
