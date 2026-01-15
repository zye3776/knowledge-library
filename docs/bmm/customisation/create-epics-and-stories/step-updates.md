# Step File Updates

Specific changes required for each step file in the workflow.

## Overview of Changes

The key changes from the default BMAD workflow:

1. **Variable rename**: `outputFile` → `indexFile`
2. **File location**: `epics.md` → `epics/index.md`
3. **Frontmatter simplified**: Removed unused variables
4. **Epic folder structure**: Individual folders per epic
5. **Menu handling**: Added "when finished redisplay the menu" pattern

---

## Step 1: Validate Prerequisites

File: `steps/step-01-validate-prerequisites.md`

### Frontmatter Changes

**Replace entire frontmatter with:**
```yaml
---
name: 'step-01-validate-prerequisites'
description: 'Validate required documents exist and extract all requirements for epic and story creation'
nextStepFile: './step-02-design-epics.md'
epics_folder: '{planning_artifacts}/epics'
indexFile: '{planning_artifacts}/epics/index.md'
---
```

### Content Changes

#### Change 1: EXECUTION PROTOCOLS section

**Before:**
```markdown
- 💾 Populate {outputFile} with extracted requirements
```

**After:**
```markdown
- 💾 Populate {indexFile} with extracted requirements
```

#### Change 2: Document creation instruction (~line 80)

**Before:**
```
create the {outputFile} from the {epicsTemplate}
```

**After:**
```
create {indexFile} with extracted requirements
```

#### Change 3: Section 7 - Complete replacement

**Before:**
```markdown
### 7. Load and Initialize Template

Load {epicsTemplate} and initialize {outputFile}:

1. Copy the entire template to {outputFile}
2. Replace {{project_name}} with the actual project name
...
```

**After:**
```markdown
### 7. Create Epics Folder and Index

Create the epics folder structure and index file:

\`\`\`bash
mkdir -p {epics_folder}
\`\`\`

Create {indexFile} with extracted requirements:

1. Add YAML frontmatter with `stepsCompleted: []`, `inputDocuments: []`, `generated: {date}`, `project: {name}`
2. Add project name as main header
3. Add Requirements Inventory section:
   - Functional Requirements (extracted FRs)
   - Non-Functional Requirements (extracted NFRs)
   - Additional Requirements (from Architecture/UX)
4. Leave Epic List section empty for Step 2
```

#### Change 4: Menu section order

Ensure Menu Handling Logic comes BEFORE EXECUTION RULES:

```markdown
Display: `**Confirm the Requirements are complete and correct to [C] continue:**`

#### Menu Handling Logic:

- IF C: Save all to {indexFile}, update frontmatter, only then load, read entire file, then execute {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#10-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- User can chat or ask questions - always respond and then end with display again of the menu option
```

---

## Step 2: Design Epics

File: `steps/step-02-design-epics.md`

### Frontmatter Changes

**Replace entire frontmatter with:**
```yaml
---
name: 'step-02-design-epics'
description: 'Design and approve the epics_list that will organize all requirements into user-value-focused epics'
nextStepFile: './step-03-create-stories.md'
indexFile: '{planning_artifacts}/epics/index.md'
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---
```

### Content Changes

1. Replace all `{outputFile}` with `{indexFile}`
2. Update Menu Handling Logic to add "when finished redisplay the menu":

```markdown
#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask}, and when finished redisplay the menu
- IF P: Execute {partyModeWorkflow}, and when finished redisplay the menu
- IF C: Save approved epics_list to {indexFile}, update frontmatter, then only then load, read entire file, then execute {nextStepFile}
```

---

## Step 3: Create Stories

File: `steps/step-03-create-stories.md`

### Frontmatter Changes

**Replace entire frontmatter with:**
```yaml
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
```

### Content Changes - MAJOR REWRITE

Step 3 has been significantly rewritten. Key additions:

#### Add Standards Enforcement Section after STEP GOAL

