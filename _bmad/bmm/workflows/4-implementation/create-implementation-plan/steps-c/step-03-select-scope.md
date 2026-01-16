---
name: 'step-03-select-scope'
description: 'User selects which epic(s) or specific story to generate implementation plans for'

nextStepFile: './step-04-select-mode.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'
---

# Step 3: Select Scope

## STEP GOAL:

Allow user to select which epic(s) or specific story they want to generate implementation plans for.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English

### Role Reinforcement:

- ✅ You are helping user scope their work
- ✅ This is a user decision point - wait for input
- ✅ Present options clearly, accept user choice

### Step-Specific Rules:

- 🎯 Focus ONLY on scope selection
- 🚫 FORBIDDEN to start processing - that's later steps
- 💬 Present clear options from scan results
- 🚫 FORBIDDEN to proceed without user selection

## EXECUTION PROTOCOLS:

- 🎯 Load scan results from state file
- 💾 Present selection options
- 📖 Capture and validate user selection
- 🚫 Wait for explicit user choice

## CONTEXT BOUNDARIES:

- Previous: Step 02 scanned epics and saved results to state
- Focus: User selects what to work on
- Limits: Only selection, no processing yet
- Input: Scan results from state file

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Load Scan Results

Load {stateFile} and retrieve `scanResults` from step 02.

### 2. Present Selection Options

Display:

```
**Select Scope for Implementation Planning**

**Option 1: All Stories (Recommended)**
Generate implementation plans for ALL stories that need them.
- Total: [N] stories across [M] epics

**Option 2: Specific Epic(s)**
Select one or more epics to process all their stories.
Available epics:
  [1] epic-1-youtube-content-extraction (3 stories need plans)
  [2] epic-2-... (N stories need plans)

**Option 3: Specific Story**
Select a single story to generate one implementation plan.
Enter story ID (e.g., "1-1" or "epic-1/1-1")

**Your choice:**
- [A] All stories
- [E] Select epic(s) - enter numbers (e.g., "1" or "1,2")
- [S] Specific story - enter story ID
```

### 3. Process User Selection

**IF user selects A (All):**
- Set `selectedEpics` to ALL epics with missing plans
- Set `selectedStories` to ALL stories needing plans
- Display confirmation: "Selected ALL [N] stories across [M] epics"

**IF user selects E (Epic):**
- Parse epic numbers from input
- Validate epic numbers exist
- Set `selectedEpics` to chosen epics
- Set `selectedStories` to all stories in those epics needing plans
- Display confirmation: "Selected [N] stories from epic(s): [list]"

**IF user selects S (Story):**
- Parse story ID from input
- Validate story exists and needs a plan
- Set `selectedEpics` to that story's epic
- Set `selectedStories` to just that story
- Display confirmation: "Selected single story: [story name]"

**IF invalid input:**
- Display helpful error message
- Redisplay selection options

### 4. Confirm Selection

Display:

```
**Selection Confirmed**

| Aspect | Value |
|--------|-------|
| Epics | [list or "All"] |
| Stories | [count] |
| Estimated Time | [rough estimate based on count] |

Stories to process:
1. [story-id]: [story-name]
2. [story-id]: [story-name]
...

Proceed with this selection?
```

### 5. Update State with Selection

Update {stateFile}:

```yaml
# ... existing state ...
stepsCompleted: ['step-01-init', 'step-02-scan-epics', 'step-03-select-scope']
selectedEpics: ['epic-1-...']
selectedStories: ['1-1', '1-3', ...]
selectionMode: all | epic | story
```

### 6. Present Menu

Display: "**[C] Continue to processing mode selection**"

#### Menu Handling Logic:

- IF C: Save selection to {stateFile}, then load, read entire file, then execute {nextStepFile}
- IF user wants to change selection: Return to step 2 (present options again)
- IF Any other: Help user, then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input
- ONLY proceed when user confirms selection with 'C'
- Allow user to re-select if they change their mind

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Scan results loaded from state
- Clear selection options presented
- User selection captured and validated
- Selection saved to state file
- User confirmed before proceeding

### ❌ SYSTEM FAILURE:

- Proceeding without user selection
- Invalid selection not handled gracefully
- State not updated with selection
- Unclear options presentation

**Master Rule:** This is a user decision point. Wait for explicit input, validate, confirm.
