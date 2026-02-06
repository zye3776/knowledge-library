---
# Plan Status Tracking
story_id: "5-2"
story_name: "configure-output-directories"
epic: "epic-5-module-foundation"
epic_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation"
story_path: "_bmad-output/planning-artifacts/epics/epic-5-module-foundation/stories/5-2-configure-output-directories.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Configure Output Directories

## Overview

This story enables users to configure where their knowledge library content is stored. It supports relative paths, absolute paths, and home-relative paths (~), with automatic directory creation and permission validation.

## Critical Technical Decisions

### Architecture Alignment
- Path resolution happens at workflow init, not per-operation
- Resolved path used consistently across all file operations
- Falls back to default if config value is missing

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Path styles | Relative, absolute, and ~ | Maximum flexibility for user preferences |
| Missing directory | Auto-create | Reduce friction; user specified the path |
| Permission check | Fail fast | Better error than silent write failure |

### Risk Areas
- Cross-platform path handling (Windows vs Unix)
- Network drives or synced folders (Dropbox) with permission quirks
- Symlinks creating unexpected behavior

## High-Level Approach

Create path resolution utility that handles all path styles. Validate resolved path at workflow init. Create directory if missing. Check write permissions. Use resolved path for all library operations.

### Files Affected
- **Create:** Path resolution utility
- **Modify:** All file operations to use resolved path
- **Read:** `config.yaml` for output.libraries value

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Story 5.1 | Config.yaml must exist |

## Implementation Phases

### Phase 1: Path Resolution
- Goal: Support relative, absolute, and ~ paths
- Output: Utility that resolves any path style to absolute

### Phase 2: Directory Validation
- Goal: Check existence, create if needed, verify permissions
- Output: Validated directory ready for writes

### Phase 3: Integration
- Goal: Use resolved path in all library file operations
- Output: Consistent path usage across workflows

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Custom output directory used | Phase 3 |
| AC2 | Relative paths resolved from project root | Phase 1 |
| AC3 | Absolute paths used directly | Phase 1 |
| AC4 | Invalid path shows clear error | Phase 2 |
| AC5 | Missing directory created automatically | Phase 2 |

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
4. Test with relative, absolute, and ~ paths
5. Test permission error handling

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
