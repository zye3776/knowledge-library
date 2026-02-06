---
# Plan Status Tracking
story_id: "4-1"
story_name: "run-full-pipeline"
epic: "epic-4-pipeline-orchestration"
epic_path: "_bmad-output/planning-artifacts/epics/epic-4-pipeline-orchestration"
story_path: "_bmad-output/planning-artifacts/epics/epic-4-pipeline-orchestration/stories/4-1-run-full-pipeline.md"
created: "2026-02-05"
last_modified: "2026-02-05"
status: draft
iteration: 1
reviews:
  user_approved: false
  self_check_passed: true
---

# Implementation Plan: Run Full Pipeline

## Overview

This story orchestrates the complete Extract → Refine → Consume pipeline in one session. It chains the capabilities from Epics 1, 2, and 3 in a fire-and-forget flow with no intermediate checkpoints. Users see a completion summary at the end.

## Critical Technical Decisions

### Architecture Alignment
- Uses BMAD step-file workflow architecture for pipeline flow
- Invokes existing Epic 1/2/3 skills rather than duplicating logic
- Saves progress after each stage for error recovery

### Key Trade-offs
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Checkpoint frequency | End only (summary) | Fire-and-forget reduces friction; re-run via 4.3 if needed |
| Stage invocation | Call existing skills | Reuse over duplication; single source of truth |
| Error recovery | Halt with progress saved | Completed stages preserved; user can re-run failed stage |
| Metadata tracking | completed_at per stage only | Minimal tracking; git provides history |

### Risk Areas
- Stage failures mid-pipeline leaving partial state (mitigated: preserve completed work)
- TTS failures after long processing (mitigated: refined.md saved, just re-run consume)

## High-Level Approach

Create an orchestrator workflow that accepts a YouTube URL, invokes each stage in sequence without pausing, displays a completion summary, and tracks stage timestamps in metadata.

### Files Affected
- **Create:** Pipeline orchestrator workflow
- **Modify:** `metadata.yaml` (stage timestamps)
- **Invoke:** Epic 1 extract, Epic 3 refine, Epic 2 consume skills

### Dependencies
| Type | Dependency | Notes |
|------|------------|-------|
| Internal | Epic 1 complete | Extract capability |
| Internal | Epic 2 complete | Consume capability |
| Internal | Epic 3 complete | Refine capability |

## Implementation Phases

### Phase 1: Pipeline Orchestration
- Goal: Create workflow that accepts URL and chains all three stages
- Tasks:
  - Create workflow entry point accepting YouTube URL
  - Invoke extract → refine → consume in sequence
  - Update status and completed_at after each stage
  - Display completion summary (word counts, audio duration)

### Phase 2: Error Handling
- Goal: Handle stage failures gracefully with progress preservation
- Tasks:
  - Catch stage failures and display clear error with stage context
  - Preserve outputs from completed stages
  - Update metadata to reflect partial completion state

## Acceptance Criteria Coverage

| AC # | Criteria Summary | Covered By |
|------|------------------|------------|
| AC1 | Full pipeline runs without intermediate prompts | Phase 1 |
| AC2 | Completion summary with word counts and duration | Phase 1 |
| AC3 | Stage failure shows clear error | Phase 2 |
| AC4 | Completed stage outputs preserved on failure | Phase 2 |
| AC5 | Metadata contains stage timestamps | Phase 1 |

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
4. Test full pipeline with valid YouTube URL
5. Test checkpoint flows (stop at each stage)

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
