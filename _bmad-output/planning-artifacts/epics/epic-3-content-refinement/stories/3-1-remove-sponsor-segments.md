# Story 3.1: Remove Sponsor Segments

Status: ready

## Story

As a **knowledge library user**,
I want sponsor segments automatically identified and removed from my transcript,
So that I can consume the actual content without promotional interruptions.

## Background

YouTube content creators often include sponsor reads ("This video is sponsored by..."). These segments break the flow of educational content and add no value when consuming via audio. The system uses Claude's language understanding to identify and remove these segments while preserving all surrounding context.

This story defines the **sponsor detection rules** for the unified refinement prompt. See [Epic Overview](../overview.md) for the single-pass architecture decision.

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** Given a transcript containing sponsor segments, when refinement is applied, then sponsor segments are removed and the surrounding content flows naturally
2. **AC2:** Given a transcript with technical product mentions that are NOT sponsors, when refinement is applied, then these mentions are preserved intact
3. **AC3:** Given a transcript with sponsor segments, when refinement is applied, then original transcript.md is preserved and changes are written to refined.md
4. **AC4:** Given successful refinement, when the process completes, then metadata.yaml records `refinement_stats.sponsors_removed` count
5. **AC5:** Given content removal, when transitions are evaluated, then they meet the [Transition Quality Criteria](../overview.md#transition-quality-criteria) (no orphaned refs, no incomplete thoughts)
</acceptance_criteria>

## Tasks

- [ ] **Task 1: Write Section A of unified prompt** (AC: 1, 2, 3, 4, 5)
  - [ ] 1.1 Write "Section A: Sponsor Removal Rules" markdown
  - [ ] 1.2 Include detection criteria with examples
  - [ ] 1.3 Include preservation rules for technical mentions
  - [ ] 1.4 Specify output: count for `sponsors_removed` + one example

**KISS Note:** One deliverable (prompt section). No separate test fixtures - test unified prompt output in Story 3.4.

## Technical Notes

<technical_notes>
**Sponsor Detection Patterns (Context-Based):**

Sponsors are identified by CONTEXT, not just keywords. The AI must understand:
- Explicit sponsor acknowledgments with promotional intent
- Mid-content promotional breaks
- Discount codes and affiliate mentions

**Common Patterns to REMOVE:**
- "This video is sponsored by..."
- "Thanks to [Company] for sponsoring..."
- "Before we continue, a word from our sponsor..."
- "Use code [X] for discount..."
- "Check out [Company] at the link below..."
- "Speaking of [topic], our sponsor [Company]..."

**What to PRESERVE (NOT sponsors):**
- Technical tool discussions: "We're using Redis for caching in this architecture"
- Open source mentions: "Install the NordVPN CLI tool for this VPN example"
- Educational recommendations: "I recommend reading the Kubernetes docs"
- Personal tool preferences: "I use VS Code for this kind of work"

**Detection Logic:**
```
IF mention includes:
  - Explicit sponsorship language ("sponsored by", "thanks to X for sponsoring")
  - Discount/promo codes ("use code", "% off", "link in description for discount")
  - Call-to-action with affiliate context ("check out at", "sign up using my link")
THEN → SPONSOR (remove)

IF mention is:
  - Technical explanation using product ("configuring NordVPN in the cluster")
  - Educational reference ("see the Redis documentation")
  - Tool recommendation without promo context ("I like using Figma for this")
THEN → TECHNICAL (preserve)
```

**Output Location:**
```
libraries/{slug}/
├── transcript.md   # Original - NEVER modify
└── refined.md      # Cleaned content - created/updated here
```
</technical_notes>

## Verification

<verification>
### Automated Verification
```bash
# AC3 Verification - Original preserved
test -f libraries/*/transcript.md && echo "PASS: Original preserved"
test -f libraries/*/refined.md && echo "PASS: Refined created"

# AC4 Verification - Metadata updated
yq '.refinement_stats.sponsors_removed' libraries/*/metadata.yaml
# Expected: numeric value (0 or higher)
```

### LLM-Assisted Verification (Recommended)
```
Prompt: "Review this refined transcript. Are there any remaining
sponsor segments? List any sponsor-like content that was NOT removed."

Input: refined.md content
Expected: "No sponsor segments found" or empty list
```

### Test Fixture Verification
```bash
# Run refinement on test fixture
# Compare output to expected
diff refined-output.md fixtures/expected/sponsor-segments.expected.md
```

### Manual Verification
- [ ] AC1: Read refined.md aloud - no sponsor interruptions
- [ ] AC2: Technical mentions preserved (grep for test terms)
- [ ] AC5: Transitions flow naturally - no orphaned references
</verification>

## Dependencies

- Part of unified refinement skill (see [Epic Overview](../overview.md))
- Requires transcript.md to exist in library item folder
- Uses Claude's built-in capabilities (no external dependencies)

## References

- [Epic Overview](../overview.md)
- [PRD FR5, FR8](/_bmad-output/planning-artifacts/prd.md)
