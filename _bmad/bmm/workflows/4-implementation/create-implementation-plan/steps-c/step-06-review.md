---
name: 'step-06-review'
description: 'Review generated implementation plans using BMM party mode'

nextStepFile: './step-07-finalize.md'
stateFile: '{output_folder}/implementation-plan-state.yaml'
epicsFolder: '{output_folder}/planning-artifacts/epics'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
validationCriteria: '../data/validation-criteria.md'
---

# Step 6: Review Plans

## STEP GOAL:

Review all generated implementation plans using BMM party mode to ensure quality, completeness, and alignment with validation criteria before finalizing.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER skip review - plans must be validated before development
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A REVIEW ORCHESTRATOR
- ✅ YOU MUST ALWAYS SPEAK OUTPUT in English

### Role Reinforcement:

- ✅ You are facilitating a multi-agent review of implementation plans
- ✅ Party mode brings diverse perspectives (PM, Architect, Dev, etc.)
- ✅ Goal is to catch issues before autonomous development begins

### Step-Specific Rules:

- 🎯 Focus ONLY on reviewing generated plans
- 🚫 FORBIDDEN to modify plans without user approval
- 💬 Present review findings clearly
- 🚫 FORBIDDEN to proceed if critical issues found (user must decide)

## EXECUTION PROTOCOLS:

- 🎯 Load validation criteria for review context
- 💾 Track review status in state file
- 📖 Present findings with clear recommendations
- 🚫 Halt for user decision on critical issues

## CONTEXT BOUNDARIES:

- Previous: Step 05 generated all implementation plans
- Focus: Quality review before development
- Limits: Review only, no implementation
- Dependencies: Generated .implement.md files

## MANDATORY SEQUENCE

**CRITICAL:** Follow this sequence exactly. Do not skip, reorder, or improvise unless user explicitly requests a change.

### 1. Load State and Plans

Load {stateFile} and retrieve:
- `storiesCompleted` - plans that were generated
- `selectedEpics` - which epics were processed

Display:
```
**Starting Implementation Plan Review**

Plans to review: [N]
Review method: BMM Party Mode (multi-agent deliberation)
```

### 2. Load Validation Criteria

Load {validationCriteria} to understand:
- High-level abstraction requirements
- No embedded coding standards rule
- Decision clarity requirements
- Reviewability requirements
- Agent workflow requirements

### 3. Present Review Options

Display:
```
**Select Review Scope**

**[A] All Plans** - Review all [N] generated plans
**[S] Sample** - Review first plan as representative sample
**[K] Skip** - Skip review and proceed to finalization

Note: Party mode review invokes multiple agent perspectives
(PM, Architect, Dev) to validate plan quality.
```

### 4. Execute Review Based on Selection

**IF user selects A (All):**

FOR EACH plan in storiesCompleted:
  - Load plan file: {epicsFolder}/[epic]/stories/[story].implement.md
  - Invoke party mode with context:
    * Plan content
    * Validation criteria
    * Question: "Review this implementation plan against our validation criteria. Is it high-level enough? Are technical decisions clear? Any concerns?"
  - Collect findings

**IF user selects S (Sample):**

- Load first plan from storiesCompleted
- Invoke party mode for single plan review
- Apply findings as general feedback for all plans

**IF user selects K (Skip):**

- Display: "**Review skipped.** Proceeding to finalization."
- Update state and proceed to next step

### 5. Invoke Party Mode

**For each plan being reviewed:**

Invoke {partyModeWorkflow} with:
```
Context: Implementation plan review
Document: [plan content]
Criteria: [validation criteria summary]

Questions for the group:
1. Is this plan appropriately high-level (reviewable in 5 minutes)?
2. Are technical decisions clear with rationale?
3. Are there any embedded coding standards that should be removed?
4. Does the agent instructions section correctly reference the coding standards path?
5. Any risks or concerns with this approach?
```

### 6. Compile Review Findings

After party mode completes, compile findings:

```
**Review Findings: [story-name]**

| Criterion | Status | Notes |
|-----------|--------|-------|
| High-level abstraction | ✅/⚠️/❌ | [notes] |
| No embedded standards | ✅/⚠️/❌ | [notes] |
| Decision clarity | ✅/⚠️/❌ | [notes] |
| Agent instructions | ✅/⚠️/❌ | [notes] |

**Party Mode Consensus:**
[Summary of agent feedback]

**Recommended Actions:**
- [action 1]
- [action 2]
```

### 7. Handle Review Results

**IF critical issues found:**

Display:
```
**⚠️ Review Found Critical Issues**

[List issues]

**Options:**
**[F] Fix** - Return to step 05 to regenerate affected plans
**[O] Override** - Accept plans despite issues (not recommended)
**[C] Continue** - Proceed to finalization with issues noted
```

**IF no critical issues:**

Display: "**Review Complete.** All plans meet validation criteria."

### 8. Update State

Update {stateFile}:
```yaml
stepsCompleted: [..., 'step-06-review']
reviewCompleted: true
reviewScope: all | sample | skipped
reviewFindings:
  totalReviewed: [N]
  passed: [P]
  warnings: [W]
  critical: [C]
```

### 9. Present Menu

Display: "**[C] Continue to finalization**"

#### Menu Handling Logic:

- IF C: Save review results to {stateFile}, then load, read entire file, then execute {nextStepFile}
- IF user wants to re-review: Return to step 3 (review options)
- IF Any other: Help user, then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after review
- ONLY proceed when user confirms with 'C'
- Critical issues require explicit user decision

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- Validation criteria loaded
- Plans reviewed via party mode (or explicitly skipped)
- Findings clearly presented
- Critical issues flagged for user decision
- State updated with review results
- User confirmed before proceeding

### ❌ SYSTEM FAILURE:

- Skipping review without user consent
- Not presenting review findings
- Proceeding despite critical issues without user approval
- State not updated with review status

**Master Rule:** Reviews catch issues before development. Never skip without user consent. Present findings clearly.
