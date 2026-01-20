# Project Structure & Boundaries

## Requirements to Component Mapping

| Requirement Category | Component | Location |
|---------------------|-----------|----------|
| Extraction (FR1-5) | Extract workflow + yt-dlp skill | `workflows/extract/`, `skills/extract-youtube/` |
| Processing (FR6-11) | Rephrase workflow | `workflows/rephrase/` |
| Consumption (FR12-17) | Consume workflow + TTS skill | `workflows/consume/`, existing `tts-openai` |
| Storage (FR18-21) | Library structure | `libraries/{slug}/` |
| Configuration (FR22-23) | Module config | `config.yaml` |
| Orchestration | Pipeline orchestrator | `workflows/orchestrator/` |

## Complete Project Directory Structure

```
knowledge-library/
├── README.md                           # Module documentation
├── module.yaml                         # BMAD module installation config
├── config.yaml                         # Module settings (content_folder, etc.)
│
├── agents/
│   └── knowledge-librarian.md          # Main module agent with menu
│
├── workflows/
│   ├── extract/
│   │   ├── workflow.md                 # Extract entry point
│   │   ├── steps-c/                    # Create mode
│   │   │   ├── step-01-init.md         # Initialize, check config
│   │   │   ├── step-02-source.md       # URL input, validation
│   │   │   ├── step-03-fetch.md        # Invoke yt-dlp skill
│   │   │   └── step-04-output.md       # Save transcript, update metadata
│   │   ├── steps-e/                    # Edit mode
│   │   │   ├── step-01-load.md         # Load existing transcript
│   │   │   └── step-02-refetch.md      # Re-extract with options
│   │   ├── steps-v/                    # Validate mode
│   │   │   ├── step-01-load.md         # Load transcript
│   │   │   └── step-02-validate.md     # Check quality metrics
│   │   ├── templates/
│   │   │   └── transcript.template.md  # Transcript output format
│   │   └── data/
│   │       └── yt-dlp-options.md       # Reference for yt-dlp flags
│   │
│   ├── rephrase/
│   │   ├── workflow.md                 # Rephrase entry point
│   │   ├── steps-c/
│   │   │   ├── step-01-init.md         # Initialize, load transcript
│   │   │   ├── step-02-analyze.md      # Identify noise, sponsors
│   │   │   ├── step-03-clean.md        # Remove noise, restructure
│   │   │   └── step-04-output.md       # Save refined content
│   │   ├── steps-e/
│   │   │   ├── step-01-load.md         # Load existing refined
│   │   │   └── step-02-adjust.md       # Modify refinement
│   │   ├── steps-v/
│   │   │   ├── step-01-load.md         # Load refined content
│   │   │   └── step-02-validate.md     # Check noise removal
│   │   └── templates/
│   │       └── refined.template.md     # Refined output format
│   │
│   ├── consume/
│   │   ├── workflow.md                 # Consume entry point
│   │   ├── steps-c/
│   │   │   ├── step-01-init.md         # Initialize, load refined
│   │   │   ├── step-02-prepare.md      # Prepare for TTS (chunking)
│   │   │   ├── step-03-tts.md          # Invoke tts-openai skill
│   │   │   └── step-04-output.md       # Save audio, update metadata
│   │   ├── steps-e/
│   │   │   ├── step-01-load.md         # Load existing audio info
│   │   │   └── step-02-regenerate.md   # Re-generate with options
│   │   ├── steps-v/
│   │   │   ├── step-01-load.md         # Load audio metadata
│   │   │   └── step-02-validate.md     # Verify audio exists, quality
│   │   ├── templates/
│   │   │   └── tts-manifest.template.md
│   │   └── data/
│   │       └── openai-voices.md        # Voice options reference
│   │
│   └── orchestrator/
│       ├── workflow.md                 # Pipeline orchestrator entry
│       └── steps/
│           ├── step-01-init.md         # Initialize pipeline, get source
│           ├── step-02-extract.md      # Run extract workflow
│           ├── step-03-validate-e.md   # Validate extraction (optional)
│           ├── step-04-rephrase.md     # Run rephrase workflow
│           ├── step-05-validate-r.md   # Validate refinement (optional)
│           ├── step-06-consume.md      # Run consume workflow
│           ├── step-07-validate-c.md   # Validate consumption (optional)
│           └── step-08-complete.md     # Pipeline complete, summary
│
├── skills/
│   └── extract-youtube/
│       └── SKILL.md                    # yt-dlp execution skill
│
├── tasks/
│   ├── validate-transcript.md          # Reusable transcript validation
│   ├── validate-refined.md             # Reusable refined validation
│   └── slug-generator.md               # Generate slug from title
│
├── templates/
│   └── metadata.template.yaml          # Standard metadata structure
│
└── libraries/                          # Content output (user-configurable)
    └── {slug}/                         # Per-source folder
        ├── transcript.md               # Raw extraction
        ├── refined.md                  # After rephrase
        ├── audio.mp3                   # TTS output
        └── metadata.yaml               # Source info, state, errors
```

