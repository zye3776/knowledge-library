---
name: 'step-04-final-validation'
description: 'Validate complete coverage of all requirements and ensure implementation readiness'
epics_folder: '{planning_artifacts}/epics'
indexFile: '{planning_artifacts}/epics/index.md'
epicStandards: '{project-root}/.claude/rules/epic-standards.md'
storyStandards: '{project-root}/.claude/rules/story-standards.md'
---

# Step 4: Final Validation

## STEP GOAL:

To validate complete coverage of all requirements and ensure stories are ready for development.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Process validation sequentially without skipping
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a product strategist and technical specifications writer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring validation expertise and quality assurance
- ✅ User brings their implementation priorities and final review

### Step-Specific Rules:

- 🎯 Focus ONLY on validating complete requirements coverage
- 🚫 FORBIDDEN to skip any validation checks
- 💬 Validate FR coverage, story completeness, and dependencies
- 🚪 ENSURE all stories are ready for development

## EXECUTION PROTOCOLS:

- 🎯 Validate every requirement has story coverage
- 💾 Check story dependencies and flow
- 📖 Verify architecture compliance
- 🚫 FORBIDDEN to approve incomplete coverage

## CONTEXT BOUNDARIES:

- Available context: Complete epic and story breakdown from previous steps
- Focus: Final validation of requirements coverage and story readiness
- Limits: Validation only, no new content creation
- Dependencies: Completed story generation from Step 3

## VALIDATION PROCESS:

**⚠️ DO NOT BE LAZY - LOAD AND READ EVERY FILE. DO NOT SKIP OR SHORTCUT ANY VALIDATION CHECK.**

### 0. Load Standards for Validation

**Read the standards files to validate against:**
```
Read {epicStandards}    # Folder structure, quality checklist
Read {storyStandards}   # Story file requirements
```

### 1. Folder Structure Validation

**Verify epic folders exist and are complete:**

For each epic in {epics_folder}/:
- [ ] `epic-{N}-{slug}/overview.md` exists
- [ ] `epic-{N}-{slug}/sprint-status.yaml` exists
- [ ] `epic-{N}-{slug}/stories/index.md` exists
- [ ] All story files referenced in index.md exist

### 2. FR Coverage Validation

Load {indexFile} and review all story files to ensure EVERY FR is covered:

**CRITICAL CHECK:**
- Go through each FR from the Requirements Inventory in {indexFile}
- Verify it appears in at least one story's acceptance criteria
- No FRs should be left uncovered

### 3. Standards Compliance Validation

**From {epicStandards} - Quality Checklist:**
- [ ] Epic is SELF-CONTAINED (no external file references)
- [ ] Story Context References point only to `../overview.md`
- [ ] Every AC has a measurable verification command
- [ ] Tasks reference which ACs they satisfy
- [ ] Dependencies listed in index.md
- [ ] sprint-status.yaml has all stories
- [ ] Stories are atomic

**From {storyStandards} - Stories Must NOT Include:**
- [ ] NO code patterns or examples
- [ ] NO file structures or paths to create
- [ ] NO architecture diagrams
- [ ] NO Dev Notes / Implementation guidance
- [ ] NO testing strategy details

### 4. Story Quality Validation

**Each story file must:**
- Be completable by a single dev agent
- Have clear acceptance criteria in Given/When/Then format
- Have verification commands for each AC
- **Not have forward dependencies** (can only depend on PREVIOUS stories)

### 5. Dependency Validation (CRITICAL)

**Epic Independence Check:**
- Does each epic deliver COMPLETE functionality for its domain?
- Can Epic 2 function without Epic 3 being implemented?
- ✅ RIGHT: Each epic is independently valuable

**Within-Epic Story Dependency Check:**
- Review stories/index.md dependency graph
- Verify no story depends on a future story
- ✅ RIGHT: Each story builds only on previous stories

### 6. Generate Validation Report

Create a summary of validation results:

```markdown
## Validation Report

### Folder Structure: ✅ PASS / ❌ FAIL
- Epic folders created: {count}
- Story files created: {count}

### FR Coverage: ✅ PASS / ❌ FAIL
- FRs covered: {count}/{total}
- Missing FRs: {list or "None"}

### Standards Compliance: ✅ PASS / ❌ FAIL
- Epic checklist: {pass/fail}
- Story checklist: {pass/fail}

### Dependencies: ✅ PASS / ❌ FAIL
- No forward dependencies: {yes/no}
```

### 7. Complete Workflow

If all validations pass:
- Display validation report
- Confirm epics are ready for development

**Present Final Menu:**
**All validations complete!** [C] Complete Workflow

#### Menu Handling Logic:

- IF C: Confirm workflow completion - epics are ready for `/bmad:bmm:workflows:dev-story`
- IF Any other comments or queries: help user respond then redisplay the menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY complete workflow when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All epic folders verified with complete structure
- Every FR traced to at least one story acceptance criterion
- All stories comply with epic-standards and story-standards
- No forward dependencies found in any epic or story
- Validation report generated with all checks passing
- User confirms workflow completion

### ❌ SYSTEM FAILURE:

- Missing epic folders or story files
- Any FR without story coverage
- Stories containing implementation details or code patterns
- Forward dependencies detected
- Validation report shows any FAIL status
- Not loading and reading every file during validation

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
