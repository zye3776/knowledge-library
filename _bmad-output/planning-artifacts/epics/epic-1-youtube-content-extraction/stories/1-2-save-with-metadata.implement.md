---
story_id: "1-2"
story_name: "save-with-metadata"
epic: "epic-1-youtube-content-extraction"
epic_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction"
story_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-2-save-with-metadata.md"
created: "2026-02-01"
last_modified: "2026-02-01"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Save Extracted Content with Metadata

## Overview

Create the `save-content` skill - a TypeScript + Bun CLI tool that persists extracted transcripts to the knowledge library with proper metadata. This is the storage layer that enables all future retrieval, processing, and consumption workflows. Without this, extracted content exists only in memory.

**Deliverable:** A skill that accepts transcript text, YouTube URL, and video title, then saves to the library folder structure with metadata YAML.

## Critical Technical Decisions

### Architecture Alignment

| Decision | Implementation | Source |
|----------|----------------|--------|
| Storage location | `{project_root}/libraries/{slug}/` | core-architectural-decisions.md |
| Transcript format | Markdown (plain text) | core-architectural-decisions.md |
| Metadata format | YAML file | core-architectural-decisions.md |
| Skill pattern | Mirror `extract-youtube` structure | CLAUDE.md, story 1-1 |
| Runtime | TypeScript + Bun | CLAUDE.md |
| Error handling | Discriminated union Result type | KISS-principle, story 1-1 pattern |

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Slug generation | Simple lowercase + hyphen transform | KISS - covers 99% of titles, avoid complex transliteration |
| Overwrite behavior | Silent overwrite without backup | Story AC5 specifies overwrite; user controls when to re-extract |
| Metadata storage | Separate YAML file vs frontmatter | Easier parsing, cleaner separation of concerns |

### Risk Areas

- **File system permissions:** Skill may fail if libraries folder is not writable
- **Slug collisions:** Two different videos could generate the same slug (edge case)
- **Large transcripts:** Memory usage when handling very long transcripts (unlikely for YouTube)

## High-Level Approach

The skill accepts three inputs (transcript, URL, title) and performs three operations:
1. Generate URL-safe slug from video title
2. Create folder structure if needed
3. Write transcript.md and metadata.yaml files

All input comes via CLI arguments to enable piping from extract-youtube and future workflow orchestration.

### Files Affected

**Create:**
```
.claude/skills/save-content/
├── SKILL.md              # Skill documentation
├── package.json          # Project config
├── tsconfig.json         # TypeScript config
├── biome.json            # Extends root biome.json
├── .gitignore            # Ignore node_modules, build artifacts
└── scripts/
    ├── save.ts           # Main implementation
    └── save.test.ts      # Test suite
```

**Modify:**
- None (greenfield skill)

**Runtime Output (created by skill):**
```
libraries/{slug}/
├── transcript.md         # Raw transcript text
└── metadata.yaml         # Source URL, title, timestamp
```

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Runtime | Bun builtins only | No npm packages needed |
| Dev | @types/bun | Type definitions |
| Dev | Biome | Linting/formatting (project standard) |

## Implementation Phases

### Phase 1: Skill Scaffold and Types

**Goal:** Establish project structure matching extract-youtube pattern

**Output:**
- package.json with build/test scripts
- tsconfig.json matching project conventions
- biome.json linked to root config
- Type definitions for Result, SaveError, SaveInput

**Key Types:**
```typescript
// Simple string errors per KISS principle - no discriminated union needed for MVP
type SaveResult = {
  slug: string;
  transcriptPath: string;
  metadataPath: string;
};

interface SaveInput {
  transcript: string;
  url: string;
  title: string;
}

// Use Result<SaveResult, string> for error handling
```

### Phase 2: Core Functions with Tests (TDD)

**Goal:** Implement and test core logic before wiring CLI

