---
story_id: "1-4"
story_name: "re-extract-existing-content"
epic: "epic-1-youtube-content-extraction"
epic_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction"
story_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-4-re-extract-existing-content.md"
created: "2026-02-01"
last_modified: "2026-02-01"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Re-extract Existing Content

## Overview

This story adds Edit mode (`steps-e/`) to the extraction workflow, enabling users to re-extract transcripts for existing library entries. This is essential when original extraction captured incomplete content (auto-subs vs manual captions), network issues caused partial extraction, or video subtitles have been updated. The implementation must preserve existing metadata while safely replacing transcript content with backup/restore safeguards.

**Deliverable:** An `--re-extract` flag for the extract-youtube skill that validates the library entry exists, prompts for confirmation, backs up the original transcript, performs re-extraction, and updates metadata with re-extraction tracking.

## Critical Technical Decisions

### Architecture Alignment

| Decision | Implementation | Source |
|----------|----------------|--------|
| Library structure | Folder-per-source with metadata.yaml | core-architectural-decisions.md |
| Tri-modal workflow | Edit mode for re-extraction | core-architectural-decisions.md |
| Error handling | Original content preserved on failure | NFR3, NFR4 in prd.md |
| KISS principle | Simple backup/restore, no complex versioning | project philosophy |

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backup strategy | Simple file copy to `.backup` suffix | KISS - no need for versioning history, just rollback on failure |
| Confirmation UX | Interactive Y/N prompt | Matches existing workflow patterns, prevents accidental overwrites |
| Metadata tracking | Add `re_extracted_at` timestamp | Tracks re-extraction without complex versioning |
| Entry validation | Require metadata.yaml to exist | metadata.yaml is the source of truth for library entries |

### Risk Areas

- **Downstream stale content**: User may forget to update refined.md/audio.mp3 after re-extraction. Mitigation: Clear warning message about downstream content.
- **URL mismatch**: User could try to re-extract with different URL than original. Decision: Use URL from metadata.yaml, not user input.

## High-Level Approach

The implementation extends the existing `extract-youtube` skill with re-extraction capability. Rather than creating a separate skill, we add a `--re-extract <slug>` flag that:

1. Looks up the library entry by slug
2. Reads the original YouTube URL from metadata.yaml
3. Prompts for confirmation before overwriting
4. Creates a backup of the current transcript
5. Performs extraction using the stored URL
6. Updates metadata on success or restores backup on failure
7. Warns about downstream content staleness

### Files Affected

- **Modify:** `.claude/skills/extract-youtube/scripts/extract.ts` - Add re-extract mode
- **Modify:** `.claude/skills/extract-youtube/scripts/extract.test.ts` - Add tests for re-extract
- **Modify:** `.claude/skills/extract-youtube/SKILL.md` - Document re-extract flag
- **Create:** None (extends existing skill)

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Internal | extract-youtube skill | Existing extraction logic reused |
| Internal | Library folder structure | Assumes `libraries/{slug}/` with metadata.yaml |
| Config | content_folder | Path from config.yaml |
| Story | 1-2 (save-with-metadata) | Must be complete first - defines metadata.yaml schema |
| Story | 1-3 (interactive-workflow) | Must be complete first - defines library entry creation |

## Implementation Phases

### Phase 1: Library Entry Validation

- **Goal:** Implement functions to locate and validate library entries
- **Output:** `findLibraryEntry(slug)` and `readMetadata(entryPath)` functions

**Key functions:**
```typescript
interface LibraryMetadata {
  title: string;
  source_url: string;
  video_id: string;
  extracted_at: string;
  re_extracted_at?: string;
}

function findLibraryEntry(slug: string, contentFolder: string): Result<string, string>
function readMetadata(entryPath: string): Result<LibraryMetadata, string>
```

Note: Use sync file reading (Bun supports `Bun.file().text()` sync-style). Simple string errors per KISS.

**Validation checks:**
- Library folder exists at `{content_folder}/{slug}/`
- metadata.yaml exists and is parseable (if metadata exists, assume transcript exists)

### Phase 2: Confirmation and Backup

- **Goal:** Implement confirmation prompt and backup mechanism
- **Output:** `confirmReExtract()` and `backupTranscript()` functions

