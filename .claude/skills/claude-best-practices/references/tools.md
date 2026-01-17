# Tools & Extensions

## Bash Tools

Claude inherits your shell environment. To use custom tools:
1. Tell Claude the tool name with usage examples
2. Have Claude run `--help` for documentation
3. Document frequently used tools in CLAUDE.md

## GitHub CLI (gh)

Install `gh` for Claude to:
- Create issues and PRs
- Read comments
- Manage repository interactions

Without `gh`, Claude can still use GitHub API or MCP servers.

## MCP (Model Context Protocol)

### Configuration Locations

| Location | Scope |
|----------|-------|
| Project config | Current directory only |
| Global config | All projects |
| `.mcp.json` (checked in) | All team members |

### Debugging

Use `--mcp-debug` flag to identify configuration issues.

### Example .mcp.json

```json
{
  "servers": {
    "puppeteer": { "command": "npx", "args": ["@anthropic/mcp-puppeteer"] },
    "sentry": { "command": "npx", "args": ["@anthropic/mcp-sentry"] }
  }
}
```

## Custom Slash Commands

### Setup

Store Markdown files in `.claude/commands/` folder:
- Project commands: `.claude/commands/`
- Personal commands: `~/.claude/commands/`

### Using Arguments

Use `$ARGUMENTS` keyword for parameters.

### Example: fix-github-issue.md

```markdown
Please analyze and fix the GitHub issue: $ARGUMENTS

1. Use gh issue view to get issue details
2. Understand the problem
3. Search codebase for relevant files
4. Implement necessary changes
5. Write and run tests
6. Ensure code passes linting and typechecking
7. Create descriptive commit message
8. Push and create PR
```

**Usage:** `/project:fix-github-issue 1234`