```markdown
## CRITICAL: STANDARDS ENFORCEMENT

**Before creating ANY epic or story files, you MUST read and follow:**

1. **{epicStandards}** - Epic folder structure and requirements
2. **{epicTemplates}** - Templates for overview.md and sprint-status.yaml
3. **{storyStandards}** - Story file standards (user-focused, no implementation details)
4. **{storyTemplates}** - Templates for story files
5. **{storyBmadSkill}** - Component distribution decisions (BMAD vs Claude Skills)

**These files are the SINGLE SOURCE OF TRUTH. Do not deviate from them.**
```

#### Replace story generation with folder structure creation

**Section 3 - Epic Folder Structure:**
```markdown
### 3. Create Epic Folder Structure

For each epic, create this folder structure:

\`\`\`
{epics_folder}/epic-{N}-{slug}/
├── overview.md              # From {epicTemplates}
├── sprint-status.yaml       # From {epicTemplates}
└── stories/
    ├── index.md             # Stories overview + dependency graph
    ├── {N}-1-{slug}.md      # Story files from {storyTemplates}
    ├── {N}-2-{slug}.md
    └── ...
\`\`\`

**Naming Conventions:**
- Epic folder: `epic-{number}-{kebab-case-slug}` (e.g., `epic-1-youtube-content-extraction`)
- Story files: `{epic}-{story}-{kebab-case-slug}.md` (e.g., `1-1-extract-youtube-transcript.md`)
```

#### Add WHAT not HOW guidance

```markdown
### 2. Story Creation Guidelines

**CRITICAL RULE: Stories describe WHAT, not HOW**

Stories must be USER-FOCUSED:
- ✅ Describe user actions and observable outcomes
- ✅ Use Given/When/Then acceptance criteria
- ❌ NO file paths or folder structures
- ❌ NO code patterns or technical implementation details
- ❌ NO architecture decisions
```

---

## Step 4: Final Validation

File: `steps/step-04-final-validation.md`

### Frontmatter Changes

**Replace entire frontmatter with:**
```yaml
---
name: 'step-04-final-validation'
description: 'Validate complete coverage of all requirements and ensure implementation readiness'
epics_folder: '{planning_artifacts}/epics'
indexFile: '{planning_artifacts}/epics/index.md'
epicStandards: '{project-root}/.claude/rules/epic-standards.md'
storyStandards: '{project-root}/.claude/rules/story-standards.md'
---
```

### Content Changes - MAJOR REWRITE

Step 4 has been rewritten with new validation process:

#### Add Standards Loading Section

```markdown
### 0. Load Standards for Validation

**Read the standards files to validate against:**
\`\`\`
Read {epicStandards}    # Folder structure, quality checklist
Read {storyStandards}   # Story file requirements
\`\`\`
```

#### Add Folder Structure Validation

```markdown
### 1. Folder Structure Validation

**Verify epic folders exist and are complete:**

For each epic in {epics_folder}/:
- [ ] `epic-{N}-{slug}/overview.md` exists
- [ ] `epic-{N}-{slug}/sprint-status.yaml` exists
- [ ] `epic-{N}-{slug}/stories/index.md` exists
- [ ] All story files referenced in index.md exist
```

#### Add Standards Compliance Validation

```markdown
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
```

#### Add SUCCESS/FAILURE METRICS Section

```markdown
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
```

---

## Verification Checklist

After applying all updates:

### Step 1
- [ ] Frontmatter uses `indexFile` (not `outputFile`)
- [ ] Frontmatter uses `epics_folder`
- [ ] Section 7 creates folder with `mkdir -p {epics_folder}`
- [ ] References `{indexFile}` throughout

### Step 2
- [ ] Frontmatter uses `indexFile`
- [ ] Menu handling has "when finished redisplay the menu"
- [ ] References `{indexFile}` throughout

### Step 3
- [ ] Frontmatter has all standards and template references
- [ ] Has CRITICAL: STANDARDS ENFORCEMENT section
- [ ] Has "WHAT not HOW" guidance
- [ ] Creates epic folder structure
- [ ] Menu handling has "when finished redisplay the menu"

### Step 4
- [ ] Frontmatter uses `indexFile`
- [ ] Has "Load Standards for Validation" section
- [ ] Has "Folder Structure Validation" section
- [ ] Has "Standards Compliance Validation" section
- [ ] Has SUCCESS/FAILURE METRICS section
