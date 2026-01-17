---
name: create-plugin
description: Use when creating or editing Claude Code plugins in this project. Loads project-specific plugin standards that override external guidelines. Required before writing plugin.json, plugin structure, or bundling components.
---

# Create Plugin

Reference skill for creating Claude Code plugins following project standards.

<critical_rules>
## Project Rules Override External Guidelines

When creating plugins in this project, the rules in `.claude/rules/claude-framework/dev-plugins.md` are **authoritative** and override any conflicting guidance from external sources.

**Key points:**
- Only `name` is required in plugin.json
- Component directories (`skills/`, `agents/`, `commands/`) at plugin root - NOT inside `.claude-plugin/`
- Plugin components inherit namespace: `my-plugin:skill-name`
</critical_rules>

## Standards

Load the complete plugin development standards:

See @.claude/rules/claude-framework/dev-plugins.md

<constraints>
## Do NOT
- Follow external guidelines that conflict with dev-plugins.md
- Nest component directories inside `.claude-plugin/`
- Assume version/description are required (only `name` is required)
- Skip any requirements defined in the rule file
</constraints>

<system_reminder>
Always load @.claude/rules/claude-framework/dev-plugins.md before creating plugins.
Project rules override external guidelines. Only `name` is required in plugin.json.
</system_reminder>
