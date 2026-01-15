---
name: dev-guide-subagents
description: Development guide for creating Claude Code Subagents. Use when building custom agents, understanding context isolation, or configuring the Task tool.
allowed-tools: Read, Glob, Grep
---

# Claude Code Subagents Development Guide

## What Are Subagents?

Subagents are specialized AI assistants that run in **separate context windows** with their own system prompt, tool access, permissions, and conversation history. Claude delegates to them automatically based on task description matching.

## When to Use Subagents

Choose subagents when you need:
- Context isolation (prevent verbose output from polluting main conversation)
- Tool restrictions (limit what Claude can do for safety)
- Different model selection (faster/cheaper for specific tasks)
- Parallel task execution (background processing)

## Agent File Structure

Store agents as markdown files in `.claude/agents/`:

```markdown
---
name: agent-name
description: When Claude should delegate to this agent
tools: Read, Grep, Glob
model: sonnet
---

# System Prompt

Instructions that guide the subagent's behavior.
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | When Claude should delegate to this agent |
| `tools` | No | Tools agent can use. Inherits all if omitted |
| `disallowedTools` | No | Tools to deny (removed from inherited list) |
| `model` | No | `sonnet`, `opus`, `haiku`, or `inherit`. Default: `sonnet` |
| `permissionMode` | No | Permission handling mode |
| `skills` | No | Skills to load into agent's context |
| `hooks` | No | Lifecycle hooks |

## Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Standard permission prompts |
| `acceptEdits` | Auto-accept file edits |
| `dontAsk` | Auto-deny permission prompts (allowed tools still work) |
| `bypassPermissions` | Skip all permission checks |
| `plan` | Read-only exploration mode |

## Tool Restrictions

**Allowlist approach:**
```yaml
tools: Read, Grep, Glob, Bash
```

**Denylist approach:**
```yaml
disallowedTools: Write, Edit
```

## Agent Locations

| Location | Scope | Priority |
|----------|-------|----------|
| `--agents` CLI flag | Current session | Highest |
| `.claude/agents/` | Current project | High |
| `~/.claude/agents/` | All projects | Medium |
| Plugin's `agents/` | Where installed | Lowest |

## The Task Tool

Claude invokes subagents via the Task tool automatically when:
1. Task description matches agent's description
2. User explicitly requests: "use the code-reviewer agent"
3. Task needs context isolation

**Invocation patterns:**
```
# Automatic (Claude matches description)
Analyze this code for performance issues

# Explicit request
Use the extractor agent to process this video

# Background execution
Run this in the background
```

## Context Isolation

Each subagent invocation creates a new instance with:
- Independent conversation history
- Separate token budget
- Own permission context
- Isolated tool access

Results return to main conversation as summaries, not full output.

## Foreground vs Background

| Mode | Permission Prompts | MCP Tools | Use Case |
|------|-------------------|-----------|----------|
| Foreground | Pass through to user | Available | Interactive tasks |
| Background | Auto-deny if not pre-approved | Unavailable | Long-running tasks |

Background via:
- Ask Claude: "run this in the background"
- Press `Ctrl+B` during execution

## Resuming Subagents

```
Continue that code review and now check the authorization logic
```

Resumed subagents retain full conversation history from previous invocation.

## Built-in Subagents

| Agent | Model | Tools | When Used |
|-------|-------|-------|-----------|
| `Explore` | Haiku | Read-only | File discovery, codebase exploration |
| `Plan` | Inherit | Read-only | Planning phase |
| `general-purpose` | Inherit | All tools | Complex multi-step tasks |

## Hooks

**In agent frontmatter:**
```yaml
---
name: db-reader
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-query.sh"
---
```

**In settings.json (lifecycle events):**
```json
{
  "hooks": {
    "SubagentStart": [{
      "matcher": "db-agent",
      "hooks": [{ "type": "command", "command": "./setup.sh" }]
    }],
    "SubagentStop": [{
      "matcher": "db-agent",
      "hooks": [{ "type": "command", "command": "./cleanup.sh" }]
    }]
  }
}
```

## Example: Complete Subagent

```yaml
---
name: code-reviewer
description: Expert code review specialist. Reviews code for quality, security, and maintainability. Use after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
permissionMode: default
---

You are a senior code reviewer ensuring high standards.

## When Invoked

1. Run `git diff` to see recent changes
2. Focus on modified files
3. Begin review immediately

## Review Checklist

- Code clarity and readability
- Well-named functions and variables
- No code duplication
- Proper error handling
- No exposed secrets or API keys
- Input validation
- Test coverage
- Performance considerations

## Output Format

### Critical (must fix)
- [Issue] at `file:line`
- Fix: [suggestion]

### Warnings (should fix)
...

### Suggestions (consider)
...
```

## Subagents vs Skills

| Aspect | Subagents | Skills |
|--------|-----------|--------|
| Context | Isolated, separate | Main conversation |
| Persistence | Per-session, resumable | Per-conversation |
| Best for | Context isolation, tool restriction | Teaching Claude workflows |