## Architectural Boundaries

**Workflow Boundaries:**

| Boundary | Communication | Data Exchange |
|----------|---------------|---------------|
| Extract ↔ Rephrase | Via orchestrator | `transcript.md` file |
| Rephrase ↔ Consume | Via orchestrator | `refined.md` file |
| Orchestrator ↔ Workflows | Workflow invocation | `metadata.yaml` state |

**Skill Boundaries:**

| Skill | Input | Output |
|-------|-------|--------|
| `extract-youtube` | YouTube URL | Raw transcript text |
| `tts-openai` (existing) | Text content | Audio file path |

**Data Boundaries:**

| Boundary | Location | Access Pattern |
|----------|----------|----------------|
| Content Library | `{content_folder}/{slug}/` | Read/write per workflow |
| Config | `config.yaml` | Read at workflow init |
| Module State | `metadata.yaml` per content | Read/write by orchestrator |

## Integration Points

**Internal Communication:**
```
Orchestrator
    ├── invokes → Extract workflow
    │                └── invokes → extract-youtube skill
    ├── invokes → Rephrase workflow
    │                └── (LLM processing, no external skill)
    └── invokes → Consume workflow
                     └── invokes → tts-openai skill
```

**External Integrations:**

| Service | Skill/Script | Authentication |
|---------|--------------|----------------|
| YouTube (yt-dlp) | `extract-youtube` skill | None (public videos) |
| OpenAI TTS API | `tts-openai` skill | `OPENAI_API_KEY` env var |

**Data Flow:**
```
YouTube URL → yt-dlp → transcript.md → LLM refinement → refined.md → OpenAI TTS → audio.mp3
                  ↓                           ↓                            ↓
            metadata.yaml ←──────────── (state updates) ──────────────────┘
```

## File Organization Patterns

**Configuration Files:**
- `module.yaml` - BMAD installer config (name, version, dependencies)
- `config.yaml` - Runtime settings (content_folder, default voice, etc.)

**Source Organization:**
- Workflows organized by pipeline stage (extract, rephrase, consume, orchestrator)
- Each workflow has tri-modal step folders (steps-c, steps-e, steps-v)
- Shared logic in `tasks/` directory

**Test Organization:**
- Manual testing via workflow validate modes (steps-v/)
- No automated test framework (aligns with PRD simplicity)

**Asset Organization:**
- Templates in workflow-specific `templates/` folders
- Reference data in workflow-specific `data/` folders
- Shared templates in root `templates/` folder

## Development Workflow Integration

**Installation:**
```bash
# User runs BMAD installer
bmad install knowledge-library
```

**Usage:**
```bash
# In Claude Code
/knowledge-library:orchestrator           # Full pipeline
/knowledge-library:extract               # Just extract
/knowledge-library:rephrase              # Just rephrase
/knowledge-library:consume               # Just consume
```

**Custom Workflow Creation:**
```bash
# User creates custom workflow via BMB
/bmad:bmb:workflows:create-workflow
# Then places in knowledge-library/workflows/custom-extract/
```
