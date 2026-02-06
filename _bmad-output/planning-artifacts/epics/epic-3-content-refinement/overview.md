# Epic 3: Content Refinement

**Author:** Claude Opus 4.5
**Date:** 2026-01-16
**Last Updated:** 2026-02-05

---

## Overview

Users can clean and refine extracted transcripts by removing sponsor segments, advertisements, and unexplained visual references while preserving all technical terminology and valuable content. This epic delivers the "rephrase" capability that transforms raw transcripts into polished, audio-ready content.

### Objectives

1. Remove sponsor segments from transcripts
2. Remove unexplained visual references ("as you can see...")
3. Remove advertisement content (including intro/outro cleanup)
4. Preserve technical terminology and jargon intact
5. Enable user review before final output

### Scope

<constraints>
**In Scope:**
- AI-assisted identification of sponsor segments
- Detection and removal of visual reference phrases
- Ad content identification and removal
- Intro/outro promotional content cleanup
- Technical term preservation
- User review and approval workflow

**Out of Scope:**
- Automatic transcription correction (grammar, spelling)
- Content summarization or condensation
- Translation to other languages
- Adding content or expanding explanations
</constraints>

---

## Architecture Decision: Unified Refinement

<critical_rules>
### Single-Pass Unified Prompt Architecture

All content refinement (Stories 3.1, 3.2, 3.3) executes as a **single unified prompt** that performs all removal operations in one LLM call.

**Rationale:**
- Single context window ensures consistent understanding of content
- Avoids compounding errors from chained passes
- Lower latency (one API call vs three)
- Transitions are smoothed once, not repeatedly

**Implementation Pattern:**
```
transcript.md → [Unified Refinement Prompt] → refined.md + stats
```

**KISS Simplification:** Stories 3.1, 3.2, 3.3 each produce ONE deliverable: their section of the unified prompt. No separate test fixtures per story - test the unified output.

**Consequence:** Implementation builds ONE prompt file that combines all rules.
</critical_rules>

---

## Unified Prompt Output Schema

<critical_rules>
### Required Output Structure

The unified refinement prompt MUST return structured output that Story 3.4 can parse:

```yaml
# The prompt instructs Claude to output in this format:

---BEGIN REFINED CONTENT---
[The refined transcript text]
---END REFINED CONTENT---

---BEGIN STATS---
sponsors_removed: 2
visual_refs_removed: 8
ads_removed: 3
intro_cleaned: true
outro_cleaned: true
original_words: 4523
refined_words: 3891
---END STATS---

---BEGIN EXAMPLES---
sponsor_example: "This video is sponsored by NordVPN..." (removed from line ~45)
visual_ref_example: "As you can see here..." (removed from line ~23)
ad_example: "Smash that like button..." (removed from line ~312)
---END EXAMPLES---
```

**Parsing:** Story 3.4 splits output on delimiters, extracts:
1. Refined content → saves to `refined.md`
2. Stats → updates `metadata.yaml`
3. Examples → displays in review summary

**This schema is the contract between refinement (3.1-3.3) and review (3.4).**
</critical_rules>

---

## Metadata Schema

<technical_notes>
### Unified Refinement Metadata

All refinement operations update `metadata.yaml` using this schema:

```yaml
# After extraction (from Epic 1)
stage: extracted
extracted_at: "2026-01-16T10:00:00Z"

# After refinement (Stories 3.1-3.3)
stage: refined_pending_review  # Awaiting user review
refined_at: "2026-01-16T10:15:00Z"
refinement_stats:
  sponsors_removed: 2
  visual_refs_removed: 8
  ads_removed: 3
  intro_cleaned: true
  outro_cleaned: true
  original_words: 4523
  refined_words: 3891
  reduction_percent: 14

# After review approval (Story 3.4)
stage: refined
refinement_approved_at: "2026-01-16T10:30:00Z"
refinement_decision: approved  # or 'rejected', 'skipped'

# If rejected - user proceeds with original
stage: refinement_skipped
refinement_decision: rejected
refinement_rejected_at: "2026-01-16T10:30:00Z"
use_original: true
```

### Stage State Machine

```
extracted ──────────────────────────────────────────┐
    │                                               │
    ▼                                               │
refined_pending_review ─────────────────────────────┤
    │                                               │
    ├──[Approve]──▶ refined ──────────────▶ Epic 2  │
    │                                               │
    ├──[Reject]───▶ refinement_skipped ───▶ Epic 2  │
    │               (uses transcript.md)            │
    │                                               │
    └──[Exit]─────▶ refined_pending_review ─────────┘
                    (workflow paused, resumable)
```

**Valid Stage Values:**
- `extracted` - Transcript exists, no refinement attempted
- `refined_pending_review` - Refinement complete, awaiting user decision
- `refined` - User approved refinement, use refined.md
- `refinement_skipped` - User rejected refinement, use transcript.md

**Epic 2 Compatibility:**
Epic 2 (Audio Consumption) checks `stage` and `use_original` to determine source file:
- If `stage: refined` → use `refined.md`
- If `stage: refinement_skipped` AND `use_original: true` → use `transcript.md`
- If `stage: extracted` → prompt user to run refinement or skip
</technical_notes>

---

## Transition Quality Criteria

