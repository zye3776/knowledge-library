---
name: create-command
description: Use when creating or editing slash commands in this project. Loads project-specific command standards that override external guidelines. Required before writing command .md files or configuring command frontmatter.
---

# Create Command

Reference skill for creating Claude Code slash commands following project standards.

<critical_rules>
## Project Rules Override External Guidelines

When creating commands in this project, the rules in `.claude/rules/claude-framework/dev-commands.md` are **authoritative** and override any conflicting guidance from external sources.

**Key points:**
- Commands are single `.md` files in `.claude/commands/`
- Use `$ARGUMENTS` for all args, `$1`, `$2` for positional
- `!` prefix executes bash inline, `@` prefix includes file contents
- File path determines command name
</critical_rules>

## Standards

Load the complete command development standards:

See @.claude/rules/claude-framework/dev-commands.md

<constraints>
## Do NOT
- Follow external guidelines that conflict with dev-commands.md
- Use `$0` (doesn't exist, start with `$1`)
- Mix up `!` (bash execution) with `@` (file inclusion)
- Forget `allowed-tools` when using Bash commands
- Skip any requirements defined in the rule file
</constraints>

<system_reminder>
Always load @.claude/rules/claude-framework/dev-commands.md before creating commands.
Project rules override external guidelines. Commands are single .md files.
</system_reminder>
