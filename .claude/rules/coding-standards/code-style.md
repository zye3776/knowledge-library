---
paths:
  - "**/*.{ts,tsx}"
---

# Code Style

## Formatting

Run before committing:
```bash
bun run format
```

## Prettier Configuration

- Single quotes for strings
- 2-space indentation
- Trailing commas in multi-line structures
- 100 character line width

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `agent-parser.ts` |
| Classes | PascalCase | `BaseAgent` |
| Interfaces | PascalCase (I prefix optional) | `AgentConfig` or `IAgentConfig` |
| Functions | camelCase | `parseAgentFile` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variables | camelCase | `agentInstance` |

## Examples

```typescript
// Constants
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;

// Interface
interface AgentConfig {
  id: string;
  name: string;
}

// Class
class BaseAgent {
  constructor(private config: AgentConfig) {}
}

// Function
function parseAgentFile(configPath: string): AgentConfig {
  // ...
}

// Variable
const agentInstance = new BaseAgent(config);
```
