---
name: epic-autonomous-dev
description: Execute fully autonomous epic development using BMM subagent patterns. Use when implementing entire epics, running sprint-status → dev-story → code-review → KISS-refactoring cycles, or automating multi-story development. Runs in YOLO mode without user interaction.
---

# Epic Autonomous Development

Fully autonomous epic development using thin orchestration subagents that delegate to BMM agents and workflows. Commits only after KISS compliance verification.

## Quick Start

### Execute Next Story

```
Run the epic autonomous development cycle for the current sprint.
```

This will:
1. Check sprint status to identify the next story
2. Load project context (standards, architecture, UX)
3. Implement the story with KISS principles
4. Run code improvement subagent
5. Execute code review
6. Perform KISS refactoring and create commit
7. Loop until epic complete, then run retrospective

## YOLO Mode (Mandatory)

All tasks run autonomously without user interaction:

```
## YOLO MODE - MANDATORY

- DO NOT use AskUserQuestion or interactive prompts
- DO NOT wait for user confirmation
- Make reasonable decisions and proceed
- If blocked, complete what you can and report the blocker
- Load .docs/project-context.md and .docs/architecture.md before coding

The user will ONLY see your final output.
```

## Development Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    EPIC DEVELOPMENT CYCLE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SPRINT STATUS                                                │
│     └─ /bmad:bmm:workflows:sprint-status                        │
│        └─ Identify next story or "epic complete"                │
│                          │                                       │
│                          ▼                                       │
│  2. CONTEXT LOADER (once per story via subagent)                │
│     └─ Task(Explore): Search .docs/ for relevant docs           │
│        └─ Returns: coding standards, architecture (1-2K tokens) │
│                          │                                       │
│                          ▼                                       │
│  3. STORY DEVELOPMENT                                           │
│     └─ /bmad:bmm:workflows:dev-story                            │
│        └─ Implement with KISS principles, run lint & tests      │
│        └─ NO COMMIT YET                                         │
│                          │                                       │
│                          ▼                                       │
│  3b. CODE IMPROVEMENT (subagent refinement)                     │
│      └─ Architecture alignment verification                     │
│      └─ Codebase pattern analysis                               │
│      └─ Maintainability review                                  │
│      └─ Apply improvements                                      │
│                          │                                       │
│                          ▼                                       │
│  4. CODE REVIEW                                                  │
│     └─ /bmad:bmm:workflows:code-review                          │
│        ├─ Issues found → back to CODE IMPROVEMENT               │
│        └─ Approved → continue                                   │
│                          │                                       │
│                          ▼                                       │
│  5. KISS REFACTORING (MANDATORY)                                │
│     └─ Load KISS Principle Guide                                │
│     └─ Verify: cyclomatic ≤10, nesting ≤3, params ≤3            │
│     └─ Refactor for simplicity                                  │
│     └─ Add Technical Implementation Notes                       │
│     └─ **CREATE COMMIT**                                        │
│                          │                                       │
│                          ▼                                       │
│  6. CYCLE CHECK                                                  │
│     ├─ More stories? → Return to SPRINT STATUS                  │
│     └─ All done? → RETROSPECTIVE                                │
│                          │                                       │
│                          ▼                                       │
│  7. RETROSPECTIVE → User Guide → Docs Refresh Suggestions       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Patterns

### Pattern 1: Sprint Status Check

```javascript
Task({
  subagent_type: "general-purpose",
  description: "Check sprint status",
  prompt: `
## YOLO MODE - MANDATORY
[YOLO directives]

## BMM Task Executor: Sprint Status Check

### Task Parameters
- **Agent:** /bmad:bmm:agents:sm
- **Workflow:** /bmad:bmm:workflows:sprint-status
- **Project Root:** ${project_root}

### Execution
1. Activate: /bmad:bmm:agents:sm
2. Execute: /bmad:bmm:workflows:sprint-status
3. Analyze sprint state, identify next story

