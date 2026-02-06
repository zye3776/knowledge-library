---
# Plan Status Tracking
story_id: "5-1"
story_name: "initialize-project-config"
epic: "epic-5-module-foundation"
epic_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation"
story_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation/stories/5-1-initialize-project-config.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Initialize Project Configuration

## Overview

This story creates the initialization workflow that sets up a new knowledge-library project. It generates config.yaml with sensible defaults, creates the required directory structure, and validates that dependencies (yt-dlp, OPENAI_API_KEY) are available.

## Critical Technical Decisions

### Architecture Alignment
- Creates config.yaml in project root (following BMAD module pattern)
- Uses libraries/ as default content folder (configurable)
- Validates environment before allowing tool usage

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Config format | YAML with comments | Human-readable, self-documenting |
| Dependency check | Warning not blocking | Allow setup even without deps configured |
| Existing config | Prompt for action | Don't silently overwrite user config |

### Risk Areas
- User has no write permission in project directory
- Dependencies installed but not in PATH
- Config file syntax errors after manual editing

## High-Level Approach

Create an init skill that generates config.yaml from a template, creates the libraries/ directory, checks for yt-dlp and OPENAI_API_KEY, and reports status. Handle existing config gracefully with user choice.

### Files Affected
- **Create:** `config.yaml` in project root
- **Create:** `libraries/` directory
- **Check:** yt-dlp in PATH, OPENAI_API_KEY in environment

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| External | yt-dlp | Must be installed for extraction |
| Env Var | OPENAI_API_KEY | Required for TTS |

## Implementation Phases

### Phase 1: Config Template
- Goal: Create config.yaml with all options and comments
- Output: Well-documented default configuration

### Phase 2: Directory Setup
- Goal: Create libraries/ and any other required directories
- Output: Ready project structure

### Phase 3: Dependency Validation
- Goal: Check yt-dlp and OPENAI_API_KEY availability
- Output: Clear status with installation guidance

### Phase 4: Existing Config Handling
- Goal: Handle pre-existing config gracefully
- Output: Keep/Reset/Cancel options

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Config.yaml created with sensible defaults | Phase 1 |
| AC2 | Libraries directory created | Phase 2 |
| AC3 | Dependencies checked (yt-dlp, API key) | Phase 3 |
| AC4 | Missing dependency shows clear instructions | Phase 3 |
| AC5 | Existing config prompts for action | Phase 4 |

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
4. Test fresh initialization
5. Test with existing config

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
