# AGENTS.md

Guide for agentic coding agents working in the BMAD knowledge-library repository.

## Project Type

BMAD module (v6.0.0-alpha.23) - a Claude Code plugin/extension. NOT a standalone CLI tool.

## Build/Test Commands

### For Skills (TypeScript + Bun)

```bash
cd .claude/skills/skill-name
bun install              # Install dependencies
bun test                 # Run all tests
bun test scripts/script.test.ts  # Run single test file
bun test --test-name-pattern="test name"  # Run matching tests
bun test --watch         # Watch mode
bun run build            # Build standalone (after tests pass)
bun build scripts/script.ts --compile --outfile scripts/script
```

TypeScript provides built-in type checking via Bun. No separate typecheck command needed.

## Code Style Guidelines

### Language & Runtime

- **Language**: TypeScript only (Python NOT allowed for new skills)
- **Runtime**: Bun (https://bun.sh)
- **Module System**: ESM (`"type": "module"` in package.json)

### File Organization

```
skill-name/
├── SKILL.md              # Overview (< 500 lines)
├── package.json          # Dependencies and scripts
├── scripts/
│   ├── main.ts           # Main executable
│   └── main.test.ts      # Tests (required)
└── references/           # Large docs (on-demand)
```

### Imports

```typescript
// Node built-ins first
import { spawn } from "child_process";
// External dependencies second
import { Command } from "commander";
import OpenAI from "openai";
// Local modules third
```

### TypeScript Patterns

```typescript
interface State {
  status: "generating" | "ready" | "completed";
  last_updated?: string;
}

async function loadData(path: string): Promise<State | null> {
  try {
    return await Bun.file(path).json();
  } catch {
    return null;
  }
}
```

Use `const` for variables, `let` only when reassignment needed. Define interfaces for complex types. Use type assertions sparingly (`as Type`). Async/await preferred over callbacks.

### Naming Conventions

| Element | Style | Example |
|---------|-------|---------|
| Files | kebab-case | `tts-openai`, `speak.ts` |
| Classes/Types | PascalCase | `PlaybackState`, `Voice` |
| Functions | camelCase | `generateAudio`, `loadState` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_VOICE` |
| Variables | camelCase | `outputDir` |

### Error Handling

```typescript
try {
  const result = await operation();
  return result;
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}
```

### Console Output

- `console.log` - for data output (pipeable)
- `console.error` - for status/progress (non-pipeable)
- Use `process.stderr.write("\r...")` for in-place updates

### CLI Pattern

```typescript
#!/usr/bin/env bun  // Required shebang
import { Command } from "commander";

const program = new Command();
program.name("script-name").description("Brief")
  .argument("[input]", "Input description")
  .option("-o, --output <file>", "Output file")
  .action(async (input, options) => { /* ... */ });
program.parse();
```

### Testing (TDD Required)

```typescript
import { describe, it, expect } from "bun:test";

describe("functionName", () => {
  it("should handle normal input", () => {
    const result = functionName("input");
    expect(result).toBe("expected");
  });

  it("should handle edge cases", () => {
    expect(() => functionName("")).toThrow();
  });

  it("should handle async operations", async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
  });
});
```

**TDD Workflow:** Write failing test → Implement minimal code → Refactor → Build

### Formatting

2-space indentation, single quotes, semicolons required, max 80-100 chars/line, no trailing whitespace, empty line between functions.

## Constraints

- NO auto-advancing workflow steps without user approval
- NO Python for new skills (use TypeScript + Bun)
- NO searching/reading from `node_modules/` folders
- NO hardcoding paths (use config values)
- ALL scripts must have tests
- ALL tests must pass before building
- SKILL.md files must be under 500 lines

## File Patterns to Ignore

When using Glob or Grep, exclude: `node_modules/`, `.git/`, `_bmad-output/`, `dist/`, `build/`

## Common Pitfalls

- Missing `#!/usr/bin/env bun` shebang
- Forgetting `process.exit(1)` on errors
- Using `console.log` for status (should be `console.error`)
- Not defining interfaces for complex types
- Writing tests after implementation (violates TDD)
- Building before tests pass
- Exceeding 500 lines in SKILL.md (use references/ folder)