### Output
Return JSON: {
  "sprint_state": "in_progress"|"all_stories_done"|"blocked",
  "next_story": {...} or null,
  "stories_remaining": N,
  "notes": "..."
}
`
})
```

### Pattern 2: Context Loader

```javascript
Task({
  subagent_type: "Explore",
  description: "Load story context docs",
  prompt: `
## Context Loader: Story ${story_id}

### Search Parameters
- **Story File:** ${story_file_path}
- **Docs Root:** ${project_root}/.docs/

### Phase 1: Identify Required Docs
1. Read story file
2. Identify needed categories:
   - Coding standards (always)
   - Architecture (if system changes)
   - UX/UI (if user-facing)
   - Epic context (always)

### Phase 2: Search and Extract
For each category, search .docs/:
- project-context.md → coding standards
- architecture.md → component boundaries
- design/ux-design-specification.md → UI patterns

### Phase 3: Generate Context Summary
Return ONLY summary (1-2K tokens), not full docs:

## Story Context Summary
### Coding Standards
- [Key conventions for this story]
### Architecture Constraints
- [Relevant boundaries and patterns]
### Validation Checklist
- [ ] Follows coding standards
- [ ] Matches architecture
`
})
```

### Pattern 3: Story Development

```javascript
Task({
  subagent_type: "general-purpose",
  description: "Implement Story ${story_id}",
  prompt: `
## YOLO MODE - MANDATORY
[YOLO directives]

## MANDATORY: Load KISS Principle Guide
- **${project_root}/.docs/guides-agents/KISS-principle-agent-guide.md**

## BMM Task Executor: Story Development

### Task Parameters
- **Agent:** /bmad:bmm:agents:dev
- **Workflow:** /bmad:bmm:workflows:dev-story
- **Story File:** ${story_file}

### Execution

**Phase 0: Load KISS Guide**
- Max cyclomatic complexity: 10
- Max nesting: 3 levels
- Max parameters: 3
- No premature abstractions

**Phase 1: Story Development**
1. Activate: /bmad:bmm:agents:dev
2. Execute: /bmad:bmm:workflows:dev-story
3. Apply KISS during implementation

**Phase 2: Verification**
4. Run: pnpm run lint (fix ALL errors)
5. Run: pnpm test (ensure passing)
6. KISS self-check
7. Update sprint-status.yaml to "review"
8. **DO NOT COMMIT**

### Output
Return JSON: {
  "story_id": "${story_id}",
  "status": "ready-for-review"|"blocked"|"failed",
  "tests_passing": N,
  "lint_clean": true|false,
  "files_modified": [...],
  "notes": "..."
}
`
})
```

### Pattern 4: Code Improvement Subagent

```javascript
Task({
  subagent_type: "general-purpose",
  description: "Improve Story ${story_id} implementation",
  prompt: `
## YOLO MODE - MANDATORY
[YOLO directives]

## Code Improvement Subagent: Story ${story_id}

### Task Parameters
- **Architecture Doc:** .docs/architecture.md
- **Files Modified:** [list from dev-story]

### Execution

**PHASE 1: ARCHITECTURE ALIGNMENT**
- Load architecture doc
- Verify layer boundaries
- Check component responsibilities

**PHASE 2: CODEBASE ANALYSIS**
- Scan for related modules/patterns
- Check for existing similar functionality
- Identify duplication opportunities

**PHASE 3: MAINTAINABILITY REVIEW**
- Assess naming clarity
- Evaluate coupling/cohesion
- Flag technical debt risks

**PHASE 4: IMPROVEMENT APPLICATION**
- Refactor for consistency
- Eliminate duplication
- Apply KISS principles
- Run lint & tests

### Output
Return JSON: {
  "status": "improved"|"no_changes_needed"|"blocked",
  "architecture_aligned": true|false,
  "improvements_applied": [...],
  "maintainability_score": "high"|"medium"|"low",
  "files_modified": [...]
}
`
})
```

### Pattern 5: KISS Refactoring (MANDATORY)

```javascript
Task({
  subagent_type: "general-purpose",
  description: "KISS refactor Story ${story_id}",
  prompt: `
