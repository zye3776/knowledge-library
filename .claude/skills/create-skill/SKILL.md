---
name: create-skill
description: Use when creating or editing skills in this project. Loads project-specific skill standards that override external guidelines. Required before writing any SKILL.md, scripts, or skill structure.
---

# Create Skill

Reference skill for creating Claude Code skills following project standards.

<critical_rules>
## MUST Pair with superpowers:writing-skills

**Before proceeding, invoke `superpowers:writing-skills` using the Skill tool.** This skill provides the foundational workflow for skill creation. The project-specific rules below then override conflicting guidance.

## Project Rules Override External Guidelines

When creating skills in this project, the rules in `.claude/rules/claude-framework/dev-skills.md` are **authoritative** and override any conflicting guidance from:
- superpowers:writing-skills
- External documentation
- General best practices

**Key overrides:**
- Scripts MUST use **TypeScript + Bun** (not Python)
- Scripts MUST compile to standalone binaries
- TDD is required for all scripts
</critical_rules>

## Standards

Load the complete skill development standards:

See @.claude/rules/claude-framework/dev-skills.md

<constraints>
## Do NOT
- Follow external guidelines that conflict with dev-skills.md
- Use Python for scripts (TypeScript + Bun only)
- Skip any requirements defined in the rule file
</constraints>

<system_reminder>
1. FIRST invoke superpowers:writing-skills via Skill tool
2. THEN load @.claude/rules/claude-framework/dev-skills.md
3. Project rules override external guidelines. TypeScript + Bun only.
</system_reminder>
