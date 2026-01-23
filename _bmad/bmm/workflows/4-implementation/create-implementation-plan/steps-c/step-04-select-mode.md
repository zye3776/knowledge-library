---
name: 'step-04-select-mode'
description: 'User selects processing mode - Sequential (one-by-one) or Batch (all together)'

nextStepFile: './step-05-process-stories.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'
---

# Step 4: Select Processing Mode

## STEP GOAL:

Allow user to choose between Sequential processing (each story through full cycle before next) or Batch processing (all stories through each phase together).

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English

### Role Reinforcement:

- ✅ You are helping user choose their workflow style
- ✅ This is a user decision point - explain trade-offs clearly
- ✅ Both modes produce the same output, just different process

### Step-Specific Rules:

- 🎯 Focus ONLY on mode selection
- 🚫 FORBIDDEN to start processing - that's step 05
- 💬 Explain trade-offs between modes clearly
- 🚫 FORBIDDEN to proceed without user selection

## EXECUTION PROTOCOLS:

- 🎯 Load selection from state file
- 💾 Present mode options with trade-offs
- 📖 Capture user choice
- 🚫 Wait for explicit user choice

## CONTEXT BOUNDARIES:

- Previous: Step 03 selected scope (epics/stories)
- Focus: How to process the selected stories
- Limits: Only mode selection, no processing yet
- This is the last user decision before autonomous processing begins

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Load Selection State

Load {stateFile} and retrieve `selectedStories` count.

### 2. Present Mode Options

Display:

```
**Select Processing Mode**

You have selected [N] stories for implementation plan generation.

**[S] Sequential Mode** (Recommended for < 5 stories)
Each story goes through the FULL cycle before moving to next:
  Story 1: Generate → OpenCode Review → Party Mode → Save
  Story 2: Generate → OpenCode Review → Party Mode → Save
  ...

✓ Each plan can benefit from learnings of previous reviews
✓ Easier to pause and resume between stories
✓ Lower context/memory usage
✗ Slower for many stories

**[B] Batch Mode** (Recommended for 5+ stories)
All stories go through each phase together:
  Phase 1: Generate ALL plans
  Phase 2: OpenCode reviews ALL plans
  Phase 3: Party Mode reviews ALL plans
  Phase 4: Save ALL plans

✓ Faster overall processing
✓ Reviews can see patterns across stories
✓ Better for consistency across plans
✗ Higher context/memory usage
✗ Harder to pause mid-batch

**Your choice: [S]equential or [B]atch?**
```

### 3. Process User Selection

**IF user selects S (Sequential):**
- Set `processingMode` to `sequential`
- Display: "**Sequential mode selected.** Each story will complete its full review cycle before moving to the next."

**IF user selects B (Batch):**
- Set `processingMode` to `batch`
- Display: "**Batch mode selected.** All stories will be processed together through each phase."

**IF invalid input:**
- Display: "Please enter S for Sequential or B for Batch."
- Redisplay options

### 4. Confirm and Summarize

Display:

```
**Ready to Begin Processing**

| Aspect | Value |
|--------|-------|
| Stories | [N] selected |
| Mode | [Sequential/Batch] |
| Reviews | OpenCode + Party Mode |
| Output | {story-name}.implement.md per story |

**Process Overview:**
[Show flow diagram based on selected mode]

This will invoke the following skills:
- z-load-project-context (load project-brief, architecture, prd)

**Ready to start?**
```

### 5. Update State with Mode

Update {stateFile}:

```yaml
# ... existing state ...
stepsCompleted: ['step-01-init', 'step-02-scan-epics', 'step-03-select-scope', 'step-04-select-mode']
processingMode: sequential | batch
processingStarted: false
```

### 6. Present Menu

Display: "**[C] Continue - Start processing**"

#### Menu Handling Logic:

- IF C: Save mode to {stateFile}, then load, read entire file, then execute {nextStepFile}
- IF user wants to change mode: Return to step 2 (present options again)
- IF user wants to change scope: Display "Use 'back' to return to scope selection" (handle gracefully)
- IF Any other: Help user, then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input
- ONLY proceed when user confirms with 'C'
- This is the last checkpoint before autonomous processing

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Selection loaded from state
- Clear mode options with trade-offs presented
- User choice captured
- Mode saved to state file
- User confirmed before proceeding

### ❌ SYSTEM FAILURE:

- Proceeding without user mode selection
- Unclear explanation of mode differences
- State not updated with mode
- Starting processing without confirmation

**Master Rule:** This is the last user decision point. Ensure clear understanding before autonomous processing begins.
