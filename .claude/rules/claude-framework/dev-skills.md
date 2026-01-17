---
paths:
  - ".claude/skills/**/*.md"
  - ".claude/skills/**/SKILL.md"
  - "**/skills/**/SKILL.md"
---

# Skills Development Standards

<critical_rules>
When creating or editing SKILL.md files, follow these standards:

## Required Frontmatter Fields
- `name`: Lowercase letters, numbers, hyphens only. Max 64 chars
- `description`: What skill does and when to use it. Max 1024 chars. Claude uses this for auto-discovery

## SKILL.md Must Be Under 500 Lines
Use separate files for detailed content (reference.md, examples.md, scripts/)

## First Decision: Static vs Script-Powered

Before creating any skill, determine if it needs executable scripts:

### Use Static Skills When:
- Providing document indexes or navigation
- Defining prompt templates or workflow guides
- Instructing Claude what to read/do (Claude handles execution)
- Creating reference lookups or configuration guides
- The skill's job is to guide, not execute

### Use Script-Powered Skills When:
- Calling external APIs (TTS, web services, etc.)
- Processing binary files or complex data transforms
- Requiring state management or persistence
- Needing deterministic CLI behavior
- Tasks Claude's built-in tools cannot handle

**Default to static.** Only add scripts when Claude cannot accomplish the task with its built-in tools (Read, Write, Edit, Grep, Glob, WebFetch, Bash).
</critical_rules>

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase, hyphens) |
| `description` | Yes | When Claude should use this skill (include trigger keywords) |
| `version` | No | Semantic version (e.g., `1.0.0`) |
| `allowed-tools` | No | Tools skill can use: `Read`, `Grep`, `Glob`, `Write`, `Edit`, `Bash`, `WebFetch`, `WebSearch` |
| `model` | No | Model override (e.g., `claude-sonnet-4-20250514`). Defaults to conversation model |
| `context` | No | Set to `fork` to run in isolated subagent context |
| `agent` | No | Agent type when `context: fork`: `Explore`, `Plan`, `general-purpose`, or custom |
| `hooks` | No | Lifecycle hooks: `PreToolUse`, `PostToolUse`, `Stop` |
| `user-invocable` | No | Show in slash menu (default: `true`) |
| `disable-model-invocation` | No | Block Skill tool invocation (default: `false`) |

## File Organization

### Static Skill Structure

```
my-skill/
├── SKILL.md              # Complete instructions (< 500 lines)
└── references/           # Optional: large docs loaded on-demand
    └── detailed-guide.md
```

### Script-Powered Skill Structure

```
my-skill/
├── SKILL.md              # Overview + script usage (< 500 lines)
├── package.json          # Bun project config
├── scripts/
│   ├── main.ts           # TypeScript source
│   └── main.test.ts      # Tests (required)
└── references/           # Optional: large docs
    └── api-docs.md
```

## Static Skills

Static skills contain only instructions - Claude executes them using built-in tools.

For XML formatting within SKILL.md files (semantic tags, indentation), see `.claude/rules/markdown/xml.md`.

## Script-Powered Skills

Use scripts only when Claude's built-in tools cannot accomplish the task.

<critical_rules>
### Scripts Must Use TypeScript + Bun
- Type safety and better IDE support
- Zero-dependency standalone executables
- Native TypeScript execution

### Scripts Must Compile to Standalone Binary
```bash
bun build ./cli.ts --compile --outfile scripts/{script-name}
```
- `package.json` must include a `build` script
- Never ship without building the standalone executable

### Scripts Must Use TDD
- Write tests before or alongside implementation
- All tests must pass before skill is complete
- Use `bun test` for running tests
</critical_rules>

### package.json Template

```json
{
  "name": "skill-name",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "bun build scripts/my-script.ts --compile --outfile scripts/my-script",
    "test": "bun test",
    "test:watch": "bun test --watch"
  },
  "dependencies": {
    "commander": "^14.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

### Script File Template

```typescript
#!/usr/bin/env bun
import { Command } from "commander";

const program = new Command();

