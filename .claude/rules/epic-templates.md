---
paths:
  - "_bmad-output/planning-artifacts/epics/**/overview.md"
  - "_bmad-output/planning-artifacts/epics/**/sprint-status.yaml"
---

# Epic Templates

<critical_rules>
## Epics Define WHAT, Not HOW

Epics and stories describe requirements and acceptance criteria only. Implementation details (architecture, code patterns, file structures) are created separately in implementation plans.

## XML Tags

| Tag | Purpose |
|-----|---------|
| `<constraints>` | Scope boundaries |
| `<nfr>` | Non-functional requirements |
| `<risks>` | Risk assessment |
| `<dependencies>` | Epic/external dependencies |
</critical_rules>

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
story_location: _bmad-output/planning-artifacts/epics/epic-{N}-{slug}/stories

development_status:
  epic-{N}: backlog
  {N}-1-{slug}: ready-for-dev
  {N}-2-{slug}: backlog
```

<system_reminder>
Epics define WHAT needs to be done, not HOW. No architecture diagrams, code patterns, file structures, or implementation details. Implementation plans are created separately.
</system_reminder>
