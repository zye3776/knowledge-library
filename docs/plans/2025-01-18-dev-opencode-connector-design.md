# dev-opencode-connector Design

**Date:** 2025-01-18
**Status:** Approved

## Overview

A connector skill that bridges OpenCode development sessions with BMAD party mode. It sends implementation plans to OpenCode, yields questions back to the calling agent for multi-agent deliberation, and forwards answers back to OpenCode until development completes.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Party Mode     │◄───►│ dev-opencode-connector│◄───►│  OpenCode   │
│  (Calling Agent)│     │      (This Skill)     │     │   Server    │
└─────────────────┘     └──────────────────────┘     └─────────────┘
        │                         │
        │ yields questions        │ SSE stream
        │ receives answers        │ @opencode-ai/sdk
        ▼                         ▼
   Multi-agent               Development
   deliberation              execution
```

## Design Decisions

### Delegation Mode
- Claude Code sends the plan to OpenCode
- Claude Code answers OpenCode's questions automatically using party mode
- Fully automated - no user intervention during execution

### SDK Approach
- Uses `@opencode-ai/sdk` TypeScript package
- Type-safe, handles SSE streaming natively
- Cleaner API than raw HTTP

### Context Loading
- Invokes `dev-load-project-context` skill first
- Reads architecture, PRD, coding standards
- Full codebase exploration for answering questions

### Callback/Yield Pattern
- Skill yields each question back to calling agent
- Waits for response, then continues
- Maintains session state naturally
- Maps well to OpenCode SDK's SSE stream

### Assumes OpenCode Running
- Expects `opencode serve` already running on configured port
- Fails with clear error if not reachable
- Simpler than auto-start, easier to debug

## Interfaces

### Input

```typescript
interface ConnectorInput {
  plan_path: string;           // Path to implementation plan
  opencode?: {
    host?: string;             // Default: 127.0.0.1
    port?: number;             // Default: 4096
  };
}
```

### Yielded Question

```typescript
interface OpenCodeQuestion {
  session_id: string;
  question_id: string;
  question: string;
  context: {
    current_task: string;
    files_involved: string[];
    code_snippet?: string;
  };
}
```

### Answer Format

```typescript
interface OpenCodeAnswer {
  question_id: string;
  answer: string;
  files_to_reference?: string[];
}
```

### Final Result

```typescript
interface ConnectorResult {
  success: boolean;
  session_id: string;
  summary: string;
  files_changed: string[];
  errors?: string[];
}
```

## Flow

1. **Load context** - Invoke `dev-load-project-context` skill
2. **Read plan** - Load implementation plan from `plan_path`
3. **Connect** - Use `@opencode-ai/sdk` to connect to OpenCode server
4. **Create session** - Start new OpenCode session
5. **Send plan** - Send implementation plan as initial prompt
6. **Listen loop**:
   - Subscribe to SSE events
   - When OpenCode asks a question → yield to calling agent
   - Receive answer from calling agent → send to OpenCode
   - Repeat until completion signal
7. **Return** - Return final result with summary and changed files

## File Structure

```
.claude/skills/dev-opencode-connector/
├── SKILL.md              # Skill definition
├── package.json          # Dependencies (@opencode-ai/sdk)
├── bun.lock
└── scripts/
    ├── main.ts           # Entry point + CLI
    ├── connector.ts      # Core connector logic
    ├── types.ts          # TypeScript interfaces
    └── main.test.ts      # Tests
```

## Error Handling

- **Connection failed**: Clear error message with host:port info
- **Session creation failed**: Return error with OpenCode response
- **Timeout**: Configurable timeout per question (default 5 min)
- **OpenCode error**: Capture and return in result

## Integration with Party Mode

The skill is designed to be invoked by party mode workflow:

1. Party mode receives a story to implement
2. Party mode invokes `dev-opencode-connector` with plan
3. When OpenCode asks a question, skill yields back to party mode
4. Party mode agents deliberate on the answer
5. Party mode sends answer back through the skill
6. Loop until complete
