---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: complete
completedAt: '2026-01-15'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/analysis/brainstorming-session-2026-01-09.md'
workflowType: 'architecture'
project_name: 'knowledge-library'
user_name: 'Z'
date: '2026-01-15'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
24 requirements across 6 categories defining a content extraction and transformation pipeline:
- **Extraction:** YouTube URL input → yt-dlp transcript extraction with metadata preservation
- **Processing:** Noise removal (sponsors, ads, unexplained visuals) while preserving technical terminology
- **Consumption:** TTS generation via OpenAI API with configurable voice preferences
- **Storage:** Markdown-based knowledge library with folder organization
- **Configuration:** YAML config file in project folder for preferences and defaults
- **Interaction:** Interactive CLI with guided prompts (no complex flags for basic use)

**Non-Functional Requirements:**
11 requirements emphasizing simplicity and reliability:
- Clear, actionable error messages (NFR1-2, NFR7)
- Graceful failure without corruption or manual cleanup (NFR3-4)
- Minimal dependencies - only yt-dlp and OpenAI TTS (NFR11)
- No automatic retry logic - user initiates retries (NFR10)
- Simplicity over edge case handling (NFR9)

**Scale & Complexity:**

- Primary domain: CLI tool / Backend processing
- Complexity level: Low
- Estimated architectural components: 4-5 (Extraction, Processing, TTS, Storage, CLI Interface)

### Technical Constraints & Dependencies

| Constraint | Implication |
|------------|-------------|
| yt-dlp dependency | Must handle videos without subtitles gracefully |
| OpenAI TTS API | Requires API key management, network connectivity |
| Self-contained project folder | All config, output, and library files in one location |
| Interactive-first design | Optimize for guided UX, defer scriptable mode to post-MVP |
| Context isolation | Extraction processes fork to keep main CLI clean |

### Cross-Cutting Concerns Identified

1. **Error handling strategy** - Consistent pattern needed across extraction, processing, and TTS phases
2. **File organization** - Predictable folder structure for raw content, processed content, and audio output
3. **Configuration loading** - Single config file read at startup, applied across all phases
4. **Metadata preservation** - Title, source URL tracked from extraction through storage

## Starter Template Evaluation

### Primary Technology Domain

**BMAD Module + Claude Code Skills** - A hybrid architecture combining:
- BMAD workflows for multi-step processes with user interaction and state tracking
- Claude Code Skills for action execution (TTS, extraction, scraping)

This is NOT a standalone CLI tool, but a **Claude Code plugin/extension** that empowers Claude Code with knowledge extraction capabilities.

### Starter Options Considered

| Option | Structure | Pros | Cons |
|--------|-----------|------|------|
| A: Single Workflow | One monolithic workflow.md | Simple | Limited reusability, no customization |
| B: BMAD Module with Step-File Workflows | Full module with step-based workflows | Modular, extensible, users can create custom workflows via BMB | More files to manage |
| C: BMAD Module + Claude Code Skills | Module workflows + Skills for helpers | Best of both: workflows for processes, skills for utilities | Most complex |

### Selected Starter: Option B - BMAD Module with Step-File Workflows

**Rationale for Selection:**
- Workflows are best suited for multi-step processes (Extract → Rephrase → Consume)
- Step-file architecture provides progressive disclosure and state tracking
- Users can create custom workflows using BMB's workflow builder
- Follows the pattern established by existing BMAD modules (BMM, CIS, BMGD)

### Hybrid Architecture Pattern

| Component | Purpose | Examples |
|-----------|---------|----------|
| **BMAD Workflows** | Multi-step processes with user interaction, state tracking, progressive disclosure | Extract pipeline, Rephrase pipeline, Full E→R→C orchestration |
| **Claude Code Skills** | Action executors - single-purpose, model-invoked | TTS conversion, web scraping, yt-dlp extraction |

**Pattern:** Workflow steps reference skills for actions. The workflow handles orchestration and user interaction; skills handle execution.

