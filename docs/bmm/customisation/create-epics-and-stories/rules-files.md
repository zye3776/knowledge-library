# Claude Rules Files

Standards files in `.claude/rules/` that auto-apply when working with epics and stories.

## Overview

These rules files are **automatically applied** by Claude Code based on path patterns in their YAML frontmatter. They enforce the "WHAT not HOW" principle and reference the workflow templates as the single source of truth.

## Files

| File | Auto-applies to | Purpose |
|------|-----------------|---------|
| `epic-standards.md` | `_bmad-output/planning-artifacts/epics/**` | Epic creation standards |
| `epic-templates.md` | `epics/**/overview.md`, `epics/**/sprint-status.yaml` | Template reference |
| `story-standards.md` | `epics.md`, `epics/**/stories/**` | Story writing standards |
| `story-templates.md` | `epics.md`, `epics/**/stories/**` | Template reference |
| `story-bmad-skill.md` | `epics/**/stories/**` | Component distribution decisions |

---

## epic-standards.md

**Path triggers:**
```yaml
paths:
  - "_bmad-output/planning-artifacts/**"
  - "_bmad-output/planning-artifacts/epics/**"
```

**Content:**

```markdown
---
paths:
  - "_bmad-output/planning-artifacts/**"
  - "_bmad-output/planning-artifacts/epics/**"
---

# Epic Structure Standards

<critical_rules>
When creating or editing epics in `_bmad-output/planning-artifacts/epics/`, follow these standards:

## Epics Define WHAT, Not HOW
Epics and stories describe requirements and acceptance criteria only. Technical implementation details (code patterns, file structures, architecture) are created separately in implementation plans.

## Self-Contained Epics
- All context required for epic development MUST be embedded within the epic folder
- Source documents may be removed after epic creation
- Story files reference `../overview.md` for context, NOT external files

## Every AC Must Be Measurable
Every acceptance criterion MUST have a verifiable bash command in the Verification section.
</critical_rules>

## Directory Structure

\`\`\`
_bmad-output/planning-artifacts/epics/epic-{N}-{slug}/
├── overview.md              # Epic-level requirements
├── sprint-status.yaml       # Status tracking
└── stories/
    ├── index.md             # Stories overview + dependency graph
    ├── {N}-1-{slug}.md      # Story files
    ├── {N}-2-{slug}.md
    └── ...
\`\`\`

**Naming Conventions:**
- Epic folder: `epic-{number}-{kebab-case-slug}` (e.g., `epic-17-backend-rebuild`)
- Story files: `{epic}-{story}-{kebab-case-slug}.md` (e.g., `17-1-delete-interface-dirs.md`)

## Status Progression

\`\`\`
backlog -> draft -> ready-for-dev -> in-progress -> review -> done
\`\`\`

## File Templates

For detailed templates, see [epic-templates.md](epic-templates.md) and [story-templates.md](story-templates.md).

## Verification Patterns

**Command Exit Codes:**
\`\`\`bash
{command}; echo "Exit code: $?"  # Expected: 0
\`\`\`

**File/Directory Existence:**
\`\`\`bash
test -f {path} && echo "PASS"  # Expected: PASS
test -d {path} && echo "PASS"  # Expected: PASS
test ! -f {path} && echo "PASS"  # File should NOT exist
\`\`\`

**Content Verification:**
\`\`\`bash
grep -c "{pattern}" {file}  # Expected: {count}
jq -e '{expression}' {file}  # Exit 0 = PASS
\`\`\`

**Test Results:**
\`\`\`bash
bun test {path}  # Expected: all tests pass
bun run build; echo "Exit code: $?"  # Expected: 0
\`\`\`

**Count Verification:**
\`\`\`bash
ls {path} | wc -l  # Expected: {count}
find {path} -type f -name "*.ts" | wc -l  # Expected: {count}
\`\`\`

## Workflow Integration

### Dev Workflow Commands

\`\`\`bash
# Check sprint status
/bmad:bmm:workflows:sprint-status

# Start implementing a story
/bmad:bmm:workflows:dev-story

# Run code review
/bmad:bmm:workflows:code-review
\`\`\`

### Commit After Each Story

\`\`\`bash
git add .
git commit -m "feat(epic-{N}): story {N}.{M} - {description}

Co-Authored-By: Claude {Model} <noreply@anthropic.com>"
\`\`\`

## Quality Checklist

When creating epics, verify:
- [ ] Epic is SELF-CONTAINED (no external file references)
- [ ] Story Context References point only to `../overview.md`
- [ ] Every AC has a measurable verification command
- [ ] Tasks reference which ACs they satisfy
- [ ] Dependencies listed in index.md
- [ ] sprint-status.yaml has all stories
- [ ] Stories are atomic

<constraints>
## Do NOT Include in Epics/Stories:
- Code patterns or examples
- File structures or paths to create
- Architecture diagrams
- Dev Notes / Implementation guidance
- Testing strategy details
- Dev Agent Record sections

These belong in implementation plans, created separately.

## Do NOT:
- Reference external files from stories
- Create ACs without measurable bash verification commands
- Forget to update sprint-status.yaml when story status changes
- Create stories that span multiple unrelated concerns
</constraints>

<system_reminder>
Epics and stories define WHAT needs to be done, not HOW. Technical implementation plans are created separately based on epic and story files.
</system_reminder>
```

