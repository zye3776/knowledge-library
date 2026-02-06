---
# Plan Status Tracking
story_id: "5-4"
story_name: "simple-command-invocation"
epic: "epic-5-module-foundation"
epic_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation"
story_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation/stories/5-4-simple-command-invocation.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Simple Command Invocation

## Overview

This story establishes the primary entry point for the knowledge-library module: a simple slash command (/knowledge-library or /kl) that presents the main menu and guides users to available features. It validates prerequisites before showing the menu.

## Critical Technical Decisions

### Architecture Alignment
- Uses Claude Code slash command registration via BMAD skill system
- Checks prerequisites before showing main menu
- Routes to appropriate workflows based on user selection

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Command length | /kl as alias | Quick access for frequent use |
| Prerequisite check | At command start | Fail fast with guidance |
| Menu structure | Flat with clear options | Simple, discoverable UX |

### Risk Areas
- Command name collision with other installed modules
- Prerequisites check adding latency to command start
- Users expecting CLI-style flags (not supported)

## High-Level Approach

Create the main entry point skill that checks prerequisites (config exists, dependencies available), presents the main menu with core actions, and routes to appropriate workflows. Handle missing prerequisites gracefully with init guidance.

### Files Affected
- **Create:** Main command skill/entry point
- **Create:** /kl alias registration
- **Read:** `config.yaml` for prerequisite check

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Story 5.1 | Init capability for missing config |
| Internal | All other stories | Menu routes to their features |

## Implementation Phases

### Phase 1: Command Registration
- Goal: Create /knowledge-library and /kl commands
- Output: Registered slash commands in BMAD module

### Phase 2: Prerequisites Check
- Goal: Validate config and dependencies at start
- Output: Clear guidance if prerequisites missing

### Phase 3: Main Menu
- Goal: Present feature options and route to workflows
- Output: Interactive menu with New/Browse/Pipeline/Settings/Help

### Phase 4: Help System
- Goal: Provide feature explanations
- Output: Help output describing capabilities

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | /knowledge-library and /kl show main menu | Phase 1, 3 |
| AC2 | Menu options route to workflows | Phase 3 |
| AC3 | Missing config prompts init | Phase 2 |
| AC4 | Missing dependencies show guidance | Phase 2 |
| AC5 | Help explains features | Phase 4 |

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
4. Test both command names (/knowledge-library, /kl)
5. Test all menu options route correctly

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