### Module Structure

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

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Content storage location and structure
- External service integration approach
- Workflow organization pattern

**Important Decisions (Shape Architecture):**
- Tri-modal workflow support
- Error handling strategy
- Inter-stage validation

**Deferred Decisions (Post-MVP):**
- Custom workflow templates for users
- Alternative TTS providers
- Batch processing mode

### Data & File Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage Location | User-configurable via `config.yaml` | Flexibility for different setups |
| Default Path | `{project_root}/libraries/` | Clean, dedicated location |
| Naming Convention | Slug-based with folder per source | Organized, traceable |
| Transcript Format | Markdown with YAML frontmatter | Human-readable, LLM-friendly, BMAD convention |
| Refined Content Format | Markdown with YAML frontmatter | Consistent with transcripts |
| Audio Format | MP3 | Universal compatibility |

**File Structure Example:**
```
libraries/
└── how-to-build-a-second-brain/
    ├── transcript.md          # Raw extraction
    ├── refined.md             # After rephrase
    ├── audio.mp3              # TTS output
    └── metadata.yaml          # Source info, timestamps, status
```

**Config Entry:**
```yaml
# In module config.yaml
content_folder: "{project-root}/libraries"
```

### External Service Integration

| Service | Approach | Implementation |
|---------|----------|----------------|
| yt-dlp | Direct CLI via Bash | Skill invokes `yt-dlp` directly, assumes user has it installed |
| OpenAI TTS | Existing `tts-openai` skill | Reuse `.claude/skills/tts-openai/`, adapt if needed |

**yt-dlp Skill Pattern:**
```markdown
# In extract skill
Execute: yt-dlp --write-auto-sub --sub-lang en --skip-download -o "{{output_path}}" "{{url}}"
```

**TTS Integration:**
```markdown
# In consume workflow step
Invoke skill: tts-openai with content from refined.md
```

### Workflow Organization

| Decision | Choice | Details |
|----------|--------|---------|
| Granularity | Hybrid | 3 separate workflows + 1 orchestrator |
| Default Behavior | Sequential pipeline | Extract → Rephrase → Consume |
| Flexibility | User can switch workflows mid-pipeline via orchestrator |
| Modes | Tri-modal | Create / Edit / Validate for each workflow |

**Orchestrator Behavior:**
- Runs Extract → Rephrase → Consume by default
- After each stage, presents options: Continue / Switch workflow / Stop
- Tracks pipeline state for resumption
- Allows users to substitute custom workflows at any stage

**Workflow Modes:**

| Workflow | Create | Edit | Validate |
|----------|--------|------|----------|
| extract | Extract from new source | Re-extract with different options | Check transcript quality/completeness |
| rephrase | Refine new transcript | Adjust existing refinement | Review noise removal effectiveness |
| consume | Generate TTS from refined | Regenerate with different voice/settings | Audio quality check |

### Error Handling & Validation

| Decision | Choice | Details |
|----------|--------|---------|
| Service Failures | Halt with Error | Stop workflow, display error clearly |
| Orchestrator Role | Suggest actions | Offer retry, skip, or abort options |
| Error Capture | Generate report | Save error details for future analysis |
| Inter-stage Validation | Enabled by default | Validate content between stages |
| Validation Skip | "Continue" option | Users can bypass validation if desired |
| Preference Capture | Track choices | Record user validation preferences for future features |

**Error Report Structure:**
```yaml
# In metadata.yaml or separate error-log.yaml
errors:
  - timestamp: 2026-01-15T10:30:00
    stage: extract
    error_type: yt-dlp_failure
    message: "Video unavailable"
    user_action: retry
    resolved: true
```

**Validation Checkpoints:**

| Checkpoint | Checks | Skip Option |
|------------|--------|-------------|
| Post-Extract | Transcript not empty, minimum length, language detected | [C]ontinue anyway |
| Post-Rephrase | Refined content exists, noise markers removed, structure intact | [C]ontinue anyway |
| Pre-Consume | No code blocks, reasonable length for TTS, no broken formatting | [C]ontinue anyway |

