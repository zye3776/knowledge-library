---
name: extract
description: "Interactive YouTube transcript extraction workflow"
stepsCompleted: []
currentStep: null
modes:
  - create: steps/       # Default: Extract new transcript
  - validate: steps-v/   # Validate existing transcript
---

# Extract YouTube Transcript

Interactive workflow for extracting transcripts from YouTube videos and saving them to the knowledge library.

## Workflow Modes

This workflow supports multiple modes:

- **Create Mode** (default): Extract a new transcript from YouTube
- **Validate Mode**: Validate an existing transcript for quality

To run in validate mode, invoke with: `/extract --validate [slug]`

<mandatory_execution_rules>
## MANDATORY EXECUTION RULES

1. **EXECUTE STEPS IN SEQUENCE** - Process step files in numerical order (01, 02, 03, 04)
2. **NEVER AUTO-ADVANCE** - Wait for user approval at all A/C menus before proceeding
3. **HALT ON ERRORS** - Display actionable error messages and present error menu options
4. **UPDATE STATE** - Track completed steps in frontmatter stepsCompleted array
5. **PRESENT MENUS** - Always show menu options using bracketed notation: [A], [C], [R], [X]
</mandatory_execution_rules>

## Workflow Overview

This workflow guides you through:

1. **Initialize** - Validate prerequisites and get YouTube URL
2. **Extract** - Run the extract-youtube skill to get transcript
3. **Review** - Preview transcript and approve or cancel
4. **Save** - Save transcript with metadata to knowledge library

## Step Processing

<step_processing>
### How to Execute This Workflow

1. Load and execute `steps/step-01-init.md`
2. After step completion, check for user decision (A/C menu)
3. Based on user choice:
   - **[A]pprove**: Proceed to next step
   - **[C]ancel**: Exit workflow cleanly
   - **[R]etry**: Re-run current step (on error)
   - **[X]Exit**: Exit workflow immediately
4. Update frontmatter `stepsCompleted` array after each step
5. Continue until step-04-save.md completes or user exits
</step_processing>

## Start Workflow

<start>
**Create Mode (default):**
Begin by loading and executing: `steps/step-01-init.md`

**Validate Mode:**
Begin by loading and executing: `steps-v/step-01-validate.md`

Mode is determined by invocation:
- `/extract` or `/extract <url>` - Create mode
- `/extract --validate` or `/extract --validate <slug>` - Validate mode
</start>
