# Story 3.2: Remove Visual References

Status: ready

## Story

As a **knowledge library user**,
I want unexplained visual references removed from my transcript,
So that when listening to audio, I don't encounter confusing references to things I cannot see.

## Background

Video transcripts often contain phrases like "as you can see here" or "look at this diagram" that make no sense in an audio-only format. These references break the listening experience because the visual context is unavailable. The system identifies and removes these references while preserving any verbal explanations that accompany them.

This story defines the **visual reference rules** for the unified refinement prompt. See [Epic Overview](../overview.md) for the single-pass architecture decision.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a transcript with unexplained visual references ("as you can see"), when refinement is applied, then these phrases are removed
2. **AC2:** Given a transcript with explained visuals ("as you can see, the function returns an array"), when refinement is applied, then the explanation is preserved while the "as you can see" prefix is removed
3. **AC3:** Given a transcript with visual references, when refinement is applied, then sentences remain grammatically correct after removal
4. **AC4:** Given refinement completion, when metadata is updated, then `refinement_stats.visual_refs_removed` contains the count
5. **AC5:** Given content removal, when transitions are evaluated, then they meet the [Transition Quality Criteria](../overview.md#transition-quality-criteria)
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Write Section B of unified prompt** (AC: 1, 2, 3, 4, 5)
  - [ ] 1.1 Write "Section B: Visual Reference Rules" markdown
  - [ ] 1.2 Define explained vs unexplained classification
  - [ ] 1.3 Define transformation rules (prefix removal, sentence removal)
  - [ ] 1.4 Specify output: count for `visual_refs_removed` + one example

**KISS Note:** One deliverable (prompt section). Grammar preservation is Claude's responsibility. No separate test fixtures.

## Technical Notes

<technical_notes>
**Visual Reference Patterns (Extensive List):**

Common patterns to detect:
- "As you can see here..."
- "Look at this..."
- "On the screen..."
- "In this diagram..."
- "If you look at the code..."
- "The highlighted section shows..."
- "Notice how this..."
- "Let me show you..."
- "Check out this code snippet..."
- "See the arrow pointing to..."
- "The blue box on the left..."
- "Here's what that looks like..."
- "Scroll down to see..."
- "In the screenshot..."
- "The red highlighted line..."

**Classification: Explained vs Unexplained**

| Type | Example | Action |
|------|---------|--------|
| Explained | "As you can see, the function returns an array" | Remove prefix → "The function returns an array" |
| Unexplained | "Look at this next diagram" | Remove entire sentence |
| Partial | "Notice how the error appears here" | If "error" is described → keep description |

**Transformation Rules:**

1. **Prefix Removal (Explained Refs)**
   - Before: "As you can see here, the data flows from left to right."
   - After: "The data flows from left to right."

2. **Sentence Removal (Unexplained Refs)**
   - Before: "Now look at this next diagram."
   - After: [sentence removed entirely]

3. **Grammar Preservation**
   - Before: "Look at line 5, it contains the bug."
   - After: "Line 5 contains the bug."
   - (Restructured to maintain grammatical correctness)

4. **Mid-Sentence Handling**
   - Before: "The function, as you can see, returns a promise."
   - After: "The function returns a promise."

**Severity Consideration:**
Some visual refs are more confusing than others:
- Low confusion: "as you can see" (vague, easily ignored)
- High confusion: "the red highlighted section" (specific, listener searches for it)
Both should be removed, but high confusion refs are higher priority.
</technical_notes>

## Verification

<verification>
### Automated Verification
```bash
# AC4 Verification - Metadata updated
yq '.refinement_stats.visual_refs_removed' libraries/*/metadata.yaml
# Expected: numeric value
```

### LLM-Assisted Verification (Recommended)
```
Prompt: "Review this refined transcript for audio consumption.
Are there any remaining references to visual elements that a
listener cannot see? List any phrases that would confuse an
audio-only listener."

Input: refined.md content
Expected: "No visual references found" or empty list
```

### Test Fixture Verification
```bash
diff refined-output.md fixtures/expected/visual-references.expected.md
```

### Manual Verification
- [ ] AC1: No unexplained visual refs in refined.md
- [ ] AC2: Explanations preserved (check for technical content)
- [ ] AC3: Read aloud - all sentences grammatically complete
- [ ] AC5: Transitions are natural after removal
</verification>

## Dependencies

- Part of unified refinement skill (see [Epic Overview](../overview.md))
- Requires transcript.md to exist in library item folder
- Uses Claude's built-in capabilities (no external dependencies)

## References

- [Epic Overview](../overview.md)
- [PRD FR6, FR8](/_bmad-output/planning-artifacts/prd.md)