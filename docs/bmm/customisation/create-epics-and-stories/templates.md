# Template Content

These templates should exist in `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/`.

## epic-templates.md

File: `templates/epic-templates.md`

```markdown
# Epic Templates

Templates for epic folder structure files.

---

## overview.md

\`\`\`markdown
# Epic {N}: {Title}

**Author:** {Agent name}
**Date:** {YYYY-MM-DD}

---

## Overview

{2-3 sentence summary of what this epic accomplishes}

### Objectives

1. {Objective 1}
2. {Objective 2}
3. {Objective 3}

### Scope

<constraints>
**In Scope:**
- {Item 1}
- {Item 2}

**Out of Scope:**
- {Item 1}
- {Item 2}
</constraints>

---

## Stories Summary

| Story | Title | Priority | Dependencies |
|-------|-------|----------|--------------|
| {N}.1 | {Title} | P0 | None |
| {N}.2 | {Title} | P0 | {N}.1 |

---

## Non-Functional Requirements

<nfr>
### Performance
- {Measurable performance requirement}

### Security
- {Security requirement}

### Reliability
- {Reliability requirement}
</nfr>

---

## Risks and Mitigations

<risks>
| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| {Risk} | {H/M/L} | {H/M/L} | {Mitigation} |
</risks>

---

## Dependencies

<dependencies>
### Epic Dependencies
- **Epic {X}**: {Description}

### External Dependencies
- {Package/service name}
</dependencies>

---

## References

- {Link to relevant documentation}
\`\`\`

---

## sprint-status.yaml

\`\`\`yaml
# STATUS DEFINITIONS:
# Epic:  backlog | in-progress | done
# Story: backlog | draft | ready-for-dev | in-progress | review | done

generated: {YYYY-MM-DD}
project: {project_name}
project_key: {project_key}
story_location: {planning_artifacts}/epics/epic-{N}-{slug}/stories

development_status:
  epic-{N}: backlog
  {N}-1-{slug}: ready-for-dev
  {N}-2-{slug}: backlog
\`\`\`
```

---

## story-templates.md

File: `templates/story-templates.md`

```markdown
# Story Templates

Templates for story files in epic folders.

---

## 1. Epic Planning Story (in epics.md)

User-focused stories for planning. NO technical details.

\`\`\`markdown
### Story {N}.{M}: {Title}

As a **{user_type}**,
I want {capability},
So that {value_benefit}.

**Acceptance Criteria:**

**Given** {user context or precondition}
**When** {user action}
**Then** {observable outcome from user perspective}
**And** {additional observable outcome}
\`\`\`

---

## 2. Story File ({N}-{M}-{slug}.md)

Detailed requirements for a single story.

\`\`\`markdown
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
\`\`\`bash
# AC1 Verification
{command}  # Expected: {result}

# AC2 Verification
{command}  # Expected: {result}

# AC3 Verification
{command}  # Expected: {result}
\`\`\`
</verification>

## References

- [Epic Overview](../overview.md)
\`\`\`

---

## 3. Stories Index (stories/index.md)

\`\`\`markdown
# Epic {N}: {Title} - Stories

## Stories

| # | Story | Priority | Status | Dependencies |
|---|-------|----------|--------|--------------|
| {N}.1 | [{Title}](./{N}-1-{slug}.md) | P0 | ready-for-dev | None |
| {N}.2 | [{Title}](./{N}-2-{slug}.md) | P0 | backlog | {N}.1 |

## Dependency Graph

\`\`\`
{N}.1 ──┬──> {N}.2
        └──> {N}.3
\`\`\`

## Implementation Order

### Phase 1: Foundation
1. **{N}.1** - {Title}
2. **{N}.2** - {Title}

### Phase 2: Core Functionality
3. **{N}.3** - {Title}

## References

- [Epic Overview](../overview.md)
\`\`\`
```

---

## Deleted Template

The following template was removed and should NOT exist:

- `templates/epics-template.md` - No longer needed; epics.md is created directly in Step 1

## Template Validation

After applying customisation, verify:

1. `templates/epic-templates.md` exists with overview.md and sprint-status.yaml sections
2. `templates/story-templates.md` exists with 3 template sections
3. `templates/epics-template.md` does NOT exist
