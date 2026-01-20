# Starter Template Evaluation

## Primary Technology Domain

**BMAD Module + Claude Code Skills** - A hybrid architecture combining:
- BMAD workflows for multi-step processes with user interaction and state tracking
- Claude Code Skills for action execution (TTS, extraction, scraping)

This is NOT a standalone CLI tool, but a **Claude Code plugin/extension** that empowers Claude Code with knowledge extraction capabilities.

## Starter Options Considered

| Option | Structure | Pros | Cons |
|--------|-----------|------|------|
| A: Single Workflow | One monolithic workflow.md | Simple | Limited reusability, no customization |
| B: BMAD Module with Step-File Workflows | Full module with step-based workflows | Modular, extensible, users can create custom workflows via BMB | More files to manage |
| C: BMAD Module + Claude Code Skills | Module workflows + Skills for helpers | Best of both: workflows for processes, skills for utilities | Most complex |

## Selected Starter: Option B - BMAD Module with Step-File Workflows

**Rationale for Selection:**
- Workflows are best suited for multi-step processes (Extract → Rephrase → Consume)
- Step-file architecture provides progressive disclosure and state tracking
- Users can create custom workflows using BMB's workflow builder
- Follows the pattern established by existing BMAD modules (BMM, CIS, BMGD)

## Hybrid Architecture Pattern

| Component | Purpose | Examples |
|-----------|---------|----------|
| **BMAD Workflows** | Multi-step processes with user interaction, state tracking, progressive disclosure | Extract pipeline, Rephrase pipeline, Full E→R→C orchestration |
| **Claude Code Skills** | Action executors - single-purpose, model-invoked | TTS conversion, web scraping, yt-dlp extraction |

**Pattern:** Workflow steps reference skills for actions. The workflow handles orchestration and user interaction; skills handle execution.

## Module Structure

```
knowledge-library/
├── module.yaml                      # Module installation config
├── config.yaml                      # Module-specific settings
├── README.md                        # Module documentation
│
├── agents/
│   └── knowledge-librarian.md       # Main agent for the module
│
├── workflows/
│   ├── extract/
│   │   ├── workflow.md              # Extract from YouTube workflow
│   │   ├── steps/
│   │   │   ├── step-01-init.md
│   │   │   ├── step-02-source.md    # URL input, validation
│   │   │   ├── step-03-fetch.md     # Run yt-dlp
│   │   │   └── step-04-output.md    # Save transcript
│   │   ├── templates/
│   │   └── data/
│   │
│   ├── rephrase/
│   │   ├── workflow.md              # Rephrase/clean content workflow
│   │   ├── steps/
│   │   └── templates/
│   │
│   ├── consume/
│   │   ├── workflow.md              # Convert to TTS workflow
│   │   ├── steps/
│   │   ├── templates/
│   │   └── data/
│   │
│   └── orchestrator/
│       ├── workflow.md              # Complete E→R→C pipeline
│       └── steps/
│
├── skills/
│   ├── extract-youtube/SKILL.md     # yt-dlp execution
│   └── (uses existing tts-openai)
│
├── tasks/                           # Reusable task definitions
│
└── tools/                           # Helper scripts (if needed)
```
