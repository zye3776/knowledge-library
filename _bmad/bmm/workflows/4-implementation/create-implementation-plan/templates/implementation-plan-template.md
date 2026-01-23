---
# Plan Status Tracking
story_id: "{story_id}"
story_name: "{story_name}"
epic: "{epic_name}"
epic_path: "{epic_path}"
story_path: "{story_path}"
created: "{created_date}"
last_modified: "{last_modified_date}"
status: draft  # draft | pending_review | approved | in_progress | completed
iteration: 1
reviews:
  user_approved: false
  self_check_passed: false
---

# Implementation Plan: {story_name}

## Overview

[2-3 sentences: What this story delivers, why it matters, how it fits the epic]

## Critical Technical Decisions

[Key decisions requiring senior-level review before auto-development begins]

### Architecture Alignment
- [How this aligns with architecture.md - reference section, don't repeat]

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| [What needed deciding] | [What was chosen] | [Why - 1 sentence] |

### Risk Areas
- [Areas where implementation agents should exercise extra caution]

## High-Level Approach

[Concise description of HOW the story will be implemented - the strategy, not the details]

### Files Affected
- **Create:** [List new files]
- **Modify:** [List existing files]

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| External | [package] | [version if critical] |
| Internal | [module/component] | [why needed] |
| Env Var | [VAR_NAME] | [purpose] |

## Implementation Phases

[High-level phases, NOT detailed step-by-step instructions]

### Phase 1: {Name}
- Goal: [What this phase achieves]
- Output: [Deliverable]

### Phase 2: {Name}
- Goal: [What this phase achieves]
- Output: [Deliverable]

[Add phases as needed - typically 2-4]

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | [Brief] | Phase {N} |
| AC2 | [Brief] | Phase {N} |

## Agent Instructions

<critical_rules>
### Coding Standards Reference

**DO NOT include coding standards in this plan.**

Implementation agents MUST load coding standards from:
```
/Users/Z/projects/zees-plugins/plugins/coding-standards/rules
```

Load relevant standards ONLY when about to write code, not during planning.
</critical_rules>

### Agent Workflow
1. Read this plan for context and decisions
2. Before writing code: Load relevant coding standards from path above
3. Implement phase by phase
4. Run tests after each phase
5. Self-review against acceptance criteria

---

## Self-Check (Workflow Use Only)

_This section is populated by the workflow before user review_

```yaml
self_check:
  high_level: false      # Plan is abstract, not detailed instructions
  no_coding_standards: false  # No coding/test standards embedded
  decisions_clear: false # Technical decisions are reviewable
  phases_defined: false  # Implementation phases exist
  ac_mapped: false       # All acceptance criteria covered
  agent_instructions: false  # Agent workflow section present
```
