---
name: 'step-03-create-stories'
description: 'Generate all epics with their stories as individual files following project standards'
epics_folder: '{planning_artifacts}/epics'
nextStepFile: './step-04-final-validation.md'
indexFile: '{planning_artifacts}/epics/index.md'
epicStandards: '{project-root}/.claude/rules/epic-standards.md'
storyStandards: '{project-root}/.claude/rules/story-standards.md'
storyBmadSkill: '{project-root}/.claude/rules/story-bmad-skill.md'
epicTemplates: '../templates/epic-templates.md'
storyTemplates: '../templates/story-templates.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 3: Generate Epics and Stories

## STEP GOAL:

To generate all epics with their stories as individual files in the proper folder structure, following the standards defined in `.claude/rules/`.

## CRITICAL: STANDARDS ENFORCEMENT

**Before creating ANY epic or story files, you MUST read and follow:**

1. **{epicStandards}** - Epic folder structure and requirements
2. **{epicTemplates}** - Templates for overview.md and sprint-status.yaml
3. **{storyStandards}** - Story file standards (user-focused, no implementation details)
4. **{storyTemplates}** - Templates for story files
5. **{storyBmadSkill}** - Component distribution decisions (BMAD vs Claude Skills)

**These files are the SINGLE SOURCE OF TRUTH. Do not deviate from them.**

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Process epics sequentially
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a product strategist and technical specifications writer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring story creation and acceptance criteria expertise
- ✅ User brings their implementation priorities and constraints

### Step-Specific Rules:

- 🎯 Generate stories for each epic following the template exactly
- 🚫 FORBIDDEN to deviate from template structure
- 💬 Each story must have clear acceptance criteria
- 🚪 ENSURE each story is completable by a single dev agent
- 🔗 **CRITICAL: Stories MUST NOT depend on future stories within the same epic**

## EXECUTION PROTOCOLS:

- 🎯 Generate stories collaboratively with user input
- 💾 Create epic folders and story files in {epics_folder}/
- 📖 Process epics one at a time in sequence
- 🚫 FORBIDDEN to skip any epic or rush through stories
- 📋 MUST follow templates from {epicTemplates} and {storyTemplates}

## STORY GENERATION PROCESS:

### 1. Load Standards and Templates

**MANDATORY: Read these files before proceeding:**

```
Read {epicStandards}      # Epic folder structure requirements
Read {epicTemplates}      # Templates for overview.md, sprint-status.yaml
Read {storyStandards}     # Story standards (WHAT not HOW)
Read {storyTemplates}     # Story file templates
```

Load {indexFile} and review:
- Approved epics_list from Step 2
- FR coverage map
- All requirements (FRs, NFRs, additional)

### 2. Story Creation Guidelines

**CRITICAL RULE: Stories describe WHAT, not HOW**

Stories must be USER-FOCUSED:
- ✅ Describe user actions and observable outcomes
- ✅ Use Given/When/Then acceptance criteria
- ❌ NO file paths or folder structures
- ❌ NO code patterns or technical implementation details
- ❌ NO architecture decisions

**🔗 STORY DEPENDENCY PRINCIPLE:**
- Each story can be completed based only on previous stories
- ❌ WRONG: "Wait for Story 1.4 to be implemented before this works"
- ✅ RIGHT: "This story works independently and enables future stories"

### 3. Create Epic Folder Structure

For each epic, create this folder structure:

```
{epics_folder}/epic-{N}-{slug}/
├── overview.md              # From {epicTemplates}
├── sprint-status.yaml       # From {epicTemplates}
└── stories/
    ├── index.md             # Stories overview + dependency graph
    ├── {N}-1-{slug}.md      # Story files from {storyTemplates}
    ├── {N}-2-{slug}.md
    └── ...
```

**Naming Conventions:**
- Epic folder: `epic-{number}-{kebab-case-slug}` (e.g., `epic-1-youtube-content-extraction`)
- Story files: `{epic}-{story}-{kebab-case-slug}.md` (e.g., `1-1-extract-youtube-transcript.md`)

### 4. Process Epics Sequentially

For each epic in the approved epics_list:

#### A. Create Epic Folder
```bash
mkdir -p {epics_folder}/epic-{N}-{slug}/stories
```

#### B. Create overview.md
Use template from **{epicTemplates}** section "overview.md"

#### C. Create sprint-status.yaml
Use template from **{epicTemplates}** section "sprint-status.yaml"
- Set epic status to `backlog`
- Set first story to `ready-for-dev`
- Set remaining stories to `backlog`

#### D. Create stories/index.md
Use template from **{storyTemplates}** section "3. Stories Index"

#### E. Create Individual Story Files
Use template from **{storyTemplates}** section "2. Story File"

**DO NOT duplicate templates here - reference {storyTemplates} directly.**

#### F. Collaborative Review
After creating each story file:
- Present to user for approval
- Verify it follows {storyStandards}
- Ensure NO implementation details leaked in

### 5. Epic Completion

After all files for an epic are created:
- Display summary of files created
- Verify all FRs for the epic are covered
- Get user confirmation to proceed to next epic

### 6. Update Index with Epic Folder References

After all epics are created, update {indexFile} to add epic folder references:

```markdown
## Epic Folders

| Epic | Folder | Status |
|------|--------|--------|
| Epic 1 | [epic-1-{slug}](./epic-1-{slug}/) | backlog |
| Epic 2 | [epic-2-{slug}](./epic-2-{slug}/) | backlog |
...
```

### 7. Present FINAL MENU OPTIONS

After all epics and stories are complete:

Display: "**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue"

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF C: Save content to {indexFile}, update frontmatter, then only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-final-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [all epics and stories saved to document following the template structure exactly], will you then load and read fully `{nextStepFile}` to execute and begin final validation phase.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All epics processed in sequence
- Stories created for each epic
- Template structure followed exactly
- All FRs covered by stories
- Stories appropriately sized
- Acceptance criteria are specific and testable
- Document is complete and ready for development

### ❌ SYSTEM FAILURE:

- Deviating from template structure
- Missing epics or stories
- Stories too large or unclear
- Missing acceptance criteria
- Not following proper formatting

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
