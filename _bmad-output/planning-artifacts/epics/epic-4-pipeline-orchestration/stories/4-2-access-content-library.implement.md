---
# Plan Status Tracking
story_id: "4-2"
story_name: "access-content-library"
epic: "epic-4-pipeline-orchestration"
epic_path: "_bmad-output/planning-artifacts/epics/epic-4-pipeline-orchestration"
story_path: "_bmad-output/planning-artifacts/epics/epic-4-pipeline-orchestration/stories/4-2-access-content-library.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Access Content Library

## Overview

This story enables users to browse and access their previously processed content. It provides a library listing view, item detail view, and access to the output files (transcript, refined content, audio). This becomes the primary way users interact with accumulated knowledge.

## Critical Technical Decisions

### Architecture Alignment
- Reads from the libraries/ directory structure established in Epic 1
- Uses metadata.yaml as the source of truth for item status
- Presents interactive menu following BMAD patterns

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Display format | Table listing sorted by date desc | Quick scanning, newest first |
| Status values | extracted/refined/audio | Simple, clear progression states |
| Content access | Print file paths to terminal | User opens with their preferred tool |
| Large libraries | Display all (MVP) | Pagination deferred; 20+ items is future problem |

### Risk Areas
- Corrupted metadata.yaml in some items (mitigated: skip with warning)
- Items with missing files (mitigated: check existence before listing)

## High-Level Approach

Scan the libraries/ directory, read metadata.yaml from each subfolder, sort by date descending, and present an interactive browse experience. Item selection shows full details and prints file paths.

### Files Affected
- **Create:** Library browser skill
- **Read:** All `libraries/*/metadata.yaml` files
- **Check:** Content file existence before displaying options

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Epic 1 library structure | Folder and metadata format |
| Internal | `config.yaml` | Output directory location |

## Implementation Phases

### Phase 1: Library Scanning and Display
- Goal: Scan, sort, and display library contents
- Tasks:
  - Scan libraries/ directory for content folders
  - Read metadata.yaml from each folder (skip corrupted with warning)
  - Sort by most recent stage timestamp (newest first)
  - Display formatted table with title, status, date
  - Handle empty library with friendly message

### Phase 2: Item Details and File Access
- Goal: Show item details and provide file paths
- Tasks:
  - Display full metadata for selected item
  - Check which output files actually exist
  - List only existing files as options
  - Print file paths to terminal when selected

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Library listing sorted by date descending | Phase 1 |
| AC2 | Item selection shows full metadata | Phase 2 |
| AC3 | Audio file path printed to terminal | Phase 2 |
| AC4 | Content file paths printed to terminal | Phase 2 |
| AC5 | Empty library shows friendly message | Phase 1 |
| AC6 | Only existing files listed | Phase 2 |

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
4. Test with populated library
5. Test with empty library

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
