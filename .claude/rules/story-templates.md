---
paths:
  - "_bmad-output/planning-artifacts/epics.md"
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
---

# Story Templates

<critical_rules>
## Stories Define WHAT, Not HOW

Stories describe requirements and acceptance criteria only. Technical implementation details (code patterns, file structures, architecture) are created separately in implementation plans.

## Template Location

Templates are defined in the workflow folder:
`_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/story-templates.md`

## XML Tags

| Tag | Purpose |
|-----|---------|
| `<acceptance_criteria>` | AC lists |
| `<verification>` | Measurable outcome commands |
| `<constraints>` | Story-specific limitations |
</critical_rules>

## Templates Reference

See workflow templates for:
- **Epic Planning Story** (in epics.md) - User-focused, no technical details
- **Story File** ({N}-{M}-{slug}.md) - Detailed requirements
- **Stories Index** (stories/index.md) - Overview and dependency graph

<constraints>
### DO NOT include in stories:
- File paths or directory structures
- Technology choices or library names
- Code examples or patterns
- Implementation guidance
</constraints>

<system_reminder>
Stories define WHAT needs to be done, not HOW. No code patterns, file structures, Dev Notes, or implementation guidance. Technical implementation plans are created separately.
</system_reminder>
