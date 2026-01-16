# Skill Specifications for create-implementation-plan Workflow

This folder contains detailed specifications for the three skills required by the `create-implementation-plan` workflow.

## Skills Overview

| Skill | Purpose | Context Mode | Priority |
|-------|---------|--------------|----------|
| `dev-load-project-context` | Load all project docs into memory | Inline | 1 - Build first |
| `dev-opencode-review` | Review plan via OpenCode AI | `context: fork` | 2 - Build second |
| `dev-party-mode-review` | Multi-agent review via Party Mode | `context: fork` | 3 - Build last |

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    create-implementation-plan                    │
│                         (Main Workflow)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 05: Process Stories                                        │
│                                                                  │
│  FOR EACH story:                                                 │
│                                                                  │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ 1. INVOKE dev-load-project-context                       │ │
│    │    Input: epic_name, story_id, output_folder             │ │
│    │    Output: context object with all docs                  │ │
│    │    Mode: Inline (fast, lightweight)                      │ │
│    └──────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ 2. Generate Draft Plan (inline in workflow)              │ │
│    │    Uses: context + implementation-plan-template.md       │ │
│    │    Output: draft_plan markdown                           │ │
│    └──────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ 3. INVOKE dev-opencode-review (context: fork)            │ │
│    │    Input: draft_plan, story_context, arch_summary        │ │
│    │    Output: suggestions[], issues[], coverage_analysis    │ │
│    │    Mode: Forked (isolates heavy review)                  │ │
│    └──────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ 4. INVOKE dev-party-mode-review (context: fork)          │ │
│    │    Input: draft_plan, opencode_review, contexts          │ │
│    │    Output: final_plan, changes_made, agent_consensus     │ │
│    │    Mode: Forked (isolates multi-agent discussion)        │ │
│    └──────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │ 5. Save final_plan as {story}.implement.md               │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Summary

```
                    ┌─────────────────────┐
                    │   Project Files     │
                    │  - architecture.md  │
                    │  - prd.md           │
                    │  - coding-standards │
                    │  - epic/stories     │
                    └─────────┬───────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  dev-load-project-context     │
              │  ─────────────────────────    │
              │  Returns: Structured context  │
              │  - architecture.key_decisions │
              │  - story.acceptance_criteria  │
              │  - coding_standards.patterns  │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │     Draft Plan Generation     │
              │  ─────────────────────────    │
              │  Uses: implementation-plan-   │
              │        template.md            │
              │  Output: draft_plan (md)      │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │    dev-opencode-review        │
              │  ─────────────────────────    │
              │  Returns:                     │
              │  - suggestions[] (2-5 items)  │
              │  - issues[] (0-5 items)       │
              │  - coverage_analysis          │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   dev-party-mode-review       │
              │  ─────────────────────────    │
              │  Returns:                     │
              │  - final_plan (complete md)   │
              │  - changes_made[]             │
              │  - agent_consensus            │
              │  - quality_assessment         │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   {story}.implement.md        │
              │  ─────────────────────────    │
              │  Ready for dev-story workflow │
              └───────────────────────────────┘
```

## Specification Files

### 1. dev-load-project-context.spec.md

**Purpose:** Load all required project context documents for implementation plan generation.

| Aspect | Details |
|--------|---------|
| Context Mode | Inline (no fork) |
| Timeout | 10 seconds |
| Key Input | `epic_name`, `story_id`, `output_folder` |
| Key Output | Structured context with architecture, prd, story, standards |
| Error Handling | Fail fast on missing required docs |

**Build Priority:** 1 (build first - other skills depend on this context)

---

### 2. dev-opencode-review.spec.md

**Purpose:** Review draft implementation plan using OpenCode AI and return structured feedback.

| Aspect | Details |
|--------|---------|
| Context Mode | `context: fork` (isolated) |
| Timeout | 60 seconds |
| Key Input | `draft_plan`, `story_context`, `architecture_summary` |
| Key Output | `suggestions[]`, `issues[]`, `coverage_analysis` |
| Review Focus | Architecture alignment, completeness, feasibility, security |

**Build Priority:** 2 (build after context loader)

---

### 3. dev-party-mode-review.spec.md

**Purpose:** Run BMM Party Mode multi-agent review on implementation plan, produce final reviewed plan.

| Aspect | Details |
|--------|---------|
| Context Mode | `context: fork` (isolated) |
| Timeout | 120 seconds |
| Key Input | `draft_plan`, `opencode_review`, `story_context`, `project_context` |
| Key Output | `final_plan`, `changes_made[]`, `agent_consensus` |
| Agents | Architect, Developer, Tech Lead, QA Engineer |

**Build Priority:** 3 (build last - depends on OpenCode output format)

---

## Skill Dependencies

```
dev-load-project-context
         │
         │ provides context to
         ▼
   Draft Plan Generation
         │
         │ draft_plan flows to
         ▼
  dev-opencode-review
         │
         │ review results flow to
         ▼
 dev-party-mode-review
         │
         │ final_plan flows to
         ▼
   File System (save)
```

## Implementation Notes

### Context Fork Pattern

Both `dev-opencode-review` and `dev-party-mode-review` use `context: fork` to:
1. **Isolate heavy operations** - Reviews can be verbose; main context stays clean
2. **Return structured data only** - Discussion transcripts discarded
3. **Enable parallel execution** - In batch mode, multiple reviews can run

### Portability Requirement

All skills must work with both:
- **Claude Code** - Primary development environment
- **OpenCode** - Alternative AI tool for reviews

This means:
- No Claude-specific APIs
- Standard input/output formats (YAML-like structures)
- Skills should be invokable via CLI or programmatic API

### Testing Strategy

Each skill should have:
1. **Unit tests** - Test input validation, output formatting
2. **Integration tests** - Test with mock project files
3. **E2E test** - Full workflow test with real files

Test data location:
```
skill-specs/test-data/
├── valid-project/
├── missing-architecture/
├── missing-prd/
├── large-docs/
└── minimal-project/
```

## Quick Start for Implementation

1. **Start with `dev-load-project-context`:**
   ```bash
   mkdir -p .claude/skills/dev-load-project-context/scripts
   cd .claude/skills/dev-load-project-context
   bun init
   # Implement based on spec
   bun test
   ```

2. **Then `dev-opencode-review`:**
   ```bash
   mkdir -p .claude/skills/dev-opencode-review/scripts
   # Add context: fork to SKILL.md
   # Implement review logic
   ```

3. **Finally `dev-party-mode-review`:**
   ```bash
   mkdir -p .claude/skills/dev-party-mode-review/scripts
   # Add context: fork to SKILL.md
   # Implement Party Mode orchestration
   ```

## Related Files

- Workflow: `_bmad/bmm/workflows/4-implementation/create-implementation-plan/`
- Template: `_bmad/bmm/workflows/4-implementation/create-implementation-plan/data/implementation-plan-template.md`
- Workflow Plan: `_bmad-output/bmb-creations/workflows/create-implementation-plan/workflow-plan-create-implementation-plan.md`