**Output:**
- `generateSlug(title: string): string` - URL-safe slug generation
- `saveTranscript(input: SaveInput, librariesPath: string): Result<SaveResult, SaveError>`
- Test coverage for slug generation edge cases
- Test coverage for file write operations (using temp directories)

**Test Categories:**
1. **Slug Generation**
   - Basic lowercase conversion: "Hello World" -> "hello-world"
   - Special character removal: "What's Up? (2024)" -> "whats-up-2024"
   - Multiple spaces/hyphens collapse: "A  --  B" -> "a-b"
   - Leading/trailing cleanup: "--hello--" -> "hello"
   - Empty/whitespace handling: Returns error

2. **File Operations**
   - Creates libraries folder if missing
   - Creates slug subfolder
   - Writes transcript.md with correct content
   - Writes metadata.yaml with required fields
   - Overwrites existing files on re-save

3. **Metadata Format**
   ```yaml
   source_url: "https://youtube.com/watch?v=..."
   title: "Original Video Title"
   extracted_at: "2026-02-01T10:30:00Z"
   ```

### Phase 3: CLI Integration

**Goal:** Wire functions to command-line interface

**Output:**
- CLI entry point with argument parsing
- Help output matching extract-youtube style
- Exit codes for different error types
- Success output showing saved paths

**CLI Interface:**
```bash
# Basic usage with required flags
./scripts/save --url "https://youtube.com/..." --title "Video Title" --transcript "..."
```

**Test Categories (add to Phase 3):**
- Missing --url flag returns helpful error
- Empty --transcript value returns helpful error
- Malformed URL returns helpful error

### Phase 4: SKILL.md and Build

**Goal:** Document skill and create compiled executable

**Output:**
- SKILL.md with usage examples
- Compiled binary via `bun run build`
- Verification commands for all acceptance criteria

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By | Verification |
|------|------------------|------------|--------------|
| AC1 | Transcript saved as markdown | Phase 2 - saveTranscript() | `test -f libraries/{slug}/transcript.md` |
| AC2 | Metadata file with URL, title, timestamp | Phase 2 - saveTranscript() | `grep "source_url:" metadata.yaml` |
| AC3 | Slug is URL-safe | Phase 2 - generateSlug() | `ls libraries/ \| grep -E "^[a-z0-9-]+$"` |
| AC4 | Auto-create folder structure | Phase 2 - saveTranscript() | Run on empty libraries/, verify creation |
| AC5 | Overwrite existing content | Phase 2 - saveTranscript() | Save twice, verify second content wins |

## Agent Instructions

<critical_rules>
### Coding Standards Reference

**DO NOT include coding standards in this plan.**

Implementation agents MUST load coding standards from:
```
.claude/rules/
```

And follow project conventions from:
```
CLAUDE.md
biome.json (root)
```

Load relevant standards ONLY when about to write code, not during planning.
</critical_rules>

### Agent Workflow

1. Read this plan for context and decisions
2. Before writing code: Review extract-youtube skill as reference implementation
3. Implement phase by phase, running tests after each
4. Use `bun test` for unit tests
5. Use `bun run lint` to verify code style
6. Self-review against acceptance criteria
7. Run verification commands from story file

### Implementation Notes

1. **Mirror extract-youtube structure** - Use same Result type pattern, similar CLI style
2. **Slug generation is simple** - Don't over-engineer; handle basic cases well
3. **Timestamps use ISO 8601** - `new Date().toISOString()` for consistency
4. **Libraries path** - Hardcode to `{cwd}/libraries/` for production
5. **Test with temp directories** - Use temp directories for tests, don't pollute real libraries folder

---

## Self-Check (Workflow Use Only)

```yaml
self_check:
  high_level: true       # Plan is abstract, not detailed instructions
  no_coding_standards: true   # No coding/test standards embedded
  decisions_clear: true  # Technical decisions are reviewable
  phases_defined: true   # Implementation phases exist
  ac_mapped: true        # All acceptance criteria covered
  agent_instructions: true  # Agent workflow section present
```
