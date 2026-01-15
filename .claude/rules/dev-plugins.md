---
paths:
  - ".claude-plugin/**"
  - "**/.claude-plugin/**"
  - "**/plugin.json"
---

# Plugins Development Standards

<critical_rules>
When creating or editing plugin files, follow these standards:

## Only `name` Is Required in plugin.json
All other fields are optional (version defaults to `0.1.0` if omitted).

## Directory Structure Requirements
- `.claude-plugin/plugin.json` must exist at plugin root
- Component directories (`skills/`, `agents/`, `commands/`, `hooks/`) at plugin root
- Do NOT nest component directories inside `.claude-plugin/`

## Namespacing
Plugin components inherit namespace: `my-plugin:skill-name`, `my-plugin:agent-name`
</critical_rules>

## Plugin Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (only name required)
├── skills/
│   └── my-skill/
│       ├── SKILL.md
│       └── scripts/
│           └── helper.py
├── agents/
│   └── my-agent.md
├── commands/
│   └── my-command.md
├── hooks/
│   └── pre-commit.sh
└── README.md
```

## plugin.json Manifest

### Minimal (Only Required Field)

```json
{
  "name": "my-plugin"
}
```

### Recommended (With Metadata)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Description of what this plugin does",
  "author": "Your Name",
  "repository": "https://github.com/user/my-plugin",
  "license": "MIT"
}
```

### Full (With All Options)

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Description of what this plugin does",
  "author": "Your Name",
  "repository": "https://github.com/user/my-plugin",
  "license": "MIT",
  "claude-code": {
    "minVersion": "1.0.0"
  },
  "skills": ["skills/*"],
  "agents": ["agents/*"],
  "commands": ["commands/*"],
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "./hooks/validate.sh"
      }]
    }]
  },
  "mcp": {
    "servers": {
      "my-server": {
        "command": "node",
        "args": ["./mcp/server.js"]
      }
    }
  }
}
```

## Manifest Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | **Yes** | Plugin identifier (lowercase, hyphens, unique across installed plugins) |
| `version` | No | Semantic version (defaults to `0.1.0`) |
| `description` | No | What the plugin does |
| `author` | No | Plugin author |
| `repository` | No | Source repository URL |
| `license` | No | License identifier |
| `claude-code.minVersion` | No | Minimum Claude Code version required |
| `skills` | No | Glob patterns for skill directories |
| `agents` | No | Glob patterns for agent files |
| `commands` | No | Glob patterns for command files |
| `hooks` | No | Hook configurations |
| `mcp` | No | MCP server configurations |

## Skills in Plugins

Place skills in `skills/` directory:

```
skills/
└── code-analyzer/
    ├── SKILL.md
    ├── reference.md
    └── scripts/
        └── analyze.py
```

Skills inherit plugin namespace: `my-plugin:code-analyzer`

## Agents in Plugins

Place agents in `agents/` directory:

```
agents/
└── reviewer.md
```

Agent name becomes: `my-plugin:reviewer`

## Commands in Plugins

Place commands in `commands/` directory:

```
commands/
├── analyze.md
└── report.md
```

Commands become: `/analyze`, `/report` with namespace `my-plugin`

## Hooks in Plugins

Define in `plugin.json`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write",
      "hooks": [{
        "type": "command",
        "command": "./hooks/validate-write.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "./hooks/log-bash.sh"
      }]
    }]
  }
}
```

## MCP Servers in Plugins

Bundle MCP servers:

```json
{
  "mcp": {
    "servers": {
      "database": {
        "command": "node",
        "args": ["./mcp/db-server.js"],
        "env": {
          "DB_PATH": "./data/db.sqlite"
        }
      }
    }
  }
}
```

## Installation

```bash
# From local directory
claude plugins install ./my-plugin

# From git repository
claude plugins install github:user/my-plugin

# From marketplace (if published)
claude plugins install my-plugin
```

## Plugin Scope

| Installation | Scope |
|--------------|-------|
| Project | `.claude/plugins/` - this repo only |
| Personal | `~/.claude/plugins/` - all your projects |

## Priority (Lowest to Highest)

1. Plugin-provided skills/agents/commands
2. Project `.claude/` definitions
3. Personal `~/.claude/` definitions
4. Enterprise/Managed definitions

Higher priority overrides lower when names conflict.

<constraints>
## Do NOT:
- Nest component directories inside `.claude-plugin/`
- Use names that conflict with existing plugins
- Forget to use kebab-case for plugin names
- Omit the `name` field (only required field)
- Assume version/description are required (they're not)
</constraints>

## Development Workflow

1. **Create structure:**
   ```bash
   mkdir -p my-plugin/.claude-plugin my-plugin/skills my-plugin/agents my-plugin/commands
   ```

2. **Add plugin.json:**
   ```bash
   echo '{"name": "my-plugin"}' > my-plugin/.claude-plugin/plugin.json
   ```

3. **Develop skills/agents/commands** in respective directories

4. **Test locally:**
   ```bash
   claude plugins install ./my-plugin
   ```

5. **Verify with `/context`** - check skills and agents are discovered

6. **Publish** (when ready for distribution)

## Best Practices

1. Keep SKILL.md under 500 lines - use reference files for details
2. Write clear descriptions - Claude uses them for auto-discovery
3. Include README.md - document what the plugin provides
4. Version semantically - breaking changes = major version bump
5. Test before publishing - install locally and verify all features
6. Scope tools appropriately - restrict tools in skills/agents for safety

## Additional Resources

For questions about Claude Code plugins not covered here, use the deepwiki MCP tool:

```
mcp__deepwiki__ask_question
  repoName: "anthropics/claude-code"
  question: "Your specific question about plugins"
```

Example queries:
- "How does plugin namespacing work for skills and agents?"
- "What fields are supported in plugin.json manifest?"
- "How do MCP servers get bundled with plugins?"
