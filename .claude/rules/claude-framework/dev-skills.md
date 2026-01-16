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

```
my-skill/
├── SKILL.md              # Overview, navigation (< 500 lines)
├── reference.md          # Detailed API docs, specifications
├── examples.md           # Usage examples
└── scripts/
    └── helper.py         # Executed without loading into context
```

Reference supporting files in SKILL.md:
```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## Utility scripts
Run extraction: `python scripts/helper.py input.txt`
```

## Script Development Standards

<critical_rules>
### Scripts Must Use TypeScript + Bun
All new skill scripts should be written in TypeScript and built with Bun for:
- Type safety and better IDE support
- Zero-dependency standalone executables
- Native TypeScript execution without transpilation step

### Scripts Must Use TDD (Test-Driven Development)
- Write tests before or alongside implementation
- Tests must be included for all script functionality
- All tests must pass before the skill is considered complete
- Use `bun test` for running tests
</critical_rules>

### Project Structure for Scripts

```
my-skill/
├── SKILL.md
├── package.json            # Bun project config
├── scripts/
│   ├── my-script.ts        # TypeScript source
│   └── my-script.test.ts   # Tests for the script
├── references/             # Large reference docs (loaded on-demand)
│   ├── api-docs.md
│   └── specifications.md
├── data/                   # Static data files
│   ├── config.json
│   └── templates/
└── node_modules/           # Dependencies (gitignored)
```

### Folder Conventions

| Folder | Purpose | When to Use |
|--------|---------|-------------|
| `scripts/` | Executable TypeScript code | CLI tools, automation |
| `references/` | Documentation loaded on-demand | Large API docs, specs, guides |
| `data/` | Static data files | Config, templates, lookup tables |
| `assets/` | Output files (images, fonts) | Templates, icons, boilerplate |

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

### When to Use Scripts vs Inline Code

| Use Scripts | Use Inline Instructions |
|-------------|------------------------|
| Repeated deterministic tasks | One-time operations |
| Complex CLI with many options | Simple file operations |
| External API integrations | Basic text processing |
| State management (resume, etc.) | Claude can handle directly |

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
## Do NOT:
- Exceed 500 lines in SKILL.md (use reference files instead)
- Use vague descriptions (include specific trigger keywords)
- Omit required fields (name, description)
- Put all content inline (use progressive disclosure)
- Store large reference content inline (use `references/` folder)
- Embed static data in code (use `data/` folder)
- Ship scripts without tests (all tests must pass)
- Skip TDD workflow (write tests first or alongside code)
- Build before tests pass (`bun test` then `bun run build`)
</constraints>

## Example: Complete Skill

```yaml
---
name: code-analyzer
description: Analyzes code quality, complexity, and patterns. Use when reviewing code, auditing a codebase, or checking code health.
allowed-tools: Read, Grep, Glob
---

# Code Analyzer

## Instructions

1. Identify target files using Glob patterns
2. Read each file and analyze:
   - Code complexity (cyclomatic complexity)
   - Function length and nesting depth
   - Code duplication patterns
   - Naming conventions

3. Report findings organized by severity

## Output Format

### Critical (must fix)
- [Issue] at `file:line`
- Fix: [suggestion]

### Warnings (should fix)
...

### Suggestions (consider)
...
```

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
