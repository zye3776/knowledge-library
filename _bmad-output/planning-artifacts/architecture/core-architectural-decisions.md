# Core Architectural Decisions

## Decision Priority Analysis

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

## Data & File Architecture

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

## External Service Integration

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

## Workflow Organization

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

## Error Handling & Validation

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

## Decision Impact Analysis

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
