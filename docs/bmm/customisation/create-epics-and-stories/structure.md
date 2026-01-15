# Folder Structure and File Naming

## Epic Folder Structure

Each epic is created as a folder with its own files, NOT as a single monolithic document.

### Output Location

```
{planning_artifacts}/epics/epic-{N}-{slug}/
├── overview.md              # Epic overview, objectives, scope
├── sprint-status.yaml       # Story status tracking
└── stories/
    ├── index.md             # Stories list, dependency graph
    ├── {N}-1-{slug}.md      # Story files
    ├── {N}-2-{slug}.md
    └── ...
```

### Path Variables

| Variable | Value |
|----------|-------|
| `{planning_artifacts}` | `_bmad-output/planning-artifacts` |
| `{epics_folder}` | `{planning_artifacts}/epics` |

## Naming Conventions

### Epic Folders

Format: `epic-{N}-{kebab-case-slug}`

Examples:
- `epic-1-youtube-content-extraction`
- `epic-2-transcript-refinement`
- `epic-3-tts-audio-generation`

### Story Files

Format: `{epic}-{story}-{kebab-case-slug}.md`

Examples:
- `1-1-extract-youtube-transcript.md`
- `1-2-store-video-metadata.md`
- `2-1-remove-sponsor-segments.md`

## Template Organisation

Templates live in the workflow folder, NOT in `.claude/rules/`.

### Template Location

```
_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/
└── templates/
    ├── epic-templates.md     # Templates for overview.md, sprint-status.yaml
    └── story-templates.md    # Templates for story files, stories/index.md
```

### Standards Location

Standards in `.claude/rules/` **reference** the workflow templates:

```
.claude/rules/
├── epic-standards.md         # References {workflow_path}/templates/epic-templates.md
└── story-standards.md        # References {workflow_path}/templates/story-templates.md
```

### Key Principle

**Single Source of Truth**: Templates are maintained in ONE place (workflow folder). Standards reference them but don't duplicate content.

## Step File Frontmatter Pattern

The step files use a simplified frontmatter structure. Here's the pattern by step:

### Step 1: Validate Prerequisites

```yaml
---
name: 'step-01-validate-prerequisites'
description: 'Validate required documents exist and extract all requirements for epic and story creation'
nextStepFile: './step-02-design-epics.md'
epics_folder: '{planning_artifacts}/epics'
indexFile: '{planning_artifacts}/epics/index.md'
---
```

### Step 2: Design Epics

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

### Step 3: Create Stories

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

### Step 4: Final Validation

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

### Key Frontmatter Variables

| Variable | Purpose |
|----------|---------|
| `indexFile` | Main index file at `{planning_artifacts}/epics/index.md` |
| `epics_folder` | Epic folder root at `{planning_artifacts}/epics` |
| `epicStandards` | Path to epic standards rule |
| `storyStandards` | Path to story standards rule |
| `epicTemplates` | Path to epic templates |
| `storyTemplates` | Path to story templates |

### Removed Variables

| Variable | Reason Removed |
|----------|----------------|
| `outputFile` | Replaced by `indexFile` |
| `epicsTemplate` | No longer needed - index.md created directly |
| `thisStepFile` | Not used |
| `workflowFile` | Not used |
| `workflow_path` | Templates referenced relatively |

## Main Output File (epics/index.md)

The `{planning_artifacts}/epics/index.md` file is created directly in Step 1:

### Created Structure

```markdown
---
stepsCompleted: []
inputDocuments: []
generated: {YYYY-MM-DD}
project: {project_name}
---

# {Project Name} - Epics and Stories

## Requirements Inventory

### Functional Requirements (FRs)
{Extracted from PRD}

### Non-Functional Requirements (NFRs)
{Extracted from PRD}

### Additional Requirements
{From Architecture/UX documents}

## Epic List
{Populated in Step 2}

## Epic Folders

| Epic | Folder | Status |
|------|--------|--------|
| Epic 1 | [epic-1-{slug}](./epic-1-{slug}/) | backlog |
...
```
