---
name: 'step-06-finalize'
description: 'Report final completion status and cleanup'

stateFile: '{output_folder}/implementation-plan-state.yaml'
epicsFolder: '{output_folder}/planning-artifacts/epics'
---

# Step 6: Finalize

## STEP GOAL:

Report final completion status, summarize what was generated, and provide next steps for the user.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English

### Role Reinforcement:

- ✅ You are completing the workflow
- ✅ Provide clear summary of what was accomplished
- ✅ Guide user to next steps

### Step-Specific Rules:

- 🎯 Focus ONLY on reporting and completion
- 🚫 FORBIDDEN to process more stories - that's done
- 💬 Provide clear, actionable summary
- 🚫 This is the FINAL step - no next step

## EXECUTION PROTOCOLS:

- 🎯 Load final state
- 💾 Generate completion report
- 📖 Update state to COMPLETED
- 🚫 Clean up any temporary files if needed

## CONTEXT BOUNDARIES:

- Previous: Step 05 processed all stories
- Focus: Summary and completion
- Limits: No more processing
- This is the final step

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Load Final State

Load {stateFile} and retrieve:
- `storiesCompleted` - successfully processed
- `storiesFailed` - any failures
- `processingMode` - how it was processed
- `selectedEpics` - which epics were included

### 2. Generate Completion Report

Display:

```
═══════════════════════════════════════════════════════════════
              IMPLEMENTATION PLAN GENERATION COMPLETE
═══════════════════════════════════════════════════════════════

**Summary**

| Metric | Value |
|--------|-------|
| Processing Mode | [Sequential/Batch] |
| Epics Processed | [N] |
| Stories Processed | [M] |
| Plans Generated | [P] |
| Reviews Completed | [P × 2] |
| Failures | [F] |

**Generated Implementation Plans:**

Epic: epic-1-youtube-content-extraction
  ✓ 1-1-extract-youtube-transcript.implement.md
  ✓ 1-3-process-transcript.implement.md

[Continue for each epic...]

**Plan Locations:**
All plans saved alongside their story files in:
  {epicsFolder}/[epic-name]/stories/[story-name].implement.md

═══════════════════════════════════════════════════════════════
```

### 3. Report Any Failures

**IF storiesFailed is not empty:**

Display:
```
**⚠️ Some Stories Failed Processing**

The following stories encountered errors and need manual attention:

| Story | Error | Phase |
|-------|-------|-------|
| [id] | [error] | [phase] |

**Recommended Actions:**
1. Review the error messages above
2. Fix any underlying issues (missing data, API errors, etc.)
3. Re-run the workflow with just the failed stories
```

### 4. Provide Next Steps

Display:
```
**Next Steps**

Your implementation plans are ready for development. Here's what to do next:

1. **Review Plans** (Optional but recommended)
   Run the validate mode to check plan quality:
   `/bmad:bmm:workflows:create-implementation-plan -v`

2. **Start Development**
   Use the dev-story workflow to execute the plans:
   `/bmad:bmm:workflows:dev-story`

   Or use the autonomous development skill:
   `/epic-autonomous-dev`

3. **Track Progress**
   Sprint status files have been updated.
   Check: {epicsFolder}/[epic]/sprint-status.yaml

**Workflow State**
State file preserved at: {stateFile}
You can reference this for processing history.
```

### 5. Update Final State

Update {stateFile}:
```yaml
workflowName: create-implementation-plan
status: COMPLETED
completedAt: [current timestamp]
stepsCompleted: ['step-01-init', 'step-02-scan-epics', 'step-03-select-scope', 'step-04-select-mode', 'step-05-process-stories', 'step-06-finalize']
summary:
  totalStories: [N]
  plansGenerated: [M]
  failures: [F]
  processingMode: [mode]
```

### 6. Final Message

Display:
```
**Workflow Complete**

Thank you for using the Implementation Plan Generator.

To generate more plans in the future, run this workflow again.
Your previous state will be preserved for reference.

Happy coding! 🚀
```

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Clear completion report displayed
- All generated plans listed with locations
- Failures clearly reported with next steps
- State updated to COMPLETED
- User given actionable next steps

### ❌ SYSTEM FAILURE:

- Incomplete summary
- Not reporting failures
- State not marked complete
- No guidance for next steps

**Master Rule:** End clearly. Summarize completely. Guide the user forward.
