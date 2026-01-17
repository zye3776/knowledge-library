---
name: dev-load-project-context
description: Load project context documents (architecture, PRD, coding standards, epic/story) for implementation plan generation. Use when creating implementation plans for stories.
---

# Project Document Index

<critical_rules>
- ALWAYS read architecture.md before implementing any story
- ALWAYS read the specific story file for acceptance criteria
- ALWAYS read KISS principles before writing code
- NEVER skip reading referenced documents - they contain essential context
</critical_rules>

<documents>
  <section name="core-planning">
    <doc name="Architecture" path="_bmad-output/planning-artifacts/architecture.md">
      Technical decisions, tech stack, constraints, system design
    </doc>
    <doc name="PRD" path="_bmad-output/planning-artifacts/prd.md">
      Product requirements, user goals, success metrics
    </doc>
    <doc name="Epics Index" path="_bmad-output/planning-artifacts/epics/index.md">
      Overview of all epics and their status
    </doc>
  </section>

  <section name="epic-story-documents">
    <doc name="Epic Overview" path="_bmad-output/planning-artifacts/epics/{epic-name}/overview.md">
      Epic goal, scope, story list
    </doc>
    <doc name="Stories Index" path="_bmad-output/planning-artifacts/epics/{epic-name}/stories/index.md">
      List of stories in epic
    </doc>
    <doc name="Story File" path="_bmad-output/planning-artifacts/epics/{epic-name}/stories/{story-id}-*.md">
      Acceptance criteria, tasks, dependencies
    </doc>
    <doc name="Sprint Status" path="_bmad-output/planning-artifacts/epics/{epic-name}/sprint-status.yaml">
      Current sprint progress tracking
    </doc>
  </section>

  <section name="development-standards">
    <doc name="KISS Principles" path="docs/guides-agents/KISS-principle-agent-guide.md">
      Simplicity guidelines, complexity thresholds, anti-patterns
    </doc>
    <doc name="Agent Dev Guide" path="docs/guides-agents/index.md">
      Guidelines for AI agent development
    </doc>
  </section>

  <section name="claude-code-configuration">
    <doc name="Project CLAUDE.md" path="CLAUDE.md">
      Project overview, key patterns, constraints
    </doc>
    <doc name="Skill Standards" path=".claude/rules/claude-framework/dev-skills.md">
      How to create skills
    </doc>
    <doc name="Command Standards" path=".claude/rules/claude-framework/dev-commands.md">
      How to create commands
    </doc>
    <doc name="Agent Standards" path=".claude/rules/claude-framework/dev-agents.md">
      How to create agents
    </doc>
    <doc name="XML+Markdown" path=".claude/rules/markdown/xml.md">
      Hybrid formatting standards
    </doc>
  </section>

  <section name="planning-standards">
    <doc name="Epic Standards" path=".claude/rules/planning/epic-standards.md">
      Epic structure and requirements
    </doc>
    <doc name="Story Standards" path=".claude/rules/planning/story-standards.md">
      Story structure and requirements
    </doc>
    <doc name="Epic Templates" path=".claude/rules/planning/epic-templates.md">
      Templates for creating epics
    </doc>
    <doc name="Story Templates" path=".claude/rules/planning/story-templates.md">
      Templates for creating stories
    </doc>
  </section>
</documents>

---

## Usage by Task Type

<instructions>
  <task type="story-implementation">
    Read these documents in order:
    1. `_bmad-output/planning-artifacts/architecture.md` - Technical context
    2. `_bmad-output/planning-artifacts/epics/{epic}/stories/{story}.md` - Story details
    3. `docs/guides-agents/KISS-principle-agent-guide.md` - Development principles
  </task>

  <task type="planning-new-features">
    Read these documents in order:
    1. `_bmad-output/planning-artifacts/prd.md` - Product requirements
    2. `_bmad-output/planning-artifacts/architecture.md` - Technical constraints
    3. `.claude/rules/planning/story-standards.md` - Story format
  </task>

  <task type="creating-skills-commands-agents">
    Read these documents in order:
    1. `.claude/rules/claude-framework/dev-skills.md` (or dev-commands.md, dev-agents.md)
    2. `.claude/rules/markdown/xml.md` - Formatting standards
    3. `CLAUDE.md` - Project conventions
  </task>

  <task type="documentation-updates">
    Read these documents in order:
    1. `CLAUDE.md` - What to document
    2. `.claude/rules/markdown/imports.md` - Import syntax
    3. Relevant planning docs for context
  </task>
</instructions>

<system_reminder>
This is a document index, not executable code. Read the documents listed above based on your task type. Architecture and story files are mandatory for implementation work.
</system_reminder>
