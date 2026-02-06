---
# Plan Status Tracking
story_id: "3-2"
story_name: "remove-visual-references"
epic: "epic-3-content-refinement"
epic_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement"
story_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement/stories/3-2-remove-visual-references.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: ready
iteration: 3
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Remove Visual References

## Overview

Write Section B of the unified refinement prompt. One deliverable: markdown text that defines visual reference detection and transformation rules.

**KISS Principle Applied:** No separate test fixtures. Grammar preservation is Claude's responsibility - iterate on prompt if needed.

## Critical Technical Decisions

### Architecture Alignment

<critical_rules>
**One Deliverable:** Section B of the unified refinement prompt.

Claude knows visual reference patterns. We're writing instructions that guide behavior.
</critical_rules>

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deliverable | One prompt section | KISS - no test fixtures |
| Grammar | Claude's responsibility | Can't unit test LLM grammar |
| Testing | Unified prompt tested in 3.4 | Test output, not rules |

## High-Level Approach

Write Section B markdown. Include classification (explained vs unexplained), transformation rules, and examples.

### Files to Create

| File | Purpose |
|------|---------|
| Section B text (in unified prompt file) | Visual reference rules |

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Stories | 3.1, 3.3 | Combined into unified prompt |
| Epic | Output schema | Defined in Epic Overview |

## Implementation

### Single Phase: Write Section B

**Deliverable:** Section B markdown for unified prompt

```markdown
## Section B: Visual Reference Rules

### Classification

**Explained** = Visual reference followed by verbal explanation
- "As you can see, the function returns an array" → Keep explanation, remove "As you can see"

**Unexplained** = Visual reference with no verbal context
- "Look at this diagram" → Remove entire sentence

### Transformation Rules

1. **Prefix Removal** (explained refs):
   - Before: "As you can see here, the data flows left to right."
   - After: "The data flows left to right."

2. **Sentence Removal** (unexplained refs):
   - Before: "Now look at this next diagram."
   - After: [removed]

3. **Mid-Sentence** (restructure):
   - Before: "The function, as you can see, returns a promise."
   - After: "The function returns a promise."

### Common Patterns to Detect
- "As you can see..."
- "Look at this..."
- "On the screen..."
- "In this diagram..."
- "The highlighted section..."
- "Notice how this..."

### Output
Report `visual_refs_removed` count and one example in the stats section.
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Unexplained refs removed | Classification + transformation |
| AC2 | Explanations preserved | Prefix removal rule |
| AC3 | Grammar correct | Claude's capability |
| AC4 | Stats recorded | Output specification |
| AC5 | Natural transitions | Unified prompt handles |

## Agent Instructions

### Workflow
1. Write Section B markdown as shown above
2. Add to unified refinement prompt file
3. Test as part of unified prompt (Story 3.4)

---

## Self-Check (Workflow Use Only)

```yaml
self_check:
  high_level: true
  no_coding_standards: true
  decisions_clear: true
  phases_defined: true
  ac_mapped: true
  agent_instructions: true
  kiss_compliant: true  # Collapsed 4 phases to 1 deliverable
```
