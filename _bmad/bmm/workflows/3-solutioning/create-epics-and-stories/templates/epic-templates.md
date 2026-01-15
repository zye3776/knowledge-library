# Epic Templates

Templates for epic folder structure files.

---

## overview.md

```markdown
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
```

---

## sprint-status.yaml

```yaml
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
```
