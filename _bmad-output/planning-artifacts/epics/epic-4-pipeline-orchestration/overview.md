# Epic 4: Pipeline Orchestration

**Author:** Claude Opus 4.5
**Date:** 2026-01-16

---

## Overview

Users can run the complete Extract -> Refine -> Consume pipeline in a single session with validation checkpoints between stages. This epic also enables users to access and manage their previously processed content library.

### Objectives

1. Orchestrate full pipeline from URL to audio in one session
2. Provide validation checkpoints between pipeline stages
3. Enable access to previously processed content
4. Support selective re-running of pipeline stages

### Scope

<constraints>
**In Scope:**
- Full pipeline orchestration (extract -> refine -> consume)
- Inter-stage validation with user approval
- Content library browsing and retrieval
- Re-running individual stages on existing content

**Out of Scope:**
- Batch processing of multiple URLs
- Scheduled/automated pipeline runs
- Content deletion or cleanup utilities
- Cross-library content management
</constraints>

---

## Stories Summary

| Story | Title | Priority | Dependencies |
|-------|-------|----------|--------------|
| 4.1 | Run Full Pipeline | P0 | None |
| 4.2 | Access Content Library | P0 | None |
| 4.3 | Re-run Pipeline Stage | P1 | 4.1, 4.2 |

---

## Non-Functional Requirements

<nfr>
### Reliability
- Stage failures preserve completed work (no lost progress)
- Clear error messages identify failed stage
- Re-run capability for surgical fixes

### Usability
- Single command to start full pipeline (fire-and-forget)
- Easy navigation of existing content (sorted by date)
- Clear indication of content processing state

### Simplicity
- Linear pipeline flow (no intermediate checkpoints)
- One content item at a time
- Single-stage re-runs (no cascade complexity)

### Testing Strategy (MVP)
- Manual testing only for MVP phase
- Verification scripts provided in story files
- Automation deferred to post-MVP
</nfr>

---

## Risks and Mitigations

<risks>
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| User cancels mid-pipeline | M | M | Save state at each checkpoint |
| Previous stage output missing | M | L | Validate prerequisites before each stage |
| Content library grows large | L | M | Simple folder-based organization |
</risks>

---

## Dependencies

<dependencies>
### Epic Dependencies
- **Epic 1**: Extract stage
- **Epic 2**: Consume stage (audio generation)
- **Epic 3**: Refine stage

### External Dependencies
- None (orchestrates other epics)
</dependencies>

---

## Requirements Traceability

| FR | Description |
|----|-------------|
| FR16 | User can access previously processed content for reference |

---

## References

- [Epics Index](../index.md)