**Confirmation display:**
```
Re-extract transcript for "{title}"?

Current transcript:
  - Extracted: {extracted_at}

This will replace the existing transcript.md
[Y]es / [N]o:
```

Note: Reuse interactive prompt utilities from Story 1-3 if available.

**Backup approach:**
```typescript
function backupTranscript(entryPath: string): Result<string, string> {
  // Copy transcript.md -> transcript.md.backup
  // Return backup path for restoration
}

function restoreTranscript(backupPath: string): Result<void, string> {
  // Restore transcript.md from backup
  // Delete backup file
}
```

### Phase 3: Re-extraction and Metadata Update

- **Goal:** Perform extraction using stored URL and update metadata
- **Output:** Updated transcript.md and metadata.yaml

**Re-extraction flow:**
1. Read `source_url` from metadata.yaml
2. Call existing `extractTranscript(source_url)`
3. On success:
   - Write new transcript.md
   - Update metadata.yaml with `re_extracted_at`
   - Delete backup
4. On failure:
   - Restore transcript from backup
   - Report error with original preserved message

**Metadata update:**
```yaml
# After re-extraction
re_extracted_at: "2026-02-01T10:30:00Z"
```

### Phase 4: Downstream Content Warning

- **Goal:** Check for and warn about downstream content that may be stale
- **Output:** Warning message if refined.md or audio.mp3 exist

**Check and warn:**
```typescript
function checkDownstreamContent(entryPath: string): string[] {
  // Check for refined.md, audio.mp3
  // Return list of found files
}

// After successful re-extraction:
if (downstream.length > 0) {
  console.warn(`
Warning: The following files may now be stale:
${downstream.map(f => `  - ${f}`).join('\n')}

Consider re-processing these files with the updated transcript.
`);
}
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | User prompted to confirm before overwriting | Phase 2 - confirmReExtract() |
| AC2 | Old transcript replaced, metadata updated with timestamp | Phase 3 - metadata update |
| AC3 | Original transcript preserved on failure | Phase 2 - backup/restore mechanism |
| AC4 | Warning displayed if downstream content exists | Phase 4 - checkDownstreamContent() |
| AC5 | Clear error if library entry does not exist | Phase 1 - findLibraryEntry() validation |

## Agent Instructions

<critical_rules>
### Coding Standards Reference

**DO NOT include coding standards in this plan.**

Implementation agents MUST load coding standards from:
```
/Users/Z/projects/zees-plugins/plugins/coding-standards/rules
```

Load relevant standards ONLY when about to write code, not during planning.
</critical_rules>

### Agent Workflow

1. Read this plan for context and decisions
2. Before writing code: Load relevant coding standards from path above
3. **Phase 1:** Implement library entry validation functions with tests
4. **Phase 2:** Implement confirmation prompt and backup mechanism with tests
5. **Phase 3:** Implement re-extraction flow and metadata update with tests
6. **Phase 4:** Implement downstream content warning with tests
7. Run full test suite after each phase
8. Self-review against acceptance criteria

### Implementation Notes

1. **Reuse existing extraction logic** - Call `extractTranscript()` for actual extraction
2. **YAML parsing** - Use Bun's built-in YAML or simple regex for metadata.yaml
3. **Interactive prompts** - Use process.stdin for Y/N confirmation
4. **Error handling** - Use simple string errors per KISS principle
5. **Exit codes** - Add exit code 7 for re-extract errors (single code with descriptive message)

### CLI Interface

```bash
# Re-extract by slug
./scripts/extract --re-extract building-agents-with-claude-agent-sdk

# Help shows new flag
./scripts/extract --help

# Exit codes for re-extract mode:
#   7 - Re-extract error (with descriptive message)
```

---

## Self-Check (Workflow Use Only)

_This section is populated by the workflow before user review_

```yaml
self_check:
  high_level: true      # Plan is abstract, not detailed instructions
  no_coding_standards: true  # No coding/test standards embedded
  decisions_clear: true # Technical decisions are reviewable
  phases_defined: true  # Implementation phases exist
  ac_mapped: true       # All acceptance criteria covered
  agent_instructions: true  # Agent workflow section present
```
