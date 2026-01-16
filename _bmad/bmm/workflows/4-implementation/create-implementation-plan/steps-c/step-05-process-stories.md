---
name: 'step-05-process-stories'
description: 'Core processing loop - generate plans, OpenCode review, Party Mode review, save'

nextStepFile: './step-06-finalize.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'
planTemplate: '../data/implementation-plan-template.md'
epicsFolder: '{output_folder}/planning-artifacts/epics'

# Skills to invoke (with context: fork)
loadContextSkill: 'dev-load-project-context'
opencodeReviewSkill: 'dev-opencode-review'
partyModeReviewSkill: 'dev-party-mode-review'
---

# Step 5: Process Stories

## STEP GOAL:

Execute the core processing loop - generate implementation plans, run OpenCode review, run Party Mode review, and save completed plans for all selected stories.

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
- ✅ Use forked skills for heavy operations to preserve context
- ✅ Report progress as stories complete

### Step-Specific Rules:

- 🎯 Process ALL selected stories according to chosen mode
- 🚫 FORBIDDEN to skip OpenCode or Party Mode reviews
- 💬 Report progress after each story (sequential) or phase (batch)
- 🎯 Use skills with `context: fork` for OpenCode and Party Mode
- 🚫 DO NOT load full review context into main thread

## EXECUTION PROTOCOLS:

- 🎯 Load state to get selections and mode
- 💾 Update state as each story completes
- 📖 Save implementation plans alongside story files
- 🚫 Fail gracefully - log errors, continue with other stories

## CONTEXT BOUNDARIES:

- Previous: User selected scope and mode
- Focus: Autonomous generation and review
- Skills: dev-load-project-context, dev-opencode-review, dev-party-mode-review
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

### 2. Load Project Context

**Invoke {loadContextSkill}:**

Load all required context documents:
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/prd.md`
- `.claude/rules/coding-standards` (or similar)
- Epic overview for selected epic(s)
- KISS development principles

Display: "**Context loaded.** Architecture, PRD, and coding standards ready."

### 3. Process Stories (Mode-Dependent)

**IF processingMode == 'sequential':**

```
FOR EACH story in selectedStories (not in storiesCompleted):

  3a. Load Story Details
      - Read story file from {epicsFolder}/[epic]/stories/[story].md
      - Extract: title, description, acceptance criteria, dependencies

  3b. Generate Implementation Plan
      - Load {planTemplate}
      - Fill template sections based on:
        * Story requirements
        * Architecture decisions
        * PRD context
        * Coding standards
      - Use DeepWiki MCP for technical research if needed
      - Save draft to memory (don't write file yet)

  3c. OpenCode Review (forked context)
      - Invoke {opencodeReviewSkill} with:
        * Draft implementation plan
        * Story context
        * Architecture constraints
      - Receive: suggestions, issues, improvements
      - Store review results

  3d. Party Mode Review (forked context)
      - Invoke {partyModeReviewSkill} with:
        * Draft implementation plan
        * OpenCode suggestions/issues
        * Full project context
      - Receive: final reviewed implementation plan

  3e. Save Implementation Plan
      - Write final plan to: {epicsFolder}/[epic]/stories/[story].implement.md
      - Update story's sprint-status entry (implementation_plan: exists)

  3f. Update Progress
      - Add story to storiesCompleted in {stateFile}
      - Display: "✓ [story-id]: [story-name] - Plan generated and saved"

  CONTINUE to next story
```

**IF processingMode == 'batch':**

```
Phase 1: Generate ALL Plans
  FOR EACH story in selectedStories:
    - Load story details
    - Generate draft implementation plan
    - Store in memory/temp
  Display: "Phase 1 complete: [N] plans generated"

Phase 2: OpenCode Review ALL
  Invoke {opencodeReviewSkill} with ALL draft plans
  Receive: suggestions and issues for each plan
  Display: "Phase 2 complete: OpenCode review done"

Phase 3: Party Mode Review ALL
  Invoke {partyModeReviewSkill} with:
    - All draft plans
    - All OpenCode suggestions
    - Full project context
  Receive: all finalized plans
  Display: "Phase 3 complete: Party Mode review done"

Phase 4: Save ALL Plans
  FOR EACH story:
    - Write final plan to {epicsFolder}/[epic]/stories/[story].implement.md
    - Update sprint-status
    - Add to storiesCompleted
  Display: "Phase 4 complete: [N] plans saved"
```

### 4. Handle Errors

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

### 5. Update Final State

Update {stateFile}:
```yaml
stepsCompleted: ['step-01-init', ..., 'step-05-process-stories']
processingStarted: true
processingComplete: true
currentPhase: 'complete'
storiesCompleted: ['1-1', '1-3', ...]
storiesFailed: []  # or list of failures
```

### 6. Display Completion Summary

Display:
```
**Processing Complete**

| Metric | Value |
|--------|-------|
| Stories Processed | [N] |
| Plans Generated | [M] |
| Reviews Completed | [M] × 2 (OpenCode + Party Mode) |
| Failed | [F] |

**Generated Plans:**
- ✓ epic-1/.../1-1-extract-youtube-transcript.implement.md
- ✓ epic-1/.../1-3-process-transcript.implement.md
[list all generated plans]

[IF any failures:]
**Failed Stories (manual review needed):**
- ✗ [story-id]: [error reason]
```

### 7. Proceed to Finalization

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
- Each plan went through: Generate → OpenCode → Party Mode → Save
- Plans saved to correct locations
- State updated throughout
- Clear progress reporting
- Failures logged but didn't halt entire process

### ❌ SYSTEM FAILURE:

- Skipping review steps
- Not using forked context for heavy reviews
- Entire process crashes on single story failure
- State not updated (can't resume on failure)
- Plans saved to wrong locations

**Master Rule:** Process autonomously, use forked skills for reviews, fail gracefully, update state continuously.
