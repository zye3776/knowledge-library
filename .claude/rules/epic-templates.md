---
paths:
  - "_bmad-output/planning-artifacts/**"
  - "_bmad-output/planning-artifacts/epics/**"
---

# Epic File Templates

## overview.md Template

```markdown
# Technical Specification: Epic {N} - {Title}

**Epic:** {Short description}
**Author:** {Agent name}
**Date:** {YYYY-MM-DD}
**Version:** 1.0

---

## Overview

{2-3 sentence summary of what this epic accomplishes}

### Objectives

1. {Objective 1}
2. {Objective 2}
3. {Objective 3}

### Scope

**In Scope:**
- {Item 1}
- {Item 2}

**Out of Scope:**
- {Item 1}
- {Item 2}

---

## Architecture Alignment

### High-Level Architecture

```
{ASCII diagram showing system components and data flow}
```

### Project Structure

```
{Directory tree showing files to create/modify}
```

### Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| {Layer} | {Tech} | {Ver} | {Notes} |

---

## Stories Summary

| Story | Title | Priority | Dependencies |
|-------|-------|----------|--------------|
| {N}.1 | {Title} | P0 | None |
| {N}.2 | {Title} | P0 | {N}.1 |

---

## Detailed Design

### Story {N}.1: {Title}

**Objective:** {What this story accomplishes}

**Implementation:**
- {Key implementation detail 1}
- {Key implementation detail 2}

**Code Pattern:**
```typescript
// Example code showing expected implementation pattern
```

{Repeat for each story}

---

## Data Models

### {ModelName}

```typescript
interface {ModelName} {
  field: type
}
```

---

## Non-Functional Requirements

### Performance
- {Measurable performance requirement}

### Security
- {Security requirement}

### Reliability
- {Reliability requirement}

---

## Acceptance Criteria Traceability

| AC | Description | Story |
|----|-------------|-------|
| {N}.1.1 | {Description} | {N}.1 |
| {N}.1.2 | {Description} | {N}.1 |

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| {Risk} | {H/M/L} | {H/M/L} | {Mitigation} |

---

## Dependencies

### Epic Dependencies
- **Epic {X}**: {Description}

### External Dependencies
- {Package/service name}

---

## References

- {Link to relevant documentation}
```

---

## sprint-status.yaml Template

```yaml
# generated: {YYYY-MM-DD}
# project: {project_name}
# project_key: {project_key}
# tracking_system: file-system
# story_location: _bmad-output/planning-artifacts/epics/epic-{N}-{slug}/stories

# STATUS DEFINITIONS:
# ==================
# Epic Status:
#   - backlog: Epic not yet started
#   - in-progress: Epic actively being worked on
#   - done: All stories in epic completed
#
# Story Status:
#   - backlog: Story only exists in epic file
#   - draft: Story file created, not yet started
#   - ready-for-dev: Story ready for implementation
#   - in-progress: Developer actively working on implementation
#   - review: Ready for code review
#   - done: Story completed

# WORKFLOW NOTES:
# ===============
# - Sequential execution: one story at a time
# - Each story goes through: dev-story -> code-review -> commit
# - Update status as work progresses

generated: {YYYY-MM-DD}
project: {project_name}
project_key: {project_key}
tracking_system: file-system
story_location: _bmad-output/planning-artifacts/epics/epic-{N}-{slug}/stories

development_status:
  epic-{N}: backlog
  {N}-1-{slug}: ready-for-dev
  {N}-2-{slug}: backlog
  {N}-3-{slug}: backlog
```

---

## stories/index.md Template

```markdown
# Epic {N}: {Title} - Stories Index

## Overview

{1-2 sentence summary}

## Stories

| # | Story | Priority | Status | Dependencies |
|---|-------|----------|--------|--------------|
| {N}.1 | [{Title}](./{N}-1-{slug}.md) | P0 | ready-for-dev | None |
| {N}.2 | [{Title}](./{N}-2-{slug}.md) | P0 | backlog | {N}.1 |

## Dependency Graph

```
{N}.1 ({Title}) ──────┬──────────────────> {N}.2 ({Title})
                      │                           │
                      └──────────────────> {N}.3 ({Title})
```

## Implementation Order

### Sprint 1: Foundation
1. **{N}.1** - {Title} (P0)
2. **{N}.2** - {Title} (P0)

### Sprint 2: Core Functionality
3. **{N}.3** - {Title} (P0)

## Quick Start Commands

```bash
# {Command description}
{command}
```

## Architecture Summary

```
{ASCII diagram of relevant architecture}
```

## References

- [Epic {N} Overview](../overview.md)
```

---

## Story File Template ({N}-{M}-{slug}.md)

```markdown
# Story {N}.{M}: {Title}

Status: ready-for-dev

## Story

As a **{user_type}**,
I want {capability},
so that {value_benefit}.

## Background

{Optional: Context, current state, why this change is needed}

## Acceptance Criteria

1. **AC1:** {Criterion with measurable outcome}
2. **AC2:** {Criterion with measurable outcome}
3. **AC3:** {Criterion with measurable outcome}

## Tasks / Subtasks

- [ ] **Task 1: {Task Title}** (AC: 1)
  - [ ] 1.1 {Subtask description}
  - [ ] 1.2 {Subtask description}

- [ ] **Task 2: {Task Title}** (AC: 2, 3)
  - [ ] 2.1 {Subtask description}
  - [ ] 2.2 {Subtask description}

- [ ] **Task 3: Unit Tests** (AC: 1-3)
  - [ ] 3.1 {Test description}
  - [ ] 3.2 {Test description}

## Dev Notes

### {Implementation Section Title}

{Implementation guidance, code patterns, or technical context}

```typescript
// Example code pattern
```

### {Another Section}

{More implementation details}

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `{path}` | Create | {Description} |
| `{path}` | Modify | {Description} |
| `{path}` | Delete | {Description} |

### Testing Strategy

{How to test this story - unit tests, integration tests, manual verification}

```typescript
// Test example
```

### Measurable Outcomes

```bash
# AC1 Verification
{command}  # Expected: {result}

# AC2 Verification
{command}  # Expected: {result}

# AC3 Verification
{command}  # Expected: {result}
```

### Project Structure Notes

- {Important project conventions to follow}
- {File naming patterns}
- {Import conventions (e.g., ESM .js extensions)}

### References

- [Epic {N} Overview](../overview.md)
- [{Related Story}](./{N}-{X}-{slug}.md)
- {External documentation links}

---

## Dev Agent Record

### Context Reference

- [Epic {N} Overview](../overview.md)

### Agent Model Used

{model_id}

### Debug Log References

{Links to any debug logs if applicable}

### Completion Notes List

- **{Category}**: {Description of what was done}
- **{Category}**: {Description}

### Technical Implementation Notes

{Detailed notes about implementation decisions, KISS compliance, build/test results}

### File List

**Production Files:**
- `{file_path}` - {Description}

**Test Files:**
- `{file_path}` - {Description}

### Change Log

- {YYYY-MM-DD}: Story implemented by {Agent}
- {YYYY-MM-DD}: Story drafted
```
