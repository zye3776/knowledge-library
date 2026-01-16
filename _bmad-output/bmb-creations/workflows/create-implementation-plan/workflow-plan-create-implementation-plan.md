---
stepsCompleted: ['step-01-discovery', 'step-02-classification', 'step-03-requirements', 'step-04-tools', 'step-05-plan-review', 'step-06-design', 'step-07-foundation', 'step-08-build-step-01']
created: 2026-01-16
status: BUILDING_STEPS
approvedDate: 2026-01-16
workflowName: create-implementation-plan
targetPath: '_bmad/bmm/workflows/4-implementation/create-implementation-plan/'
currentBuildStep: 2
---

# Workflow Creation Plan

## Discovery Notes

**User's Vision:**
Create a v2 replacement for the existing `epic-autonomous-dev` skill. This workflow orchestrates autonomous story-level implementation planning with multi-agent review (Claude Code + OpenCode + BMM Party Mode). It bridges the gap between user-facing requirements (epics/stories) and AI-ready implementation plans.

**Who It's For:**
- Developers initiating autonomous development cycles
- AI-driven development workflows (Claude Code, OpenCode) that consume the implementation plans

**What It Produces:**
- `{story-name}.implement.md` - Complete technical implementation plan co-located with story file
- Contains: code structure, tech stack decisions, critical technical decisions, env vars, everything needed for autonomous coding

**Key Insights:**

1. **Replaces v1 skill**: `epic-autonomous-dev` was the prototype; this workflow is the production-ready evolution
2. **Multi-agent orchestration**: Generate → OpenCode Review → Party Mode Finalize
3. **Portable skills**: All skills work with both Claude Code and OpenCode
4. **Context loading is critical**: Step E loads architecture.md, prd.md, coding-standards, KISS principles via dedicated skill
5. **Fully autonomous output**: Implementation plan requires zero human input during code execution

**Workflow Steps (High-Level):**

| Step | Description |
|------|-------------|
| a | Developer summons workflow |
| b | Scan epics, read sprint-status.yaml for each |
| c | User selects epic(s) OR specific story for auto-development |
| d | Orchestrate story development (replaces epic-autonomous-dev logic) |
| e | SKILL: Load project context into memory |
| f | Load epic overview + stories index + story details |
| g | SKILL: Generate implementation plan from template |
| h | SKILL: OpenCode reviews → suggestions/issues |
| i | BMM Party Mode review → final plan |
| j | Save as `{story-name}.implement.md` |

**Design Goals:**
- Better performance (modular, focused steps)
- Expandability (add stages/agents without rewriting)
- Easy customization (independent skills/steps)

