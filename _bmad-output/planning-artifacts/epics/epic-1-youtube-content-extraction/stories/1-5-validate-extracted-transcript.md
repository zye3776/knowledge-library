# Story 1.5: Validate Extracted Transcript

Status: ready-for-dev

## Story

As a **knowledge library user**,
I want to validate an extracted transcript before further processing,
So that I can ensure the content quality meets my needs before investing time in refinement or TTS consumption.

## Background

This is the tri-modal validation step (steps-v/) for the extraction workflow. After content is extracted via Story 1.3's interactive workflow, users need a way to verify transcript quality before proceeding. Validation checks include: content length, language detection, readability, and absence of extraction artifacts. This story depends on 1.3 (Interactive Extraction Workflow) being complete.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given extracted transcript content exists for a library item, when validation is invoked, then content quality metrics are displayed (word count, estimated reading time)
2. **AC2:** Given validation calculates word count, when results are displayed, then the word count is shown for user judgment
3. **AC3:** Given validation detects potential extraction artifacts (timestamps, speaker labels, formatting issues), when results are displayed, then specific issues are listed with locations
4. **AC4:** Given validation completes, when user reviews results, then they can choose to [A]pprove and proceed, [R]etry extraction, or [X] Exit without changes
5. **AC5:** Given user approves validation, when confirmation is provided, then metadata.yaml is updated with validation_passed: true and validation_date
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Validation metrics calculation** (AC: 1, 2)
  - [ ] 1.1 Load transcript content from library item folder
  - [ ] 1.2 Calculate word count and estimated reading time
  - [ ] 1.3 Format and display metrics summary (user judges if sufficient)

- [ ] **Task 2: Artifact detection** (AC: 3)
  - [ ] 2.1 Scan for common extraction artifacts (bracketed timestamps, speaker labels like "SPEAKER:")
  - [ ] 2.2 Detect formatting issues (excessive line breaks, malformed characters)
  - [ ] 2.3 Compile issues list with line numbers or excerpts (list all found, no threshold)

- [ ] **Task 3: Interactive validation flow** (AC: 4)
  - [ ] 3.1 Display validation results summary
  - [ ] 3.2 Present A/R/X menu options
  - [ ] 3.3 Handle user selection and route appropriately
  - [ ] 3.4 Never auto-advance without user approval

- [ ] **Task 4: Metadata update on approval** (AC: 5)
  - [ ] 4.1 Load existing metadata.yaml for library item
  - [ ] 4.2 Add validation_passed boolean and validation_date ISO timestamp
  - [ ] 4.3 Save metadata directly (simple write for personal tool)

## Dev Notes

### Technical Requirements

- **Runtime:** TypeScript + Bun (per project standards)
- **No test framework:** Use workflow Validate modes for quality checks per NFR9
- **Error handling:** Halt on error, display clear message with [R]etry/[X]Exit options per project-context.md
- **YAML format:** Use snake_case for all keys per project naming conventions

### Validation Philosophy

Validation is a **report, not a judge**. Present the facts (word count, artifacts found) and let the user decide if the content is acceptable. No system-imposed thresholds or warnings.

### Artifact Detection Patterns

```typescript
const ARTIFACT_PATTERNS = [
  /\[\d{1,2}:\d{2}(:\d{2})?\]/g,  // Bracketed timestamps [00:00] or [00:00:00]
  /^SPEAKER\s*\d*:/gm,             // Speaker labels
  /\[Music\]|\[Applause\]/gi,      // Common auto-caption markers
  /\u{FFFD}/gu,                    // Replacement character (encoding issues)
];
```

### Menu Presentation Pattern

Per BMAD workflow rules - always present A/P/C or A/R/X menu after content generation:
```
[A] Approve - Mark validated and proceed
[R] Retry - Exit with message to run extraction again
[X] Exit - Cancel without changes
```

### File Structure

This validation step integrates with the existing library structure:
```
libraries/{slug}/
├── transcript.md     # Content to validate (input)
├── metadata.yaml     # Updated with validation status (output)
└── ...
```

### Project Structure Notes

- Workflow step file location: `.claude/skills/knowledge-library/workflows/extract-youtube/steps-v/`
- Step file naming: `step-01-validate.md`
- No new skills required - validation logic is in workflow step

### References

- [Source: _bmad-output/project-context.md#Testing Rules] - Validation approach
- [Source: _bmad-output/project-context.md#BMAD Workflow Patterns] - Menu presentation
- [Source: _bmad-output/planning-artifacts/epics/epic-1-youtube-content-extraction/overview.md#NFR] - Reliability requirements
- [Source: _bmad-output/planning-artifacts/prd.md#FR9] - User can review processed content before consumption

## Verification

<verification>
```bash
# AC1 Verification - Metrics display
# Create test transcript and run validation
echo "Test content with at least one hundred words..." > /tmp/test-transcript.md
# Run validation step and check output includes word count, reading time
# Expected: Metrics summary displayed

# AC2 Verification - Word count shown
echo "Short content" > /tmp/short-transcript.md
# Run validation on short content
# Expected: Word count displayed (user judges if sufficient)

# AC3 Verification - Artifact detection
echo "[00:01] SPEAKER 1: Hello [Music]" > /tmp/artifact-transcript.md
# Run validation on content with artifacts
# Expected: List of detected artifacts with patterns matched

# AC4 Verification - Menu options
# After validation, menu displays A/R/X options
# User can select each option and system responds appropriately
# Expected: No auto-advance, menu always displayed

# AC5 Verification - Metadata update
# Approve validation, then check metadata.yaml
grep "validation_passed: true" libraries/test-slug/metadata.yaml
grep "validation_date:" libraries/test-slug/metadata.yaml
# Expected: Both fields present after approval
```
</verification>

## References

- [Epic Overview](../overview.md)
- [Stories Index](./index.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