program
  .name("script-name")
  .description("What this script does")
  .argument("[input]", "Input description")
  .option("-o, --output <file>", "Output file")
  .action(async (input, options) => {
    // Implementation
  });

program.parse();
```

### Build Commands

```bash
# Install dependencies
bun install

# Build standalone executable
bun run build

# Or directly:
bun build scripts/my-script.ts --compile --outfile scripts/my-script
```

### Test File Template

```typescript
// scripts/my-script.test.ts
import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe("my-script", () => {
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
});
```

### TDD Workflow

```bash
# 1. Write failing test first
bun test                    # RED - test fails

# 2. Implement minimal code to pass
bun test                    # GREEN - test passes

# 3. Refactor while keeping tests green
bun test                    # REFACTOR - still passes

# 4. Build after all tests pass
bun run build
```

### Script Best Practices

| Practice | Description |
|----------|-------------|
| Shebang | Always use `#!/usr/bin/env bun` as first line |
| CLI framework | Use `commander` for argument parsing |
| Type safety | Define interfaces for options and state |
| Error handling | Use try/catch with typed errors |
| Exit codes | Use `process.exit(1)` for errors |
| Output | Use `console.error` for status, `console.log` for data |
| Environment | Read API keys from `process.env` |
| Testing | Write tests for all exported functions |
| Test location | Place `*.test.ts` files alongside source in `scripts/` |

## Progressive Disclosure

Claude loads skills in stages to preserve context tokens:
1. **Discovery**: Only name + description loaded at startup
2. **Activation**: Full SKILL.md loaded when request matches description
3. **Execution**: Referenced files loaded only when needed

## Skill Locations and Priority

| Location | Path | Scope | Priority |
|----------|------|-------|----------|
| Personal | `~/.claude/skills/` | All your projects | Higher |
| Project | `.claude/skills/` | This repo only | Lower |
| Plugin | Bundled with plugin | Where installed | Lowest |

Higher priority overrides lower when names conflict.

## Context Isolation

Run skill in isolated subagent with `context: fork`:

```yaml
---
name: heavy-processor
description: Processes large files with verbose output
context: fork
agent: general-purpose
allowed-tools: Read, Bash
---
```

Benefits:
- Separate conversation history
- Verbose output doesn't pollute main context
- Independent token budget

## Skills vs Commands vs Subagents

| Aspect | Skills | Commands | Subagents |
|--------|--------|----------|-----------|
| Invocation | Automatic (description match) | Explicit `/cmd` | Task tool |
| Structure | Directory + SKILL.md | Single .md file | Single .md file |
| Best for | Complex workflows | Quick prompts | Context isolation |
| Supporting files | Yes | No | No |
| Location | `.claude/skills/` | `.claude/commands/` | `.claude/agents/` |

<constraints>
## Do NOT (All Skills):
- Exceed 500 lines in SKILL.md (use reference files)
- Use vague descriptions (include trigger keywords)
- Omit required fields (name, description)
- Add scripts when static instructions suffice

## Do NOT (Script-Powered Skills Only):
- Ship scripts without tests
- Skip TDD workflow
- Build before tests pass
- Skip compiling standalone binary
</constraints>

## Examples

### Static Skill

See `.claude/skills/dev-load-project-context/SKILL.md` - document index that guides Claude to read relevant files.

### Script-Powered Skill

See `.claude/skills/tts-openai/SKILL.md` - calls external OpenAI API for text-to-speech conversion.

## Related Rules

| Rule | When to Use |
|------|-------------|
| `.claude/rules/markdown/xml.md` | Writing SKILL.md content with semantic XML tags and proper indentation |
| `.claude/rules/markdown/maintenance.md` | After creating or editing any skill markdown files |
| `.claude/rules/markdown/imports.md` | When referencing external files from SKILL.md using @imports |

## Additional Resources

For questions about Claude Code skill development not covered here, use the deepwiki MCP tool:

```
mcp__deepwiki__ask_question
  repoName: "anthropics/claude-code"
  question: "Your specific question about skills"
```

Example queries:
- "What YAML frontmatter fields are supported in SKILL.md?"
- "How do skill scripts work with the progressive disclosure system?"
- "What are best practices for skill script error handling?"
