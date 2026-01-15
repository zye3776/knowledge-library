# Orchestration Reference

Main loop logic for epic autonomous development.

## Main Loop Pseudocode

```javascript
function executeEpic():
  while true:
    // Step 1: Check sprint status
    result = Task(sprint-status)

    if result.sprint_state == "all_stories_done":
      break  // Exit loop, proceed to retrospective

    if result.sprint_state == "blocked":
      log_and_halt(result.notes)
      return

    story = result.next_story

    // Step 2: Context Loader (runs once via subagent)
    context = Task(context-loader, story)
    // Returns: coding standards, architecture constraints (1-2K tokens)

    // Step 3: Story Development
    dev_result = Task(dev-story, story, context.summary)
    // Implements story following context, KISS principles

    if dev_result.status == "blocked":
      log_and_halt(dev_result.notes)
      return

    // Step 3b: Code Improvement (subagent refinement)
    improvement_result = Task(
      subagent_type="code-improver",
      prompt=build_improvement_prompt(
        story=story,
        files_modified=dev_result.files_modified,
        architecture_doc=context.architecture_doc
      )
    )

    if improvement_result.status == "blocked":
      log_and_halt(improvement_result.notes)
      return

    // Step 4: Code review (NO COMMIT YET)
    review_result = Task(code-review, story, context.summary)

    if review_result.review_status == "changes_requested":
      // Issues found - re-run code improvement with review feedback
      continue

    // Step 5: KISS Refactoring & Cleanup (MANDATORY)
    kiss_result = Task(kiss-refactoring, story, improvement_result.files_modified)
    // This step creates the commit

    if not kiss_result.kiss_compliant:
      log_warning("KISS compliance issues - review refactoring results")

    // Commit created, continue to next story
    log_progress(kiss_result.commit_sha)

  // Step 6: All stories done - run retrospective
  retro_result = Task(retrospective)

  // Step 7: Generate user guide
  guide_result = Task(epic-user-guide)

  // Step 8: Generate docs refresh suggestions (NOT committed)
  docs_result = Task(docs-refresh-suggestions)

  log_completion(guide_result)
```

## Error Handling Matrix

| Subagent Result | Main Context Action |
|-----------------|---------------------|
| `sprint_state: "in_progress"` | Continue with next_story |
| `sprint_state: "all_stories_done"` | Proceed to retrospective |
| `sprint_state: "blocked"` | Log blocker, halt execution |
| Context loader returns summary | Proceed to story development |
| Context loader fails | Retry once, then proceed without context |
| Dev-story completes | Proceed to code improvement |
| Dev-story blocked | Log blocker, halt execution |
| Code improvement completes | Proceed to code review |
| `review_status: "approved"` | Proceed to KISS refactoring |
| `review_status: "changes_requested"` | Re-run code improvement |
| `kiss_compliant: true` | Continue to sprint-status |
| `kiss_compliant: false` | Log warning, verify refactorings |
| Task fails/times out | Retry once, then halt |

## Code Improvement Subagent Integration

When code review requests changes:
1. Code review returns: `review_status: "changes_requested"`
2. Main loop continues (doesn't break)
3. Re-runs code improvement subagent with review feedback
4. Code-improver addresses specific review issues
5. Proceeds to code review again when complete

## Context Loading Efficiency

Context is loaded ONCE before story development:
1. **Subagent efficiency** - Explore agent searches .docs/ and returns summary
2. **Token savings** - 1-2K token summary vs 10K+ for full docs
3. **Consistent context** - Same context used for dev-story and code improvement
4. **Architecture reference** - Architecture doc path passed to code-improver
