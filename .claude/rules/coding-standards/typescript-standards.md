---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript Standards

## Strict Mode

All strict checks must pass:
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true

## Type Definitions

- Prefer explicit types over inference for function parameters
- Prefer explicit types over inference for return types
- Use interfaces for object shapes that may be extended
- Use type aliases for unions, intersections, and primitives

## Examples

```typescript
// Correct - Explicit function signature
function parseAgentFile(configPath: string): Promise<AgentConfig> {
  // ...
}

// Correct - Interface for extensible object shapes
interface AgentConfig {
  id: string;
  name: string;
  description?: string;
}

// Correct - Type alias for unions
type Message = AgentMessage | SystemMessage | UserMessage;

// Incorrect - Avoid when possible
function parseAgentFile(configPath) { // Missing type annotations
  // ...
}
```
