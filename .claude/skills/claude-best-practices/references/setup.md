# Setup & Configuration

## CLAUDE.md Files

### What to Include
- Common bash commands
- Core files and utility functions
- Code style guidelines
- Testing instructions
- Repository etiquette (branch naming, merge vs rebase)
- Developer environment setup
- Project-specific warnings or unexpected behaviors

### Example CLAUDE.md

```markdown
# Bash commands
- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style
- Use ES modules (import/export), not CommonJS (require)
- Destructure imports when possible

# Workflow
- Always typecheck after code changes
- Prefer single tests over full test suite for performance
```

### File Locations

| Location | Scope | Git |
|----------|-------|-----|
| `~/.claude/CLAUDE.md` | All sessions | N/A |
| `./CLAUDE.md` | Project (shared) | Commit |
| `./CLAUDE.local.md` | Project (private) | Gitignore |
| Parent directories | Inherited | Optional |
| Child directories | On-demand | Optional |

### Tuning Tips
- Treat CLAUDE.md like a prompt - iterate on effectiveness
- Use `#` key to have Claude add instructions automatically
- Add emphasis (IMPORTANT, YOU MUST) for critical rules
- Keep concise and human-readable
- Run through prompt improver occasionally

## Tool Permissions

### Managing Allowed Tools
1. Select "Always allow" when prompted
2. Use `/permissions` command to add/remove tools
3. Edit `.claude/settings.json` (project) or `~/.claude.json` (global)
4. Use `--allowedTools` CLI flag for session-specific

### Common Permission Patterns

```
Edit                    # Allow file edits
Bash(git commit:*)      # Allow git commits
mcp__<server>__<tool>   # Allow specific MCP tools
```

## Quick Setup

Run `/init` to auto-generate a CLAUDE.md for your project.
