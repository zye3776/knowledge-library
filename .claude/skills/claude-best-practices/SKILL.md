---
name: claude-best-practices
description: Use when customizing CLAUDE.md files, configuring tool permissions, creating slash commands, optimizing prompts, setting up headless automation, or implementing multi-agent workflows.
globs:
  - CLAUDE.md
  - CLAUDE.local.md
  - .claude/settings.json
  - .claude/commands/**
  - .mcp.json
---

# Claude Code Best Practices

<critical_rules>
## Core Principles

1. **Specificity wins** - Clear, detailed instructions outperform vague requests
2. **Iterate with feedback** - Course correct early; use Escape to interrupt
3. **Visual context helps** - Provide images, mocks, screenshots when relevant
4. **Test-driven works** - Give Claude clear targets (tests, mocks) to iterate against
5. **Separate concerns** - Use multiple Claude instances for write/review cycles
</critical_rules>

## Quick Reference

Load the relevant reference based on user intent:

| Topic | Reference |
|-------|-----------|
| Setting up CLAUDE.md | See @references/setup.md |
| Custom slash commands | See @references/tools.md |
| Workflow patterns | See @references/workflows.md |
| Optimizing interactions | See @references/optimization.md |
| CI/CD integration | See @references/automation.md |
| Running multiple Claudes | See @references/multi-agent.md |

## CLAUDE.md File Hierarchy

| Location | Scope | Git |
|----------|-------|-----|
| `~/.claude/CLAUDE.md` | Global (all sessions) | N/A |
| `./CLAUDE.md` | Project root (shared) | Commit |
| `./CLAUDE.local.md` | Project local | Gitignore |
| Parent directories | Inherited downward | Optional |
| Child directories | Loaded on demand | Optional |

<constraints>
## Do NOT
- Put secrets in CLAUDE.md (use environment variables)
- Make CLAUDE.md overly long (keep concise, use imports)
- Skip permission setup for automated workflows
</constraints>

<system_reminder>
Key principles: Specificity wins, iterate with feedback, test-driven works.
Load topic-specific references from references/ folder based on user intent.
</system_reminder>