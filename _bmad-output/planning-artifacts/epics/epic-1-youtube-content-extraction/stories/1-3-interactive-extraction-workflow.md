# Story 1.3: Interactive Extraction Workflow

Status: ready-for-dev

## Story

As a **knowledge library user**,
I want to be guided through the YouTube extraction process via an interactive workflow,
So that I can extract content without memorizing commands and receive clear feedback at each step.

## Background

With the core extraction skill (1.1) and metadata saving capability (1.2) complete, users need a guided workflow that orchestrates the full extraction experience. This workflow follows BMAD step-file architecture and presents A/P/C menus after content generation. The workflow handles URL input, invokes extraction, displays results for approval, and saves content to the knowledge library.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a user invokes the extraction workflow, when they provide a YouTube URL, then the workflow guides them through the extraction process with clear prompts
2. **AC2:** Given extraction completes successfully, when the transcript is ready, then the workflow displays a preview and presents an A/C menu (Approve/Cancel)
3. **AC3:** Given the user approves the extracted content, when they select [A]pprove, then the transcript is saved with metadata to the content library
4. **AC4:** Given any error occurs during extraction, when the error is detected, then the workflow halts, displays an actionable error message, and presents options: [R]etry or [X]Exit
5. **AC5:** Given the user selects Cancel at any point, when they choose [X]Exit or [C]ancel, then the workflow exits cleanly without saving partial content
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Create workflow structure** (AC: 1)
  - [ ] 1.1 Create workflow.md entry point with MANDATORY EXECUTION RULES
  - [ ] 1.2 Create steps/ folder with step-01-init.md (URL input)
  - [ ] 1.3 Create step-02-extract.md (invoke extract-youtube skill)

- [ ] **Task 2: Implement A/C menu flow** (AC: 2, 5)
  - [ ] 2.1 Create step-03-review.md (display preview, present menu)
  - [ ] 2.2 Implement [A]pprove branch (proceed to save)
  - [ ] 2.3 Implement [C]ancel branch (exit without saving)

- [ ] **Task 3: Implement save flow** (AC: 3)
  - [ ] 3.1 Create step-04-save.md (invoke metadata save from 1.2)
  - [ ] 3.2 Generate slug from video title
  - [ ] 3.3 Create content library folder structure
  - [ ] 3.4 Display completion confirmation

- [ ] **Task 4: Error handling flow** (AC: 4)
  - [ ] 4.1 Handle extraction failures with clear messaging
  - [ ] 4.2 Present error menu: [R]etry, [X]Exit
  - [ ] 4.3 Log errors to workflow state for debugging

## Verification

<verification>
```bash
# Automated file existence checks
test -f .claude/commands/extract/workflow.md && echo "workflow.md PASS" || echo "workflow.md FAIL"
test -d .claude/commands/extract/steps && echo "steps/ PASS" || echo "steps/ FAIL"

# AC1 Verification - Workflow prompts for URL
# Manual: Invoke workflow and verify it prompts for YouTube URL

# AC2 Verification - A/C menu displayed after extraction
# Manual: Complete extraction and verify menu appears with [A]pprove, [C]ancel options

# AC3 Verification - Content saved on approve
ls libraries/*/transcript.md && ls libraries/*/metadata.yaml
# Expected: Files exist in content library

# AC4 Verification - Error handling
# Manual: Provide invalid URL, verify error message and [R]etry/[X]Exit menu

# AC5 Verification - Clean exit on cancel
# Manual: Select Cancel during workflow, verify no partial files created
ls libraries/ | wc -l
# Expected: No new folders created
```
</verification>

## Technical Notes

### Workflow File Structure

```
.claude/commands/extract/
├── workflow.md           # Entry point with MANDATORY EXECUTION RULES
└── steps/
    ├── step-01-init.md       # URL input and validation
    ├── step-02-extract.md    # Invoke extract-youtube skill
    ├── step-03-review.md     # Display preview, A/P/C menu
    └── step-04-save.md       # Save to library with metadata
```

### BMAD Patterns Required

- Workflow entry must include MANDATORY EXECUTION RULES section
- Every content generation step must present A/C menu
- Never auto-advance without user approval
- Update frontmatter stepsCompleted on each progression
- Use bracketed menu notation: [A], [C], [R], [X]

### Integration Points

- Invokes `extract-youtube` skill (Story 1.1) for transcript extraction
- Uses metadata save capability (Story 1.2) for library persistence
- Follows project-context.md error handling conventions

## References

- [Epic Overview](../overview.md)
- [Story 1.1: Extract YouTube Transcript](./1-1-extract-youtube-transcript.md)
- [PRD Functional Requirements](../../../prd.md) - FR22, FR23, FR24
