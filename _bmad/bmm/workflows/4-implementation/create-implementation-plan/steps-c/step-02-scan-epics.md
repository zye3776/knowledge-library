---
name: 'step-02-scan-epics'
description: 'Scan epics folder and read sprint-status.yaml to display available epics and stories'

nextStepFile: './step-03-select-scope.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'
epicsFolder: '{output_folder}/planning-artifacts/epics'
---

# Step 2: Scan Epics

## STEP GOAL:

Scan the epics folder, read sprint-status.yaml for each epic, and display a summary of available epics and their stories for user selection.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English
- ⚙️ TOOL/SUBPROCESS FALLBACK: If any instruction references a tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- ✅ You are an implementation architect surveying available work
- ✅ This is a scanning step - gather data efficiently
- ✅ Present information clearly for user decision-making

### Step-Specific Rules:

- 🎯 Focus ONLY on scanning and displaying epic/story status
- 🚫 FORBIDDEN to select or process any stories - that's later steps
- 💬 Present clear, actionable summary
- 🎯 Use subprocess for scanning multiple files (Pattern 1)
- ⚙️ If subprocess unavailable, scan files sequentially in main thread

## EXECUTION PROTOCOLS:

- 🎯 Scan all epic folders in {epicsFolder}
- 💾 Parse sprint-status.yaml for each epic
- 📖 Build summary of available stories
- 🚫 Don't load full story content - just status

## CONTEXT BOUNDARIES:

- Previous: Step 01 validated all required docs exist
- Focus: Survey what's available for implementation planning
- Limits: Only read status files, not full story content
- Output: Summary data for user selection

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Scan Epic Folders

List all epic folders in {epicsFolder}:

```
_bmad-output/planning-artifacts/epics/
├── epic-1-youtube-content-extraction/
├── epic-2-.../
└── epic-N-.../
```

For EACH epic folder found, note:
- Epic folder name
- Path to sprint-status.yaml
- Path to stories/ subfolder

### 2. Read Sprint Status Files

**For EACH epic, read its `sprint-status.yaml`:**

Expected structure:
```yaml
epic: epic-1-youtube-content-extraction
status: in_progress
stories:
  - id: "1-1"
    name: extract-youtube-transcript
    status: ready | in_progress | completed | blocked
    implementation_plan: exists | missing
  - id: "1-2"
    name: ...
```

**Collect:**
- Epic name and status
- List of stories with their status
- Whether each story already has an implementation plan

### 3. Build Epic Summary

Create summary data structure:

```
Epic: epic-1-youtube-content-extraction
Status: in_progress
Stories: 5 total | 2 ready | 1 in_progress | 2 completed
Implementation Plans: 2 existing | 3 missing
```

### 4. Display Summary

Present to user:

```
**Epic Status Summary**

| Epic | Status | Stories | Ready | Plans Missing |
|------|--------|---------|-------|---------------|
| epic-1-youtube-content-extraction | in_progress | 5 | 2 | 3 |
| epic-2-... | ... | ... | ... | ... |

**Stories Needing Implementation Plans:**

**Epic: epic-1-youtube-content-extraction**
- [ ] 1-1: extract-youtube-transcript (ready)
- [ ] 1-3: process-transcript (ready)
- [x] 1-2: validate-url (plan exists)

[Continue for each epic...]

**Total:** [N] stories need implementation plans
```

### 5. Validate Sufficient Work

**IF no stories need implementation plans:**
Display: "All stories already have implementation plans. Nothing to do."
Exit workflow.

**IF stories are available:**
Continue to scope selection.

### 6. Save Scan Results to State

Create/update {stateFile} with scan results:

```yaml
workflowName: create-implementation-plan
status: IN_PROGRESS
stepsCompleted: ['step-01-init', 'step-02-scan-epics']
lastUpdated: [current date]
scanResults:
  epics:
    - name: epic-1-youtube-content-extraction
      status: in_progress
      totalStories: 5
      storiesReady: 2
      plansMissing: 3
      stories:
        - id: "1-1"
          name: extract-youtube-transcript
          status: ready
          hasPlan: false
        # ...
```

### 7. Proceed to Scope Selection

Display: "**Proceeding to scope selection...**"

#### Menu Handling Logic:

- After displaying summary and saving state, immediately load, read entire file, then execute {nextStepFile}

#### EXECUTION RULES:

- This is a scanning step with auto-proceed
- No user menu needed - data gathered, proceed to selection

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All epics scanned successfully
- Sprint-status.yaml parsed for each epic
- Clear summary displayed
- Stories needing plans identified
- State file updated with scan results
- Proceeds to step 03

### ❌ SYSTEM FAILURE:

- Missing epic folders not handled
- Malformed sprint-status.yaml crashes workflow
- Unclear summary presentation
- Not saving scan results to state

**Master Rule:** Scan thoroughly, present clearly, save state for next steps.