<acceptance_criteria>
### Definition of "Natural Transitions"

After content removal, transitions are considered natural when:

1. **No orphaned references:** Sentences don't reference removed content
   - ❌ "As I mentioned, this is important" (what was mentioned?)
   - ✅ "This pattern is important because..."

2. **No abrupt topic shifts:** Logical flow is maintained
   - ❌ "...and that's caching. Now let's discuss authentication."
   - ✅ "...and that's caching. Building on this, authentication also benefits from..."

3. **No incomplete thoughts:** All sentences are grammatically complete
   - ❌ "The function returns" (returns what?)
   - ✅ "The function returns an array of user objects."

4. **No awkward starts/ends:** Content begins with topic context, ends with conclusion
   - ❌ Audio starts: "...so anyway, let's get into it"
   - ✅ Audio starts: "Today we're exploring three authentication patterns"

**Verification:** Human review during Story 3.4, with specific transition check as part of approval flow.
</acceptance_criteria>

---

## Test Fixtures Requirement

<technical_notes>
### Sample Transcripts for Testing

Implementation MUST include test fixtures at:
```
.claude/skills/content-refinement/fixtures/
├── sponsor-segments.md      # Known sponsor patterns
├── visual-references.md     # Explained and unexplained refs
├── ad-content.md            # Subscribe, merch, engagement
├── mixed-content.md         # All types combined
├── false-positives.md       # Technical mentions that look like ads
└── expected/                # Expected outputs for each
    ├── sponsor-segments.expected.md
    ├── visual-references.expected.md
    └── ...
```

**Each fixture includes:**
- Input transcript with marked segments
- Expected output after refinement
- Removal counts for verification

**False Positive Test Cases:**
- "We're using NordVPN in our architecture" (technical, not sponsor)
- "The subscribe method on the observable" (API, not CTA)
- "Check out the Redis documentation" (educational, not promo)
- "As you can see, the function returns JSON" (explained visual ref)
</technical_notes>

---

## Stories Summary

| Story | Title | Priority | Dependencies | Notes |
|-------|-------|----------|--------------|-------|
| 3.1 | Remove Sponsor Segments | P0 | None | Defines sponsor rules for unified prompt |
| 3.2 | Remove Visual References | P0 | None | Defines visual ref rules for unified prompt |
| 3.3 | Remove Ad Content | P0 | None | Defines ad/intro/outro rules for unified prompt |
| 3.4 | Review Refined Content | P0 | 3.1, 3.2, 3.3 | User review gate before Epic 2 |

**Implementation Note:** Stories 3.1, 3.2, 3.3 are logically parallel (define rules independently) but are implemented together in a single unified refinement skill. Story 3.4 executes after unified refinement completes.

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│              UNIFIED REFINEMENT SKILL               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ 3.1     │  │ 3.2     │  │ 3.3     │  (Rules)    │
│  │Sponsors │  │Visual   │  │Ads/     │             │
│  │         │  │Refs     │  │Intro    │             │
│  └────┬────┘  └────┬────┘  └────┬────┘             │
│       │            │            │                   │
│       └────────────┼────────────┘                   │
│                    │                                │
│                    ▼                                │
│           [Single LLM Call]                         │
│                    │                                │
│                    ▼                                │
│              refined.md                             │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │     3.4      │
              │   Review     │
              └──────────────┘
                     │
                     ▼
                  Epic 2
```

---

## Non-Functional Requirements

<nfr>
### Reliability
- Original transcript preserved (refinement creates new file)
- Clear indication of what was removed (counts + examples)
- User can reject refinements and keep original
- Workflow state persisted for resume capability

### Quality
- Technical terminology must never be removed
- Context around removed content flows naturally (see Transition Quality Criteria)
- No broken sentences or awkward transitions
- Intro/outro cleanup preserves topic-setting content

### Simplicity
- Single unified refinement pass
- Clear before/after comparison with examples
- Maximum 3 re-refinement attempts before manual intervention required
</nfr>

---

## Risks and Mitigations

<risks>
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Valuable content incorrectly identified as sponsor | H | M | User review with specific examples shown |
| Technical terms removed by accident | H | L | Explicit preservation rules + test fixtures |
| Transitions become awkward after removal | M | M | Transition quality criteria + human review |
| Over-aggressive removal leaves little content | M | L | Word count comparison in summary |
| Intro topic-setting removed with promotional content | M | M | Separate rules for promotional vs educational intros |
| Re-refinement loops indefinitely | L | L | Max 3 iteration limit enforced |
</risks>

---

## Dependencies

<dependencies>
### Epic Dependencies
- **Epic 1**: Requires extracted transcript to refine

### External Dependencies
- None (uses Claude's built-in capabilities)
</dependencies>

---

## Requirements Traceability

| FR | Description | Story |
|----|-------------|-------|
| FR5 | System can identify and remove sponsor segments from transcripts | 3.1 |
| FR6 | System can identify and remove unexplained visual references | 3.2 |
| FR7 | System can identify and remove ad content from transcripts | 3.3 |
| FR8 | System can preserve all technical terminology and jargon intact | 3.1, 3.2, 3.3 |
| FR9 | User can review processed content before consumption | 3.4 |

---

## References

- [Epics Index](../index.md)
- [Stories Index](./stories/index.md)
