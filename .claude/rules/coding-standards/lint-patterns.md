# Lint Patterns to Avoid

<critical_rules>
When fixing lint errors not covered in this document, ADD the new pattern here with an example before or after fixing. Keep this document current as the canonical reference for lint issues in this project.
</critical_rules>

Common ESLint violations to prevent when writing TypeScript code.

## Unused Imports

Only import what you use. Remove imports when refactoring removes their usage.

```typescript
// Wrong - importing unused items
import { describe, test, expect, beforeEach, mock } from "bun:test";
// If beforeEach and mock aren't used in the file

// Correct - only import what's needed
import { describe, test, expect } from "bun:test";
```

## Unused Variables

Prefix intentionally unused variables with underscore (`_`).

```typescript
// Wrong - unused destructured value
const { values, positionals } = parseArgs(options);
// If positionals is never used

// Correct - prefix with underscore
const { values, positionals: _positionals } = parseArgs(options);

// Wrong - unused computed value
const totalFindings = issues.length + suggestions.length;
// If totalFindings is never referenced

// Correct - prefix with underscore if keeping for documentation
const _totalFindings = issues.length + suggestions.length;
// Or remove entirely if not needed
```

## Unused Type Imports

Remove type imports that aren't used. Common after refactoring.

```typescript
// Wrong - Severity and SuggestionSeverity not used
import type {
  ReviewInput,
  Severity,
  SuggestionSeverity,
  OverallQuality,
} from "./types";

// Correct - only import used types
import type {
  ReviewInput,
  OverallQuality,
} from "./types";
```

## Prefer const Over let

Use `const` for variables that are never reassigned, even if mutated.

```typescript
// Wrong - array is never reassigned
let items: string[] = [];
items.push("foo");

// Correct - const works for mutable operations
const items: string[] = [];
items.push("foo");
```

## Regex Escape Characters

Don't escape characters that don't need escaping. Use `$` for end-of-string, not `\Z`.

```typescript
// Wrong - \Z is not a valid JS regex escape
const pattern = /^##+ .*goal[\s\S]*?(?=^#|\Z)/im;

// Correct - use $ for end of string
const pattern = /^##+ .*goal[\s\S]*?(?=^#|$)/im;
```

## Before Committing

Run lint check before committing:

```bash
bun run lint
```

Fix auto-fixable issues:

```bash
bun run lint:fix
```
