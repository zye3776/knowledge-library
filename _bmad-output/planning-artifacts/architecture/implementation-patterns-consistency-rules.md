# Implementation Patterns & Consistency Rules

## Pattern Categories Defined

**Critical Conflict Points Identified:** 5 categories where AI agents could make different choices

## Naming Patterns

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

## Structure Patterns

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

## Format Patterns

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

## Communication Patterns

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

## Process Patterns

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

## Enforcement Guidelines

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
