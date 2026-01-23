## Project Overview

This is a **BMAD knowledge-library** - a Claude Code plugin/extension that enables users to extract YouTube video transcripts, refine them by removing noise (sponsors, ads, visual references), and convert them to audio via TTS for listening on walks/commutes.

<critical_rules>
- This is NOT a standalone CLI tool. It's a BMAD module (v6.0.0-alpha.23) with step-file workflows orchestrated through Claude Code.
- Always present A/P/C menu after content generation
- Never auto-advance without user approval
- Update frontmatter `stepsCompleted` array on progression
- Use DeepWiki MCP as the PRIMARY source for technical research over WebSearch (setup guides, troubleshooting, API reference)
- Agents MUST obey rules in `.opencode/rules/` whenever applicable - read the referenced rule file before performing related tasks
  </critical_rules>

## Architecture

### Directory Structure

| Path                | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `_bmad/`            | BMAD framework modules (core, bmm, bmb, cis)   |
| `_bmad-output/`     | Generated artifacts (planning, implementation) |
| `.claude/skills/`   | Claude Code skills (TypeScript + Bun)          |
| `.claude/agents/`   | Custom subagents                               |
| `.claude/rules/`    | Development standards                          |
| `.claude/commands/` | Slash commands                                 |

### BMAD Modules

- **core**: Brainstorming, party-mode workflows, bmad-master agent
- **bmm**: Business Method Module - PM, dev, architect agents and workflows
- **bmb**: BMAD Module Builder - create agents/workflows/modules
- **cis**: Creative & Innovation Suite - design thinking, problem solving

### Content Library Structure (after implementation)

```
libraries/{slug}/
├── transcript.md     # Raw extraction
├── refined.md        # Cleaned content
├── audio.mp3         # TTS output
└── metadata.yaml     # Source info, pipeline state
```

## Key Patterns

### BMAD Workflows

- Entry point: `workflow.md`
- Steps: `steps/` or tri-modal `steps-c/`, `steps-e/`, `steps-v/`
- Step naming: `step-{NN}-{action}.md`

### Skills Development

Skills use TypeScript + Bun with TDD:

```bash
cd .claude/skills/skill-name
bun install
bun test          # Run tests first
bun run build     # Create standalone executable
```

Required structure:

```
skill-name/
├── SKILL.md              # < 500 lines
├── package.json
├── scripts/
│   ├── main.ts
│   └── main.test.ts      # Tests required
└── references/           # Large docs (on-demand)
```

### Hybrid XML + Markdown

Skills, commands, and agents use hybrid formatting:

- **XML tags**: `<critical_rules>`, `<constraints>`, `<instructions>`, `<user_input>`
- **Markdown**: Headers, code blocks, lists, documentation

## Commands

```bash
# Linting & Formatting (from project root)
bun run lint              # Check for ESLint errors
bun run lint:fix          # Auto-fix ESLint errors
bun run format            # Format with Prettier
bun run format:check      # Check formatting

# Testing (within skill directories)
cd .claude/skills/skill-name
bun test                  # Run all tests
bun test --watch          # Watch mode
bun test scripts/main.test.ts  # Run single test file

# Build a skill
cd .claude/skills/skill-name && bun install && bun run build

# TTS playback
.claude/skills/tts-openai/scripts/speak "text"
.claude/skills/tts-openai/scripts/speak -f file.txt
```

## Environment Variables

| Variable         | Purpose                       |
| ---------------- | ----------------------------- |
| `OPENAI_API_KEY` | Required for tts-openai skill |

<constraints>
## Do NOT

- Auto-advance workflow steps without user approval
- Skip A/P/C menu presentation
- Overwrite content without confirmation
- Use Python for new skills (use TypeScript + Bun)
- Use npm, yarn, or pnpm (always use bun)
- Hardcode paths (use config values)
- Ship skills without tests
- Search or read from `node_modules/` folders (especially in `.claude/skills/*/node_modules/`)
  </constraints>

<system_reminder>
Key points: This is a BMAD module, not a CLI tool. Always use TypeScript + Bun for skills. Never auto-advance workflows. Never search/read node_modules.
</system_reminder>

## OpenCode Rules

<rules>
  <section name="coding-standards" description="Code quality and style enforcement">
    <rule name="code-style" path=".opencode/rules/code-style.md">
      Prettier config, naming conventions (kebab-case files, PascalCase classes, camelCase functions, SCREAMING_SNAKE constants); use when writing or reviewing TypeScript code formatting.
    </rule>
    <rule name="typescript-standards" path=".opencode/rules/typescript-standards.md">
      Strict mode requirements, explicit function signatures, interfaces for extensible objects, type aliases for unions; use when defining types or function signatures.
    </rule>
    <rule name="effectjs-standards" path=".opencode/rules/effectjs-standards.md">
      Tagged error types, Effect.gen for composition, Schedule for retries, acquireRelease for resources, Context.Tag for DI; use when writing Effect.js code or error handling.
    </rule>
    <rule name="eslint-compliance" path=".opencode/rules/eslint-compliance.md">
      Never disable ESLint rules - refactor code to comply, document alternative solutions with impact analysis; use when encountering lint violations.
    </rule>
    <rule name="lint-patterns" path=".opencode/rules/lint-patterns.md">
      Fixes for unused imports/variables (underscore prefix), const over let, typed mocks instead of `as any`, regex escapes; use when fixing common lint errors.
    </rule>
    <rule name="testing-standards" path=".opencode/rules/testing-standards.md">
      Unit tests beside source files (`*.test.ts`), integration tests in `test/integration/`, Bun test runner only; use when creating or organizing tests.
    </rule>
  </section>

  <section name="markdown" description="Documentation formatting standards">
    <rule name="imports" path=".opencode/rules/imports.md">
      Use `@path/to/file` syntax to reference files, add context before imports, avoid circular dependencies; use when extracting content to separate files or referencing shared docs.
    </rule>
    <rule name="maintenance" path=".opencode/rules/maintenance.md">
      Remove redundancy, resolve conflicts, consolidate sections, reference instead of duplicate across files; use after creating or updating any markdown file.
    </rule>
    <rule name="xml" path=".opencode/rules/xml.md">
      Invent semantic tags (`<documents>`, `<workflow>`), indent nested XML, use Markdown for headers/lists/code; use when creating Skills, Commands, or Agents.
    </rule>
  </section>

  <section name="claude-framework" description="Claude Code configuration standards">
    <rule name="claude-md-best-practices" path=".opencode/rules/claude-md-best-practices.md">
      CLAUDE.md is living documentation - update after code changes, corrections, gotchas, new commands; use when modifying project patterns or during periodic review.
    </rule>
    <rule name="claude-md-root" path=".opencode/rules/claude-md-root.md">
      Root CLAUDE.md needs: project overview, architecture, code style, commands, conventions, gotchas; use when creating or restructuring root CLAUDE.md files.
    </rule>
  </section>
</rules>
