# Staged Execution Reference

For complex stories (6+ points), break execution into staged sub-tasks with intermediate commits.

## When to Use Staged Execution

**Use staging when:**
- Story has 6+ story points
- Multiple distinct components (types + manager + tests)
- Integration story tying together many stories
- High-risk changes where early validation prevents wasted work

**Do NOT split when:**
- Components are tightly coupled
- Story is already well-scoped (3-5 points)
- Overhead of coordination exceeds benefit
- Single cohesive feature better implemented atomically

## Staged Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAGED STORY EXECUTION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BEFORE STARTING: Load KISS Principle Guide                      │
│                          │                                       │
│                          ▼                                       │
│  Stage 1: Foundation (with KISS)                                 │
│     ├─ Types, interfaces, core skeleton                          │
│     ├─ KISS self-check before review                             │
│     ├─ Code Review Stage 1                                       │
│     └─ COMMIT                                                    │
│                          │                                       │
│                          ▼                                       │
│  Stage 2: Core Implementation (with KISS)                        │
│     ├─ Main logic, wiring, event handling                        │
│     ├─ KISS self-check before review                             │
│     ├─ Code Review Stage 2                                       │
│     └─ COMMIT                                                    │
│                          │                                       │
│                          ▼                                       │
│  Stage 3: Testing & Integration (with KISS)                      │
│     ├─ Unit tests, integration tests                             │
│     ├─ KISS self-check before review                             │
│     ├─ Code Review Stage 3                                       │
│     └─ COMMIT                                                    │
│                          │                                       │
│                          ▼                                       │
│  Stage 4: KISS Refactoring & Cleanup (MANDATORY)                 │
│     ├─ Verify KISS compliance from all stages                    │
│     ├─ Final refactoring pass                                    │
│     ├─ Technical Implementation Notes                            │
│     └─ FINAL COMMIT                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Commit Messages for Staged Commits

```
feat(story-{id}): {stage_description}

- {brief_summary_of_stage}
- Stage {N} of {total}: {stage_name}
- Tests: {count} passing (if applicable)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Example 4-stage story:**
```
feat(story-9-11): Orchestration types and manager skeleton
- Define OrchestrationEventType enum and config interfaces
- Stage 1 of 4: Foundation

feat(story-9-11): Wire up subsystems and event emission
- Connect MessageBus, AgentSwitcher, ConversationManager
- Stage 2 of 4: Core Implementation

feat(story-9-11): Integration tests and documentation
- Add 21 integration tests covering all ACs
- Stage 3 of 4: Testing & Integration
- Tests: 21 passing

feat(story-9-11): KISS refactoring and cleanup
- Simplified from 12 methods to 8
- KISS compliance verified: all metrics within thresholds
- Stage 4 of 4: KISS Refactoring & Cleanup
```

## Combining Staging with Code Improvement

For very complex stories (8+ points), run code improvement after each stage:

```
Stage 1: Foundation
  └─ Dev-story (types, interfaces)
  └─ Code Improvement Subagent
  └─ COMMIT Stage 1

Stage 2: Core Implementation
  └─ Dev-story (main logic)
  └─ Code Improvement Subagent
  └─ COMMIT Stage 2

Stage 3: Testing
  └─ Dev-story (tests)
  └─ Code Improvement Subagent
  └─ COMMIT Stage 3

Stage 4: KISS Refactoring
  └─ Final KISS verification
  └─ COMMIT Stage 4 (final)
```

## Decision Matrix

| Story Type | Approach |
|------------|----------|
| Simple (1-3 pts) | Standard flow |
| Medium (3-5 pts) | Standard flow |
| Complex (6+ pts) | Standard or staged |
| Very Complex (8+ pts) | Staged + Code Improvement each stage |
| Integration Story | Standard flow (subagent checks alignment) |
