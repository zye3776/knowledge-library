---
name: dev-guide-commands
description: Development guide for creating Claude Code Slash Commands. Use when building quick prompts, understanding $ARGUMENTS syntax, or creating user-invoked shortcuts.
allowed-tools: Read, Glob, Grep
---

# Claude Code Slash Commands Development Guide

## What Are Slash Commands?

Slash commands are frequently used prompts stored as Markdown files. Unlike skills (automatic), **commands are explicitly invoked** by typing `/command-name`.

## When to Use Commands

Choose slash commands when you need:
- Quick, reusable prompts
- Explicit user invocation (`/command`)
- Simple single-file structure
- High-frequency manual triggers

## File Structure

Commands are single `.md` files in `.claude/commands/`:

```
.claude/
└── commands/
    ├── optimize.md        # /optimize
    ├── review.md          # /review
    └── frontend/
        └── component.md   # /component (namespace: project:frontend)
```

## Command Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `.claude/commands/` | Project (shared with team) | Higher |
| `~/.claude/commands/` | Personal (all projects) | Lower |

Project commands override personal commands with same name.

## Basic Command

```markdown
Analyze this code for performance issues and suggest optimizations.
Focus on:
- Algorithm complexity
- Memory usage
- I/O operations
```

Save as `.claude/commands/optimize.md`, invoke with `/optimize`.

## Frontmatter Options

```yaml
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit with the given message
model: claude-3-5-haiku-20241022
context: fork
agent: general-purpose
disable-model-invocation: false
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---

Command content here...
```

| Field | Purpose | Default |
|-------|---------|---------|
| `allowed-tools` | Tools command can use | Inherits from conversation |
| `argument-hint` | Hint shown in autocomplete | None |
| `description` | Brief description | First line of prompt |
| `model` | Specific model for this command | Inherits |
| `context` | Set to `fork` for isolated context | Inline |
| `agent` | Agent type if `context: fork` | `general-purpose` |
| `disable-model-invocation` | Block Skill tool invocation | `false` |
| `hooks` | Lifecycle hooks | None |

## Arguments

### All Arguments with `$ARGUMENTS`

```markdown
Fix issue #$ARGUMENTS following our coding standards.
```

Usage: `/fix-issue 123 high-priority`
`$ARGUMENTS` becomes: `123 high-priority`

### Individual Arguments with `$1`, `$2`, etc.

```markdown
Review PR #$1 with priority $2 and assign to $3.
```

Usage: `/review-pr 456 high alice`
- `$1` = `456`
- `$2` = `high`
- `$3` = `alice`

## Bash Execution with `!`

Use `!` prefix to execute bash commands inline:

```markdown
---
allowed-tools: Bash(git:*)
---

## Context

- Current git status: !`git status`
- Current diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`

## Your task

Create a commit based on the changes above.
```

## File References with `@`

Use `@` prefix to include file contents:

```markdown
Review the implementation in @src/utils/helpers.js

Compare @src/old-version.js with @src/new-version.js
```

## Namespace Organization

Subdirectories create namespaces:

```
.claude/commands/
├── review.md                    # /review (project)
├── frontend/
│   └── component.md             # /component (project:frontend)
└── backend/
    └── api.md                   # /api (project:backend)
```

Commands in different subdirectories can share names (distinguished by namespace).

## Context Fork

Run command in isolated subagent:

```yaml
---
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob
---

Analyze the entire codebase and generate a report.
This may produce verbose output.
```

## Example: Git Commit Command

```yaml
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*)
argument-hint: [commit message]
description: Stage changes and create a commit
---

## Current State

- Status: !`git status --short`
- Diff: !`git diff --staged`

## Task

Create a commit with message: $ARGUMENTS

Follow these conventions:
- Use conventional commits format (feat:, fix:, docs:, etc.)
- Keep subject line under 50 characters
- Add body if changes are complex
```

## Example: Code Review Command

```yaml
---
allowed-tools: Read, Grep, Glob
argument-hint: [file or directory]
description: Review code for quality and best practices
---

Review the code in $ARGUMENTS for:

1. **Code Quality**
   - Naming conventions
   - Function length and complexity
   - Code duplication

2. **Best Practices**
   - Error handling
   - Input validation
   - Security concerns

3. **Maintainability**
   - Documentation
   - Test coverage
   - Clear structure

Provide specific suggestions with file:line references.
```

## Commands vs Skills

| Aspect | Commands | Skills |
|--------|----------|--------|
| Invocation | Explicit `/command` | Automatic |
| Structure | Single `.md` file | Directory + SKILL.md |
| Supporting files | No | Yes (scripts, docs) |
| Best for | Quick prompts | Complex workflows |
| Arguments | `$ARGUMENTS`, `$1`, `$2` | N/A |
| Bash execution | `!` prefix | Via allowed-tools |
| File inclusion | `@` prefix | Reference in markdown |

## The Skill Tool

Claude can programmatically invoke commands via the Skill tool if:
- Command has `description` in frontmatter
- `disable-model-invocation` is not `true`

Reference commands in CLAUDE.md to encourage usage:
```markdown
Run /commit after making changes.
Use /review before submitting PRs.
```
