# Epic 3: Content Refinement - Stories

## KISS Architecture Note

<critical_rules>
**Simplified deliverables:**

- Stories 3.1, 3.2, 3.3 each produce ONE thing: a section of the unified refinement prompt
- Story 3.4 parses output and handles user review
- No separate test fixtures per story - test unified output

**Output Schema:** See [Epic Overview - Unified Prompt Output Schema](../overview.md#unified-prompt-output-schema)
</critical_rules>

## Stories

| # | Story | Priority | Status | Deliverable |
|---|-------|----------|--------|-------------|
| 3.1 | [Remove Sponsor Segments](./3-1-remove-sponsor-segments.md) | P0 | ready | Section A of unified prompt |
| 3.2 | [Remove Visual References](./3-2-remove-visual-references.md) | P0 | ready | Section B of unified prompt |
| 3.3 | [Remove Ad Content](./3-3-remove-ad-content.md) | P0 | ready | Section C of unified prompt |
| 3.4 | [Review Refined Content](./3-4-review-refined-content.md) | P0 | ready | Review workflow step |

## Dependency Graph

```
3.1 (Section A) ──┐
                  │
3.2 (Section B) ──┼──▶ [Unified Prompt] ──▶ refined.md + stats
                  │
3.3 (Section C) ──┘
                              │
                              ▼
                    3.4 (Parse & Review)
                              │
                              ▼
                           Epic 2
```

## Implementation Order

### Phase 1: Write Prompt Sections
Write prompt text (parallel, no dependencies):
1. **3.1** - Section A: Sponsor removal rules
2. **3.2** - Section B: Visual reference rules
3. **3.3** - Section C: Ad content rules

### Phase 2: Combine & Review
4. Combine sections into unified refinement prompt file
5. **3.4** - Review workflow (parses output, handles A/R/V/E menu)

## Unified Prompt Structure

```markdown
# Content Refinement Prompt

## Task
Analyze the transcript and remove noise while preserving educational content.

## Section A: Sponsor Removal Rules
[From Story 3.1]

## Section B: Visual Reference Rules
[From Story 3.2]

## Section C: Ad Content Rules
[From Story 3.3]

## Output Format
[Delimited sections per Epic Overview schema]
```

## References

- [Epic Overview](../overview.md)
- [Unified Prompt Output Schema](../overview.md#unified-prompt-output-schema)
