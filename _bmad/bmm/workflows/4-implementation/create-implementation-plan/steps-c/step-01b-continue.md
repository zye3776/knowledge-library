---
name: 'step-01b-continue'
description: 'Resume workflow from previous session state'

stateFile: '{output_folder}/implementation-plan-state.yaml'

nextStepOptions:
  step-02-scan-epics: './step-02-scan-epics.md'
  step-03-select-scope: './step-03-select-scope.md'
  step-04-select-mode: './step-04-select-mode.md'
  step-05-process-stories: './step-05-process-stories.md'
  step-06-review: './step-06-review.md'
  step-07-finalize: './step-07-finalize.md'
---

# Step 1b: Continue Workflow

## STEP GOAL:

Resume the implementation plan workflow from where it was left off in a previous session.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step, ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English

### Role Reinforcement:

- ✅ You are resuming a workflow session
- ✅ User has run this workflow before and wants to continue
- ✅ State file contains all progress information

### Step-Specific Rules:

- 🎯 Focus ONLY on reading state and routing to correct step
- 🚫 FORBIDDEN to restart workflow from beginning
- 💬 Welcome user back and show progress summary
- 🚫 FORBIDDEN to skip ahead of where user left off

## EXECUTION PROTOCOLS:

- 🎯 Load and parse state file
- 💾 Display progress summary
- 📖 Route to the correct next step
- 🚫 Preserve all existing state

## CONTEXT BOUNDARIES:

- State file exists (confirmed by step-01-init)
- Contains: stepsCompleted, processingMode, selectedEpics, storiesCompleted, currentStory
- Route based on last completed step

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Welcome Back

Display: "**Welcome back!** Let me check where we left off..."

### 2. Load State File

Load and parse {stateFile}:

```yaml
# Expected state structure:
workflowName: create-implementation-plan
status: IN_PROGRESS
stepsCompleted: ['step-01-init', 'step-02-scan-epics', ...]
processingMode: sequential | batch
selectedEpics: ['epic-1-...']
selectedStories: ['1-1-...', '1-2-...']
storiesCompleted: ['1-1-...']
currentStory: '1-2-...'
lastContinued: '2026-01-16'
```

### 3. Display Progress Summary

Display:
```
**Session State Loaded**

| Aspect | Value |
|--------|-------|
| Processing Mode | [sequential/batch] |
| Selected Epics | [list] |
| Stories to Process | [total count] |
| Stories Completed | [completed count] |
| Current Story | [current or "Starting next"] |
| Last Session | [date] |

**Steps Completed:**
- [list of completed steps]
```

### 4. Determine Next Step

**Based on stepsCompleted array, route to the appropriate step:**

| Last Completed | Next Step | Action |
|----------------|-----------|--------|
| `step-01-init` | `step-02-scan-epics` | Need to scan epics |
| `step-02-scan-epics` | `step-03-select-scope` | Need scope selection |
| `step-03-select-scope` | `step-04-select-mode` | Need mode selection |
| `step-04-select-mode` | `step-05-process-stories` | Ready to process |
| `step-05-process-stories` (partial) | `step-05-process-stories` | Resume processing |
| `step-05-process-stories` (complete) | `step-06-review` | Ready for review |
| `step-06-review` | `step-07-finalize` | Ready to finalize |

### 5. Confirm and Route

Display: "**Ready to continue from: [next step name]**"

"Would you like to:
- **[C]ontinue** from where you left off
- **[R]estart** the workflow from the beginning (will clear progress)
- **[S]tatus** - show detailed state information"

#### Menu Handling Logic:

- IF C: Load, read entire file, then execute the appropriate step from {nextStepOptions}
- IF R: Delete {stateFile}, then display "Progress cleared. Please run the workflow again to start fresh." and exit
- IF S: Display full state file contents, then redisplay menu
- IF Any other: Help user, then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- Preserve state when continuing
- Only delete state if user explicitly chooses restart

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- State file loaded and parsed correctly
- Clear progress summary displayed
- User routed to correct next step
- State preserved through continuation

### ❌ SYSTEM FAILURE:

- Corrupted state file not handled
- Routing to wrong step
- Losing progress data
- Not showing clear progress summary

**Master Rule:** Preserve user progress. Never lose work from previous sessions.
