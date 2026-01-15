# Apply Customisation Instructions

Automated instructions for Claude Code to re-apply customisations after BMAD upgrade or reinstall.

## Prerequisites

Before applying, verify:
1. BMAD is installed at `_bmad/`
2. Workflow exists at `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/`
3. `.claude/rules/` directory exists
4. You have write access to the workflow folder and `.claude/rules/`

## Execution Steps

### Step 1: Verify Workflow Exists

```bash
ls -la _bmad/bmm/workflows/3-solutioning/create-epics-and-stories/
```

Expected: `workflow.md`, `steps/`, `templates/` directories exist.

### Step 2: Update Templates

#### 2.1 Delete epics-template.md if exists

```bash
rm -f _bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epics-template.md
```

#### 2.2 Ensure epic-templates.md exists

Read `docs/bmm/customisation/create-epics-and-stories/templates.md` and copy the `epic-templates.md` content to:
`_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epic-templates.md`

#### 2.3 Ensure story-templates.md exists

Read `docs/bmm/customisation/create-epics-and-stories/templates.md` and copy the `story-templates.md` content to:
`_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/story-templates.md`

### Step 3: Update Step Files

For each step file, apply the frontmatter pattern:

#### 3.1 Frontmatter Updates (All Steps)

Ensure these lines exist in frontmatter:
```yaml
# Standards (in .claude/rules/)
epicStandards: '{project-root}/.claude/rules/epic-standards.md'
storyStandards: '{project-root}/.claude/rules/story-standards.md'

# Templates (in workflow folder - SINGLE SOURCE OF TRUTH)
epicTemplates: '{workflow_path}/templates/epic-templates.md'
storyTemplates: '{workflow_path}/templates/story-templates.md'
```

Remove this line if present:
```yaml
epicsTemplate: '{workflow_path}/templates/epics-template.md'
```

#### 3.2 Step 1 Specific Changes

File: `steps/step-01-validate-prerequisites.md`

1. Replace all `{outputFile}` with `{indexFile}`

2. Replace Section 7 content. Find:
   ```markdown
   ### 7. Load and Initialize Template
   ```
   Replace with content from `step-updates.md` section "Change 3: Section 7 - Complete replacement"

3. Reorder menu sections: Menu Handling Logic should come BEFORE EXECUTION RULES

#### 3.3 Step 3 Specific Changes

File: `steps/step-03-create-stories.md`

Add to frontmatter if not present:
```yaml
storyBmadSkill: '{project-root}/.claude/rules/story-bmad-skill.md'
```

Ensure "Story Creation Guidelines" section includes WHAT not HOW guidance.

### Step 4: Create/Update .claude/rules/ Files

These files auto-apply standards when working with epics and stories.

#### 4.1 Create rules files

Read `docs/bmm/customisation/create-epics-and-stories/rules-files.md` and create each file in `.claude/rules/`:

1. **epic-standards.md** - Full content from rules-files.md
2. **epic-templates.md** - Reference to workflow templates
3. **story-standards.md** - Full content from rules-files.md
4. **story-templates.md** - Reference to workflow templates
5. **story-bmad-skill.md** - BMAD vs Claude Skill decisions

#### 4.2 Verify path triggers

Each file must have YAML frontmatter with `paths:` array:

```yaml
---
paths:
  - "_bmad-output/planning-artifacts/epics/**"
---
```

The paths determine when rules auto-apply.

### Step 5: Verify Changes

Run verification checklist:

```bash
# === Workflow Templates ===
# Check no epics-template.md exists
test ! -f _bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epics-template.md && echo "OK: epics-template.md removed"

# Check epic-templates.md exists
test -f _bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epic-templates.md && echo "OK: epic-templates.md exists"

# Check story-templates.md exists
test -f _bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/story-templates.md && echo "OK: story-templates.md exists"

# Check no epicsTemplate references in step files
grep -r "epicsTemplate" _bmad/bmm/workflows/3-solutioning/create-epics-and-stories/steps/ && echo "FAIL: epicsTemplate still referenced" || echo "OK: No epicsTemplate references"

# === .claude/rules/ Files ===
# Check all rules files exist
test -f .claude/rules/epic-standards.md && echo "OK: epic-standards.md exists"
test -f .claude/rules/epic-templates.md && echo "OK: epic-templates.md exists"
test -f .claude/rules/story-standards.md && echo "OK: story-standards.md exists"
test -f .claude/rules/story-templates.md && echo "OK: story-templates.md exists"
test -f .claude/rules/story-bmad-skill.md && echo "OK: story-bmad-skill.md exists"

# Check rules have path triggers
grep -l "^paths:" .claude/rules/epic-*.md .claude/rules/story-*.md | wc -l  # Expected: 5
```

## Rollback

If customisation causes issues:

1. Reinstall BMAD module to restore defaults
2. Review error messages
3. Apply customisations incrementally

## Post-Customisation

After successful application:

1. Test workflow by running: `/bmad:bmm:workflows:create-epics-and-stories`
2. Verify Step 1 creates `epics/index.md` directly (no template loading)
3. Verify Step 3 creates epic folders with proper structure
4. Verify stories contain no implementation details

## Troubleshooting

### Error: Template not found

If step file references a missing template:
1. Check `templates/` folder contains required files
2. Verify frontmatter paths are correct
3. Ensure `{workflow_path}` resolves correctly

### Error: outputFile or epicsTemplate variable undefined

Step file still references deleted variables:
1. Remove `epicsTemplate` and `outputFile` from frontmatter
2. Replace `{outputFile}` with `{indexFile}` in step content
3. Update any instructions referencing `{epicsTemplate}`

### Stories contain implementation details

Validation failed - stories have technical content:
1. Review `philosophy.md` for guidelines
2. Update story content to remove:
   - File paths
   - Code patterns
   - Architecture decisions
   - Dev notes
