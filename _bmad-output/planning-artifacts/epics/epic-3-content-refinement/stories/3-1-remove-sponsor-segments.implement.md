---
# Plan Status Tracking
story_id: "3-1"
story_name: "remove-sponsor-segments"
epic: "epic-3-content-refinement"
epic_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement"
story_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement/stories/3-1-remove-sponsor-segments.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: ready
iteration: 3
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Remove Sponsor Segments

## Overview

Write Section A of the unified refinement prompt. One deliverable: markdown text that defines sponsor detection and preservation rules.

**KISS Principle Applied:** No separate test fixtures. No phased approach. Write the prompt section.

## Critical Technical Decisions

### Architecture Alignment

<critical_rules>
**One Deliverable:** Section A of the unified refinement prompt.

This is prompt authoring, not software implementation. Claude already knows how to detect sponsors. We're writing instructions that guide that capability.
</critical_rules>

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deliverable | One prompt section | KISS - no test fixtures for LLM behavior |
| Testing | Unified prompt tested in 3.4 | Test output, not isolated rules |

## High-Level Approach

Write Section A markdown. Include detection criteria, preservation criteria, and examples. Specify output format for stats.

### Files to Create

| File | Purpose |
|------|---------|
| Section A text (in unified prompt file) | Sponsor removal rules |

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Stories | 3.2, 3.3 | Combined into unified prompt |
| Epic | Output schema | Defined in Epic Overview |

## Implementation

### Single Phase: Write Section A

**Deliverable:** Section A markdown for unified prompt

```markdown
## Section A: Sponsor Removal Rules

### What to REMOVE
Sponsor segments are promotional content where the creator endorses a product/service for payment:
- "This video is sponsored by..."
- "Thanks to [Company] for sponsoring..."
- "Use code [X] for [N]% off..."
- "Check out [Company] at the link below..."
- Discount codes and affiliate mentions

Remove the ENTIRE sponsor segment, not just trigger phrases.

### What to PRESERVE
Technical product mentions are NOT sponsors:
- "We're using Redis for caching in this architecture"
- "Install the NordVPN CLI for this VPN example"
- "I recommend reading the Kubernetes docs"

PRESERVE these - they're educational, not promotional.

### Decision Logic
```
IF mention includes explicit sponsorship language OR discount codes OR affiliate CTAs:
  → REMOVE entire segment
IF mention is technical explanation or educational reference:
  → PRESERVE
```

### Output
Report `sponsors_removed` count and one example in the stats section.
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Sponsors removed | Detection criteria |
| AC2 | Technical mentions preserved | Preservation criteria |
| AC3 | Original preserved | Unified skill writes to refined.md |
| AC4 | Stats recorded | Output specification |
| AC5 | Natural transitions | Unified prompt handles |

## Agent Instructions

### Workflow
1. Write Section A markdown as shown above
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
  kiss_compliant: true  # Collapsed 3 phases to 1 deliverable
```
