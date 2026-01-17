---
paths:
  - "**/*.{ts,tsx,js,jsx}"
---

# ESLint Compliance

## Never Skip or Disable ESLint Rules

- DO NOT add `// eslint-disable-next-line`
- DO NOT add `// eslint-disable`
- DO NOT add `/* eslint-disable */`
- DO NOT modify `.eslintrc` to weaken rules
- MUST resolve all violations by refactoring code

## Alternative Implementation Process

When encountering an ESLint violation:

1. **Explain the violation** - What rule is being violated and why
2. **Propose alternative solution** - Different implementation that satisfies the rule
3. **Justify the approach** - Why this alternative is chosen
4. **Assess impact** - Effect on readability, performance, maintainability, type safety
5. **Identify risks** - Potential issues or edge cases
6. **Apply only after review** - Document before implementing

## Warnings

- Treat warnings with same rigor as errors
- All warnings must be addressed
- No warning should persist in committed code

## Example Documentation Format

```markdown
### ESLint Issue: `@typescript-eslint/no-explicit-any`

**Violation:** Line 45 uses `any` type for API response
**Current Code:** `const response: any = await fetch(...)`

**Alternative Solution:** Define explicit interface for API response
```typescript
interface ApiResponse {
  data: ResearchResult[];
  meta: { total: number; page: number };
}
const response: ApiResponse = await fetch(...);
```

**Why This Approach:**
- Provides compile-time type checking
- Enables IDE autocompletion
- Documents expected API shape

**Impact:**
- (+) Type safety throughout response handling
- (+) Self-documenting code
- (-) Requires interface maintenance if API changes

**Risks:**
- API response structure changes could cause runtime errors if interface not updated
- Mitigation: Add runtime validation with zod or similar
```
