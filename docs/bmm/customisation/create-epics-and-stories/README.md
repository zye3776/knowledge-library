# Create Epics and Stories Workflow Customisation

This folder contains all context needed to re-apply customisations to the BMM `create-epics-and-stories` workflow after BMAD upgrades or reinstallation.

## Purpose

The standard BMAD workflow has been customised for the knowledge-library project with specific requirements around epic/story structure, template organisation, and a "WHAT not HOW" philosophy for story writing.

## Customisation Files

| File | Purpose |
|------|---------|
| [philosophy.md](./philosophy.md) | Core principles - stories describe WHAT, not HOW |
| [structure.md](./structure.md) | Folder structure and file naming conventions |
| [templates.md](./templates.md) | Template content for epic-templates.md and story-templates.md |
| [rules-files.md](./rules-files.md) | `.claude/rules/` files that auto-apply standards |
| [step-updates.md](./step-updates.md) | Specific changes required for each step file |
| [apply-customisation.md](./apply-customisation.md) | Automated instructions for Claude Code |

## Quick Reference

### Key Changes from Default BMAD

1. **Stories are user-focused** - No implementation details, file paths, or code patterns
2. **Epic folder structure** - Individual folders per epic with overview.md, sprint-status.yaml, and stories/
3. **Templates in workflow folder** - Single source of truth, rules reference them
4. **No epics-template.md** - epics/index.md created directly, not from template
5. **Consistent frontmatter** - All 4 step files use identical template reference pattern
6. **Auto-applied rules** - `.claude/rules/` files enforce standards on path patterns

### .claude/rules/ Files

| File | Auto-applies to |
|------|-----------------|
| `epic-standards.md` | `_bmad-output/planning-artifacts/epics/**` |
| `epic-templates.md` | `epics/**/overview.md`, `sprint-status.yaml` |
| `story-standards.md` | `epics/index.md`, `epics/**/stories/**` |
| `story-templates.md` | `epics/index.md`, `epics/**/stories/**` |
| `story-bmad-skill.md` | `epics/**/stories/**` |

### Workflow Location

```
_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/
├── workflow.md
├── steps/
│   ├── step-01-validate-prerequisites.md
│   ├── step-02-design-epics.md
│   ├── step-03-create-stories.md
│   └── step-04-final-validation.md
└── templates/
    ├── epic-templates.md      # For overview.md, sprint-status.yaml
    └── story-templates.md     # For story files, index.md
```

### Output Structure

```
_bmad-output/planning-artifacts/
└── epics/
    ├── index.md                       # Requirements + epic list
    └── epic-{N}-{slug}/
        ├── overview.md
        ├── sprint-status.yaml
        └── stories/
            ├── index.md
            └── {N}-{M}-{slug}.md
```

## Re-applying Customisation

To re-apply after BMAD upgrade:

```
/apply-customisation docs/bmm/customisation/create-epics-and-stories
```

Or manually: Follow instructions in [apply-customisation.md](./apply-customisation.md)
