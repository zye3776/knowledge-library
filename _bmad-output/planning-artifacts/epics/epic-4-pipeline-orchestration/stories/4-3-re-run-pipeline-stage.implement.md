---
# Plan Status Tracking
story_id: "4-3"
story_name: "re-run-pipeline-stage"
epic: "epic-4-pipeline-orchestration"
epic_path: "_bmad-output/planning-artifacts/epics/epic-4-pipeline-orchestration"
story_path: "_bmad-output/planning-artifacts/epics/epic-4-pipeline-orchestration/stories/4-3-re-run-pipeline-stage.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Re-run Pipeline Stage

## Overview

This story enables users to selectively re-run individual pipeline stages on existing content. Use cases include: refinement that removed too much, TTS with wrong voice settings, or source video that was updated. It provides surgical single-stage re-processing.

## Critical Technical Decisions

### Architecture Alignment
- Reuses existing stage skills from Epics 1, 2, 3
- Overwrites existing output files (with confirmation)
- Updates metadata timestamps (git tracks history)

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cascade option | None | Single-stage only; user runs re-run again if needed |
| Overwrite handling | Confirm before replacing | Prevent accidental data loss |
| History tracking | Simple overwrite | Git provides version history; no need for previous_run |
| Prerequisites | Hard requirements | Fail fast with clear error if prerequisites missing |

### Risk Areas
- Re-extract on unavailable video (mitigated: clear error on failure)
- Missing prerequisites (mitigated: check before allowing stage selection)

## High-Level Approach

Add re-run option to library item view (modifies Story 4.2 output). Check prerequisites, present stage selection, confirm overwrite, invoke appropriate stage skill, update timestamp.

### Files Affected
- **Modify:** Library item detail view from Story 4.2 (add re-run option)
- **Overwrite:** Stage-specific output files
- **Modify:** `metadata.yaml` (stage timestamps)

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Story 4.2 | Library detail view to extend |
| Internal | Epic 1/2/3 skills | Stages to re-run |

## Implementation Phases

### Phase 1: Re-run Menu with Prerequisites
- Goal: Add stage selection with prerequisite validation
- Tasks:
  - Add re-run option to library item detail view
  - Check prerequisites before displaying stage options
  - Disable/hide stages with missing prerequisites
  - Show clear prerequisite error if user selects unavailable stage

### Phase 2: Confirmation and Execution
- Goal: Confirm overwrite and execute single stage
- Tasks:
  - Display overwrite warning with file names
  - Require explicit confirmation
  - Invoke appropriate Epic 1/2/3 skill
  - Update stage completed_at timestamp

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Stage selection with confirmation | Phase 1, Phase 2 |
| AC2 | Extract re-run replaces transcript.md | Phase 2 |
| AC3 | Refine re-run regenerates refined.md | Phase 2 |
| AC4 | Consume re-run regenerates audio | Phase 2 |
| AC5 | Metadata timestamp updated | Phase 2 |
| AC6 | Prerequisite error on missing requirements | Phase 1 |

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
4. Test each stage re-run independently
5. Verify metadata history tracking

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