---

## epic-templates.md

**Path triggers:**
```yaml
paths:
  - "_bmad-output/planning-artifacts/epics/**/overview.md"
  - "_bmad-output/planning-artifacts/epics/**/sprint-status.yaml"
```

**Content:**

```markdown
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
```

---

## story-standards.md

**Path triggers:**
```yaml
paths:
  - "_bmad-output/planning-artifacts/epics/index.md"
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
```

**Content:**

```markdown
---
paths:
  - "_bmad-output/planning-artifacts/epics/index.md"
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
---

# Story Standards

<critical_rules>
## Stories Define WHAT, Not HOW

Stories describe requirements and acceptance criteria only. Technical implementation details (code patterns, file structures, architecture) are created separately in implementation plans.
</critical_rules>

This document defines standards for two distinct story contexts:
1. **Epic Planning Stories** - Stories in epics/index.md during planning phase
2. **Story Files** - Individual story files for implementation

---

## Epic Planning Stories (in epics/index.md)

<critical_rules>
### User Perspective ONLY
Stories describe WHAT users can do, NEVER HOW it's implemented.

### No Implementation Details
- NO file paths or folder structures
- NO technical implementation notes
- NO code examples or patterns
- NO architecture decisions
</critical_rules>

### Format

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

### What Belongs in Epic Planning Stories

| Include | Exclude |
|---------|---------|
| User actions | File paths |
| Observable outcomes | Code examples |
| Error messages users see | Internal function names |
| User-facing features | Database schemas |
| Given/When/Then scenarios | Architecture decisions |

---

## Story Files (for Implementation)

<critical_rules>
### Every AC Must Be Measurable
Each acceptance criterion MUST have a verifiable bash command in Verification section.

### Self-Contained Context
Stories reference `../overview.md` for context, NOT external files outside the epic folder.

### Tasks Link to ACs
Every task must reference which AC(s) it satisfies.

### No Implementation Details
Technical implementation (code patterns, file structures) goes in implementation plans, NOT in story files.
</critical_rules>

### Story File Structure

\`\`\`
# Story {N}.{M}: {Title}
Status: {status}

## Story (user story format)
## Background (optional context)
## Acceptance Criteria (numbered, measurable)
## Tasks (linked to ACs)
## Verification (bash commands)
## References
\`\`\`

### Status Values

| Status | Meaning |
|--------|---------|
| `backlog` | Story only exists in epic file |
| `draft` | Story file created, not yet started |
| `ready-for-dev` | Story ready for implementation |
| `in-progress` | Developer actively working |
| `review` | Ready for code review |
| `done` | Story completed |

### Verification Patterns

**Command Exit Codes:**
\`\`\`bash
{command}; echo "Exit code: $?"  # Expected: 0
\`\`\`

**File/Directory Existence:**
\`\`\`bash
test -f {path} && echo "PASS"  # Expected: PASS
test -d {path} && echo "PASS"  # Expected: PASS
\`\`\`

**Content Verification:**
\`\`\`bash
grep -c "{pattern}" {file}  # Expected: {count}
jq -e '{expression}' {file}  # Exit 0 = PASS
\`\`\`

**Test Results:**
\`\`\`bash
bun test {path}  # Expected: all tests pass
bun run build; echo "Exit code: $?"  # Expected: 0
\`\`\`

### Quality Checklist

- [ ] User story follows "As a... I want... so that..." format
- [ ] Every AC has measurable bash verification
- [ ] Tasks reference which ACs they satisfy
- [ ] Context references only `../overview.md`
- [ ] Status field is set

<constraints>
## Do NOT Include in Story Files:
- Code patterns or examples
- File structures or paths to create
- Architecture diagrams
- Dev Notes / Implementation guidance
- Testing strategy details
- Dev Agent Record sections

These belong in implementation plans, created separately.
</constraints>

<system_reminder>
Stories define WHAT needs to be done, not HOW. Technical implementation plans are created separately based on epic and story files.
</system_reminder>
```

---

