---
name: dev-load-project-context
description: Load project context documents (architecture, PRD, coding standards, epic/story) for implementation plan generation. Use when creating implementation plans for stories.
---

# Project Document Index

Use this index to find relevant context documents for planning, development, and documentation tasks.

## Core Planning Documents

| Document | Path | Purpose |
|----------|------|---------|
| **Architecture** | `_bmad-output/planning-artifacts/architecture.md` | Technical decisions, tech stack, constraints, system design |
| **PRD** | `_bmad-output/planning-artifacts/prd.md` | Product requirements, user goals, success metrics |
| **Epics Index** | `_bmad-output/planning-artifacts/epics/index.md` | Overview of all epics and their status |

## Epic & Story Documents

| Document | Path Pattern | Purpose |
|----------|--------------|---------|
| **Epic Overview** | `_bmad-output/planning-artifacts/epics/{epic-name}/overview.md` | Epic goal, scope, story list |
| **Stories Index** | `_bmad-output/planning-artifacts/epics/{epic-name}/stories/index.md` | List of stories in epic |
| **Story File** | `_bmad-output/planning-artifacts/epics/{epic-name}/stories/{story-id}-*.md` | Acceptance criteria, tasks, dependencies |
| **Sprint Status** | `_bmad-output/planning-artifacts/epics/{epic-name}/sprint-status.yaml` | Current sprint progress tracking |

## Development Standards

| Document | Path | Purpose |
|----------|------|---------|
| **KISS Principles** | `docs/guides-agents/KISS-principle-agent-guide.md` | Simplicity guidelines, complexity thresholds, anti-patterns |
| **Agent Dev Guide** | `docs/guides-agents/index.md` | Guidelines for AI agent development |

## Claude Code Configuration

| Document | Path | Purpose |
|----------|------|---------|
| **Project CLAUDE.md** | `CLAUDE.md` | Project overview, key patterns, constraints |
| **Skill Standards** | `.claude/rules/claude-framework/dev-skills.md` | How to create skills |
| **Command Standards** | `.claude/rules/claude-framework/dev-commands.md` | How to create commands |
| **Agent Standards** | `.claude/rules/claude-framework/dev-agents.md` | How to create agents |
| **XML+Markdown** | `.claude/rules/markdown/xml.md` | Hybrid formatting standards |

## Planning Standards

| Document | Path | Purpose |
|----------|------|---------|
| **Epic Standards** | `.claude/rules/planning/epic-standards.md` | Epic structure and requirements |
| **Story Standards** | `.claude/rules/planning/story-standards.md` | Story structure and requirements |
| **Epic Templates** | `.claude/rules/planning/epic-templates.md` | Templates for creating epics |
| **Story Templates** | `.claude/rules/planning/story-templates.md` | Templates for creating stories |

---

## Usage by Task Type

### For Story Implementation
Read these documents:
1. `_bmad-output/planning-artifacts/architecture.md` - Technical context
2. `_bmad-output/planning-artifacts/epics/{epic}/stories/{story}.md` - Story details
3. `docs/guides-agents/KISS-principle-agent-guide.md` - Development principles

### For Planning New Features
Read these documents:
1. `_bmad-output/planning-artifacts/prd.md` - Product requirements
2. `_bmad-output/planning-artifacts/architecture.md` - Technical constraints
3. `.claude/rules/planning/story-standards.md` - Story format

### For Creating Skills/Commands/Agents
Read these documents:
1. `.claude/rules/claude-framework/dev-skills.md` (or dev-commands.md, dev-agents.md)
2. `.claude/rules/markdown/xml.md` - Formatting standards
3. `CLAUDE.md` - Project conventions

### For Documentation Updates
Read these documents:
1. `CLAUDE.md` - What to document
2. `.claude/rules/markdown/imports.md` - Import syntax
3. Relevant planning docs for context
