---
# Plan Status Tracking
story_id: "3-3"
story_name: "remove-ad-content"
epic: "epic-3-content-refinement"
epic_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement"
story_path: "_bmad-output/planning-artifacts/epics/epic-3-content-refinement/stories/3-3-remove-ad-content.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: ready
iteration: 3
reviews:
  user_approved: false
  self_check_passed: true
  kiss_review: true
---

# Implementation Plan: Remove Ad Content

## Overview

Write Section C of the unified refinement prompt. One deliverable: markdown text that defines ad detection, intro cleanup, outro cleanup, and preservation rules.

**KISS Principle Applied:** No 6 phases. One prompt section covering all ad-related rules.

## Critical Technical Decisions

### Architecture Alignment

<critical_rules>
**One Deliverable:** Section C of the unified refinement prompt.

This is the most comprehensive section, but it's still just prompt text.
</critical_rules>

### Key Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Deliverable | One prompt section | KISS - all ad rules together |
| Testing | Unified prompt tested in 3.4 | Test output, not rules |
| Structure | All rules in one section | Unified prompt handles holistically |

## High-Level Approach

Write Section C markdown. Include mid-content ad detection, intro cleanup, outro cleanup, and preservation rules. All in one coherent section.

### Files to Create

| File | Purpose |
|------|---------|
| Section C text (in unified prompt file) | Ad content rules |

### Dependencies

| Type | Dependency | Notes |
|------|------------|-------|
| Stories | 3.1, 3.2 | Combined into unified prompt |
| Epic | Output schema | Defined in Epic Overview |

## Implementation

### Single Phase: Write Section C

**Deliverable:** Section C markdown for unified prompt

```markdown
## Section C: Ad Content Rules

### Mid-Content Ads (REMOVE)
- Subscribe/like CTAs: "Smash that like button", "Hit subscribe"
- Channel promos: "Check out my other videos"
- Merchandise: "T-shirts available at...", "Check out my merch"
- Membership: "Join my Patreon", "Become a channel member"
- Engagement: "Leave a comment below", "Let me know what you think"

### Contextual References (PRESERVE)
- Educational continuity: "As I explained in my video on..."
- Series context: "This builds on what we learned..."
- Recommendations: "Check out the official docs..."

### Intro Cleanup

**Remove:**
- "Hey guys, welcome back!"
- "Smash that subscribe button!"
- Generic greetings and engagement requests

**Preserve:**
- Topic introduction: "Today we're covering authentication patterns"
- Expectation setting: "By the end, you'll understand OAuth 2.0"

**Rule:** Find the first educational sentence. Remove everything promotional before it.

### Outro Cleanup

**Remove:**
- "Don't forget to subscribe!"
- "Like and share this video!"
- "See you in the next one!"

**Preserve:**
- Summaries: "In summary, we covered three key patterns..."
- Future content (educational): "Next week, we'll dive into refresh tokens"
- Contextual references: "I covered this in my previous video"

**Rule:** Find the last educational sentence. Remove everything promotional after it.

### Clean Start/End Requirements
- First sentence should introduce the topic (not "so anyway...")
- Last sentence should be content-related or a summary
- No dangling transitions from removed content

### Output
Report:
- `ads_removed` count
- `intro_cleaned` boolean (true if intro was modified)
- `outro_cleaned` boolean (true if outro was modified)
- One example of removed ad content
```

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Subscribe/like removed | Mid-content rules |
| AC2 | Merch/membership removed | Mid-content rules |
| AC3 | Contextual refs preserved | Preservation rules |
| AC4 | Intro cleaned | Intro cleanup rules |
| AC5 | Outro cleaned | Outro cleanup rules |
| AC6 | Mixed content handled | Unified prompt handles |
| AC7 | Stats recorded | Output specification |

## Agent Instructions

### Workflow
1. Write Section C markdown as shown above
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
  kiss_compliant: true  # Collapsed 6 phases to 1 deliverable
```