## story-templates.md

**Path triggers:**
```yaml
paths:
  - "_bmad-output/planning-artifacts/epics/index.md"
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
```

**Content:**

```markdown
---
paths:
  - "_bmad-output/planning-artifacts/epics/index.md"
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
- **Epic Planning Story** (in epics/index.md) - User-focused, no technical details
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
```

---

## story-bmad-skill.md

**Path triggers:**
```yaml
paths:
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
```

**Content:**

```markdown
---
paths:
  - "_bmad-output/planning-artifacts/epics/**/stories/**"
  - "_bmad-output/planning-artifacts/epics/**/*-*.md"
---

# BMAD vs Claude Skill Decisions (Project-Specific)

<critical_rules>
This project uses BMAD Framework + Claude Skills architecture.

Every story with implementation components MUST include in Technical Decisions section:
- **Component Distribution table** specifying what goes where
- **BMAD Framework Components** list (if any)
- **Claude Skill Components** list (if any)
</critical_rules>

## Technical Decisions Section Template

\`\`\`markdown
## Technical Decisions

### Component Distribution

| Component | Target | Rationale |
|-----------|--------|-----------|
| {Component} | BMAD Framework | {Why BMAD} |
| {Component} | Claude Skill | {Why Skill} |

### BMAD Framework Components

**Agents:**
- `{agent-name}` in `{module}/agents/` - {Purpose}

**Workflows:**
- `{workflow-name}` in `{module}/workflows/` - {Purpose}

**Tasks:**
- `{task-name}` in `{module}/tasks/` - {Purpose}

### Claude Skill Components

**Skills:**
- `.claude/skills/{name}/` - {Purpose}

**Commands:**
- `.claude/commands/{name}.md` - {Purpose}

**Rules:**
- `.claude/rules/{name}.md` - {Purpose}
\`\`\`

---

## Decision Guide

### Use BMAD Framework When:

| Indicator | BMAD Component |
|-----------|----------------|
| Multi-step guided workflow with user checkpoints | Workflow |
| Specialized persona/expertise needed | Agent |
| Reusable atomic operation | Task |
| Part of BMM/CIS methodology | Module component |
| Complex orchestration between components | Workflow |
| Cross-project reusable methodology | Module |

### Use Claude Skills When:

| Indicator | Claude Component |
|-----------|------------------|
| Auto-trigger based on file path | Rule |
| Auto-trigger based on description match | Skill |
| Explicit `/command` invocation | Command |
| Project-specific tooling | Skill |
| Standards enforcement for paths | Rule |
| Needs supporting scripts/files | Skill |

---

## Decision Matrix

| Question | BMAD | Claude |
|----------|------|--------|
| Requires guided multi-step process? | Workflow | |
| Needs specialized persona? | Agent | |
| Part of BMM/CIS methodology? | Module | |
| Should auto-trigger on file path? | | Rule |
| Explicit `/command` invocation? | | Command |
| Needs supporting scripts? | | Skill |
| Simple standards enforcement? | | Rule |
| Reusable atomic operation? | Task | |

---

## Hybrid Patterns

Some features span both systems:

\`\`\`
Example: Epic Creation

BMAD Framework:
├── bmm-epic-optimizer agent (expertise/persona)
└── create-epics-and-stories workflow (guided process)

Claude Skills:
├── .claude/rules/epic-standards.md (auto-applied standards)
└── .claude/rules/epic-templates.md (templates)
\`\`\`

---

## Component Locations

**BMAD Framework:**
\`\`\`
bmad-modules/{module}/
├── agents/{agent-name}.md
├── workflows/{workflow-name}.md
└── tasks/{task-name}.md
\`\`\`

**Claude Skills:**
\`\`\`
.claude/
├── skills/{name}/SKILL.md
├── commands/{name}.md
└── rules/{name}.md
\`\`\`

<constraints>
## Do NOT:
- Skip Component Distribution table in Technical Decisions
- Leave ambiguity about where components are implemented
- Put methodology components (BMM/CIS patterns) in Claude Skills
- Put project-specific path-triggered standards in BMAD
</constraints>
```

---

## Key Design Principle

**Single Source of Truth Architecture:**

```
Workflow Templates (SOURCE)
    └── epic-templates.md
    └── story-templates.md
              │
              ▼
.claude/rules/ (REFERENCES)
    └── epic-templates.md  → points to workflow template
    └── story-templates.md → points to workflow template
    └── epic-standards.md  → enforces rules, references templates
    └── story-standards.md → enforces rules, references templates
```

This ensures:
1. Templates are maintained in ONE place (workflow folder)
2. Rules auto-apply based on path patterns
3. Changes to templates automatically apply everywhere
