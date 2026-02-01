---
story_id: "1-5"
story_name: "validate-extracted-transcript"
epic: "epic-1-youtube-content-extraction"
epic_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction"
story_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-5-validate-extracted-transcript.md"
created: "2026-02-01"
last_modified: "2026-02-01"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Validate Extracted Transcript

## Overview

Create the tri-modal validation step (steps-v/) for the extraction workflow that allows users to verify transcript quality before proceeding with refinement or TTS consumption. This provides quality gate functionality that displays content metrics, detects extraction artifacts, and enables users to approve, retry, or exit the workflow.

**Deliverable:** A workflow step file (`step-01-validate.md`) that implements content validation logic with interactive A/R/X menu presentation.

## Critical Technical Decisions

### Architecture Alignment

| Decision | Implementation | Source |
|----------|----------------|--------|
| Workflow pattern | Step file in `steps-v/` folder | implementation-patterns-consistency-rules.md |
| Menu presentation | A/R/X bracketed options | BMAD workflow rules, CLAUDE.md |
| Metadata update | YAML with snake_case keys | architecture patterns |
| No auto-advance | Always halt for user approval | CLAUDE.md critical rules |
| Validation philosophy | Report facts, let user judge | KISS principle - no system-imposed thresholds |

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Artifact detection | Regex patterns in step file | KISS: No separate script needed for validation logic |
| Validation location | Workflow step, not skill | Validation is workflow-specific, not reusable as standalone tool |
| Metric display | Inline formatting | Simple markdown output, no templating engine |
| No thresholds | Display facts only | User judges quality, no system warnings |

### Risk Areas

- **Artifact pattern false positives:** Regex patterns may match legitimate content (e.g., timestamps in transcripts about time)
- **Missing transcript:** Need error handling if transcript.md doesn't exist

## High-Level Approach

This story creates a workflow validation step that:
1. Loads transcript content from the library item folder (error if not found)
2. Calculates quality metrics (word count, reading time)
3. Scans for extraction artifacts using regex patterns
4. Displays results as-is (no warnings, no thresholds - user judges)
5. Presents A/R/X menu and handles user selection
6. Updates metadata.yaml on approval

The validation logic is self-contained within the step file - no separate skill is needed since this is workflow-specific validation that reads existing files and presents results.

### Files Affected

- **Create:** `.claude/skills/knowledge-library/workflows/extract-youtube/steps-v/step-01-validate.md`
- **Modify:** None (workflow entry point already references steps-v/)

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Library folder structure | `libraries/{slug}/transcript.md`, `metadata.yaml` |
| Internal | Extract workflow | Must be complete (story 1.3) to have content to validate |
| Pattern | BMAD step file format | Uses standard frontmatter and execution patterns |

## Implementation Phases

### Phase 1: Create Step File Structure

- Goal: Set up the validation step file with proper frontmatter and section structure
- Output: `step-01-validate.md` scaffold with execution rules and menu handling

**Step file frontmatter:**
```yaml
---
name: 'step-01-validate'
description: 'Validate extracted transcript quality before proceeding'
mode: validate
---
```

**Required sections:**
- STEP GOAL
- MANDATORY EXECUTION RULES
- EXECUTION PROTOCOLS
- CONTEXT BOUNDARIES
- MANDATORY SEQUENCE
- Menu Handling Logic
- SUCCESS/FAILURE METRICS

### Phase 2: Implement Validation Logic

- Goal: Define the content analysis and artifact detection algorithms
- Output: Validation algorithms embedded in step file instructions

**Metrics to calculate:**
```
Word count: Split content by whitespace, count tokens
Reading time: word_count / 200 (avg reading speed)
```

**Artifact patterns (from story spec):**
```
Bracketed timestamps: /\[\d{1,2}:\d{2}(:\d{2})?\]/g
Speaker labels: /^SPEAKER\s*\d*:/gm
Auto-caption markers: /\[Music\]|\[Applause\]/gi
Encoding issues: /\u{FFFD}/gu (replacement character)
```

Note: List all artifacts found. No threshold - user judges if they're acceptable.

### Phase 3: Implement Results Display

- Goal: Create clear, actionable output formatting for validation results
- Output: Display templates for metrics, issues, and warnings

**Metrics display format:**
```markdown
**Validation Results**

| Metric | Value |
|--------|-------|
| Word Count | 2,450 |
| Reading Time | ~12 min |
```

**Issues display format:**
```markdown
**Artifacts Detected:**

1. Line 45: `[00:15]` - Bracketed timestamp
2. Line 102: `SPEAKER 1:` - Speaker label
3. Line 203: `[Music]` - Auto-caption marker
```

Note: Just list the facts. No warnings or thresholds - user judges if acceptable.

### Phase 4: Implement Menu and Metadata Update

- Goal: Handle user interaction and update library item state
- Output: Menu logic and metadata update instructions

**Menu presentation:**
```markdown
**What would you like to do?**

- **[A]** Approve - Mark validated and proceed
- **[R]** Retry - Exit with message to run extraction again
- **[X]** Exit - Cancel without changes

Please select:
```

Note: [R] simply exits with a message "Run extraction workflow again to re-extract". Don't auto-route until Story 1-4 is implemented and the interface is known.

**Metadata update on approval:**
```yaml
# Add to metadata.yaml
validation_passed: true
validation_date: "2026-02-01T10:30:00Z"
```

Note: Simple write for personal tool. No atomic temp+rename needed.

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Display quality metrics (word count, reading time) | Phase 2, Phase 3 |
| AC2 | Display word count for user judgment | Phase 2, Phase 3 |
| AC3 | List detected artifacts with locations | Phase 2, Phase 3 |
| AC4 | Present A/R/X menu, no auto-advance | Phase 4 |
| AC5 | Update metadata.yaml on approval | Phase 4 |

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
3. Implement phase by phase
4. This is a workflow step file (markdown), not TypeScript code
5. Follow BMAD step file patterns from existing examples
6. Self-review against acceptance criteria

### Implementation Notes

1. **Step file location:** Create at `.claude/skills/knowledge-library/workflows/extract-youtube/steps-v/step-01-validate.md`
2. **Content loading:** Step file should instruct agent to read `transcript.md` from the active library item
3. **State tracking:** Library item path should be available from workflow context or passed as parameter
4. **Artifact excerpts:** Show 20-30 characters around each detected artifact for context
5. **Line numbers:** Track line numbers during scanning to report issue locations
6. **Menu handling:** Per BMAD rules, always halt and wait for user input after presenting menu

### Validation Logic Pseudocode

```
1. Resolve library item path from context
2. Read transcript.md content (error if not found)
3. Calculate metrics:
   - word_count = content.split(/\s+/).length
   - reading_time = Math.ceil(word_count / 200)
4. Scan for artifacts:
   - For each pattern in ARTIFACT_PATTERNS:
     - Find all matches with line numbers
     - Store match text, line number, pattern name
5. Display results as-is (no warnings, no thresholds)
6. Present A/R/X menu
7. Handle selection:
   - A: Update metadata.yaml, proceed
   - R: Exit with message to run extraction again
   - X: Exit workflow
```

---

## Self-Check (Workflow Use Only)

_This section is populated by the workflow before user review_

```yaml
self_check:
  high_level: true       # Plan is abstract, not detailed instructions
  no_coding_standards: true   # No coding/test standards embedded
  decisions_clear: true  # Technical decisions are reviewable
  phases_defined: true   # Implementation phases exist
  ac_mapped: true        # All acceptance criteria covered
  agent_instructions: true   # Agent workflow section present
```
