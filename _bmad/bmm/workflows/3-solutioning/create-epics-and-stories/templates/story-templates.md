# Story Templates

Templates for story files in epic folders.

---

## 1. Epic Planning Story (in epics.md)

User-focused stories for planning. NO technical details.

```markdown
### Story {N}.{M}: {Title}

As a **{user_type}**,
I want {capability},
So that {value_benefit}.

**Acceptance Criteria:**

**Given** {user context or precondition}
**When** {user action}
**Then** {observable outcome from user perspective}
**And** {additional observable outcome}
```

---

## 2. Story File ({N}-{M}-{slug}.md)

Detailed requirements for a single story.

```markdown
# Story {N}.{M}: {Title}

Status: ready-for-dev

## Story

As a **{user_type}**,
I want {capability},
So that {value_benefit}.

## Background

{Optional: Context, current state, why this change is needed}

## Acceptance Criteria

<acceptance_criteria>
1. **AC1:** {Criterion with measurable outcome}
2. **AC2:** {Criterion with measurable outcome}
3. **AC3:** {Criterion with measurable outcome}
</acceptance_criteria>

## Tasks

- [ ] **Task 1: {Title}** (AC: 1)
  - [ ] 1.1 {Subtask}
  - [ ] 1.2 {Subtask}

- [ ] **Task 2: {Title}** (AC: 2, 3)
  - [ ] 2.1 {Subtask}
  - [ ] 2.2 {Subtask}

- [ ] **Task 3: {Title}** (AC: 1-3)
  - [ ] 3.1 {Subtask}

## Verification

<verification>
```bash
# AC1 Verification
{command}  # Expected: {result}

# AC2 Verification
{command}  # Expected: {result}

# AC3 Verification
{command}  # Expected: {result}
```
</verification>

## References

- [Epic Overview](../overview.md)
```

---

## 3. Stories Index (stories/index.md)

```markdown
# Epic {N}: {Title} - Stories

## Stories

| # | Story | Priority | Status | Dependencies |
|---|-------|----------|--------|--------------|
| {N}.1 | [{Title}](./{N}-1-{slug}.md) | P0 | ready-for-dev | None |
| {N}.2 | [{Title}](./{N}-2-{slug}.md) | P0 | backlog | {N}.1 |

## Dependency Graph

```
{N}.1 ──┬──> {N}.2
        └──> {N}.3
```

## Implementation Order

### Phase 1: Foundation
1. **{N}.1** - {Title}
2. **{N}.2** - {Title}

### Phase 2: Core Functionality
3. **{N}.3** - {Title}

## References

- [Epic Overview](../overview.md)
```