### Decision Impact Analysis

**Implementation Sequence:**
1. Module structure & config (storage paths)
2. Extract workflow + yt-dlp skill
3. Rephrase workflow
4. Consume workflow + TTS skill integration
5. Orchestrator workflow
6. Tri-modal support for each workflow
7. Error capture & reporting

**Cross-Component Dependencies:**
- Orchestrator depends on all three workflows existing
- Consume workflow depends on `tts-openai` skill
- All workflows depend on config for `content_folder` path
- Validation logic shared across workflows (potential task/template)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories where AI agents could make different choices

### Naming Patterns

**Workflow Naming Conventions:**

| Element | Convention | Example |
|---------|------------|---------|
| Workflow folder | kebab-case, verb-noun | `extract-youtube`, `rephrase-content` |
| Workflow entry | Always `workflow.md` | `workflows/extract/workflow.md` |
| Step files | `step-{NN}-{action}.md` | `step-01-init.md`, `step-02-source.md` |
| Tri-modal folders | `steps-c/`, `steps-e/`, `steps-v/` | `steps-c/step-01-init.md` |

**Skill Naming Conventions:**

| Element | Convention | Example |
|---------|------------|---------|
| Skill folder | kebab-case, action-target | `extract-youtube`, `validate-transcript` |
| Skill entry | Always `SKILL.md` | `skills/extract-youtube/SKILL.md` |

**Output File Naming:**

| File | Name | Rationale |
|------|------|-----------|
| Raw transcript | `transcript.md` | Clear purpose |
| Refined content | `refined.md` | Consistent pattern |
| Audio output | `audio.mp3` | Simple, clear |
| Metadata | `metadata.yaml` | YAML for machine-readable |

### Structure Patterns

**Workflow Internal Structure:**
```
workflow-name/
├── workflow.md           # Entry point (required)
├── steps/                # Step files (or steps-c/, steps-e/, steps-v/)
│   ├── step-01-init.md
│   ├── step-02-xxx.md
│   └── step-03-xxx.md
├── templates/            # Output templates (optional)
│   └── output.template.md
└── data/                 # Reference data (optional)
    └── reference.md
```

**Skill Internal Structure:**
```
skill-name/
├── SKILL.md              # Entry point (required)
└── scripts/              # Helper scripts (optional)
    └── helper.sh
```

**Content Library Structure:**
```
libraries/
└── {slug}/
    ├── transcript.md
    ├── refined.md
    ├── audio.mp3
    └── metadata.yaml
```

### Format Patterns

**YAML Frontmatter - Workflow Output:**
```yaml
---
source_url: "https://youtube.com/watch?v=xxx"
source_title: "Video Title"
slug: "video-title"
created_at: "2026-01-15T10:30:00Z"
updated_at: "2026-01-15T11:00:00Z"
stage: "extracted"  # extracted | refined | consumed
pipeline_status: "in_progress"  # in_progress | completed | error
---
```

**YAML Frontmatter - Error Report:**
```yaml
errors:
  - timestamp: "2026-01-15T10:30:00Z"
    stage: "extract"
    error_type: "yt-dlp_failure"
    message: "Video unavailable"
    user_action: "retry"
    resolved: true
```

**Data Format Standards:**
- Date Format: ISO 8601 (`2026-01-15T10:30:00Z`)
- Field Naming: snake_case for all YAML keys (BMAD convention)

### Communication Patterns

**Menu Presentation:**
```markdown
**What would you like to do?**
- **[C]** Continue - Proceed to next stage
- **[R]** Retry - Attempt this stage again
- **[S]** Switch - Use a different workflow
- **[X]** Exit - Stop pipeline

Please select:
```

**Validation Messages:**
```markdown
**✅ Validation Passed:**
- Transcript length: 2,450 words
- Language detected: English
- No empty sections found

**[C]** Continue to Rephrase | **[V]** View details
```

