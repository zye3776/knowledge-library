---
paths:
  - "_bmad-output/planning-artifacts/epics/**/overview.md"
  - "_bmad-output/planning-artifacts/epics/**/sprint-status.yaml"
---

# Epic Templates

<critical_rules>
## Epics Define WHAT, Not HOW

Epics and stories describe requirements and acceptance criteria only. Implementation details (architecture, code patterns, file structures) are created separately in implementation plans.

## Template Location

Templates are defined in the workflow folder:
`_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epic-templates.md`

## XML Tags

| Tag | Purpose |
|-----|---------|
| `<constraints>` | Scope boundaries |
| `<nfr>` | Non-functional requirements |
| `<risks>` | Risk assessment |
| `<dependencies>` | Epic/external dependencies |
</critical_rules>

## Templates Reference

See workflow templates for:
- **overview.md** template
- **sprint-status.yaml** template

<system_reminder>
Epics define WHAT needs to be done, not HOW. No architecture diagrams, code patterns, file structures, or implementation details. Implementation plans are created separately.
</system_reminder>
