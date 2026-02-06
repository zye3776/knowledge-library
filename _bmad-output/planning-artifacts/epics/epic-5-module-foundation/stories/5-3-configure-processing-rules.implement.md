---
# Plan Status Tracking
story_id: "5-3"
story_name: "configure-processing-rules"
epic: "epic-5-module-foundation"
epic_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation"
story_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation/stories/5-3-configure-processing-rules.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Configure Processing Rules

## Overview

This story enables users to configure default content refinement rules. Users can enable or disable removal of sponsors, visual references, and ad content via config.yaml. These defaults apply to all refinements unless overridden.

## Critical Technical Decisions

### Architecture Alignment
- Processing rules read from config.yaml at refinement time
- Defaults defined in code (all true) if config missing
- Rules modify the refinement prompt dynamically

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Default behavior | All removals enabled | Matches core value prop of clean audio |
| Rule application | Prompt modification | Single refinement pass with selected rules |
| All rules disabled | Copy transcript to refined | Skip refinement entirely |

### Risk Areas
- Users forgetting they disabled a rule and wondering why content isn't clean
- Invalid config values (non-boolean) causing errors
- Future per-item overrides creating complexity

## High-Level Approach

Read processing section from config.yaml. Merge with defaults for missing values. Pass enabled rules to refinement prompt builder. Conditionally include detection instructions based on enabled rules.

### Files Affected
- **Modify:** Refinement skill to read config
- **Modify:** Refinement prompt to be rule-aware
- **Read:** `config.yaml` for processing section

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Story 5.1 | Config.yaml structure |
| Internal | Epic 3 | Refinement capabilities |

## Implementation Phases

### Phase 1: Config Reading
- Goal: Read and validate processing rules from config
- Output: Typed configuration object with defaults

### Phase 2: Dynamic Prompt Building
- Goal: Include/exclude detection rules based on config
- Output: Rule-aware refinement prompt

### Phase 3: Default Handling
- Goal: Handle missing section or values gracefully
- Output: Consistent behavior with or without config

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | remove_sponsors: false preserves sponsors | Phase 2 |
| AC2 | remove_visual_refs: false preserves visual refs | Phase 2 |
| AC3 | remove_ads: false preserves ads | Phase 2 |
| AC4 | All true (default) removes all noise | Phase 2 |
| AC5 | Missing section uses defaults | Phase 3 |

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
4. Test each rule toggle independently
5. Test missing config section

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
```
