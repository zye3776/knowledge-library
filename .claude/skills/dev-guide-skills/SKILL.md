---
name: dev-guide-skills
description: Development guide for creating Claude Code Agent Skills. Use when building new skills, understanding SKILL.md structure, or deciding between skills vs commands vs subagents.
allowed-tools: Read, Glob, Grep
---

# Claude Code Skills Development Guide

## What Are Skills?

Skills are markdown files that teach Claude how to do something specific. They are **model-invoked**: Claude automatically decides when to use them based on your request matching the skill's description.

## When to Use Skills

Choose skills when you need:
- Complex workflows with multiple steps
- Supporting files (scripts, reference docs, templates)
- Automatic discovery (Claude applies without explicit trigger)
- Team-shared capabilities committed to version control

## SKILL.md Structure

Every skill requires a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: skill-name
description: Brief description of what this Skill does and when to use it
allowed-tools: Read, Grep, Glob, Bash
model: claude-sonnet-4-20250514
context: fork
agent: general-purpose
---

# Skill Name

## Instructions
Step-by-step guidance for Claude.

## Examples
Concrete usage examples.
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Lowercase letters, numbers, hyphens. Max 64 chars |
| `description` | Yes | What skill does and when to use it. Max 1024 chars. Claude uses this to auto-discover |
| `allowed-tools` | No | Tools Claude can use: `Read`, `Grep`, `Glob`, `Write`, `Edit`, `Bash`, `WebFetch`, `WebSearch` |
| `model` | No | Model to use (e.g., `claude-sonnet-4-20250514`). Defaults to conversation's model |
| `context` | No | Set to `fork` to run in isolated subagent context |
| `agent` | No | Agent type with `context: fork`: `Explore`, `Plan`, `general-purpose`, or custom agent name |
| `hooks` | No | Lifecycle hooks: `PreToolUse`, `PostToolUse`, `Stop` |
| `user-invocable` | No | Show in slash menu (default: `true`) |
| `disable-model-invocation` | No | Block Skill tool invocation (default: `false`) |

## File Organization

Keep `SKILL.md` under 500 lines. Use separate files for details:

```
my-skill/
├── SKILL.md              # Overview, navigation (< 500 lines)
├── reference.md          # Detailed API docs
├── examples.md           # Usage examples
└── scripts/
    └── helper.py         # Executed without loading into context
```

Reference supporting files in SKILL.md:

```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## Utility scripts
Run extraction: `python scripts/helper.py input.txt`
```

## Progressive Disclosure

Claude loads skills in stages:
1. **Discovery**: Only name + description loaded at startup
2. **Activation**: Full SKILL.md loaded when request matches description
3. **Execution**: Referenced files loaded only when needed

This preserves context window tokens.

## Skill Locations

| Location | Path | Scope | Priority |
|----------|------|-------|----------|
| Personal | `~/.claude/skills/` | All your projects | Higher |
| Project | `.claude/skills/` | This repo only | Lower |
| Plugin | Bundled with plugin | Where installed | Lowest |

Higher priority overrides lower when names conflict.

## Context Isolation with `context: fork`

Run skill in isolated subagent context:

```yaml
---
name: heavy-processor
description: Processes large files with verbose output
context: fork
agent: general-purpose
allowed-tools: Read, Bash
---
```

Benefits:
- Separate conversation history
- Verbose output doesn't pollute main context
- Independent token budget

## Hooks Example

```yaml
---
name: db-skill
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---
```

## Skills vs Commands vs Subagents

| Aspect | Skills | Commands | Subagents |
|--------|--------|----------|-----------|
| Invocation | Automatic | Explicit `/cmd` | Task tool |
| Structure | Directory + SKILL.md | Single .md file | Single .md file |
| Best for | Complex workflows | Quick prompts | Context isolation |
| Supporting files | Yes | No | No |

## Example: Complete Skill

```yaml
---
name: code-analyzer
description: Analyzes code quality, complexity, and patterns. Use when reviewing code or understanding a codebase.
allowed-tools: Read, Grep, Glob
---

# Code Analyzer

## Instructions

1. Identify the target files using Glob patterns
2. Read each file and analyze:
   - Code complexity (cyclomatic complexity)
   - Function length and nesting depth
   - Code duplication patterns
   - Naming conventions

3. Report findings organized by severity

## Output Format

### High Priority
- [Issue description]
- Location: `file:line`
- Suggestion: [fix]

### Medium Priority
...
```
