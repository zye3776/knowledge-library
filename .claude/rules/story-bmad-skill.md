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

```markdown
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
```

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

```
Example: Epic Creation

BMAD Framework:
├── bmm-epic-optimizer agent (expertise/persona)
└── create-epics-and-stories workflow (guided process)

Claude Skills:
├── .claude/rules/epic-structure.md (auto-applied standards)
└── .claude/rules/epic-templates.md (templates)
```

---

## Component Locations

**BMAD Framework:**
```
bmad-modules/{module}/
├── agents/{agent-name}.md
├── workflows/{workflow-name}.md
└── tasks/{task-name}.md
```

**Claude Skills:**
```
.claude/
├── skills/{name}/SKILL.md
├── commands/{name}.md
└── rules/{name}.md
```

<constraints>
## Do NOT:
- Skip Component Distribution table in Technical Decisions
- Leave ambiguity about where components are implemented
- Put methodology components (BMM/CIS patterns) in Claude Skills
- Put project-specific path-triggered standards in BMAD
</constraints>
