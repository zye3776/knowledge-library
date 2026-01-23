---
name: 'step-05-process-stories'
description: 'Core processing loop - generate implementation plans and save'

nextStepFile: './step-06-finalize.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'
planTemplate: '../data/implementation-plan-template.md'
epicsFolder: '{output_folder}/planning-artifacts/epics'

# Skills to invoke
loadContextSkill: 'z-load-project-context'
---

# Step 5: Process Stories

## STEP GOAL:

Execute the core processing loop - generate implementation plans and save completed plans for all selected stories.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input (except during autonomous processing)
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE AN ORCHESTRATOR during processing
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English
- ⚙️ TOOL/SUBPROCESS FALLBACK: If skills unavailable, perform operations in main context

### Role Reinforcement:

- ✅ You are an implementation architect generating technical plans
- ✅ This is autonomous processing - minimal user interruption
- ✅ Report progress as stories complete

### Step-Specific Rules:

- 🎯 Process ALL selected stories according to chosen mode
- 💬 Report progress after each story (sequential) or phase (batch)
- 📝 Generate comprehensive plans using loaded context

## EXECUTION PROTOCOLS:

- 🎯 Load state to get selections and mode
- 💾 Update state as each story completes
- 📖 Save implementation plans alongside story files
- 🚫 Fail gracefully - log errors, continue with other stories

## CONTEXT BOUNDARIES:

- Previous: User selected scope and mode
- Focus: Autonomous plan generation
- Skills: z-load-project-context
- Output: {story-name}.implement.md files

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Load State and Initialize

Load {stateFile} and retrieve:
- `selectedStories` - list of story IDs to process
- `processingMode` - sequential or batch
- `storiesCompleted` - any already completed (for resume)

Display:
```
**Starting Implementation Plan Generation**

Mode: [Sequential/Batch]
Stories: [N] to process
Already completed: [M] (if resuming)
```

Update state:
```yaml
processingStarted: true
currentPhase: 'loading_context'
```

### 2. Load Epic and Story Files

**Load epic and story context FIRST:**

```
FOR EACH selected epic:
  - Read {epicsFolder}/[epic]/overview.md
  - Read {epicsFolder}/[epic]/stories/index.md (if exists)

FOR EACH story in selectedStories:
  - Read {epicsFolder}/[epic]/stories/[story].md
  - Extract: title, description, acceptance criteria, dependencies, tasks
```

Display: "**Epic and story files loaded.** [N] stories ready for processing."

### 3. Load Project Context via Skill

**Invoke {loadContextSkill}:**

The skill returns a document index. From the skill output, read these documents:
- `_bmad-output/planning-artifacts/project-brief.md` - Project vision and goals
- `_bmad-output/planning-artifacts/architecture.md` - Technical decisions
- `_bmad-output/planning-artifacts/prd.md` - Product requirements
- `docs/guides-agents/KISS-principle-agent-guide.md` - Simplicity guidelines

Display: "**Project context loaded.** Project brief, architecture, PRD, and KISS principles ready."

### 4. Process Stories (Mode-Dependent)

**IF processingMode == 'sequential':**

```
FOR EACH story in selectedStories (not in storiesCompleted):

  4a. Generate Implementation Plan
      - Load {planTemplate}
      - Fill template sections based on:
        * Story requirements (already loaded in step 2)
        * Architecture decisions
        * PRD context
        * KISS principles
      - Use DeepWiki MCP for technical research if needed

  4b. Save Implementation Plan
      - Write plan to: {epicsFolder}/[epic]/stories/[story].implement.md
      - Update story's sprint-status entry (implementation_plan: exists)

  4c. Update Progress
      - Add story to storiesCompleted in {stateFile}
      - Display: "✓ [story-id]: [story-name] - Plan generated and saved"

  CONTINUE to next story
```

**IF processingMode == 'batch':**

```
Phase 1: Generate ALL Plans
  FOR EACH story in selectedStories:
    - Generate implementation plan using loaded context
    - Store in memory/temp
  Display: "Phase 1 complete: [N] plans generated"

Phase 2: Save ALL Plans
  FOR EACH story:
    - Write plan to {epicsFolder}/[epic]/stories/[story].implement.md
    - Update sprint-status
    - Add to storiesCompleted
  Display: "Phase 2 complete: [N] plans saved"
```

### 5. Handle Errors

**IF a story fails to process:**
- Log error with story ID and reason
- Mark story as `failed` in state (not completed)
- Continue with remaining stories
- Report failures at end

**Error state tracking:**
```yaml
storiesFailed:
  - id: "1-2"
    error: "DeepWiki timeout"
    phase: "generation"
```

### 6. Update Final State

Update {stateFile}:
```yaml
stepsCompleted: ['step-01-init', ..., 'step-05-process-stories']
processingStarted: true
processingComplete: true
currentPhase: 'complete'
storiesCompleted: ['1-1', '1-3', ...]
storiesFailed: []  # or list of failures
```

### 7. Display Completion Summary

Display:
```
**Processing Complete**

| Metric | Value |
|--------|-------|
| Stories Processed | [N] |
| Plans Generated | [M] |
| Failed | [F] |

**Generated Plans:**
- ✓ epic-1/.../1-1-extract-youtube-transcript.implement.md
- ✓ epic-1/.../1-3-process-transcript.implement.md
[list all generated plans]

[IF any failures:]
**Failed Stories (manual review needed):**
- ✗ [story-id]: [error reason]

**Next Steps:**
- Run code-review workflow to validate plans
- Run party-mode for multi-agent deliberation (optional)
```

### 8. Proceed to Finalization

Display: "**Proceeding to finalization...**"

#### Menu Handling Logic:

- After processing complete, immediately load, read entire file, then execute {nextStepFile}

#### EXECUTION RULES:

- This is an autonomous processing step
- Progress updates shown but no user intervention required
- Only halt if critical error (all stories fail)

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All selected stories processed (or gracefully failed)
- Each plan went through: Generate → Save
- Plans saved to correct locations
- State updated throughout
- Clear progress reporting
- Failures logged but didn't halt entire process

### ❌ SYSTEM FAILURE:

- Entire process crashes on single story failure
- State not updated (can't resume on failure)
- Plans saved to wrong locations

**Master Rule:** Process autonomously, fail gracefully, update state continuously.
