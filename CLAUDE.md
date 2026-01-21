# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **BMAD knowledge-library** - a Claude Code plugin/extension that enables users to extract YouTube video transcripts, refine them by removing noise (sponsors, ads, visual references), and convert them to audio via TTS for listening on walks/commutes.

<critical_rules>
This is NOT a standalone CLI tool. It's a BMAD module (v6.0.0-alpha.23) with step-file workflows orchestrated through Claude Code.
</critical_rules>

## Architecture

### Directory Structure

| Path | Purpose |
|------|---------|
| `_bmad/` | BMAD framework modules (core, bmm, bmb, cis) |
| `_bmad-output/` | Generated artifacts (planning, implementation) |
| `.claude/skills/` | Claude Code skills (TypeScript + Bun) |
| `.claude/agents/` | Custom subagents |
| `.claude/rules/` | Development standards |
| `.claude/commands/` | Slash commands |

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

<critical_rules>
- Always present A/P/C menu after content generation
- Never auto-advance without user approval
- Update frontmatter `stepsCompleted` array on progression
</critical_rules>

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

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for tts-openai skill |

## Technical Research

<critical_rules>
Use DeepWiki MCP as the PRIMARY source for technical research over WebSearch:

- Setup guides for technologies
- Troubleshooting library/framework issues
- Validating implementations against library documentation
- API reference and correct usage patterns
</critical_rules>

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
