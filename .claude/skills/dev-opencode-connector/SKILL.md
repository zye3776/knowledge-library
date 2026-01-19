---
name: dev-opencode-connector
description: Bridge OpenCode development sessions with BMAD party mode. Sends implementation plans to OpenCode and yields questions back to the calling agent for multi-agent deliberation.
---

# OpenCode Connector

Connects Claude Code to an OpenCode server for autonomous development. When OpenCode asks questions during implementation, this skill yields them back to the calling agent (party mode) for deliberation.

<critical_rules>
- ALWAYS invoke `dev-load-project-context` skill first to load architecture, PRD, and standards
- ALWAYS verify OpenCode server is running before attempting connection
- NEVER auto-answer questions - always yield to calling agent
- ALWAYS read the implementation plan file before sending to OpenCode
</critical_rules>

## Prerequisites

1. OpenCode server running: `opencode serve`
2. Implementation plan markdown file ready
3. Project context loaded via `dev-load-project-context`

## Usage

<instructions>
### Before Starting

1. Invoke skill `dev-load-project-context` to load project context
2. Read the implementation plan at the provided path
3. Verify OpenCode is reachable: `./scripts/opencode-connector --check`

### Running the Connector

```bash
# Check connection
./scripts/opencode-connector --check

# Run with plan
./scripts/opencode-connector --plan ./path/to/implementation-plan.md
```

### Handling Questions

The connector outputs JSON to stdout. When OpenCode asks a question:

```json
{
  "type": "question",
  "data": {
    "session_id": "sess_123",
    "question_id": "q-1",
    "question": "Which database should we use for user storage?",
    "context": {
      "current_task": "Implementing user authentication",
      "files_involved": ["src/auth/user.ts"]
    }
  }
}
```

To answer, write JSON to stdin:

```json
{"question_id": "q-1", "answer": "Use PostgreSQL as specified in architecture.md"}
```

### Completion

When OpenCode finishes:

```json
{
  "type": "result",
  "data": {
    "success": true,
    "session_id": "sess_123",
    "summary": "Completed with 15 messages exchanged",
    "files_changed": ["src/auth/user.ts", "src/db/schema.ts"]
  }
}
```
</instructions>

## Integration with Party Mode

This skill is designed to be called by party mode workflow:

```
Party Mode                    Connector                    OpenCode
    │                            │                            │
    │──invoke connector──────────►                            │
    │                            │──create session───────────►│
    │                            │──send plan────────────────►│
    │                            │                            │
    │                            │◄─────question──────────────│
    │◄──yield question───────────│                            │
    │                            │                            │
    │   [agents deliberate]      │                            │
    │                            │                            │
    │──send answer──────────────►│                            │
    │                            │──forward answer───────────►│
    │                            │                            │
    │                            │◄─────completion────────────│
    │◄──return result────────────│                            │
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `--host` | 127.0.0.1 | OpenCode server host |
| `--port` | 4096 | OpenCode server port |
| `--plan` | (required) | Path to implementation plan |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENCODE_SERVER_PASSWORD` | Optional authentication password |

## Error Handling

<constraints>
- If OpenCode is not reachable, fail immediately with clear error message
- If plan file cannot be read, fail before creating session
- If no answer received for a question, abort session gracefully
- All errors output as JSON: `{"type": "error", "message": "..."}`
</constraints>

## Output Types

| Type | Description |
|------|-------------|
| `question` | OpenCode is asking something - yield to calling agent |
| `result` | Session completed - final summary |
| `status` | Informational message (e.g., connection check) |
| `error` | Something went wrong |
