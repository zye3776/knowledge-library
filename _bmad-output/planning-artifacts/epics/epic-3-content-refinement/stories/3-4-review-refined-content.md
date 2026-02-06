# Story 3.4: Review Refined Content

Status: ready

## Story

As a **knowledge library user**,
I want to review the refined content before proceeding to audio generation,
So that I can verify the refinement preserved the content I care about and catch any incorrectly removed segments.

## Background

Automated content refinement may occasionally remove valuable content or leave awkward transitions. This story provides the user review step that allows verification before committing to TTS generation. Users can approve the refinement, request adjustments, or revert to the original transcript.

This is the final step in the refinement workflow and gates progression to Epic 2 (Audio Consumption). See [Epic Overview](../overview.md) for stage state machine.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given refined.md exists, when review is initiated, then user sees a summary with removal counts AND one example per removal type
2. **AC2:** Given the user reviews refinement, when they select [V]iew, then they can see the full refined content
3. **AC3:** Given the user approves, then metadata.yaml is updated with `stage: refined` and `refinement_approved_at` timestamp
4. **AC4:** Given the user rejects, then metadata is updated with `stage: refinement_skipped` and `use_original: true`
5. **AC5:** Given the user wants to edit, then they are directed to manually edit refined.md (no automatic re-refinement)
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Summary display** (AC: 1)
  - [ ] 1.1 Parse refinement output (stats + examples from unified prompt)
  - [ ] 1.2 Display counts and one example per removal type
  - [ ] 1.3 Show word count reduction percentage

- [ ] **Task 2: Review menu** (AC: 2, 3, 4, 5)
  - [ ] 2.1 Present menu: [A]pprove / [R]eject / [V]iew / [E]dit
  - [ ] 2.2 [A]pprove: Update metadata `stage: refined`, `refinement_approved_at`
  - [ ] 2.3 [R]eject: Update metadata `stage: refinement_skipped`, `use_original: true`
  - [ ] 2.4 [V]iew: Display full refined.md content
  - [ ] 2.5 [E]dit: Open refined.md for manual editing, return to menu

**KISS Note:** No toggle-based restoration. No iteration tracking. No re-refinement. Approve, reject, or edit manually.

## Technical Notes

<technical_notes>
**Review Menu (simplified):**
```
REFINEMENT REVIEW

Summary:
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

**Stage State Transitions:**
```
refined_pending_review
    │
    ├── [A]pprove ──▶ refined (proceed to Epic 2 with refined.md)
    │
    ├── [R]eject ───▶ refinement_skipped (proceed to Epic 2 with transcript.md)
    │
    └── [E]dit ─────▶ refined_pending_review (user edits, returns to menu)
```

**Metadata After Approval:**
```yaml
stage: refined
refinement_approved_at: "2026-01-16T10:30:00Z"
refinement_decision: approved
refinement_stats:
  sponsors_removed: 2
  visual_refs_removed: 8
  ads_removed: 3
  intro_cleaned: true
  outro_cleaned: true
  original_words: 4523
  refined_words: 3891
```

**Metadata After Rejection:**
```yaml
stage: refinement_skipped
refinement_rejected_at: "2026-01-16T10:30:00Z"
refinement_decision: rejected
use_original: true
```

**KISS Notes:**
- No toggle-based restoration (if user wants to restore, edit the file)
- No iteration tracking (one-shot refinement)
- No re-refinement loop (edit manually if needed)
- No ASCII art borders (simple text)
</technical_notes>

## Verification

<verification>
```bash
# AC1 - Summary displayed
# Run review, verify counts and examples appear

# AC3 Verification - Approval updates metadata
yq '.stage' libraries/*/metadata.yaml  # Expected: refined
yq '.refinement_approved_at' libraries/*/metadata.yaml  # Expected: timestamp
yq '.refinement_decision' libraries/*/metadata.yaml  # Expected: approved

# AC4 Verification - Rejection sets correct flags
yq '.stage' libraries/*/metadata.yaml  # Expected: refinement_skipped
yq '.use_original' libraries/*/metadata.yaml  # Expected: true
```

### Manual Verification
- [ ] AC1: Summary displays with counts AND one example per type
- [ ] AC2: [V]iew shows full refined content
- [ ] AC3: [A]pprove updates metadata correctly
- [ ] AC4: [R]eject sets use_original: true
- [ ] AC5: [E]dit allows manual editing, returns to menu
</verification>

## Dependencies

- Requires unified refinement prompt (Stories 3.1, 3.2, 3.3 combined)
- Requires refinement output parsing (per Epic Overview output schema)
- Requires refined.md to exist from refinement execution

## References

- [Epic Overview](../overview.md)
- [Unified Prompt Output Schema](../overview.md#unified-prompt-output-schema)
- [PRD FR9](/_bmad-output/planning-artifacts/prd.md)