**Error Messages:**
```markdown
**❌ Error: yt-dlp extraction failed**

**Error:** Video unavailable (private or deleted)
**Source:** https://youtube.com/watch?v=xxx

**Suggested Actions:**
- **[R]** Retry extraction
- **[U]** Try different URL
- **[X]** Exit pipeline

Error logged to: `libraries/video-title/metadata.yaml`
```

### Process Patterns

**State Tracking:**
- Pipeline state stored in `metadata.yaml` within content folder
- Frontmatter `stepsCompleted` array in workflow output documents
- `stage` field tracks Extract → Refined → Consumed progression

**Workflow Transitions:**
- Orchestrator manages stage transitions
- Each workflow returns control to orchestrator after completion
- User can switch workflows at any transition point

**Error Recovery:**
- Halt on error, display clear message
- Log error to `metadata.yaml`
- Present retry/skip/exit options
- No automatic retries

### Enforcement Guidelines

**All AI Agents MUST:**
1. Use snake_case for all YAML keys
2. Use kebab-case for folder names
3. Follow `step-{NN}-{action}.md` naming for step files
4. Store pipeline state in `metadata.yaml`
5. Present menus with `[X]` bracketed options
6. Log errors to metadata.yaml before displaying to user

**Pattern Summary:**

| Category | Pattern | Convention |
|----------|---------|------------|
| Workflow folders | kebab-case | `extract-youtube` |
| Step files | `step-{NN}-{action}.md` | `step-01-init.md` |
| Skill folders | kebab-case | `extract-youtube` |
| Output files | Fixed names per type | `transcript.md`, `refined.md` |
| YAML keys | snake_case | `source_url`, `created_at` |
| Dates | ISO 8601 | `2026-01-15T10:30:00Z` |
| Menus | Bracketed letter options | `[C]` Continue |
| Errors | Log to metadata.yaml | Structured YAML format |
| State | `stage` field in metadata | `extracted`, `refined`, `consumed` |

## Project Structure & Boundaries

### Requirements to Component Mapping

| Requirement Category | Component | Location |
|---------------------|-----------|----------|
| Extraction (FR1-5) | Extract workflow + yt-dlp skill | `workflows/extract/`, `skills/extract-youtube/` |
| Processing (FR6-11) | Rephrase workflow | `workflows/rephrase/` |
| Consumption (FR12-17) | Consume workflow + TTS skill | `workflows/consume/`, existing `tts-openai` |
| Storage (FR18-21) | Library structure | `libraries/{slug}/` |
| Configuration (FR22-23) | Module config | `config.yaml` |
| Orchestration | Pipeline orchestrator | `workflows/orchestrator/` |

### Complete Project Directory Structure

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

### Architectural Boundaries

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

### Integration Points

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

### File Organization Patterns

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

### Development Workflow Integration

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

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All architectural decisions work together without conflicts:
- BMAD Module + Claude Code Skills is a native extension pattern
- yt-dlp direct CLI works with Bash tool in skills
- Existing tts-openai skill is proven in this environment
- Tri-modal workflows follow standard BMAD patterns
- File-based state (metadata.yaml) supports stateless workflow design

**Pattern Consistency:**
All patterns align with BMAD framework conventions:
- snake_case YAML keys match BMAD conventions
- kebab-case folder names match BMAD conventions
- step-{NN}-{action}.md follows standard BMAD step naming
- Bracketed menu options consistent with BMAD workflows

**Structure Alignment:**
Project structure supports all architectural decisions:
- Workflow folders follow BMAD module pattern
- Skills folder uses standard Claude Code location
- Content library is user-configurable with sensible default
- Tasks directory enables reusable validation logic

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| FR Category | Status | Implementation Location |
|-------------|--------|------------------------|
| Extraction (FR1-5) | ✅ | `workflows/extract/`, `skills/extract-youtube/` |
| Processing (FR6-11) | ✅ | `workflows/rephrase/` |
| Consumption (FR12-17) | ✅ | `workflows/consume/`, `tts-openai` skill |
| Storage (FR18-21) | ✅ | `libraries/{slug}/` structure |
| Configuration (FR22-23) | ✅ | `config.yaml` |
| Interaction (FR24) | ✅ | Workflow menus, orchestrator |

