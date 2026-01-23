---
name: 'step-01-init'
description: 'Validate required docs exist and check for workflow continuation'

nextStepFile: './step-02-scan-epics.md'
continueFile: './step-01b-continue.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'

requiredDocs:
  projectBrief: '{output_folder}/planning-artifacts/project-brief.md'
  architecture: '{output_folder}/planning-artifacts/architecture.md'
  prd: '{output_folder}/planning-artifacts/prd.md'
  epicsFolder: '{output_folder}/planning-artifacts/epics'
---

# Step 1: Initialize

## STEP GOAL:

Validate that all required planning documents exist and check if this is a continuation of a previous session.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English
- ⚙️ TOOL/SUBPROCESS FALLBACK: If any instruction references a tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- ✅ You are an implementation architect preparing for autonomous development
- ✅ This is a validation step - be thorough but efficient
- ✅ Fail fast on missing required docs - don't proceed with partial context

### Step-Specific Rules:

- 🎯 Focus ONLY on validation and continuation check
- 🚫 FORBIDDEN to proceed if required docs are missing
- 💬 Report validation results clearly
- 🚫 FORBIDDEN to start scanning epics - that's step 02

## EXECUTION PROTOCOLS:

- 🎯 Check for existing state file first (continuation detection)
- 💾 Validate all required documents exist
- 📖 Report clear error if any required doc is missing
- 🚫 This is a gatekeeper step - don't skip validation

## CONTEXT BOUNDARIES:

- No prior context - this is the first step
- Focus: Ensure all prerequisites are met
- Limits: Only validate, don't read document contents yet
- Dependencies: None - this establishes dependencies for later steps

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Check for Continuation

Check if {stateFile} exists.

**IF state file exists:**
- Display: "**Found existing session state. Resuming previous workflow...**"
- Load, read entire file, then execute {continueFile}
- STOP here - do not continue to validation

**IF state file does NOT exist:**
- Continue to validation sequence below

### 2. Validate Required Documents

Check that each required document/folder exists:

**Required Documents:**

| Document | Path | Status |
|----------|------|--------|
| Project Brief | `{requiredDocs.projectBrief}` | Check exists |
| Architecture | `{requiredDocs.architecture}` | Check exists |
| PRD | `{requiredDocs.prd}` | Check exists |
| Epics Folder | `{requiredDocs.epicsFolder}` | Check exists and contains at least one epic |

### 3. Report Validation Results

**IF all required docs exist:**

Display:
```
**Validation Complete**

All required documents found:
- project-brief.md
- architecture.md
- prd.md
- epics/ folder with [N] epic(s)

Ready to scan epics and generate implementation plans.
```

**IF any required doc is MISSING:**

Display:
```
**Validation Failed**

Missing required documents:
- [list missing docs with expected paths]

Please ensure all planning artifacts exist before running this workflow.
Required structure:
_bmad-output/planning-artifacts/
├── project-brief.md
├── architecture.md
├── prd.md
└── epics/
    └── [epic-name]/
        ├── sprint-status.yaml
        └── stories/
```

**STOP - Do not proceed. Exit workflow.**

### 4. Proceed to Epic Scanning

Display: "**Proceeding to scan epics...**"

#### Menu Handling Logic:

- After successful validation, immediately load, read entire file, then execute {nextStepFile}

#### EXECUTION RULES:

- This is a validation step with auto-proceed on success
- No user menu needed - either pass and proceed, or fail and exit

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All required documents validated
- Continuation correctly detected (if applicable)
- Clear report of validation status
- Proceeds to step 02 on success

### ❌ SYSTEM FAILURE:

- Proceeding with missing required docs
- Not checking for continuation
- Unclear error messages
- Skipping validation

**Master Rule:** This is a gatekeeper step. Never proceed without full validation.
