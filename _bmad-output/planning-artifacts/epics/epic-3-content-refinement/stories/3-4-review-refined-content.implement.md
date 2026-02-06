---
# Plan Status Tracking
story_id: "3-4"
story_name: "review-refined-content"
epic: "epic-3-content-refinement"
epic_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement"
story_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement/stories/3-4-review-refined-content.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: ready
iteration: 3
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Review Refined Content

## Overview

Create review step that parses unified prompt output, displays summary, and handles Approve/Reject/View/Edit decisions.

**KISS Principle Applied:** No toggle-based restoration. No iteration tracking. No re-refinement. Simple menu: Approve, Reject, View, or Edit manually.

## Critical Technical Decisions

### Architecture Alignment

<critical_rules>
**Prerequisites:**
- Unified refinement prompt executed (outputs per Epic Overview schema)
- `refined.md` saved from refinement output
- Stats parsed from refinement output

**This story:**
1. Parses unified prompt output (delimited sections)
2. Saves refined.md and stats to metadata.yaml
3. Displays summary with examples
4. Handles user decision
</critical_rules>

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Menu options | A/R/V/E only | KISS - no re-refinement loop |
| Change requests | Manual edit | If user wants changes, they edit the file |
| Iterations | None | One-shot refinement, edit if needed |

## High-Level Approach

Create workflow step that:
1. Parses unified prompt output (delimited content, stats, examples)
2. Saves refined.md and updates metadata.yaml
3. Displays summary
4. Presents simple menu

### Files to Create

| File | Purpose |
|------|---------|
| Review workflow step | Parse output, display menu, handle decisions |

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Unified refinement output | Per Epic Overview schema |
| Internal | `metadata.yaml` | Write decision |
| Epic 2 | Stage compatibility | `refined` or `refinement_skipped` |

## Implementation Phases

### Phase 1: Output Parsing

**Goal:** Parse unified prompt output into components

**Tasks:**
1. Split output on delimiters:
   - `---BEGIN REFINED CONTENT---` / `---END REFINED CONTENT---`
   - `---BEGIN STATS---` / `---END STATS---`
   - `---BEGIN EXAMPLES---` / `---END EXAMPLES---`
2. Save refined content to `libraries/{slug}/refined.md`
3. Parse stats YAML and update `metadata.yaml`
4. Extract examples for summary display

### Phase 2: Summary Display & Menu

**Goal:** Show summary and handle user decision

**Summary:**
```
REFINEMENT REVIEW

Sponsors removed: 2
  └─ "This video is sponsored by NordVPN..."
Visual refs removed: 8
  └─ "As you can see here..."
Ads removed: 3
  └─ "Smash that like button..."
Intro cleaned: Yes
Outro cleaned: Yes

Original: 4,523 words → Refined: 3,891 words (14% reduction)

[A] Approve - Use refined.md for audio
[R] Reject  - Use original transcript.md
[V] View    - See full refined content
[E] Edit    - Manually edit refined.md
```

**Menu Handling:**
- [A] Approve: `stage: refined`, `refinement_approved_at: {timestamp}`
- [R] Reject: `stage: refinement_skipped`, `use_original: true`
- [V] View: Display refined.md, return to menu
- [E] Edit: User edits refined.md, return to menu when done

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Summary with counts and examples | Phase 2 |
| AC2 | [V]iew shows content | Phase 2 |
| AC3 | Approval updates metadata | Phase 2 |
| AC4 | Rejection sets use_original | Phase 2 |
| AC5 | Edit allows manual changes | Phase 2 |

## Agent Instructions

### Workflow
1. Implement output parsing (Phase 1)
2. Implement summary display and menu (Phase 2)
3. Test each menu option
4. Verify metadata updates

### Verification
```bash
# Approval
yq '.stage' libraries/test/metadata.yaml  # refined
yq '.refinement_approved_at' libraries/test/metadata.yaml  # timestamp

# Rejection
yq '.stage' libraries/test/metadata.yaml  # refinement_skipped
yq '.use_original' libraries/test/metadata.yaml  # true
```

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
  kiss_compliant: true  # Collapsed 7 phases to 2, removed iteration/toggle complexity
```
