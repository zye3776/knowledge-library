---
paths:
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
---

# Story File Templates

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

## Technical Decisions

{Architecture choices, technology selections, component placement decisions}

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

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `{path}` | Create | {Description} |
| `{path}` | Modify | {Description} |
| `{path}` | Delete | {Description} |

### Testing Strategy

{How to test this story - unit tests, integration tests, manual verification}

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
- {Import conventions}

### References

- [Epic {N} Overview](../overview.md)
- [{Related Story}](./{N}-{X}-{slug}.md)

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

---

## Stories Index Template (stories/index.md)

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

### Phase 1: Foundation
1. **{N}.1** - {Title} (P0)
2. **{N}.2** - {Title} (P0)

### Phase 2: Core Functionality
3. **{N}.3** - {Title} (P0)

## Quick Start Commands

```bash
# Check status
/bmad:bmm:workflows:sprint-status

# Start story
/bmad:bmm:workflows:dev-story
```

## References

- [Epic {N} Overview](../overview.md)
```
