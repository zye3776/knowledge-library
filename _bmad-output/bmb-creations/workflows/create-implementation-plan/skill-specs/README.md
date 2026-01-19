# Skill Specifications for create-implementation-plan Workflow

This folder contains specifications for skills used by the `create-implementation-plan` workflow.

## Skills Overview

| Skill | Purpose | Status |
|-------|---------|--------|
| `dev-load-project-context` | Load all project docs into memory | Completed |

## Archived Skills (2026-01-19)

The following skills were originally planned but removed during workflow simplification. Reviews are now handled by separate workflows.

| Skill | Location | Reason |
|-------|----------|--------|
| `dev-opencode-review` | Deleted | Use `code-review` workflow instead |
| `dev-party-mode-review` | `_bmad-output/archive/skills/` | Use `party-mode` workflow instead |

## Execution Flow (Simplified)

```
create-implementation-plan workflow
         │
         ▼
┌─────────────────────────────────────────┐
│  Step 05: Process Stories               │
│                                         │
│  FOR EACH story:                        │
│    1. Load context (dev-load-project-   │
│       context skill)                    │
│    2. Generate plan (inline)            │
│    3. Save {story}.implement.md         │
└─────────────────────────────────────────┘
```

## Post-Generation Review (Optional)

After generating plans, use separate workflows to review:

- `code-review` - Adversarial code review
- `party-mode` - Multi-agent deliberation

## Specification Files

### dev-load-project-context.spec.md

**Purpose:** Load all required project context documents for implementation plan generation.

| Aspect | Details |
|--------|---------|
| Context Mode | Inline (no fork) |
| Key Input | `epic_name`, `story_id`, `output_folder` |
| Key Output | Structured context with architecture, prd, story, standards |
| Status | Completed |

## Related Files

- Workflow: `_bmad/bmm/workflows/4-implementation/create-implementation-plan/`
- Skill: `.claude/skills/dev-load-project-context/`
- Template: `_bmad/bmm/workflows/4-implementation/create-implementation-plan/data/implementation-plan-template.md`
- Workflow Plan: `_bmad-output/bmb-creations/workflows/create-implementation-plan/workflow-plan-create-implementation-plan.md`
