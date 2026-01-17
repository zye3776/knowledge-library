---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/test/**/*.ts"
---

# Testing Standards

## Test File Organization

### Unit Tests

- Place beside source file in same directory
- Name pattern: `{name}.test.ts`
- Example: `agent-executor.ts` → `agent-executor.test.ts`

### Integration Tests

- Place in `test/integration/` directory
- Name pattern: `{name}.integration.test.ts`

## File Structure

```
src/
└── core/
    ├── agents/
    │   ├── agent-executor.ts
    │   └── agent-executor.test.ts    # Unit test beside source
    └── messaging/
        ├── message-bus.ts
        └── message-bus.test.ts

test/
└── integration/
    └── research-pipeline.integration.test.ts
```

## Test Rules

- All new code must include tests
- Use descriptive test names: `test('should parse agent YAML with nested config')`
- Test files excluded from `dist/` build output
- Run full test suite before committing: `bun test`

## Test Framework

Use Bun's test runner:
```typescript
import { describe, test, expect } from 'bun:test';
```

## DO NOT Use

- Mocha/Chai (deprecated)
- Jest (not compatible with Bun)
