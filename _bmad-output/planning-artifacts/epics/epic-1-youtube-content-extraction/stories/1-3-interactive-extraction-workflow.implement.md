---
story_id: "1-3"
story_name: "interactive-extraction-workflow"
epic: "epic-1-youtube-content-extraction"
epic_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction"
story_path: "_bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/stories/1-3-interactive-extraction-workflow.md"
created: "2026-02-01"
last_modified: "2026-02-01"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Interactive Extraction Workflow

## Overview

Create a BMAD step-file workflow that orchestrates the full YouTube extraction experience. This workflow guides users through URL input, invokes the extract-youtube skill (Story 1.1), displays results for approval via A/C menu, and saves content to the knowledge library using metadata save capability (Story 1.2).

**Deliverable:** A Claude Code command workflow at `.claude/commands/extract/` that provides interactive guided extraction with proper error handling and user control.

## Critical Technical Decisions

### Architecture Alignment

| Decision | Implementation | Source |
|----------|----------------|--------|
| Workflow location | `.claude/commands/extract/` | project-structure-boundaries.md |
| Step-file pattern | `steps/step-{NN}-{action}.md` | implementation-patterns-consistency-rules.md |
| Menu presentation | `[A]pprove / [C]ancel` | BMAD patterns from CLAUDE.md |
| State tracking | YAML frontmatter `stepsCompleted` array | core-architectural-decisions.md |
| Skill invocation | Bash call to `.claude/skills/extract-youtube/scripts/extract` | Story 1-1 implementation |
| Library save | Inline implementation (Story 1.2 dependency) | Story 1-2 specification |

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Workflow entry point | Claude Code command (not slash command) | Aligns with `.claude/commands/` pattern from architecture |
| Skill vs inline extraction | Invoke existing skill | Reuses Story 1.1 work, separation of concerns |
| Error menu options | R/X (Retry/Exit) | Standard BMAD error handling pattern |
| State persistence | Per-session frontmatter | Simple for MVP, no external state file needed |
| Preview display | Display transcript preview | Let implementation decide appropriate length |

### Risk Areas

- **Skill invocation failure**: The workflow depends on Story 1.1 skill existing and being built. Must check skill exists before invoking.
- **Save capability dependency**: Story 1.2 may not be implemented yet. This plan includes inline save logic that aligns with 1.2 spec but doesn't depend on it.
- **Long transcripts**: Large transcripts may need chunked display in preview step.

## High-Level Approach

This workflow uses BMAD step-file architecture with 4 sequential steps:

1. **Init**: Validate prerequisites, prompt for YouTube URL
2. **Extract**: Invoke extract-youtube skill, capture output
3. **Review**: Display preview, present A/P/C menu for user decision
4. **Save**: Generate slug, create library folder, save transcript and metadata

The workflow provides clear feedback at each step and halts on user decisions (A/P/C menu) per BMAD requirements.

### Files to Create

See story file Technical Notes for file structure. Step files inherit MANDATORY EXECUTION RULES from workflow.md.

### Files to Modify

- None (this creates a new workflow)

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Internal | `.claude/skills/extract-youtube/scripts/extract` | Story 1.1 - must be built |
| Internal | `libraries/` folder | Created automatically if missing |
| Config | None | Uses project-relative paths |
| Env Var | None | Skills handle their own env vars |

## Implementation Phases

### Phase 1: Workflow Scaffold

- **Goal:** Create workflow entry point with MANDATORY EXECUTION RULES section
- **Output:** `workflow.md` with proper frontmatter and step-file loading instructions

**workflow.md Structure:**
```markdown
---
name: extract
description: "Interactive YouTube transcript extraction workflow"
stepsCompleted: []
currentStep: null
---

# Extract YouTube Transcript

[MANDATORY EXECUTION RULES section]
[Step processing rules]
[Initialization sequence pointing to step-01-init.md]
```

### Phase 2: Step Files Implementation

- **Goal:** Create all 4 step files with proper sequencing and menu handling
- **Output:** Complete step files in `steps/` folder

**Step 01 - Init:**
- Check extract-youtube skill exists
- Check libraries folder exists (create if not)
- Prompt user for YouTube URL
- Validate URL format (basic check, skill does full validation)
- Store URL in workflow state
- Auto-proceed to step 02

**Step 02 - Extract:**
- Invoke: `.claude/skills/extract-youtube/scripts/extract "{url}"`
- Capture stdout (transcript) and exit code
- On success: Store transcript, proceed to step 03
- On failure: Display error message, present R/S/X menu

**Step 03 - Review:**
- Display transcript preview
- Display video metadata if available
- Present A/C menu:
  - [A]pprove: Proceed to step 04
  - [C]ancel: Exit without saving

**Step 04 - Save:**
- Generate slug from URL (use video ID as slug)
- Create `libraries/{slug}/` folder
- Write `transcript.md` with YAML frontmatter (single metadata location)
- Display completion confirmation with file paths

### Phase 3: Error Handling Integration

- **Goal:** Implement error menu flow (R/S/X pattern)
- **Output:** Error handling in step-02-extract.md

**Error Menu Logic:**
- [R]etry: Re-run extraction with same URL
- [X]Exit: Exit workflow cleanly

### Phase 4: A/C Menu Flow

- **Goal:** Implement approval flow in step-03-review.md
- **Output:** Complete menu handling

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Guided workflow with clear prompts | Phase 1 + Phase 2 (step-01-init) |
| AC2 | A/C menu after extraction | Phase 4 (step-03-review) |
| AC3 | Save on approve | Phase 2 (step-04-save) |
| AC4 | Error handling with R/S/X menu | Phase 3 (step-02-extract) |
| AC5 | Clean exit on cancel | Phase 4 (step-03-review [C] branch) |

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
2. Create `workflow.md` first - this is the entry point
3. Create step files in order: 01, 02, 03, 04
4. Test each step manually as you create it
5. Verify skill invocation works with a real YouTube URL
6. Self-review against acceptance criteria

### Implementation Details

**Step File Pattern (each step follows this structure):**

```markdown
---
name: 'step-{NN}-{action}'
description: '{what this step does}'
---

# Step {N}: {Action}

## STEP GOAL:
[What this step accomplishes]

## MANDATORY SEQUENCE
### 1. {First action}
### 2. {Second action}
### N. Present Menu (if user decision needed)
```

Note: Steps inherit MANDATORY EXECUTION RULES from workflow.md. Sequential steps don't need explicit nextStepFile linking.

**Slug Generation Logic:**
```
URL: https://youtube.com/watch?v=jNQXAC9IVRw
Slug: jNQXAC9IVRw (use video ID directly)
```

**Transcript File Format (transcript.md):**
```markdown
---
source_url: "https://youtube.com/watch?v=VIDEO_ID"
source_type: youtube
slug: "VIDEO_ID"
extracted_at: "2026-02-01T10:30:00Z"
stage: extracted
---

# Transcript

{transcript content}
```

Note: Use single metadata location (transcript.md frontmatter) per KISS principle. No separate metadata.yaml needed.

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
  agent_instructions: true    # Agent workflow section present
```
