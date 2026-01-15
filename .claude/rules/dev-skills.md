---
paths:
  - ".claude/skills/**/*.md"
  - ".claude/skills/**/SKILL.md"
  - "**/skills/**/SKILL.md"
---

# Skills Development Standards

<critical_rules>
When creating or editing SKILL.md files, follow these standards:

## Required Frontmatter Fields
- `name`: Lowercase letters, numbers, hyphens only. Max 64 chars
- `description`: What skill does and when to use it. Max 1024 chars. Claude uses this for auto-discovery

## SKILL.md Must Be Under 500 Lines
Use separate files for detailed content (reference.md, examples.md, scripts/)
</critical_rules>

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | When Claude should use this skill (include trigger keywords) |
| `version` | No | Semantic version (e.g., `1.0.0`) |
| `allowed-tools` | No | Tools skill can use: `Read`, `Grep`, `Glob`, `Write`, `Edit`, `Bash`, `WebFetch`, `WebSearch` |
| `model` | No | Model override (e.g., `claude-sonnet-4-20250514`). Defaults to conversation model |
| `context` | No | Set to `fork` to run in isolated subagent context |
| `agent` | No | Agent type when `context: fork`: `Explore`, `Plan`, `general-purpose`, or custom |
| `hooks` | No | Lifecycle hooks: `PreToolUse`, `PostToolUse`, `Stop` |
| `user-invocable` | No | Show in slash menu (default: `true`) |
| `disable-model-invocation` | No | Block Skill tool invocation (default: `false`) |

## File Organization

```
my-skill/
├── SKILL.md              # Overview, navigation (< 500 lines)
├── reference.md          # Detailed API docs, specifications
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

Claude loads skills in stages to preserve context tokens:
1. **Discovery**: Only name + description loaded at startup
2. **Activation**: Full SKILL.md loaded when request matches description
3. **Execution**: Referenced files loaded only when needed

## Skill Locations and Priority

| Location | Path | Scope | Priority |
|----------|------|-------|----------|
| Personal | `~/.claude/skills/` | All your projects | Higher |
| Project | `.claude/skills/` | This repo only | Lower |
| Plugin | Bundled with plugin | Where installed | Lowest |

Higher priority overrides lower when names conflict.

## Context Isolation

Run skill in isolated subagent with `context: fork`:

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

## Skills vs Commands vs Subagents

| Aspect | Skills | Commands | Subagents |
|--------|--------|----------|-----------|
| Invocation | Automatic (description match) | Explicit `/cmd` | Task tool |
| Structure | Directory + SKILL.md | Single .md file | Single .md file |
| Best for | Complex workflows | Quick prompts | Context isolation |
| Supporting files | Yes | No | No |
| Location | `.claude/skills/` | `.claude/commands/` | `.claude/agents/` |

<constraints>
## Do NOT:
- Exceed 500 lines in SKILL.md (use reference files instead)
- Use vague descriptions (include specific trigger keywords)
- Omit required fields (name, description)
- Put all content inline (use progressive disclosure)
</constraints>

## Example: Complete Skill

```yaml
---
name: code-analyzer
description: Analyzes code quality, complexity, and patterns. Use when reviewing code, auditing a codebase, or checking code health.
allowed-tools: Read, Grep, Glob
---

# Code Analyzer

## Instructions

1. Identify target files using Glob patterns
2. Read each file and analyze:
   - Code complexity (cyclomatic complexity)
   - Function length and nesting depth
   - Code duplication patterns
   - Naming conventions

3. Report findings organized by severity

## Output Format

### Critical (must fix)
- [Issue] at `file:line`
- Fix: [suggestion]

### Warnings (should fix)
...

### Suggestions (consider)
...
```