**Technical Context Sources:**
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/epics/[epic-name]/overview.md`
- `_bmad-output/planning-artifacts/epics/[epic-name]/stories/index.md`
- `_bmad-output/planning-artifacts/epics/[epic-name]/stories/*.md`
- `_bmad-output/planning-artifacts/epics/[epic-name]/sprint-status.yaml`
- `.claude/rules/coding-standards`
- KISS development principles

---

## Classification Decisions

**Workflow Name:** create-implementation-plan
**Target Path:** `_bmad/bmm/workflows/4-implementation/create-implementation-plan/`

**4 Key Decisions:**

| # | Decision | Value | Rationale |
|---|----------|-------|-----------|
| 1 | **Document Output** | `true` | Produces `{story-name}.implement.md` files |
| 2 | **Module Affiliation** | `BMM` | Software development workflow, fits with create-story, dev-story |
| 3 | **Session Type** | `continuable` | Multi-story loop, heavy token usage, may need pause/resume |
| 4 | **Lifecycle Support** | `tri-modal` | Production workflow, needs validate/edit capabilities |

**Structure Implications:**

```
_bmad/bmm/workflows/4-implementation/create-implementation-plan/
├── workflow.md              # Entry point with mode selection
├── data/                    # Shared templates, criteria, examples
│   ├── implementation-plan-template.md
│   └── validation-criteria.md
├── steps-c/                 # CREATE flow
│   ├── step-01-init.md      # Init with continuation detection
│   ├── step-01b-continue.md # Resume from previous session
│   ├── step-02-scan-epics.md
│   ├── step-03-select-scope.md
│   ├── step-04-load-context.md
│   ├── step-05-generate-plan.md
│   ├── step-06-opencode-review.md
│   ├── step-07-party-mode-review.md
│   └── step-08-save-plan.md
├── steps-e/                 # EDIT flow
│   └── (edit steps TBD)
└── steps-v/                 # VALIDATE flow
    └── (validate steps TBD)
```

**Additional Requirements:**
- `stepsCompleted` tracking in output frontmatter (continuable)
- `step-01b-continue.md` for resumption logic
- Shared `data/` folder for templates across modes

**Execution Modes:**
- **Batch mode**: All stories in selected epic(s)
- **Single mode**: Specific story if user requests

---

## Requirements

**Flow Structure:**
- Pattern: Hybrid (Linear setup → Looping story processing)
- Processing Modes (user chooses at runtime):
  - **Sequential**: Each story through full cycle before next
  - **Batch**: All stories through each phase together
- Phases:
  1. Initialization (with continuation detection)
  2. Epic Scanning
  3. Scope Selection (epic/story)
  4. Processing Mode Selection
  5. Context Loading
  6. Plan Generation (loop/batch)
  7. OpenCode Review (loop/batch)
  8. Party Mode Review (loop/batch)
  9. Save Plans
- Estimated steps: 8-9 step files for create flow

**User Interaction:**
- Style: Mostly Autonomous
- Decision points:
  - Select epic(s) or specific story
  - Select processing mode (sequential vs batch)
- Checkpoint frequency: Only at selection steps, no extra pauses
- No approval needed after generation or reviews

**Inputs Required:**
- Required:
  - `_bmad-output/planning-artifacts/epics/` folder with at least one epic
  - `sprint-status.yaml` in each epic folder
  - Story files in `stories/` subfolder
  - `_bmad-output/planning-artifacts/architecture.md`
  - `_bmad-output/planning-artifacts/prd.md`
  - `.claude/rules/coding-standards` (or similar)
- Optional:
  - `overview.md` in epic folder
  - `stories/index.md` for story relationships
  - UX design docs if UI-related stories
- Prerequisites: Planning artifacts must exist (fail fast if missing)
- Error Handling: **Fail fast** on missing required docs with clear error message

**Output Specifications:**
- Type: Document (`{story-name}.implement.md`)
- Format: Structured
- Location: Same folder as story file
- Template Sections:
  ```markdown
  ---
  story_id: "{id}"
  story_name: "{name}"
  epic: "{epic-name}"
  created: {date}
  status: READY_FOR_DEV
  ---

  # Implementation Plan: {story-name}

  ## Overview
  ## Technical Decisions
  ## Code Structure
  ## Dependencies
  ## Implementation Steps
  ## Acceptance Criteria Mapping
  ## Edge Cases & Error Handling
  ```
- Frequency: One per story (batch or sequential)

**Success Criteria:**
- Every selected story has a `.implement.md` file generated
- All template sections populated (no empty/placeholder content)
- Decisions align with architecture.md, no contradictions
- Implementation steps specific enough for AI dev workflow
- OpenCode + Party Mode feedback addressed in final plan
- Files saved at correct path alongside story files
- AI dev workflow can execute without asking clarifying questions
- No ambiguous instructions like "decide later" or "TBD"
- All env vars, dependencies, file paths explicitly named

**Instruction Style:**
- Overall: Mixed
- Step-specific:
  | Step | Style |
  |------|-------|
  | Init/Continue | Prescriptive |
  | Scan Epics | Prescriptive |
  | Select Scope | Prescriptive |
  | Select Mode | Prescriptive |
  | Load Context | Prescriptive |
  | Generate Plan | Mixed |
  | OpenCode Review | Intent-Based |
  | Party Mode | Intent-Based |
  | Save Plan | Prescriptive |

---

## Tools Configuration

**Core BMAD Tools:**

| Tool | Include | Integration Point |
|------|---------|-------------------|
| Party Mode | Yes | Phase 8 - via forked skill (`context: fork`) |
| Advanced Elicitation | No | Doesn't fit autonomous design |
| Brainstorming | No | Not needed for structured generation |

**LLM Features:**

| Feature | Include | Use Case |
|---------|---------|----------|
| Web-Browsing/DeepWiki | Yes | Phase 6 - technical research during plan generation |
| File I/O | Yes | Required - reading inputs, writing `.implement.md` |
| Sub-Agents | No | Replaced by forked skills |
| Sub-Processes | Optional | Future batch optimization consideration |

**Skills Architecture (Key Design Decision):**

Heavy operations run as **skills with `context: fork`** to isolate context:

```
Main Workflow Context (clean, efficient)
    │
    ├── Phase 6: Generate Plan
    │   └── Uses DeepWiki MCP for research (inline)
    │
    ├── Phase 7: Invoke dev-opencode-review skill (context: fork)
    │   └── Returns: suggestions, issues only
    │
    └── Phase 8: Invoke dev-party-mode-review skill (context: fork)
        └── Returns: final implementation plan only
```

**Skills to Create:**
1. `dev-opencode-review` - Wrapper skill to invoke OpenCode review with `context: fork`
2. `dev-party-mode-review` - Wrapper skill to invoke Party Mode with `context: fork`
3. `dev-load-project-context` - Skill to load all required docs into context

**Memory & State:**

| Aspect | Configuration |
|--------|---------------|
| Type | Continuable |
| Tracking | `stepsCompleted` array, `lastStep`, story-level progress |
| Resume | `step-01b-continue.md` for session resumption |
| Additional | Processing mode selection, partial batch progress |

**External Integrations:**

| Integration | Purpose |
|-------------|---------|
| DeepWiki MCP | Technical research for implementation decisions |
| OpenCode | External AI agent for plan review (via skill wrapper) |

**Installation Requirements:**
- None - all tools available or already configured

---

## Workflow Design

### Step File Structure (steps-c/)

| # | File | Type | Purpose | Menu |
|---|------|------|---------|------|
| 01 | `step-01-init.md` | Init (Continuable) | Validate required docs, check continuation | Auto-proceed |
| 01b | `step-01b-continue.md` | Continuation | Resume from last progress point | Auto-proceed |
| 02 | `step-02-scan-epics.md` | Middle (Simple) | Scan epics, read sprint-status.yaml, display summary | C only |
| 03 | `step-03-select-scope.md` | Branch | User selects epic(s) OR specific story | C only |
| 04 | `step-04-select-mode.md` | Branch | User chooses Sequential OR Batch | C only |
| 05 | `step-05-process-stories.md` | Middle (Loop/Batch) | Orchestrates generation, review, save loop | Progress updates |
| 06 | `step-06-finalize.md` | Final | Report completion summary | None |

### Step 05: Core Processing Logic

**Sequential Mode:**
```
FOR each story:
  1. Load context (dev-load-project-context skill)
  2. Generate plan (inline + DeepWiki research)
  3. OpenCode review (dev-opencode-review skill, context: fork)
  4. Party Mode review (dev-party-mode-review skill, context: fork)
  5. Save {story}.implement.md
  → Next story
```

**Batch Mode:**
```
1. Load all context once
2. Generate ALL plans
3. OpenCode reviews ALL plans
4. Party Mode reviews ALL plans
5. Save ALL plans
```

### Data Files (data/)

| File | Purpose |
|------|---------|
| `implementation-plan-template.md` | Structured 7-section template for output |
| `validation-criteria.md` | Success criteria checklist for validate mode |
| `context-sources.md` | List of docs to load for context |

### Interaction Pattern

| Step | Interaction | User Input |
|------|-------------|------------|
| 01-init | Autonomous | None |
| 01b-continue | Autonomous | None |
| 02-scan | Autonomous | None |
| 03-select-scope | **User decision** | Epic(s) or story selection |
| 04-select-mode | **User decision** | Sequential or Batch |
| 05-process | Autonomous | None (progress updates only) |
| 06-finalize | Autonomous | None |

**Only 2 user decision points** - matches "mostly autonomous" requirement.

### Data Flow

```
Step 01 (Init)
  └─► Validates: architecture.md, prd.md, coding-standards, epics folder
  └─► Output: Validated paths, workflow state

Step 02 (Scan)
  └─► Input: _bmad-output/planning-artifacts/epics/
  └─► Output: Epic status summary, available stories list

Step 03 (Select Scope)
  └─► Input: Epic/story list from Step 02
  └─► Output: selectedEpics[], selectedStories[]

Step 04 (Select Mode)
  └─► Input: Selections
  └─► Output: processingMode (sequential|batch)

Step 05 (Process)
  └─► Input: Selections, mode, context docs
  └─► Skills: dev-load-project-context, dev-opencode-review, dev-party-mode-review
  └─► Output: {story}.implement.md files

Step 06 (Finalize)
  └─► Input: Completion state
  └─► Output: Summary report
```

### State Tracking Schema

```yaml
---
workflowName: create-implementation-plan
status: IN_PROGRESS | COMPLETED
stepsCompleted: ['step-01-init', 'step-02-scan', ...]
processingMode: sequential | batch
selectedEpics: ['epic-1-youtube-content-extraction']
selectedStories: ['1-1-extract-youtube-transcript', ...]
storiesCompleted: ['1-1-extract-youtube-transcript']
currentStory: '1-2-...'
lastContinued: '2026-01-16'
---
```

### Skills to Create

| Skill | Purpose | Context | Returns |
|-------|---------|---------|---------|
| `dev-load-project-context` | Load arch, prd, coding-standards, epic docs | Inline | Loaded context |
| `dev-opencode-review` | Invoke OpenCode for plan review | `context: fork` | Suggestions, issues |
| `dev-party-mode-review` | Invoke Party Mode for final review | `context: fork` | Final implementation plan |

### Subprocess Optimization

| Step | Pattern | Details |
|------|---------|---------|
| Step 02 (scan) | Pattern 1 (grep) | Single scan across sprint-status.yaml files |
| Step 05 (reviews) | Pattern 2 (deep analysis) | Forked skill per story via `context: fork` |

### Error Handling

| Point | Handling |
|-------|----------|
| Missing required docs | Fail fast - list missing files, exit |
| No epics found | Error: "No epics found in planning-artifacts" |
| Story already has .implement.md | Skip with notice (default) or overwrite |
| Skill execution fails | Log error, mark story failed, continue to next |
| All stories fail | Report failure summary, exit with error |

### File Structure (Final)

```
_bmad/bmm/workflows/4-implementation/create-implementation-plan/
├── workflow.md
├── data/
│   ├── implementation-plan-template.md
│   └── validation-criteria.md
├── steps-c/
│   ├── step-01-init.md
│   ├── step-01b-continue.md
│   ├── step-02-scan-epics.md
│   ├── step-03-select-scope.md
│   ├── step-04-select-mode.md
│   ├── step-05-process-stories.md
│   └── step-06-finalize.md
├── steps-e/
│   └── (TBD - edit flow)
└── steps-v/
    └── (TBD - validate flow)
```

---

## Foundation Build Complete

**Created at:** `_bmad/bmm/workflows/4-implementation/create-implementation-plan/`

**Files Created:**

| File | Purpose |
|------|---------|
| `workflow.md` | Main entry point with tri-modal routing (create/validate/edit) |
| `data/implementation-plan-template.md` | Structured 7-section output template |
| `data/validation-criteria.md` | Criteria for validate mode |

**Folder Structure:**
- `steps-c/` - Create flow (7 step files to build)
- `steps-e/` - Edit flow (placeholder)
- `steps-v/` - Validate flow (placeholder)
- `data/` - Shared templates and criteria

**Configuration:**
- Workflow name: `create-implementation-plan`
- Continuable: Yes (multi-session support)
- Document output: Yes (structured template)
- Mode: Tri-modal (Create + Edit + Validate)

**Next Steps:**
- Step 8: Build step-01-init.md and step-01b-continue.md ✓
- Step 9+: Build remaining step files

---

## Step 01 Build Complete

**Created:**
- `steps-c/step-01-init.md` - Validates required docs, checks for continuation
- `steps-c/step-01b-continue.md` - Resumes from previous session state

**Step Configuration:**

| Aspect | Value |
|--------|-------|
| Type | Init (Continuable) |
| Input Discovery | No (docs at known paths) |
| Menu | Auto-proceed on success |
| Next Step | `step-02-scan-epics.md` |

**State File:** `{output_folder}/implementation-plan-state.yaml`

**Required Docs Validated:**
- `architecture.md`
- `prd.md`
- `epics/` folder
- `.claude/rules/` (coding standards)

**Remaining Steps to Build:**
1. `step-02-scan-epics.md` - Scan epics, read sprint-status ✓
2. `step-03-select-scope.md` - User selects epic(s) or story ✓
3. `step-04-select-mode.md` - User chooses Sequential/Batch ✓
4. `step-05-process-stories.md` - Core processing loop ✓
5. `step-06-finalize.md` - Report completion ✓

---

## All Create Flow Steps Built

**Steps Created (steps-c/):**

| Step | File | Type | Purpose |
|------|------|------|---------|
| 01 | `step-01-init.md` | Init (Continuable) | Validate docs, check continuation |
| 01b | `step-01b-continue.md` | Continuation | Resume from previous session |
| 02 | `step-02-scan-epics.md` | Middle (Simple) | Scan epics, display status |
| 03 | `step-03-select-scope.md` | Branch | User selects epic(s)/story |
| 04 | `step-04-select-mode.md` | Branch | User selects Sequential/Batch |
| 05 | `step-05-process-stories.md` | Middle (Loop) | Core generation + review loop |
| 06 | `step-06-finalize.md` | Final | Report completion |

**Workflow Structure Complete:**
```
create-implementation-plan/
├── workflow.md                    ✓
├── data/
│   ├── implementation-plan-template.md  ✓
│   └── validation-criteria.md           ✓
├── steps-c/
│   ├── step-01-init.md            ✓
│   ├── step-01b-continue.md       ✓
│   ├── step-02-scan-epics.md      ✓
│   ├── step-03-select-scope.md    ✓
│   ├── step-04-select-mode.md     ✓
│   ├── step-05-process-stories.md ✓
│   └── step-06-finalize.md        ✓
├── steps-e/                       (placeholder)
└── steps-v/                       (placeholder)
```

**Skills Required (to be created separately):**
- `dev-load-project-context` - Load architecture, prd, standards
- `dev-opencode-review` - OpenCode review with context: fork
- `dev-party-mode-review` - Party Mode review with context: fork