## YOLO MODE - MANDATORY
[YOLO directives]

## MANDATORY: Load KISS Principle Guide

## BMM Task Executor: KISS Refactoring

### Task Parameters
- **Story:** ${story_id}
- **Files Modified:** [from code-improvement]

### Execution

**Phase 1: Load KISS Guide**
- Cyclomatic complexity ≤10
- Nesting depth ≤3
- Parameters ≤3

**Phase 2: Analyze Against KISS**
For each file:
- Check complexity metrics
- Detect anti-patterns
- TypeScript best practices

**Phase 3: Refactor for Simplicity**
- Extract methods for high complexity
- Guard clauses for nesting
- Options objects for many params
- Run lint & tests after each change

**Phase 4: Validate & Document**
- Validate story file against implementation
- Add Technical Implementation Notes
- Update sprint-status.yaml to "done"

**Phase 5: Create Commit**
git commit -m "feat(story-${story_id}): ${title}

- Brief implementation summary
- KISS compliance verified
- Tests: N passing

Co-Authored-By: Claude <noreply@anthropic.com>"

### Output
Return JSON: {
  "kiss_compliant": true|false,
  "metrics_before": {...},
  "metrics_after": {...},
  "refactorings_applied": [...],
  "commit_sha": "...",
  "notes": "..."
}
`
})
```

## KISS Compliance Metrics

All code must meet these thresholds before commit:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Cyclomatic Complexity | **≤ 10** | Per function |
| Nesting Depth | **≤ 3** | Max levels |
| Parameter Count | **≤ 3** | Per function |
| Function Length | **5-20 lines** | Ideal guideline |

## Commit Message Format

```
feat(story-{id}): {title}

- {brief_summary}
- KISS compliance verified: {metrics}
- Refactorings applied: {count}
- Tests: {count} passing
- Story file updated with technical notes

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Error Handling

| Result | Next Action |
|--------|-------------|
| `sprint_state: "in_progress"` | Continue with next_story |
| `sprint_state: "all_stories_done"` | Run retrospective |
| `sprint_state: "blocked"` | Log blocker, halt |
| `review_status: "approved"` | Proceed to KISS refactoring |
| `review_status: "changes_requested"` | Re-run code improvement |
| `kiss_compliant: true` | Return to sprint status |
| Task fails | Retry once, then halt |

## Process Cleanup

Kill background processes after each task:

```bash
pkill -f "mocha.*test" 2>/dev/null || true
pkill -f "pnpm test" 2>/dev/null || true
pkill -f "vitest" 2>/dev/null || true
pkill -f "tsc.*watch" 2>/dev/null || true
```

## Sequential Execution (CRITICAL)

**Tasks MUST run one at a time.** Never parallel execute.

Shared files that would conflict:
- `sprint-status.yaml`
- Story markdown files
- Source code files
- Git history

## When Complete

After all stories done:
1. **Retrospective** - `/bmad:bmm:workflows:retrospective`
2. **User Guide** - Generate with step-by-step usage
3. **Docs Refresh** - Suggestions for .docs updates (NOT committed)

## Available BMM Agents

| Agent | Purpose |
|-------|---------|
| `/bmad:bmm:agents:dev` | Implementation |
| `/bmad:bmm:agents:sm` | Sprint management, retrospectives |
| `/bmad:bmm:agents:architect` | Technical design |

## Available BMM Workflows

| Workflow | Purpose |
|----------|---------|
| `/bmad:bmm:workflows:sprint-status` | Check sprint state |
| `/bmad:bmm:workflows:dev-story` | Execute story implementation |
| `/bmad:bmm:workflows:code-review` | Review and validate |
| `/bmad:bmm:workflows:retrospective` | Epic retrospective |

## Reference Documentation

For detailed patterns and templates, see:
- [patterns/orchestration.md](references/orchestration.md) - Main loop logic
- [patterns/staging.md](references/staging.md) - Staged execution for complex stories
- [templates/kiss-report.md](references/kiss-report.md) - KISS compliance report format
