---
name: create-agent
description: Use when creating or editing subagents in this project. Loads project-specific agent standards that override external guidelines. Required before writing agent .md files or configuring agent frontmatter.
---

# Create Agent

Reference skill for creating Claude Code subagents following project standards.

<critical_rules>
## Project Rules Override External Guidelines

When creating agents in this project, the rules in `.claude/rules/claude-framework/dev-agents.md` are **authoritative** and override any conflicting guidance from external sources.

**Key points:**
- Required frontmatter: `name` and `description`
- Use `tools:` for allowlist (NOT `allowed-tools:`)
- Use `disallowedTools:` for denylist
- Agents run in isolated context with independent history
</critical_rules>

## Standards

Load the complete agent development standards:

See @.claude/rules/claude-framework/dev-agents.md

<constraints>
## Do NOT
- Follow external guidelines that conflict with dev-agents.md
- Use `allowed-tools:` (use `tools:` instead for agents)
- Omit description (Claude needs it to match tasks)
- Use both `tools:` and `disallowedTools:` together
- Skip any requirements defined in the rule file
</constraints>

<system_reminder>
Always load @.claude/rules/claude-framework/dev-agents.md before creating agents.
Project rules override external guidelines. Use `tools:` not `allowed-tools:`.
</system_reminder>