**Non-Functional Requirements Coverage:**

| NFR | Status | How Addressed |
|-----|--------|---------------|
| Clear error messages (NFR1-2) | ✅ | Error message patterns defined |
| Graceful failure (NFR3-4) | ✅ | Halt-on-error with logging |
| No manual cleanup (NFR4) | ✅ | State in metadata.yaml, resumable |
| Actionable errors (NFR7) | ✅ | Suggested actions in error display |
| Simplicity (NFR9) | ✅ | Direct CLI for yt-dlp, existing TTS skill |
| No auto-retry (NFR10) | ✅ | User-initiated retry via menu |
| Minimal dependencies (NFR11) | ✅ | Only yt-dlp + OpenAI API |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Storage location: User-configurable with default
- File naming: Slug-based pattern defined
- External services: yt-dlp direct, existing TTS skill
- Workflow organization: Hybrid with orchestrator
- Error handling: Halt + log + suggest pattern
- Validation: Inter-stage with skip option

**Structure Completeness:**
- Module root files defined (module.yaml, config.yaml, README.md)
- All 4 workflows with tri-modal steps specified
- extract-youtube skill defined
- Validation tasks defined
- Output structure (libraries/{slug}/) pattern established

**Pattern Completeness:**
- Naming patterns for workflows, steps, skills, outputs
- Format patterns for YAML frontmatter, dates, field naming
- Communication patterns for menus, validation messages, errors
- Process patterns for state tracking, transitions, recovery

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps (to address during implementation):**
- module.yaml content schema - define during first story
- config.yaml detailed schema - define during first story
- TTS chunking strategy - address in consume workflow step

**Nice-to-Have Gaps (future enhancements):**
- Batch processing for multiple URLs
- Alternative TTS providers
- Progress indicators for long operations

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low)
- [x] Technical constraints identified (yt-dlp, OpenAI TTS)
- [x] Cross-cutting concerns mapped (error handling, config, metadata)

**✅ Architectural Decisions**
- [x] Technology stack specified (BMAD Module + Claude Code Skills)
- [x] Storage decisions documented (user-configurable, slug-based)
- [x] Integration approach defined (direct CLI, existing skill)
- [x] Workflow organization established (hybrid with orchestrator)

**✅ Implementation Patterns**
- [x] Naming conventions established (snake_case, kebab-case)
- [x] Structure patterns defined (workflow internals, content library)
- [x] Communication patterns specified (menus, errors, validation)
- [x] Process patterns documented (state tracking, error recovery)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH
- All patterns follow established BMAD conventions
- Leverages existing proven components (tts-openai)
- Simple, focused scope with clear boundaries

**Key Strengths:**
1. Leverages proven BMAD workflow architecture
2. Reuses existing tts-openai skill
3. Clear separation between orchestration (workflows) and execution (skills)
4. User-configurable without complexity
5. Tri-modal support for flexibility

**Areas for Future Enhancement:**
1. Batch processing for multiple sources
2. Alternative extraction sources (podcasts, articles)
3. Alternative TTS providers
4. Progress indicators for long operations

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
1. Create module scaffold (module.yaml, config.yaml, README.md)
2. Create `extract-youtube` skill
3. Create `extract` workflow with Create mode
4. Test end-to-end extraction

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-15
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 15+ architectural decisions made
- 9 implementation patterns defined
- 4 main workflows + 1 orchestrator specified
- 24 functional + 11 non-functional requirements fully supported

**📚 AI Agent Implementation Guide**
- Technology stack: BMAD Module + Claude Code Skills
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The BMAD Module architecture provides a production-ready foundation following established patterns from the BMAD framework.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

